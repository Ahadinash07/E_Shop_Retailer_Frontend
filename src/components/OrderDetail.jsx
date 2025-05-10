import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const API_URL = 'http://localhost:5374/';

const OrderDetail = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}retailer/orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const foundOrder = response.data.orders.find((o) => o.order_id === orderId);
                if (!foundOrder) {
                    throw new Error('Order not found');
                }
                setOrder(foundOrder);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch order details');
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } },
    };

    if (loading) return <div className="text-center p-6">Loading...</div>;
    if (error) return <div className="text-center p-6 text-red-500">{error}</div>;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-4">
                <Navbar />
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6"
                >
                    <h2 className="text-xl font-bold mb-6">Order Details - {order.order_id.slice(0, 8)}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Customer Information</h3>
                            <p><strong>Name:</strong> {`${order.first_name} ${order.last_name}`}</p>
                            <p><strong>Email:</strong> {order.email}</p>
                            <p><strong>Phone:</strong> {order.phone}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium mb-2">Shipping Address</h3>
                            <p>{order.address_line}</p>
                            <p>{`${order.city}, ${order.state} ${order.zip_code}`}</p>
                            <p>{order.country}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium mb-2">Order Summary</h3>
                            <p><strong>Product:</strong> {order.productName}</p>
                            <p><strong>Quantity:</strong> {order.quantity}</p>
                            <p><strong>Price:</strong> ${order.price.toFixed(2)}</p>
                            <p><strong>Total:</strong> ${order.total_amount.toFixed(2)}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium mb-2">Status & Tracking</h3>
                            <p><strong>Order Status:</strong> {order.order_status}</p>
                            <p><strong>Tracking Status:</strong> {order.tracking_status || 'N/A'}</p>
                            {order.tracking_notes && (
                                <p><strong>Tracking Notes:</strong> {order.tracking_notes}</p>
                            )}
                            <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default OrderDetail;