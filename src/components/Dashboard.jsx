import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

// Sample data
const products = [
  { id: 1, name: 'Premium Headphones', stock: 45, sales: 120, price: 199.99 },
  { id: 2, name: 'Wireless Keyboard', stock: 32, sales: 85, price: 89.99 },
  { id: 3, name: 'Bluetooth Speaker', stock: 18, sales: 210, price: 129.99 },
  { id: 4, name: 'Smart Watch', stock: 12, sales: 95, price: 249.99 },
];

const stats = [
  { title: 'Total Revenue', value: '$12,845', change: '+12%' },
  { title: 'Total Orders', value: '324', change: '+8%' },
  { title: 'Products', value: '56', change: '+5%' },
  { title: 'Customers', value: '1,243', change: '+18%' },
];

const Dashboard = () => {
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
        ease: "easeOut"
      },
    },
  };

  const cardVariants = {
    hover: {
      y: -5,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar />
      
      <div className="flex-1 p-4">
        <Navbar />
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6 pt-8"
        >
          {/* Stats Cards */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
                <div className="flex items-baseline mt-2">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <span className="ml-2 text-green-500 text-sm font-medium">{stat.change}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products Table */}
            <motion.div 
              variants={itemVariants}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Your Products</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium"
                >
                  Add Product
                </motion.button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product, index) => (
                      <motion.tr 
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-md flex items-center justify-center">
                              <span className="text-indigo-600 font-medium">{product.name.charAt(0)}</span>
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
                          <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div 
              variants={itemVariants}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold mb-4">Sales Overview</h3>
                <motion.div 
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.4 }}
                  className="h-48 bg-gradient-to-b from-indigo-100 to-indigo-50 rounded-lg flex items-end p-2"
                >
                  {[30, 60, 45, 80, 60, 90, 70].map((height, index) => (
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: 0.5 + index * 0.05, type: 'spring' }}
                      className="w-8 bg-indigo-500 rounded-t mx-1"
                    />
                  ))}
                </motion.div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">Top Selling</h3>
                <div className="space-y-3">
                  {products.slice(0, 3).map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="bg-indigo-100 rounded-md h-10 w-10 flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">{product.name.charAt(0)}</span>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sales} sold</p>
                      </div>
                      <div className="text-sm font-bold">${product.price.toFixed(2)}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;