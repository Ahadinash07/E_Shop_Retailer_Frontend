import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const sidebarVariants = {
    open: { 
      width: "16rem",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    },
    closed: { 
      width: "5rem",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    }
  };

  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    closed: { 
      opacity: 0,
      y: 20,
      transition: { duration: 0.2 } 
    }
  };

  const linkVariants = {
    hover: { 
      scale: 1.05,
      backgroundColor: "rgba(55, 65, 81, 0.7)",
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95 
    }
  };

  return (
    <motion.div 
      className="flex min-h-screen"
      initial={false}
      animate="open"
    >
      <motion.div 
        className="bg-gradient-to-b from-gray-800 to-gray-900 text-white p-4 flex flex-col"
        variants={sidebarVariants}
      >
        <motion.h2 
          className="text-2xl font-bold mb-6 p-2 bg-gray-700 rounded-lg text-center"
          variants={itemVariants}
        >
          RetailPro
        </motion.h2>
        
        <motion.ul className="space-y-2 mt-4">
          <motion.li variants={itemVariants}>
            <motion.div
              variants={linkVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link 
                to="/dashboard" 
                className="flex items-center p-3 rounded-lg transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Dashboard</span>
              </Link>
            </motion.div>
          </motion.li>

          <motion.li variants={itemVariants}>
            <motion.div
              variants={linkVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link 
                to="/product" 
                className="flex items-center p-3 rounded-lg transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Products</span>
              </Link>
            </motion.div>
          </motion.li>

          <motion.li variants={itemVariants}>
            <motion.div
              variants={linkVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link 
                to="/orders" 
                className="flex items-center p-3 rounded-lg transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Orders</span>
              </Link>
            </motion.div>
          </motion.li>

          <motion.li variants={itemVariants}>
            <motion.div
              variants={linkVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link 
                to="/customers" 
                className="flex items-center p-3 rounded-lg transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Customers</span>
              </Link>
            </motion.div>
          </motion.li>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;