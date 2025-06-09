import React, { useEffect, useState } from 'react'
import { useAuth } from '../../config/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

import authInstance from '../../config/authInstance';
import buffer from '../../assets/buffer.gif';
import noData from '../../assets/noData.png'
import { ArrowRightCircle } from 'lucide-react';

function EmployeeCustomerList() {

    const { auth, logout } = useAuth();
    const navigate = useNavigate();
    const axiosAuth = authInstance(auth, logout, navigate);

    const [customerList, setCustomerList] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchCustomerName, setSearchCustomerName] = useState("");
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const rowsPerPage = 10;


    const fetchCustomerList = async (page, limit) => {
        try {
            setIsLoading(true);
            const response = await axiosAuth.get(`public/customer_master/get_all_s4hana_customermaster?page=${page}&limit=${limit}`)

            if (response.status === 200) {
                const data = response.data;
                setCustomerList(data);
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
        fetchCustomerList(currentPage, itemsPerPage);
    }, []);

    useEffect(() => {
        let results = customerList;

        if (searchCustomerName) {
            results = results.filter(customer =>
                customer.customer.toLowerCase().includes(searchCustomerName.toLowerCase()) ||
                customer.customerName.toLowerCase().includes(searchCustomerName.toLowerCase())
            );
        }

        setFilteredCustomers(results);
    }, [customerList, searchCustomerName]);

    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);

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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Customer List</h1>

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
                            placeholder="Search by Customer ID or Name"
                            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchCustomerName}
                            onChange={(e) => {
                                setSearchCustomerName(e.target.value);
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
                                <th className="py-3 px-4 text-left">Customer ID</th>
                                <th className="py-3 px-4 text-left">Customer Name</th>
                                <th className="py-3 px-4 text-left">City</th>
                                <th className="py-3 px-4 text-left">Mobile Number</th>
                                <th className="py-3 px-4 text-left">Email ID</th>
                                <th className="py-3 px-4 text-left"></th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <img src={noData} alt="No users found" className="w-32 h-32 mb-4" />
                                            <p className="text-gray-500 text-lg">No users found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentCustomers.map((customer) => (
                                    <tr key={customer.customer} className="border-t border-gray-300">
                                        <td className="px-4 py-3">{customer.customer}</td>
                                        <td className="px-4 py-3">{customer.customerName}</td>
                                        <td className="px-4 py-3">{customer.cityName}</td>
                                        <td className="px-4 py-3">{customer.telephoneNumber1}</td>
                                        <td className="px-4 py-3">{customer.emailAddress}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => {
                                                    navigate('/employee-customerView', { state: { customer } })
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

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {currentCustomers.length > 0 ? (
                            currentCustomers.map((customer, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white"
                                >
                                    <p><span className="font-medium">Customer ID:</span> {customer.customer}</p>
                                    <p><span className="font-medium">Customer Name:</span> {customer.customerName}</p>
                                    <p><span className="font-medium">City:</span> {customer.cityName}</p>
                                    <p><span className="font-medium">Mobile Number:</span> {customer.telephoneNumber1}</p>
                                    <p><span className="font-medium">Email ID:</span> {customer.emailAddress}</p>
                                    <div className="mt-4 text-right">
                                        <button
                                            onClick={() => {
                                                navigate('/employee-customerView', { state: { customer } })
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
            </div>
        </div>
    )
}

export default EmployeeCustomerList