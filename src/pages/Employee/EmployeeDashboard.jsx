import React, { useEffect, useState } from 'react'
import { useAuth } from '../../config/AuthContext'
import KPICard from '../../components/KPICard';
import { FaBoxOpen, FaCheck, FaClipboardCheck, FaSearch, FaTruck } from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';
import authInstance from '../../config/authInstance';
import buffer from '../../assets/buffer.gif';
import noData from '../../assets/noData.png'

function EmployeeDashboard() {

  const { auth, logout, userId } = useAuth();
  const navigate = useNavigate();
  const axiosauth = authInstance(auth, logout, userId, navigate);

  const [kpiData, setKpiData] = useState({
    openOrders: 0,
    pickedOrders: 0,
    deliveredOrders: 0,
    completedOrders: 0
  });

  const [orderList, setOrderList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const fetchKpiCount = async () => {
    try {
      setIsLoading(true);
      const response = await axiosauth.get(`${auth.company}/order_master/get_order_counts`);

      if (response.status === 200) {
        const data = response.data;

        const updatedKpi = {
          openOrders: data["Not Started"] || 0,
          pickedOrders: data['Picked'] || 0,
          deliveredOrders: data["Delivered"] || 0,
          completedOrders: data["Cleared"] || 0
        };

        setKpiData(updatedKpi);
      }
    } catch (error) {
      console.error("Error fetching KPI counts:", error);
      setError("Something went wrong while fetching KPI.");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchOrderList = async () => {
    try {
      setIsLoading(true);
      const response = await axiosauth.get(`${auth.company}/order_master/get_all_ordermaster`);

      if (response.status === 200) {
        const jsonData = response.data;
        setOrderList(jsonData);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching Orders:", error);
      setError("Something went wrong while fetching orders.");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchOrderList();
      await fetchKpiCount();
    };

    loadData();
  }, []);

  useEffect(() => {
    let results = orderList;

    if (searchOrderId) {
      results = results.filter(orderId =>
        orderId.orderId.toLowerCase().includes(searchOrderId.toLowerCase())
      );
    };

    setFilteredOrders(results);
  }, [orderList, searchOrderId]);

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

  if (isLoading) return (
    <div className="flex justify-center items-center h-50 mt-50">
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      {/* KPI */}
      <div className="kpi grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          value={kpiData.openOrders}
          label="Open Orders"
          icon={FaBoxOpen}
          borderColor="blue"
          iconColor="blue"
        />
        <KPICard
          value={kpiData.pickedOrders}
          label="Picked Orders"
          icon={FaClipboardCheck}
          borderColor="yellow"
          iconColor="yellow"
        />
        <KPICard
          value={kpiData.deliveredOrders}
          label="Orders Delivered"
          icon={FaTruck}
          borderColor="green"
          iconColor="green"
        />
        <KPICard
          value={kpiData.completedOrders}
          label="Orders Completed"
          icon={FaCheck}
          borderColor="purple"
          iconColor="purple"
        />
      </div>

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
              value={searchOrderId}
              onChange={(e) => {
                setSearchOrderId(e.target.value);
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
              <tr className="border-b border-gray-300">
                <th className="py-3 px-4 text-left">Order ID</th>
                <th className="py-3 px-4 text-left">Customer Name</th>
                <th className="py-3 px-4 text-left">Order Date</th>
                <th className="py-3 px-4 text-left">Total Amount</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">SAP Order ID</th>
                <th className="py-3 px-4 text-left">Remarks</th>
              </tr>
            </thead>

            <tbody>
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <img src={noData} alt="No users found" className="w-32 h-32 mb-4" />
                      <p className="text-gray-500 text-lg">No users found</p>
                    </div>
                  </td>
                </tr>
              ) :
                (
                  currentOrders.map((order, index) => (
                    <tr key={index} className="border-t border-gray-300">
                      <td className="px-4 py-3">{order.orderId}</td>
                      <td className="px-4 py-3">{order.contactPerson}</td>
                      <td className="px-4 py-3">{order.orderDate}</td>
                      <td className="px-4 py-3">₹{order.total}</td>
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
              currentOrders.map((order, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded-xl p-4 shadow-md bg-white space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Order #{order.orderId}</h3>
                    <span
                      className={`px-2 py-1 text-sm rounded-full font-medium 
              ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium text-gray-700">Customer:</span> {order.contactPerson}</p>
                    <p><span className="font-medium text-gray-700">Date:</span> {order.orderDate}</p>
                    <p><span className="font-medium text-gray-700">Total:</span> ₹ {order.total}</p>
                    <p><span className="font-medium">SAP Order ID:</span> {order.salesOrderId}</p>
                    <p><span className="font-medium">Remarks:</span> {order.salesOrderId !== null ? "synced" : "not synced"}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <img src={noData} alt="No orders found" className="w-32 h-32 mb-4" />
                  <p className="text-gray-500 text-lg">No orders found</p>
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

export default EmployeeDashboard