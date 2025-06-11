import React, { useEffect, useState } from 'react'
import { useAuth } from '../../config/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import buffer from '../../assets/buffer.gif';
import noData from '../../assets/noData.png'
import { FaSearch } from 'react-icons/fa';
import authInstance from '../../config/authInstance';
import { ArrowRightCircle } from 'lucide-react';

function EmployeeOrderList() {

    const { auth, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const axiosAuth = authInstance(auth, logout, navigate);

    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [orderList, setOrderList] = useState([]);
    const [searchOrderName, setSearchOrderName] = useState("");
    const [searchStatus, setSearchStatus] = useState("All");
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(location.state?.currentPage || 1);
    const [itemsPerPage] = useState(10);
    const rowsPerPage = 10;


    const fetchOrderList = async () => {
        try {
            setIsLoading(true);
            const response = await axiosAuth.get(`/${auth.company}/order_master/get_all_ordermaster`);
            if (response.status === 200) {
                const data = response.data;
                setOrderList(data);
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
        fetchOrderList(currentPage, itemsPerPage);
    }, []);

    useEffect(() => {
        let results = orderList;

        if (searchOrderName) {
            results = results.filter(order =>
                order.orderId.toLowerCase().includes(searchOrderName.toLowerCase()) ||
                order.contactPerson.toLowerCase().includes(searchOrderName.toLowerCase())
            );
        }

        if (searchStatus !== "All") {
            results = results.filter(order => order.status === searchStatus);
        }

        setFilteredOrders(results);
    }, [orderList, searchOrderName, searchStatus]);

    const getUniqueStatus = () => {
        const allStatus = orderList.map(order => order.status);
        const uniqueStatus = [...new Set(allStatus)];
        return ["All", ...uniqueStatus.sort()];
    };

    const orderStatus = getUniqueStatus();

    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentOrder = filteredOrders.slice(indexOfFirst, indexOfLast);
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
                    // onClick={() => window.location.reload()}
                    onClick={() => navigate('/login')}
                    className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    );


    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Order List</h1>

            {/* Table and Search*/}
            <div className="bg-white p-6 mt-10 rounded-lg shadow-md">

                {/* Search */}
                <div className="flex flex-col md:flex-row gap-4 flex-grow mb-6 justify-between">
                    <div className="relative w-full md:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Customer ID or Name"
                            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchOrderName}
                            onChange={(e) => {
                                setSearchOrderName(e.target.value);
                                setCurrentPage(1);
                                setSearchStatus("All");
                            }}
                        />
                    </div>

                    <div className='relative w-full md:w-72'>
                        <select
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchStatus}
                            onChange={(e) => {
                                setSearchStatus(e.target.value);
                                setSearchOrderName('');
                                setCurrentPage(1);
                            }}
                        >
                            {orderStatus.map((type) => (
                                <option value={type} key={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Responsive Table */}
                <div className="rounded-xl overflow-hidden border border-gray-300">
                    {/* Desktop Table */}
                    <table className="hidden md:table w-full min-w-[100px] divide-y divide-gray-200">
                        <thead className="bg-gray-100 h-[50px]">
                            <tr className="border-b border-gray-300">
                                <th className="py-3 px-4 text-left">Order ID</th>
                                <th className="py-3 px-4 text-left">Customer Name</th>
                                <th className="py-3 px-4 text-left">Order Date</th>
                                <th className="py-3 px-4 text-left">Total</th>
                                <th className="py-3 px-4 text-left">Sync Status</th>
                                <th className="py-3 px-4 text-left">SAP Order ID</th>
                                <th className="py-3 px-4 text-left">Remarks</th>
                                <th className="py-3 px-4 text-left"></th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentOrder.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <img src={noData} alt="No users found" className="w-32 h-32 mb-4" />
                                            <p className="text-gray-500 text-lg">No users found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentOrder.map((order) => (
                                    <tr key={order.orderId} className="border-t border-gray-300">
                                        <td className="px-4 py-3">{order.orderId}</td>
                                        <td className="px-4 py-3">{order.contactPerson}</td>
                                        <td className="px-4 py-3">{order.orderDate}</td>
                                        <td className="px-4 py-3">{order.total}</td>

                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${order.salesOrderId !== null
                                                    ? 'bg-green-200 text-green-900'
                                                    : 'bg-red-200 text-red-900'
                                                    }`}
                                            >
                                                {order.salesOrderId !== null ? 'Success' : 'Failed'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{order.salesOrderId !== null ? (
                                            <span className="text-sm font-bold text-gray-700">{order.salesOrderId}</span>
                                        ) : (
                                            <span className="text-sm font-bold text-gray-700">-</span>
                                        )}</td>
                                        <td className="px-4 py-3">{order.status}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => {
                                                    navigate('/employee-orderView', { state: { order, currentPage } })
                                                }}
                                                className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                                            >
                                                <ArrowRightCircle className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Mobile cards */}
                    <div className="md:hidden space-y-4 p-4">
                        {currentOrder.length > 0 ? (
                            currentOrder.map((order) => (
                                <div
                                    key={order.orderId}
                                    className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white"
                                >
                                    <p><span className="font-medium">Order ID:</span> {order.orderId}</p>
                                    <p><span className="font-medium">Customer Name:</span> {order.contactPerson}</p>
                                    <p><span className="font-medium">Order Date:</span> {order.orderDate}</p>
                                    <p><span className="font-medium">Total:</span> {order.total}</p>
                                    <p><span className="font-medium">Status:</span> {order.status}</p>
                                    <p><span className="font-medium">SAP Order ID:</span> {order.salesOrderId}</p>
                                    <p><span className="font-medium">Remarks:</span> {order.salesOrderId !== null ? "synced" : "not synced"}</p>
                                    <div className="mt-4 text-right">
                                        <button
                                            onClick={() => {
                                                navigate('/employee-orderView', { state: { order, currentPage } })
                                            }}
                                            className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                                        >
                                            <ArrowRightCircle className="h-5 w-5" />
                                        </button>
                                    </div>
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
            </div >
        </div >
    )
}

export default EmployeeOrderList