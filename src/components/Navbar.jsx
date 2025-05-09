import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiUser, FiBell, FiMessageSquare } from 'react-icons/fi';

const API_URL = 'http://localhost:5374/';

const Navbar = () => {
    const [retailer, setRetailer] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedRetailer = localStorage.getItem('retailer');

        if (!token || !storedRetailer) {
            navigate('/login');
            return;
        }

        setRetailer(JSON.parse(storedRetailer));
        // Fetch notifications (mock data for example)
        setNotifications([
            { id: 1, message: 'New order received', time: '2 min ago', read: false },
            { id: 2, message: 'Inventory low for Product X', time: '1 hour ago', read: true },
            { id: 3, message: 'Payment received for Order #123', time: '3 hours ago', read: true }
        ]);
    }, [navigate]);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            const retailerId = JSON.parse(localStorage.getItem('retailer')).retailerId;

            await axios.post(
                `${API_URL}retailer_logout`,
                { retailerId }, 
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            localStorage.removeItem('token');
            localStorage.removeItem('retailer');
            navigate('/login');
        } catch (error) {
            console.error('Error during logout:', error);
            alert('Logout failed. Please try again.');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: -20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const dropdownVariants = {
        hidden: { 
            opacity: 0,
            y: -10,
            transition: {
                duration: 0.2
            }
        },
        visible: { 
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.div 
            className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Left Side */}
            <motion.div variants={itemVariants}>
                <h1 className="text-xl md:text-2xl font-bold">
                    Welcome, <span className="text-yellow-300">{retailer?.Retailer_Name}</span>
                </h1>
            </motion.div>

            {/* Right Side */}
            <motion.div 
                className="flex items-center space-x-4"
                variants={itemVariants}
            >
                {/* Notifications */}
                <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <button 
                        className="p-2 rounded-full hover:bg-blue-500 relative"
                        onClick={() => setIsDropdownOpen(false)}
                    >
                        <FiBell className="text-xl" />
                        {notifications.some(n => !n.read) && (
                            <motion.span 
                                className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ 
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    duration: 1.5
                                }}
                            />
                        )}
                    </button>
                </motion.div>

                {/* Messages */}
                <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <button className="p-2 rounded-full hover:bg-blue-500">
                        <FiMessageSquare className="text-xl" />
                    </button>
                </motion.div>

                {/* User Profile */}
                <motion.div className="relative">
                    <motion.button
                        className="flex items-center space-x-2 p-2 rounded-full hover:bg-blue-500"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="h-8 w-8 rounded-full bg-white text-blue-600 flex items-center justify-center">
                            <FiUser />
                        </div>
                        <span className="hidden md:inline">{retailer?.Retailer_Name?.split(' ')[0]}</span>
                    </motion.button>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                                variants={dropdownVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                            >
                                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                                    <p>Signed in as</p>
                                    <p className="font-medium">{retailer?.Retailer_Name}</p>
                                </div>
                                <a 
                                    href="#" 
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Your Profile
                                </a>
                                <a 
                                    href="#" 
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Settings
                                </a>
                                <motion.button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                                    whileHover={{ x: 5 }}
                                >
                                    <FiLogOut className="mr-2" />
                                    Logout
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default Navbar;