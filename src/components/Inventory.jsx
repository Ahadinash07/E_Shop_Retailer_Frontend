import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import axios from 'axios';
import moment from 'moment';
import { 
  FiSearch, 
  FiRefreshCw, 
  FiEye,
  FiX,
  FiPackage,
  FiDollarSign,
  FiTag,
  FiLayers,
  FiTruck,
  FiInfo,
  FiClock,
  FiAlertCircle
} from 'react-icons/fi';

const API_URL = "https://e-shop-backend-sage.vercel.app";

const Inventory = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Fetch inventory from API
  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setIsRefreshing(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to view inventory');
      }

      const response = await axios.get(`${API_URL}/retailer/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data.success || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response format from server');
      }

      setProducts(response.data.data);
    } catch (err) {
      console.error('Fetch inventory error:', err);
      setError(err.message === 'Network Error' 
        ? 'Unable to connect to the server. Please check if the backend is running.'
        : err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Filter products based on search term and active filter
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'low') return matchesSearch && product.quantity <= 10;
    if (activeFilter === 'medium') return matchesSearch && product.quantity > 10 && product.quantity <= 50;
    if (activeFilter === 'high') return matchesSearch && product.quantity > 50;
    
    return matchesSearch;
  });

  // Open modal with product details
  const openModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Render product cards
  const renderProducts = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" >
      {filteredProducts.map((product, index) => (
        <motion.div
          onClick={() => openModal(product)}
          key={product.productId}
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5 }}
        >
          <div className="h-48 overflow-hidden relative">
            {product.productImages && product.productImages.length > 0 ? (
              <img
                src={product.productImages[0]}
                alt={product.productName}
                className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <FiPackage className="text-gray-400 text-4xl" />
              </div>
            )}
            <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-sm">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                product.quantity > 50 ? 'bg-green-100 text-green-800' :
                product.quantity > 10 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {product.quantity} in stock
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{product.productName}</h3>
                <p className="text-xs text-gray-500 mt-1">{product.brand || 'Generic Brand'}</p>
              </div>
              <span className="text-lg font-bold text-indigo-600">₹{product.price}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description || 'No description available'}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                {product.category}
              </span>
              <motion.button
                onClick={() => openModal(product)}
                className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiEye className="mr-2" /> View
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // Modal component for detailed view
  const renderModal = () => (
    <AnimatePresence>
      {isModalOpen && selectedProduct && (
        <motion.div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedProduct.productName}</h2>
                  <p className="text-sm text-gray-500 mt-1">{selectedProduct.brand || 'Generic Brand'}</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {selectedProduct.productImages && selectedProduct.productImages.length > 0 ? (
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                      <img
                        src={selectedProduct.productImages[0]}
                        alt={selectedProduct.productName}
                        className="w-full h-full object-contain"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/500'; }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-xl">
                      <FiPackage className="text-gray-400 text-6xl" />
                    </div>
                  )}
                  
                  {selectedProduct.productImages && selectedProduct.productImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {selectedProduct.productImages.slice(0, 4).map((img, idx) => (
                        <div key={idx} className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                          <img
                            src={img}
                            alt={`${selectedProduct.productName} ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Current Price</p>
                        <p className="text-2xl font-bold text-indigo-600">₹{selectedProduct.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Stock Level</p>
                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                          selectedProduct.quantity > 50 ? 'bg-green-100 text-green-800' :
                          selectedProduct.quantity > 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedProduct.quantity} units
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex items-center text-gray-500 mb-1">
                        <FiTag className="mr-2" />
                        <span className="text-sm">Category</span>
                      </div>
                      <p className="font-medium">{selectedProduct.category}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex items-center text-gray-500 mb-1">
                        <FiLayers className="mr-2" />
                        <span className="text-sm">Subcategory</span>
                      </div>
                      <p className="font-medium">{selectedProduct.subcategory}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex items-center text-gray-500 mb-1">
                        <FiClock className="mr-2" />
                        <span className="text-sm">Added On</span>
                      </div>
                      <p className="font-medium">{moment(selectedProduct.addedAt).format('DD MMM YYYY')}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex items-center text-gray-500 mb-1">
                        <FiClock className="mr-2" />
                        <span className="text-sm">Last Updated</span>
                      </div>
                      <p className="font-medium">{moment(selectedProduct.updatedAt).format('DD MMM YYYY')}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <FiInfo className="mr-2 text-indigo-500" />
                      Product Description
                    </h3>
                    <p className="text-gray-700">
                      {selectedProduct.description || 'No detailed description available for this product.'}
                    </p>
                  </div>
                  
                  {selectedProduct.descriptionDetails && (
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Specifications</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedProduct.descriptionDetails.colors && (
                          <div>
                            <p className="text-sm text-gray-500">Colors</p>
                            <p className="font-medium">
                              {selectedProduct.descriptionDetails.colors.join(', ') || 'N/A'}
                            </p>
                          </div>
                        )}
                        {selectedProduct.descriptionDetails.sizes && (
                          <div>
                            <p className="text-sm text-gray-500">Sizes</p>
                            <p className="font-medium">
                              {selectedProduct.descriptionDetails.sizes.join(', ') || 'N/A'}
                            </p>
                          </div>
                        )}
                        {selectedProduct.descriptionDetails.weight && (
                          <div>
                            <p className="text-sm text-gray-500">Weight</p>
                            <p className="font-medium">
                              {selectedProduct.descriptionDetails.weight} kg
                            </p>
                          </div>
                        )}
                        {selectedProduct.descriptionDetails.dimensions && (
                          <div>
                            <p className="text-sm text-gray-500">Dimensions</p>
                            <p className="font-medium">
                              {selectedProduct.descriptionDetails.dimensions}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedProduct.videoUrl && (
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Video</h3>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video controls className="w-full h-full">
                      <source src={selectedProduct.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Error state
  if (error) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <div className="flex-1 p-4 overflow-y-auto flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
              <div className="flex justify-center mb-4">
                <FiAlertCircle className="text-red-500 text-4xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <motion.button 
                onClick={fetchInventory} 
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg flex items-center justify-center mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiRefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Retry
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6 flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <motion.h2 
                className="text-2xl font-bold text-gray-800"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                Inventory Management
              </motion.h2>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <motion.button 
                  onClick={fetchInventory}
                  disabled={isRefreshing}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg flex items-center shadow-sm hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <FiRefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </motion.button>
              </div>
            </div>
            
            <motion.div
              className="mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products by name, category, brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === 'all' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Products
                </button>
                <button
                  onClick={() => setActiveFilter('low')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === 'low' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Low Stock
                </button>
                <button
                  onClick={() => setActiveFilter('medium')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === 'medium' 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Medium Stock
                </button>
                <button
                  onClick={() => setActiveFilter('high')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === 'high' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  High Stock
                </button>
              </div>
            </motion.div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <motion.div
                  className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
                <span className="ml-3 text-gray-600">Loading inventory...</span>
              </div>
            ) : filteredProducts.length > 0 ? (
              renderProducts()
            ) : (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="mx-auto max-w-md">
                  <FiPackage className="mx-auto text-gray-400 text-5xl mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No products found</h3>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? "Try adjusting your search or filter criteria."
                      : "Your inventory appears to be empty. Add products to get started."}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      {renderModal()}
    </div>
  );
};

export default Inventory;