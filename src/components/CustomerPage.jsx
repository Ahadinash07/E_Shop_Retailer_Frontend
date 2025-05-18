import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const API_URL = 'https://e-shop-backend-sage.vercel.app';

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view customers');
      navigate('/login');
    } else {
      fetchCustomers(token);
    }
  }, [navigate]);

  const fetchCustomers = async (token) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/retailer/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const customersWithName = response.data.data.map((customer) => ({
          ...customer,
          name: `${customer.firstName} ${customer.lastName}`,
        }));
        console.log('Fetched customers:', JSON.stringify(customersWithName, null, 2)); // Debug log
        setCustomers(customersWithName);
        setFilteredCustomers(customersWithName);
      } else {
        throw new Error(response.data.error || 'Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('retailer');
        setError('Session expired. Please log in again.');
        navigate('/login');
      } else {
        setError(error.message || 'Failed to fetch customers');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
    setCurrentPage(1);
  }, [searchTerm, customers]);

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredCustomers].sort((a, b) => {
      const aValue = key === 'name' ? a.name.toLowerCase() : a[key] || '';
      const bValue = key === 'name' ? b.name.toLowerCase() : b[key] || '';
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredCustomers(sorted);
  };

  // Pagination
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  console.log('Rendering currentCustomers:', JSON.stringify(currentCustomers, null, 2)); // Debug log

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
      <div className="flex-1 p-6">
        <Navbar />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto"
        >
          <div className="flex justify-between items-center mb-6 mt-4">
            <h1 className="text-3xl font-semibold text-gray-900">Customer Management</h1>
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Search by name or email..."
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
            </div>
          </div>

          {filteredCustomers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No customers found.</p>
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
                        {['userId', 'name', 'email', 'phone', 'addresses', 'actions'].map((key) => (
                          <th
                            key={key}
                            onClick={() => key !== 'addresses' && key !== 'actions' && handleSort(key)}
                            className={`px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider ${
                              key !== 'addresses' && key !== 'actions' ? 'cursor-pointer hover:text-secondary-700' : ''
                            }`}
                          >
                            <div className="flex items-center">
                              <span>{key === 'userId' ? 'User ID' : key.charAt(0).toUpperCase() + key.slice(1)}</span>
                              {sortConfig.key === key && key !== 'addresses' && key !== 'actions' && (
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
                                    d={sortConfig.direction === 'asc' ? 'M19 9l-7 7-7-7' : 'M5 15l7-7 7 7'}
                                  />
                                </svg>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentCustomers.map((customer, index) => (
                        <motion.tr
                          key={customer.userId || `customer-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-gray-600">{customer.userId || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{customer.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{customer.phone}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {customer.addresses?.length > 0 ? (
                              <div className="relative group">
                                <span className="text-primary-600 cursor-pointer underline">
                                  {customer.addresses.length} {customer.addresses.length === 1 ? 'Address' : 'Addresses'}
                                </span>
                                <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg p-2 mt-1 z-10 w-64">
                                  {customer.addresses.map((address, addrIndex) => (
                                    <p key={`${customer.userId || index}-${address.addressId || addrIndex}-${addrIndex}`}>
                                      {address.street}, {address.city}, {address.state}, {address.country}, {address.zipCode}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              'No addresses'
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                console.log('Navigating to orders for user:', customer.userId); // Debug log
                                navigate(`/orders/${customer.userId || 'unknown'}`);
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
                            >
                              View Orders
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
                {currentCustomers.map((customer, index) => (
                  <motion.div
                    key={customer.userId || `customer-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white p-4 rounded-xl shadow-lg border border-gray-100"
                  >
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-900">
                        <span className="text-secondary-500">User ID:</span> {customer.userId || 'N/A'}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        <span className="text-secondary-500">Name:</span> {customer.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="text-secondary-500">Email:</span> {customer.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="text-secondary-500">Phone:</span> {customer.phone}
                      </p>
                      <div className="text-sm text-gray-600">
                        <span className="text-secondary-500">Addresses:</span>
                        {customer.addresses?.length > 0 ? (
                          <ul className="list-disc pl-5 mt-1">
                            {customer.addresses.map((address, addrIndex) => (
                              <li key={`${customer.userId || index}-${address.addressId || addrIndex}-${addrIndex}`}>
                                {address.street}, {address.city}, {address.state}, {address.country}, {address.zipCode}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span> No addresses</span>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          console.log('Navigating to orders for user:', customer.userId); // Debug log
                          navigate(`/orders/${customer.userId || 'unknown'}`);
                        }}
                        className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
                      >
                        View Orders
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
      </div>
    </div>
  );
};

export default CustomerPage;