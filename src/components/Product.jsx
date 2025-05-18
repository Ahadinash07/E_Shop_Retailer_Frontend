import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import axios from 'axios';
import moment from 'moment';
import AddProductModal from '../Modal/AddProductModal';
import ProductDescriptionModal from '../Modal/ProductDescriptionModal';
import { 
  FiSearch, 
  FiPlus, 
  FiRefreshCw, 
  FiEdit, 
  FiChevronLeft, 
  FiChevronRight 
} from 'react-icons/fi';

const API_URL = "https://e-shop-backend-sage.vercel.app";

const Product = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setIsRefreshing(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const storedRetailer = localStorage.getItem('retailer');

      if (!token || !storedRetailer) {
        throw new Error('Authentication required');
      }

      const retailerId = JSON.parse(storedRetailer).retailerId;
      const response = await axios.get(`${API_URL}/api/products/getRetailerProducts/${retailerId}`);
      
      if (!response.data || !Array.isArray(response.data.products)) {
        throw new Error('Invalid response format');
      }

      setProducts(response.data.products);
    } catch (err) {
      console.error('Fetch products error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle new product addition
  const handleProductAdded = useCallback((newProduct) => {
    const completeProduct = {
      productId: newProduct.productId || `temp-${Date.now()}`,
      productName: newProduct.productName,
      description: newProduct.description || '',
      category: newProduct.category,
      subcategory: newProduct.subcategory,
      brand: newProduct.brand,
      quantity: newProduct.quantity,
      price: newProduct.price,
      addedAt: newProduct.addedAt || new Date().toISOString(),
    };

    setProducts(prevProducts => [completeProduct, ...prevProducts]);
    setCurrentPage(1);
    setSearchTerm('');
  }, []);

  // Table columns configuration
  const columns = useMemo(() => [
    { 
      Header: 'Product ID', 
      accessor: 'productId',
      Cell: ({ value }) => (
        <div className="flex items-center"> 
          <span className="font-mono text-sm">{value}</span>
          <motion.button
            onClick={() => { 
              setSelectedProductId(value); 
              setIsDescriptionModalOpen(true); 
            }}
            className="ml-2 text-blue-500 hover:text-blue-700 text-sm flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiEdit className="mr-1" /> Add
          </motion.button>
        </div>
      )
    },
    { 
      Header: 'Product Name', 
      accessor: 'productName', 
      Cell: ({ value }) => <span className="font-medium">{value}</span> 
    },
    { 
      Header: 'Description', 
      accessor: 'description',
      Cell: ({ value }) => (
        <div className="max-w-xs truncate" title={value}>
          {value || '-'}
        </div>
      )
    },
    { Header: 'Category', accessor: 'category' },
    { Header: 'SubCategory', accessor: 'subcategory' },
    { Header: 'Brand', accessor: 'brand' },
    { 
      Header: 'Quantity', 
      accessor: 'quantity',
      Cell: ({ value }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value > 50 ? 'bg-green-100 text-green-800' : 
          value > 10 ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    { 
      Header: 'Price', 
      accessor: 'price',
      Cell: ({ value }) => `₹${parseFloat(value).toFixed(2)}`
    },
    {
      Header: 'Date',
      accessor: 'addedAt',
      Cell: ({ value }) => moment(value).format('DD/MM/YYYY'),
    },
  ], []);

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    
    return products.filter(product =>
      Object.values(product).some(value =>
        value && String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [products, searchTerm]);

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  }, [filteredProducts, currentPage, productsPerPage]);

  // Handle pagination
  const paginate = useCallback((pageNumber) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(pageNumber);
  }, []);

  // Render product table with proper scrolling
  const renderTable = useCallback(() => {
    return (
      <div className="overflow-hidden rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <motion.table 
            className="min-w-full divide-y divide-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th 
                    key={column.accessor} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10"
                  >
                    {column.Header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedProducts.map((product, index) => (
                <motion.tr 
                  key={product.productId} 
                  className="hover:bg-gray-50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  {columns.map((column) => (
                    <td 
                      key={column.accessor} 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {column.Cell ? column.Cell({ value: product[column.accessor] }) : product[column.accessor]}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        </div>
      </div>
    );
  }, [columns, paginatedProducts]);

  // Render pagination controls
  const renderPagination = useCallback(() => {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <motion.div 
        className="flex items-center justify-between mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex-1 flex justify-between sm:hidden">
          <motion.button
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Previous
          </motion.button>
          <motion.button
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Next
          </motion.button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * productsPerPage + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * productsPerPage, filteredProducts.length)}</span> of{' '}
              <span className="font-medium">{filteredProducts.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <motion.button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="sr-only">Previous</span>
                <FiChevronLeft className="h-5 w-5" />
              </motion.button>
              {startPage > 1 && (
                <>
                  <motion.button
                    onClick={() => paginate(1)}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    1
                  </motion.button>
                  {startPage > 2 && <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>}
                </>
              )}
              {pageNumbers.map(number => (
                <motion.button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === number ? 
                    'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 
                    'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {number}
                </motion.button>
              ))}
              {endPage < totalPages && (
                <>
                  {endPage < totalPages - 1 && <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>}
                  <motion.button
                    onClick={() => paginate(totalPages)}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {totalPages}
                  </motion.button>
                </>
              )}
              <motion.button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="sr-only">Next</span>
                <FiChevronRight className="h-5 w-5" />
              </motion.button>
            </nav>
          </div>
        </div>
      </motion.div>
    );
  }, [currentPage, filteredProducts.length, paginate, productsPerPage]);

  // Error state
  if (error) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col h-full overflow-x-auto">
          <div className="flex-shrink-0">
            <Navbar />
          </div>
          <div className="flex-1 overflow-x-auto p-4 min-w-max">
            <div className="bg-white p-6 rounded-lg shadow-md min-w-full" style={{ width: 'max-content' }}>
              <div className="text-red-500 mb-4">Error: {error}</div>
              <motion.button 
                onClick={fetchProducts} 
                className="px-4 py-2 bg-blue-500 text-white rounded flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiRefreshCw className="mr-2" /> Retry
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Fixed Navbar */}
        <div className="flex-shrink-0 p-6">
          <Navbar />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <motion.h2 
                className="text-2xl font-bold text-gray-800"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                Products Management
              </motion.h2>
              <div className="flex space-x-3">
                <motion.button 
                  onClick={fetchProducts}
                  disabled={isRefreshing}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiRefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </motion.button>
                <motion.button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center"
                  whileHover={{ scale: 1.05, backgroundColor: '#4f46e5' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiPlus className="mr-2" />
                  Add Product
                </motion.button>
              </div>
            </div>

            {/* Search Input */}
            <motion.div
              className="mb-6 relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </motion.div>

            {/* Loading or Content */}
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <motion.div
                  className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                {filteredProducts.length > 0 ? (
                  <>
                    <div className="flex-1 overflow-hidden">
                      {renderTable()}
                    </div>
                    <div className="mt-4">
                      {renderPagination()}
                    </div>
                  </>
                ) : (
                  <motion.div 
                    className="text-center py-12 text-gray-500 flex-1 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    No products found. Try adding a new product or adjusting your search.
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onProductAdded={handleProductAdded} 
      />
      <ProductDescriptionModal 
        isOpen={isDescriptionModalOpen} 
        onClose={() => setIsDescriptionModalOpen(false)} 
        productId={selectedProductId} 
      />  
    </div>
  );
};

export default Product;