import React, { useEffect, useState } from 'react'
import { useAuth } from '../../config/AuthContext'
import { useNavigate } from 'react-router-dom';
import authInstance from '../../config/authInstance';
import { FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import { MinusCircle } from 'lucide-react';
import noData from '../../../public/assets/nodata.png';
import buffer from '../../../public/assets/buffer.gif';
import Swal from 'sweetalert2';
import SearchableDropdown from '../../components/SearchableDropdown';

function CustomerOrderCreation() {

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

    const fetchProducts = async (page, limit) => {
        try {
            setIsLoading(true);
            const response = await axiosAuth.get(
                `/public/productmaster/get_all_s4hana_productmaster?page=${page}&limit=${limit}`
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
                const response = await axiosAuth.get(`/public/customer_master/get_all_s4hana_customermaster`);

                if (response.status === 200) {
                    const jsonData = response.data;

                    const customer = jsonData.find((item) => item.customer === auth.userId);

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
                    } else {
                        console.warn(`Customer with ID ${auth.userId} not found.`);
                        setCustomerData(null); // Clear to avoid stale data
                    }
                } else {
                    console.error('Failed to load customer data:', response);
                }
            } catch (error) {
                console.error('Error fetching customer data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCustomer();
    }, [auth.userId]); // Fetch only when userId changes


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
            items: items,
        };
        setIsLoading(true);
        try {
            const response = await axiosAuth.post(
                `${auth.company}/order_master/add_order_master`,
                body
            );

            if (response.status === 200 && response.data.status === "success") {
                await Swal.fire({
                    icon: 'success',
                    title: 'Order Placed Successfully!',
                    showConfirmButton: false,
                    timer: 1500
                });

                navigate('/customer-orderList');
                setIsLoading(false);
            } else {
                console.error("Failed to save data:", response);
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to place order',
                    text: 'Something went wrong.',
                });

                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error creating order:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error creating order.',
            });

            setIsLoading(false);
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
            totalAmount: 0
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

    // Calculate total amount
    const totalAmountSum = rows.reduce((sum, row) => sum + row.totalAmount, 0);

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen">
            <img src={buffer} alt="Loading..." className="w-50 h-50" />
        </div>
    );

    return (
        <div className="p-6">
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
                        className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
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
            <div className="flex flex-col gap-2 mb-6">
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

            <div className="mb-8">
                <div className="overflow-visible">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-visible">
                        <thead className="bg-gray-100 h-[50px]">
                            <tr className="border-b border-gray-300">
                                <th className="px-4 py-3 text-left ">S.No</th>
                                <th className="px-4 py-3 text-left ">Product Name</th>
                                <th className="px-4 py-3 text-left ">Category</th>
                                <th className="px-4 py-3 text-left ">Unit</th>
                                <th className="px-4 py-3 text-left ">Price</th>
                                <th className="px-4 py-3 text-left ">Qty</th>
                                <th className="px-4 py-3 text-left ">Total Amount</th>
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
                                                        .filter(product =>
                                                            product.productDescription.toLowerCase().includes((row.searchTerm || '').toLowerCase())
                                                        )
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
                                                                                searchTerm: product.productDescription,
                                                                                totalAmount: product.standardPrice * (r.qty || 0),
                                                                                showDropdown: false
                                                                            };
                                                                        }
                                                                        return r;
                                                                    });
                                                                    setRows(updatedRows);
                                                                }}
                                                            >
                                                                {product.productDescription}
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
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
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-20 border border-gray-300 rounded-md px-3 py-2 text-sm"
                                            value={row.qty}
                                            onChange={(e) => handleQtyChange(row.id, e.target.value)}
                                        />
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {row.product ? `${row.totalAmount.toFixed(2)}` : '-'}
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

                    <div className="text-lg font-semibold">
                        {rows.length > 0 ? (
                            <span>Total: {totalAmountSum.toFixed(2)} {rows[0]?.product?.currency || 'INR'}</span>
                        ) : null}
                    </div>
                </div>
            </div>

        </div>
    )
}

export default CustomerOrderCreation