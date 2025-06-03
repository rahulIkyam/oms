import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import buffer from '../../../public/assets/buffer.gif';

function CustomerViewOrder() {
    const { state } = useLocation();
    const order = state?.order;
    const items = order?.items || [];
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <img src={buffer} alt="Loading..." className="w-40 h-40" />
            </div>
        );
    }

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
                    <h1 className="text-2xl font-bold text-gray-800">View Order</h1>
                </div>
            </div>

            {/* Order Info */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div><strong>Order ID:</strong> {order?.orderId}</div>
                <div><strong>Order Date:</strong> {order?.orderDate}</div>
            </div>

            {/* Responsive Layout */}
            <div className="rounded-xl overflow-hidden border border-gray-300">
                {/* Desktop Table */}
                <table className="hidden md:table w-full min-w-[100px] divide-y divide-gray-200">
                    <thead className="bg-gray-50 h-[50px]">
                        <tr className="border-b border-gray-300">
                            <th className="py-3 px-4 text-left">S.No</th>
                            <th className="py-3 px-4 text-left">Product Name</th>
                            <th className="py-3 px-4 text-left">Category</th>
                            <th className="py-3 px-4 text-left">Unit</th>
                            <th className="py-3 px-4 text-left">Price</th>
                            <th className="py-3 px-4 text-left">Qty</th>
                            <th className="py-3 px-4 text-left">Total Amount</th>
                        </tr>
                    </thead>

                    <tbody>
                        {items.map((item, index) => (
                            <tr key={item.orderMasterItemId} className="border-t border-gray-300">
                                <td className="px-4 py-3">{index + 1}</td>
                                <td className="px-4 py-3">{item.productDescription}</td>
                                <td className="px-4 py-3">{item.categoryName}</td>
                                <td className="px-4 py-3">{item.baseUnit}</td>
                                <td className="px-4 py-3">{item.standardPrice}</td>
                                <td className="px-4 py-3">{item.qty}</td>
                                <td className="px-4 py-3">{item.totalAmount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 p-4">
                    {items.map((item, index) => (
                        <div
                            key={item.orderMasterItemId}
                            className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white"
                        >
                            <p><span className="font-medium">S.No:</span> {index + 1}</p>
                            <p><span className="font-medium">Product Name:</span> {item.productDescription}</p>
                            <p><span className="font-medium">Category:</span> {item.categoryName}</p>
                            <p><span className="font-medium">Unit:</span> {item.baseUnit}</p>
                            <p><span className="font-medium">Price:</span> ₹{item.standardPrice}</p>
                            <p><span className="font-medium">Qty:</span> {item.qty}</p>
                            <p><span className="font-medium">Total Amount:</span> ₹{item.totalAmount}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Total Amount Section */}
            <div className="mt-6 flex justify-end">
                <div className="text-lg font-semibold">
                    Total: ₹{order?.total}
                </div>
            </div>
        </div>
    );
}

export default CustomerViewOrder;
