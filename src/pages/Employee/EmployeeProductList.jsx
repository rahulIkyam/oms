import React, { useEffect, useState } from 'react'
import { useAuth } from '../../config/AuthContext'
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import buffer from '../../assets/buffer.gif';
import noData from '../../assets/noData.png'
import authInstance from '../../config/authInstance';


function EmployeeProductList() {

    const { auth, logout, userId } = useAuth();
    const navigate = useNavigate();
    const axiosAuth = authInstance(auth, logout, userId, navigate);

    const [productsList, setProductsList] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchProductName, setSearchProductName] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const rowsPerPage = 10;


    const getchProductsList = async (page, limit) => {
        try {
            setIsLoading(true);
            const response = await axiosAuth.get(`/public/productmaster/get_all_s4hana_productmaster?page=${page}&limit=${limit}`);

            if (response.status === 200) {
                const data = response.data;
                setProductsList(data);
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error fetching Product:", error);
            setError("Something went wrong while fetching Product List.");
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        getchProductsList(currentPage, itemsPerPage);
    }, [currentPage]);

    useEffect(() => {
        let results = productsList;

        if (searchProductName) {
            results = results.filter(product =>
                product.productDescription.toLowerCase().includes(searchProductName.toLowerCase())
            );
        }

        setFilteredProducts(results);
    }, [productsList, searchProductName]);



    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen">
            <img src={buffer} alt="Loading..." className="w-50 h-50" />
        </div>
    );
    if (error) return (
        <div className="flex flex-col justify-center items-center h-screen p-4">
            <div className="max-w-md p-6 bg-red-50 border border-red-200 rounded-lg text-center">
                <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Data</h3>
                <p className="text-red-600">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    );

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Product List</h1>

            {/* Table and Search*/}
            <div className="bg-white p-6 mt-10 rounded-lg shadow-md">

                {/* Search */}
                <div className="flex flex-col md:flex-row gap-4 flex-grow mb-6">
                    <div className="relative w-full md:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Enter Order ID..."
                            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchProductName}
                            onChange={(e) => {
                                setSearchProductName(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>

                {/* Responsice Table */}
                <div className="rounded-xl overflow-hidden border border-gray-300">
                    {/* Desktop Table */}
                    <table className="hidden md:table w-full min-w-[100px] divide-y divide-gray-200">
                        <thead className="bg-gray-100 h-[50px]">
                            <tr className="border-b border-gray-300">
                                <th className="py-3 px-4 text-left">Product Name</th>
                                <th className="py-3 px-4 text-left">Category</th>
                                <th className="py-3 px-4 text-left">Sub Category</th>
                                <th className="py-3 px-4 text-left">Unit</th>
                                <th className="py-3 px-4 text-left">Price</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <img src={noData} alt="No users found" className="w-32 h-32 mb-4" />
                                            <p className="text-gray-500 text-lg">No users found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentProducts.map((product, index) => (
                                    <tr key={index} className="border-t border-gray-300">
                                        <td className="px-4 py-3">{product.productDescription}</td>
                                        <td className="px-4 py-3">{product.categoryName}</td>
                                        <td className="px-4 py-3">{product.productType}</td>
                                        <td className="px-4 py-3">{product.standardPrice}</td>
                                        <td className="px-4 py-3">{product.baseUnit}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {currentProducts.length > 0 ? (
                            currentProducts.map((product, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white"
                                >
                                    <p><span className="font-medium">Product Name:</span> {product.productDescription}</p>
                                    <p><span className="font-medium">Category:</span> {product.categoryName}</p>
                                    <p><span className="font-medium">Sub Category:</span> {product.productType}</p>
                                    <p><span className="font-medium">Unit:</span> {product.standardPrice}</p>
                                    <p><span className="font-medium">Price:</span> {product.baseUnit}</p>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center">
                                <div className="flex flex-col items-center justify-center">
                                    <img src={noData} alt="No users found" className="w-32 h-32 mb-4" />
                                    <p className="text-gray-500 text-lg">No users found</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-end mt-6">
                        <nav className="inline-flex rounded-md shadow">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-1 border-t border-b border-gray-300 bg-white text-gray-700">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    )
}

export default EmployeeProductList