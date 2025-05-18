import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import OrderDetailsModal from '../Modal/OrderDetailsModal';

const API_URL = 'https://ahadinash07-e-shop-backend2-for-admin-retailer.vercel.app';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'orderDate', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const ordersPerPage = 10;
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view orders');
      navigate('/login');
    } else if (!userId || userId === 'unknown') {
      setError('Invalid user ID');
    } else {
      fetchOrders(token, userId);
    }
  }, [userId, navigate]);

  const fetchOrders = async (token, userId) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Fetching orders for userId: ${userId}`);
      const response = await axios.get(`${API_URL}/retailer/orders/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('API response:', JSON.stringify(response.data, null, 2));
      if (response.data.success) {
        const formattedOrders = response.data.data.map((order) => ({
          ...order,
          total: Number(order.total) || 0,
          status: order.status || 'Unknown',
          items: order.items
            ? typeof order.items === 'string'
              ? JSON.parse(order.items)
              : order.items
            : [],
        }));
        console.log('Formatted orders:', JSON.stringify(formattedOrders, null, 2));
        setOrders(formattedOrders);
        setFilteredOrders(formattedOrders);
      } else {
        throw new Error(response.data.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('retailer');
        setError('Session expired. Please log in again.');
        navigate('/login');
      } else {
        setError(error.message || 'Failed to fetch order details');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  useEffect(() => {
    const filtered = orders.filter(
      (order) =>
        (order.orderId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (order.status?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [searchTerm, orders]);

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredOrders].sort((a, b) => {
      const aValue =
        key === 'orderDate'
          ? new Date(a[key])
          : key === 'total'
          ? Number(a[key])
          : (a[key] || '').toLowerCase();
      const bValue =
        key === 'orderDate'
          ? new Date(b[key])
          : key === 'total'
          ? Number(b[key])
          : (b[key] || '').toLowerCase();
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredOrders(sorted);
  };

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Modal handlers
  const openModal = (order) => setSelectedOrder(order);
  const closeModal = () => setSelectedOrder(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100 font-poppins">
        <Sidebar />
        <div className="flex-1 p-6">
          <Navbar />
          <div className="max-w-7xl mx-auto">
            <Skeleton height={40} width={200} className="mb-6" />
            <Skeleton height={60} width={300} className="mb-4" />
            <Skeleton height={400} className="rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 font-poppins">
        <div className="rounded-xl bg-red-50 p-8 text-center shadow-lg">
          <p className="text-xl font-semibold text-red-600 mb-4">{error}</p>
          <div className="space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/customers')}
              className="rounded-lg bg-primary-600 px-6 py-3 text-white font-medium hover:bg-primary-700 transition-colors"
            >
              Back to Customers
            </motion.button>
            {error.includes('log in') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="rounded-lg bg-gray-600 px-6 py-3 text-white font-medium hover:bg-gray-700 transition-colors"
              >
                Go to Login
              </motion.button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 font-poppins">
      <Sidebar />
      <div className="flex-1 p-6">
        <Navbar />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto"
        >
          <div className="flex justify-between items-center mb-6 mt-4">
            <h1 className="text-3xl font-semibold text-gray-900">
              Orders for User {userId}
            </h1>
            <div classNameculo="relative w-full max-w-xs">
                <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {/* <input
                type="text"
                placeholder="Search by order ID or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg> */}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders found for this user.</p>
          ) : (
            <>
              {/* Desktop Table */}
              <motion.div
                variants={itemVariants}
                className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-secondary-50">
                      <tr>
                        {['orderId', 'orderDate', 'total', 'status', 'actions'].map((key) => (
                          <th
                            key={key}
                            onClick={() => key !== 'actions' && handleSort(key)}
                            className={`px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider ${
                              key !== 'actions' ? 'cursor-pointer hover:text-secondary-700' : ''
                            }`}
                          >
                            <div className="flex items-center">
                              <span>
                                {key === 'orderId'
                                  ? 'Order ID'
                                  : key === 'orderDate'
                                  ? 'Date'
                                  : key === 'total'
                                  ? 'Total'
                                  : key === 'status'
                                  ? 'Status'
                                  : 'Actions'}
                              </span>
                              {sortConfig.key === key && key !== 'actions' && (
                                <svg
                                  className="w-4 h-4 ml-1"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d={
                                      sortConfig.direction === 'asc'
                                        ? 'M19 9l-7 7-7-7'
                                        : 'M5 15l7-7 7 7'
                                    }
                                  />
                                </svg>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentOrders.map((order, index) => (
                        <motion.tr
                          key={order.orderId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-gray-600">{order.orderId}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            ${typeof order.total === 'number' ? order.total.toFixed(2) : '0.00'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'Shipped'
                                  ? 'bg-green-100 text-green-700'
                                  : order.status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : order.status === 'Delivered'
                                  ? 'bg-blue-100 text-blue-700'
                                  : order.status === 'Cancelled'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {order.status || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal(order)}
                              className="px-4 py-2 bg-primary-600 text-white bg-blue-600 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
                            >
                              View Details
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {currentOrders.map((order, index) => (
                  <motion.div
                    key={order.orderId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white p-4 rounded-xl shadow-lg border border-gray-100"
                  >
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-900">
                        <span className="text-secondary-500">Order ID:</span> {order.orderId}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="text-secondary-500">Date:</span>{' '}
                        {new Date(order.orderDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="text-secondary-500">Total:</span> $
                        {typeof order.total === 'number' ? order.total.toFixed(2) : '0.00'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="text-secondary-500">Status:</span>{' '}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'Shipped'
                              ? 'bg-green-100 text-green-700'
                              : order.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : order.status === 'Delivered'
                              ? 'bg-blue-100 text-blue-700'
                              : order.status === 'Cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {order.status || 'Unknown'}
                        </span>
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openModal(order)}
                        className="w-full mt-2 px-4 py-2 text-white rounded-lg text-sm font-semibold  bg-blue-600 transition-colors shadow-sm"
                      >
                        View Details
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  variants={itemVariants}
                  className="flex justify-center mt-6 space-x-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    Previous
                  </motion.button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => paginate(page)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        currentPage === page
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {page}
                    </motion.button>
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    Next
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </motion.div>

        {/* Modal */}
        <OrderDetailsModal order={selectedOrder} onClose={closeModal} />
      </div>
    </div>
  );
};

export default OrdersPage;