import React, { useEffect, useState } from 'react'
import { useAuth } from '../../config/AuthContext'
import { useNavigate } from 'react-router-dom';
import authInstance from '../../config/authInstance';
import { FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import { MinusCircle } from 'lucide-react';
import buffer from '../../assets/buffer.gif';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { useUploadProgress } from '../../components/CircularProgressBar';

function CustomerOrderCreation() {

    const {
        uploadDProgress,
        isUploading,
        setIsUploading,
        startUpload,
        endUpload,
        resetUpload,
        trackUploadProgress,
        contentLength
    } = useUploadProgress();

    const { auth, logout } = useAuth();
    const navigate = useNavigate();
    const axiosAuth = authInstance(auth, logout, navigate);

    const today = new Date();
    const formattedDisplayDate = today.toLocaleDateString('en-GB'); //dd/MM/yyyy
    const formattedInputDate = today.toISOString().split('T')[0]; //yyyy-MM-dd

    const [rows, setRows] = useState([]);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [customerData, setCustomerData] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [excelFile, setExcelFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState('');

    const fetchProducts = async (page, limit) => {
        try {
            setIsLoading(true);
            const response = await axiosAuth.get(
                `/productmaster/get_all_s4hana_productmaster?page=${page}&limit=${limit}`
            );

            if (response.status === 200) {
                const jsonData = response.data;
                setProducts(jsonData);
                setTotalPages(Math.ceil(jsonData.length / itemsPerPage));
            }

        } catch (error) {
            console.error("Error fetching product options:", error);
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchCustomer = async () => {
            if (!auth.userId || isLoading) return;

            setIsLoading(true);
            try {
                const saveResponse = await axiosAuth.get(`/user/get_and_save_all_customer_data`);

                if (saveResponse.status === 200) {
                    console.log("Customer data saved successfully:", saveResponse.data);

                    const response = await axiosAuth.get(`/customer_master/get_all_s4hana_customermaster`);

                    if (response.status === 200) {
                        const jsonData = response.data;

                        const customer = jsonData.find((item) => item.customer === auth.userId);
                        console.log('------customer-----');
                        console.log(customer);

                        if (customer) {
                            setCustomerData({
                                customerName: customer.customerName || '',
                                addressID: customer.addressID || '',
                                cityName: customer.cityName || '',
                                postalCode: customer.postalCode || '',
                                streetName: customer.streetName || '',
                                region: customer.region || '',
                                telephoneNumber1: customer.telephoneNumber1 || '',
                                country: customer.country || '',
                                districtName: customer.districtName || '',
                                emailAddress: customer.emailAddress || '',
                                mobilePhoneNumber: customer.mobilePhoneNumber || '',
                            });
                            console.log('-----------');
                            console.log(auth.userId);
                            console.log(customer);
                        } else {
                            console.warn(`Customer with Customer ID ${auth.userId} not found.`);
                            setCustomerData(null); // Clear to avoid stale data
                        }
                    } else {
                        console.error('Failed to load customer data:', response);
                    }
                } else {
                    console.error('Failed to save customer data:', saveResponse);
                }


            } catch (error) {
                console.error('Error fetching customer data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCustomer();
    }, []); // Fetch only when userId changes


    useEffect(() => {
        fetchProducts(currentPage, itemsPerPage);
    }, [currentPage]);

    const createOrder = async () => {


        const items = rows.map((row) => {
            const product = typeof row.product === 'object' ? row.product : row;

            return {
                baseUnit: product.baseUnit || '',
                categoryName: product.categoryName || '',
                currency: product.currency || '',
                product: product.product || '',
                productDescription: product.productDescription || '',
                productType: product.productType || '',
                qty: row.qty || 0,
                standardPrice: product.standardPrice || 0,
                totalAmount: (row.qty || 0) * (product.standardPrice || 0),
                notes: row.notes || ''
            };
        });

        const total = items.reduce((acc, item) => acc + item.totalAmount, 0);

        const body = {
            deliveryLocation: customerData.cityName || '',
            contactPerson: customerData.customerName || '',
            customerId: auth.userId,
            orderDate: formattedDisplayDate,
            postalCode: customerData.postalCode || '',
            region: customerData.region || '',
            streetName: customerData.streetName || '',
            telephoneNumber: customerData.telephoneNumber1 || '',
            total: total,
            remarks: remarks,
            items: items,
        };
        // setIsLoading(true);
        const contentLength = JSON.stringify(body).length;
        const shouldSlowDown = contentLength > 20000;
        const payload = new Blob([JSON.stringify(body)], {
            type: 'application/json'
        });
        const calculatedLength = payload.size;
        startUpload(calculatedLength);
        try {

            // Artificial delay before actual upload
            // if (shouldSlowDown) {
            //     await new Promise(resolve => setTimeout(resolve, 1000));
            // }



            const response = await axiosAuth.post(
                `order_master/add_order_master`,
                payload,
                {
                    onUploadProgress: trackUploadProgress,
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': calculatedLength
                    },
                    transformRequest: [(data) => data]
                }
            );

            // Artificial delay before completion
            // if (shouldSlowDown) {
            //     await new Promise(resolve => setTimeout(resolve, 1500));
            // }
            endUpload();
            if (response.status === 200 && response.data.status === "success") {
                await Swal.fire({
                    icon: 'success',
                    title: 'Order Placed Successfully!',
                    showConfirmButton: false,
                    timer: 1500
                });

                navigate('/customer-orderList');
            } else {
                throw new Error("Failed to save data");
            }
        } catch (error) {
            console.error("Error creating order:", error);
            resetUpload();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error creating order.',
            });
        }
    }

    // Add a new row
    const addRow = () => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        const newRow = {
            id: Date.now(),
            sNo: rows.length + 1,
            product: null,
            searchTerm: '',
            showDropdown: false,
            qty: 0,
            totalAmount: 0,
            notes: ''
        };
        setRows(prev => [...prev, newRow]);
    };

    // Remove a row
    const removeRow = (id) => {
        const updatedRows = rows.filter(row => row.id !== id)
            .map((row, index) => ({
                ...row,
                sNo: index + 1
            }));
        setRows(updatedRows);
    };




    // Handle quantity change
    const handleQtyChange = (id, newQty) => {
        const updatedRows = rows.map(row => {
            if (row.id === id) {
                const qty = parseInt(newQty) || 0;
                return {
                    ...row,
                    qty,
                    totalAmount: row.product ? row.product.standardPrice * qty : 0
                };
            }
            return row;
        });
        setRows(updatedRows);
    };

    const handleNotesChange = (id, notes) => {
        const updateRows = rows.map(row => {
            if (row.id === id) {
                return {
                    ...row,
                    notes
                };
            }
            return row;
        });
        setRows(updateRows);
    }

    // Calculate total amount
    const totalAmountSum = rows.reduce((sum, row) => sum + row.totalAmount, 0);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.name.match(/\.(xlsx|xls)$/i)) {
            setUploadError('Please upload a valid Excel file (.xlsx or .xls)');
            return;
        }

        setExcelFile(file);
        setUploadError('');
    };


    const handleExcelUpload = async () => {
        if (!excelFile) return;

        try {
            setUploadProgress(10);
            const data = await readExcelFile(excelFile);
            setUploadProgress(50);

            // Process in chunks to avoid UI freezing
            const chunkSize = 100; // Process 100 rows at a time
            const totalChunks = Math.ceil(data.length / chunkSize);
            let processedRows = [];

            for (let i = 0; i < totalChunks; i++) {
                const start = i * chunkSize;
                const end = start + chunkSize;
                const chunk = data.slice(start, end);

                const newRows = chunk.map((item, index) => {
                    // Optimized product search - create a map first
                    const productMap = products.reduce((acc, product) => {
                        acc[product.product] = product;
                        acc[product.productDescription] = product;
                        return acc;
                    }, {});

                    const product = productMap[item['Product']] ||
                        productMap[item['Product Name']];

                    return {
                        id: Date.now() + start + index,
                        sNo: rows.length + start + index + 1,
                        product: product || null,
                        searchTerm: product ? `${product.product} - ${product.productDescription}` : '',
                        qty: parseInt(item['Qty']) || 0,
                        totalAmount: product ? (parseInt(item['Qty']) || 0) * product.standardPrice : 0,
                        notes: item['Notes'] || '',
                        showDropdown: false
                    };
                });

                processedRows = [...processedRows, ...newRows];
                setUploadProgress(50 + (i / totalChunks * 40)); // Update progress
            }

            setRows([...rows, ...processedRows]);
            setUploadProgress(100);
            setTimeout(() => setShowUploadModal(false), 500);
        } catch (error) {
            console.error('Error processing Excel file:', error);
            setUploadError('Error processing file. Please check the format and try again.');
            setUploadProgress(0);
        }
    };


    const readExcelFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    };

    const downloadTemplate = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet([
            {
                "S.No": "",
                'Product': '',
                'Product Name': '',
                'Qty': '',
                'Category': '',
                'Unit': '',
                'Price': '',
                'Total Amount': '',
                'Notes': ''
            }
        ]);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
        XLSX.writeFile(workbook, "Product_Import_Template.xlsx")
    }

    if (isLoading) return (
        <div className='flex justify-center items-center h-100'>
            <div className="mt-40 ">
                <div>
                    <img src={buffer} alt="Loading..." className="w-50 h-50" />
                </div>
            </div>
            {/* <CircularProgressBar 
                isLoading={isLoading} 
                progress={progress} 
                loadingText="Processing your order..."
            /> */}
        </div>
    );

    if (isUploading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/50 z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl text-center min-w-[300px]">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${uploadDProgress}%` }}
                        ></div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-lg font-medium">
                            {uploadDProgress < 100 ? (
                                `${uploadDProgress}% Complete`
                            ) : (
                                'Finalizing...'
                            )}
                        </p>
                        <p className="text-sm text-gray-500">
                            {uploadDProgress < 100 ? (
                                'Please wait while we process your order'
                            ) : (
                                'Almost done!'
                            )}
                        </p>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-200 transition-all duration-1000 ease-out"
                                style={{ width: `${uploadDProgress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* <p className="text-xs mt-3 text-gray-400">
                        Content-Length: {contentLength} bytes
                    </p> */}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 flex flex-col">
            {/* App Bar */}
            <div className="flex flex-col md:flex-row gap-4 flex-grow mb-6 justify-between">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => navigate('/customer-orderList')}
                        className="text-gray-600 hover:text-blue-600 cursor-pointer"
                    >
                        <FaArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Create Order</h1>
                </div>

                <div className="w-full md:w-auto">
                    <button
                        className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 cursor-pointer"
                        onClick={async () => {
                            const isCustomerReady = !!customerData?.customerName;
                            const hasProducts = rows.length > 0;

                            if (!isCustomerReady || !hasProducts) {
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'Missing Data',
                                    text: 'Customer or Products not found',
                                });
                                return;
                            }

                            await createOrder();
                        }}
                    >
                        Create Order
                    </button>

                </div>
            </div>

            {/* Order Date */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
                <div className="flex-1">
                    <h5 className="text-base font-medium text-gray-800">Order Date</h5>

                    <div className="relative w-full md:w-auto">
                        <input
                            type="text"
                            value={formattedDisplayDate}
                            readOnly
                            className="bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 h-12 w-full md:w-auto text-gray-800 cursor-not-allowed"
                        />
                        <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    </div>
                </div>

                <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div><strong>Customer Name:</strong> {customerData?.customerName}</div>
                </div>
            </div>

            <div className="mb-8">
                <div className="overflow-visible">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-visible">
                        <thead className="bg-gray-100 h-[50px]">
                            <tr className="border-b border-gray-300">
                                <th className="px-4 py-3 text-left ">S.No</th>
                                <th className="px-4 py-3 text-left ">Product Name</th>
                                <th className="px-4 py-3 text-left ">Qty</th>
                                <th className="px-4 py-3 text-left ">Category</th>
                                <th className="px-4 py-3 text-left ">Unit</th>
                                <th className="px-4 py-3 text-left ">Price</th>
                                <th className="px-4 py-3 text-left ">Total Amount</th>
                                <th className="px-4 py-3 text-left ">Notes</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {rows.map((row) => (
                                <tr key={row.id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{row.sNo}</td>
                                    <td className="px-4 py-4 whitespace-nowrap relative">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                placeholder="Search product..."
                                                value={row.searchTerm || ''}
                                                onChange={(e) => {
                                                    const updatedRows = rows.map(r => {
                                                        if (r.id === row.id) {
                                                            return {
                                                                ...r,
                                                                searchTerm: e.target.value,
                                                                showDropdown: true
                                                            };
                                                        }
                                                        return r;
                                                    });
                                                    setRows(updatedRows);
                                                }}
                                                onFocus={() => {
                                                    const updatedRows = rows.map(r => {
                                                        if (r.id === row.id) {
                                                            return { ...r, showDropdown: true };
                                                        }
                                                        // return { ...r, showDropdown: false };
                                                        return r;
                                                    });
                                                    setRows(updatedRows);
                                                }}
                                                onBlur={() => {
                                                    setTimeout(() => {
                                                        const updatedRows = rows.map(r => {
                                                            if (r.id === row.id) {
                                                                return { ...r, showDropdown: false };
                                                            }
                                                            return r;
                                                        });
                                                        setRows(updatedRows);
                                                    }, 200);
                                                }}
                                            />
                                            {row.showDropdown && (
                                                <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-96 
                                                rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto 
                                                focus:outline-none sm:text-sm"
                                                    style={{ maxHeight: '300px' }}
                                                >
                                                    {products
                                                        .filter(product => {
                                                            const searchTerm = (row.searchTerm || '').toLowerCase();
                                                            return (
                                                                product.productDescription.toLowerCase().includes(searchTerm) ||
                                                                product.product.toLowerCase().includes(searchTerm)
                                                            );
                                                        })
                                                        .map((product) => (
                                                            <div
                                                                key={product.product}
                                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                                onMouseDown={(e) => e.preventDefault()}
                                                                onClick={() => {
                                                                    const updatedRows = rows.map(r => {
                                                                        if (r.id === row.id) {
                                                                            return {
                                                                                ...r,
                                                                                product: product,
                                                                                searchTerm: `${product.product} - ${product.productDescription}`,
                                                                                totalAmount: product.standardPrice * (r.qty || 0),
                                                                                showDropdown: false
                                                                            };
                                                                        }
                                                                        return r;
                                                                    });
                                                                    setRows(updatedRows);
                                                                }}
                                                            >
                                                                <div className="font-medium">{product.product}</div>
                                                                <div className="text-gray-500">{product.productDescription}</div>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <input
                                            type="text"
                                            min="0"
                                            className="w-20 border border-gray-300 rounded-md px-3 py-2 text-sm"
                                            value={row.qty}
                                            onChange={(e) => handleQtyChange(row.id, e.target.value)}
                                        />
                                    </td>

                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {row.product?.categoryName || '-'}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {row.product?.baseUnit || '-'}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {row.product ? `${row.product.standardPrice}` : '-'}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {row.product ? `${row.totalAmount.toFixed(2)}` : '-'}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                            value={row.notes || ''}
                                            onChange={(e) => handleNotesChange(row.id, e.target.value)}
                                            placeholder="Enter notes"
                                        />
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => removeRow(row.id)}
                                            className="text-red-600 hover:text-red-800 text-sm cursor-pointer"
                                        >
                                            <MinusCircle className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button
                        onClick={addRow}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 text-sm cursor-pointer"
                    >
                        Add Product
                    </button>

                    {/* Excel Upload Button */}
                    {/* <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-300 text-sm cursor-pointer"
                    >
                        Import from Excel
                    </button> */}

                    <div className="text-lg font-semibold">
                        {rows.length > 0 ? (
                            <span>Total: {totalAmountSum.toFixed(2)} {rows[0]?.product?.currency || 'INR'}</span>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="mt-auto ml-auto pt-6 w-full md:w-1/2">
                <h5 className="text-base font-medium text-gray-800 mb-2">Remarks</h5>
                <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[100px]"
                />
            </div>

            {/* Excel Upload */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Import Products from Excel</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Download Template:
                                <a
                                    onClick={downloadTemplate}
                                    className="ml-2 text-blue-600 hover:underline cursor-pointer"
                                >
                                    Download
                                </a>
                            </label>
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                        </div>
                        {uploadError && <div className="text-red-500 mb-4">{uploadError}</div>}

                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExcelUpload}
                                disabled={!excelFile}
                                className={`px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium ${!excelFile ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 cursor-pointer'}`}
                            >
                                Import
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomerOrderCreation