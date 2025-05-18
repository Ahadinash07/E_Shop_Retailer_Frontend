import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = 'https://ahadinash07-e-shop-backend2-for-admin-retailer.vercel.app';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: [
      { title: 'Total Orders', value: 0 },
      { title: 'Products', value: 0 },
      { title: 'Customers', value: 0 },
      { title: 'Revenue', value: '₹0' }
    ],
    products: [],
    salesOverview: [],
    salesOverviewHeights: [],
    topSelling: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view dashboard');
          navigate('/login');
          return;
        }
        const response = await axios.get(`${API_URL}/retailer/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          // Remove the change percentage from stats
          const updatedStats = response.data.data.stats.map(stat => ({
            title: stat.title,
            value: stat.value
          }));
          setDashboardData({
            ...response.data.data,
            stats: updatedStats
          });
        } else {
          throw new Error(response.data.error || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('retailer');
          setError('Session expired. Please log in again.');
          navigate('/login');
        } else {
          setError(err.message || 'Failed to fetch dashboard data');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const cardVariants = {
    hover: {
      y: -5,
      boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
      transition: { duration: 0.3 },
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.2 }
    }
  };

  const handleCardClick = (title) => {
    switch(title.toLowerCase()) {
      case 'total orders':
        navigate('/orders');
        break;
      case 'products':
        navigate('/inventory');
        break;
      case 'customers':
        navigate('/customers');
        break;
      case 'revenue':
        break;
      default:
        break;
    }
  };

  // Chart data for Sales Overview
  const chartData = {
    labels: dashboardData.salesOverview.map((item) => item.day),
    datasets: [
      {
        label: 'Daily Revenue (₹)',
        data: dashboardData.salesOverview.map((item) => item.revenue),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: 40,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { family: 'Poppins', size: 12 },
        bodyFont: { family: 'Poppins', size: 12 },
        callbacks: {
          label: (context) => `₹${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Poppins', size: 12 } },
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          font: { family: 'Poppins', size: 12 },
          callback: (value) => `₹${value}`,
        },
        beginAtZero: true,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-7xl p-6">
          <Skeleton height={60} width={200} className="mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array(4)
              .fill()
              .map((_, index) => (
                <Skeleton key={index} height={120} className="rounded-xl" />
              ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton height={400} className="lg:col-span-2 rounded-xl" />
            <div className="space-y-6">
              <Skeleton height={200} className="rounded-xl" />
              <Skeleton height={150} className="rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-xl bg-red-50 p-8 text-center shadow-lg">
          <p className="text-xl font-semibold text-red-600 mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="rounded-lg bg-primary-600 px-6 py-3 text-white font-medium hover:bg-primary-700 transition-colors"
          >
            Go to Login
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 font-poppins">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Navbar />
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-7xl mx-auto space-y-8 pt-8"
          >
            {/* Stats Cards */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {dashboardData.stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 bg-gradient-to-br from-primary-50 to-white cursor-pointer"
                  onClick={() => handleCardClick(stat.title)}
                >
                  <h3 className="text-secondary-500 text-sm font-medium uppercase tracking-wide">{stat.title}</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-3">{stat.value}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Main Content */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Products Table */}
              <motion.div
                variants={itemVariants}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 lg:col-span-2"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Your Products</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                    onClick={() => navigate('/product')}
                  >
                    Add Product
                  </motion.button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Sales
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardData.products.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                            No products found
                          </td>
                        </tr>
                      ) : (
                        dashboardData.products.map((product, index) => (
                          <motion.tr
                            key={product.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                  <span className="text-primary-600 font-medium text-lg">{product.name.charAt(0)}</span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{product.stock}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{product.sales}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">₹{parseFloat(product.price).toFixed(2)}</div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                variants={itemVariants}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Overview</h3>
                  <div className="h-64">
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
                  <div className="space-y-3">
                    {dashboardData.topSelling.length === 0 ? (
                      <p className="text-sm text-gray-500">No sales data available</p>
                    ) : (
                      dashboardData.topSelling.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          className="flex items-center p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                        >
                          <div className="bg-primary-100 rounded-lg h-10 w-10 flex items-center justify-center">
                            <span className="text-primary-600 font-medium">{product.name.charAt(0)}</span>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.sales} sold</p>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">₹{parseFloat(product.price).toFixed(2)}</div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;