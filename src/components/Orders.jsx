import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FiEdit, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const API_URL = 'http://localhost:5374/';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [trackingStatus, setTrackingStatus] = useState('');
    const [trackingNotes, setTrackingNotes] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('Token:', token); // Debug
                if (!token) {
                    setError('Please log in to view orders');
                    navigate('/login');
                    return;
                }
                const response = await axios.get(`${API_URL}retailer/orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('API Response:', JSON.stringify(response.data, null, 2)); // Debug
                const fetchedOrders = response.data.orders || [];
                // Check for duplicate order_id
                const orderIdCounts = fetchedOrders.reduce((acc, order) => {
                    acc[order.order_id] = (acc[order.order_id] || 0) + 1;
                    return acc;
                }, {});
                const duplicates = Object.entries(orderIdCounts)
                    .filter(([_, count]) => count > 1)
                    .map(([order_id]) => order_id);
                if (duplicates.length > 0) {
                    console.warn('Duplicate order IDs detected:', duplicates);
                    // Log details of duplicate orders
                    duplicates.forEach((dupId) => {
                        const dupOrders = fetchedOrders.filter((order) => order.order_id === dupId);
                        console.warn(`Details for duplicate order_id ${dupId}:`, JSON.stringify(dupOrders, null, 2));
                    });
                }
                setOrders(fetchedOrders);
                setLoading(false);
            } catch (err) {
                console.error('Fetch Orders Error:', err.response?.data || err.message); // Debug
                if (err.response?.status === 401) {
                    setError('Session expired. Please log in again.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('retailer');
                    navigate('/login');
                } else {
                    setError('Failed to fetch orders: ' + (err.response?.data?.message || err.message));
                }
                setLoading(false);
            }
        };
        fetchOrders();
    }, [navigate]);

    const updateOrderStatus = async (orderId, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_URL}retailer/orders/${orderId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOrders(
                orders.map((order) =>
                    order.order_id === orderId ? { ...order, order_status: status } : order
                )
            );
        } catch (err) {
            console.error('Update Status Error:', err.response?.data || err.message);
            alert('Failed to update status: ' + (err.response?.data?.message || err.message));
        }
    };

    const updateTracking = async () => {
        if (!trackingStatus) {
            alert('Please select a tracking status');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}retailer/orders/${selectedOrderId}/tracking`,
                { status: trackingStatus, notes: trackingNotes },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOrders(
                orders.map((order) =>
                    order.order_id === selectedOrderId
                        ? { ...order, tracking_status: trackingStatus, tracking_notes: trackingNotes }
                        : order
                )
            );
            setIsModalOpen(false);
            setTrackingStatus('');
            setTrackingNotes('');
        } catch (err) {
            console.error('Update Tracking Error:', err.response?.data || err.message);
            alert('Failed to update tracking: ' + (err.response?.data?.message || err.message));
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                    <span className="text-lg font-medium text-gray-700">Loading orders...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="rounded-lg bg-red-100 p-6 text-center shadow-md">
                    <p className="text-lg font-semibold text-red-700">{error}</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-4 sm:p-6">
                <Navbar />
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="mt-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
                >
                    <h2 className="mb-6 text-2xl font-semibold text-gray-800">Orders</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6">
                                        Order ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6">
                                        Product
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6">
                                        Quantity
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6">
                                        Total
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6">
                                        Tracking
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="px-4 py-6 text-center text-sm text-gray-500 sm:px-6"
                                        >
                                            No orders found
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order, index) => (
                                        <motion.tr
                                            key={order.order_id} // Reverted after backend fix
                                            variants={itemVariants}
                                            className={`transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                                        >
                                            <td className="px-4 py-4 text-sm text-gray-900 sm:px-6">
                                                {order.order_id.slice(0, 8)}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900 sm:px-6">
                                                {`${order.first_name} ${order.last_name}`}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900 sm:px-6">
                                                {order.productName}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900 sm:px-6">
                                                {order.quantity}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900 sm:px-6">
                                                $
                                                {isNaN(Number(order.total_amount))
                                                    ? 'N/A'
                                                    : Number(order.total_amount).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4 text-center text-sm sm:px-6">
                                                {order.order_status === 'Cancelled' ? (
                                                    <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-red-700">
                                                        {order.order_status}
                                                    </span>
                                                ) : (
                                                    <select
                                                        value={order.order_status}
                                                        onChange={(e) =>
                                                            updateOrderStatus(order.order_id, e.target.value)
                                                        }
                                                        className="rounded-md border-gray-300 bg-white px-3 py-1 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Confirmed">Confirmed</option>
                                                        <option value="Shipped">Shipped</option>
                                                        <option value="Delivered">Delivered</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900 sm:px-6">
                                                {order.tracking_status || 'N/A'}
                                                {order.tracking_notes && (
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {order.tracking_notes}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-center text-sm sm:px-6">
                                                {order.order_status !== 'Cancelled' ? (
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => {
                                                            setSelectedOrderId(order.order_id);
                                                            setTrackingStatus(order.tracking_status || '');
                                                            setTrackingNotes(order.tracking_notes || '');
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-700"
                                                        title="Edit Tracking"
                                                    >
                                                        <FiEdit className="h-4 w-4" />
                                                    </motion.button>
                                                ) : (
                                                    <span
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-400"
                                                        title="Tracking cannot be modified for canceled orders"
                                                    >
                                                        <FiEdit className="h-4 w-4 opacity-50" />
                                                    </span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Tracking Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                variants={modalVariants}
                                className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-800">Update Tracking</h3>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setIsModalOpen(false)}
                                        className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                    >
                                        <FiX className="h-5 w-5" />
                                    </motion.button>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Tracking Status
                                        </label>
                                        <select
                                            value={trackingStatus}
                                            onChange={(e) => setTrackingStatus(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Out for Delivery">Out for Delivery</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                                        <textarea
                                            value={trackingNotes}
                                            onChange={(e) => setTrackingNotes(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                            rows="4"
                                            placeholder="Add tracking notes (e.g., Shipped via XYZ Courier)"
                                        />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={updateTracking}
                                        className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                    >
                                        Save Tracking
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Orders;