import React, { useEffect, useState } from 'react'
import { FaArrowLeft, FaSearch } from 'react-icons/fa'
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../config/AuthContext';
import authInstance from '../../config/authInstance';
import buffer from '../../assets/buffer.gif';
import noData from '../../assets/noData.png'

function EmployeeCustomerView() {

    const { state } = useLocation();
    const customer = state.customer;

    const navigate = useNavigate();
    const { auth, logout } = useAuth();
    const axiosAuth = authInstance(auth, logout, navigate);

    const [orderList, setOrderList] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchCustomerName, setSearchCustomerName] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const rowsPerPage = 10;

    const fetchOrderByCustomer = async (page, limit) => {
        try {
            setIsLoading(true);
            const response = await axiosAuth.get(`${auth.company}/order_master/get_all_ordermaster?page=${page}&limit=${limit}`);

            if (response.status === 200) {
                const data = response.data;

                const matchedOrders = data.filter(order => order.customerId === customer.customer);
                setOrderList(matchedOrders);

                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error fetching Customer Orders:", error);
            setError("Something went wrong while fetching Customer orders.");
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderByCustomer(currentPage, itemsPerPage);
    }, [currentPage]);

    useEffect(() => {
        let results = orderList;

        if (searchCustomerName) {
            results = results.filter(customer =>
                customer.orderId.toLowerCase().includes(searchCustomerName.toLowerCase()) ||
                customer.contactPerson.toLowerCase().includes(searchCustomerName.toLowerCase())
            );
        }

        setFilteredOrders(results);
    }, [orderList, searchCustomerName]);

    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

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
            {/* App Bar */}
            <div className="flex flex-col md:flex-row gap-4 flex-grow mb-6 justify-between">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => navigate('/employee-customerList')}
                        className="text-gray-600 hover:text-blue-600 cursor-pointer"
                    >
                        <FaArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Customer Order List</h1>
                </div>
            </div>

            {/* Table and Search */}
            <div className="bg-white p-6 mt-10 rounded-lg shadow-md">

                {/* Search */}
                <div className="flex flex-col md:flex-row gap-4 flex-grow mb-6 justify-start">
                    <div className="relative w-full md:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Customer ID or Name"
                            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => {
                                setSearchCustomerName(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>


                {/* Responsive Table */}
                <div className="rounded-xl overflow-hidden border border-gray-300">
                    {/* Desktop Table */}
                    <table className="hidden md:table w-full min-w-[100px] divide-y divide-gray-200">
                        <thead className="bg-gray-100 h-[50px]">
                            <th className="py-3 px-4 text-left">Order ID</th>
                            <th className="py-3 px-4 text-left">Customer Name</th>
                            <th className="py-3 px-4 text-left">Order Date</th>
                            <th className="py-3 px-4 text-left">Total</th>
                            <th className="py-3 px-4 text-left">Status</th>
                            <th className="py-3 px-4 text-left">SAP Order ID</th>
                            <th className="py-3 px-4 text-left">Remarks</th>
                        </thead>

                        <tbody>
                            {currentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-8 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <img src={noData} alt="No users found" className="w-32 h-32 mb-4" />
                                            <p className="text-gray-500 text-lg">No users found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentOrders.map((order) => (
                                    <tr key={order.orderId} className="border-t border-gray-300">
                                        <td className="px-4 py-3">{order.orderId}</td>
                                        <td className="px-4 py-3">{order.contactPerson}</td>
                                        <td className="px-4 py-3">{order.orderDate}</td>
                                        <td className="px-4 py-3">{order.total}</td>
                                        <td className="px-4 py-3">{order.status}</td>
                                        <td className="px-4 py-3">{order.salesOrderId}</td>
                                        <td className="px-4 py-3">
                                            {order.salesOrderId !== null ? "synced" : "not synced"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>


                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {currentOrders.length > 0 ? (
                            currentOrders.map((order) => (
                                <div
                                    key={order.orderId}
                                    className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white"
                                >
                                    <p><span className="font-medium">Order ID:</span> {order.orderId}</p>
                                    <p><span className="font-medium">Customer Name:</span> {order.customerName}</p>
                                    <p><span className="font-medium">Order Date:</span> {order.orderDate}</p>
                                    <p><span className="font-medium">Total:</span> {order.total}</p>
                                    <p><span className="font-medium">Status:</span> {order.status}</p>
                                    <p><span className="font-medium">SAP Order ID:</span> {order.salesOrderId}</p>
                                    <p><span className="font-medium">Remarks:</span> {order.salesOrderId !== null ? "synced" : "not synced"}</p>
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

export default EmployeeCustomerView