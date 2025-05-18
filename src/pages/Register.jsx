import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import EcommerceAnimation from './EcommerceAnimation';

const API_URL = 'https://ahadinash07-e-shop-backend2-for-admin-retailer.vercel.app/';

const Register = () => {
    const formRef = useRef(null);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        const formData = new FormData(formRef.current);

        try {
            const response = await axios.post(`${API_URL}retailer_registration`, {
                Retailer_Name: formData.get('Retailer_Name'),
                email: formData.get('email'),
                password: formData.get('password'),
            });
            if (response.data.message === 'User registered successfully') {
                navigate('/login');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-r from-blue-600 to-purple-600">
            <EcommerceAnimation />
            
            <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full lg:w-1/2 flex items-center justify-center p-8"
            >
                <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500">
                        <h2 className="text-2xl font-bold text-white text-center py-2">Create Account</h2>
                    </div>
                    <form ref={formRef} onSubmit={handleRegister} className="p-8">
                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2 font-medium">Retailer Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiUser className="text-gray-400" />
                                </div>
                                <input 
                                    type="text" 
                                    name="Retailer_Name" 
                                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                    placeholder="Your name"
                                    required 
                                />
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2 font-medium">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiMail className="text-gray-400" />
                                </div>
                                <input 
                                    type="email" 
                                    name="email" 
                                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                    placeholder="your@email.com"
                                    required 
                                />
                            </div>
                        </div>
                        <div className="mb-8">
                            <label className="block text-gray-700 mb-2 font-medium">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiLock className="text-gray-400" />
                                </div>
                                <input 
                                    type="password" 
                                    name="password" 
                                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                    placeholder="••••••••"
                                    required 
                                />
                            </div>
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit" 
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition duration-300"
                        >
                            Register
                        </motion.button>
                        <div className="mt-6 text-center">
                            <p className="text-gray-600">
                                Already have an account?{' '}
                                <Link to="/login" className="text-blue-500 hover:text-blue-700 font-semibold">
                                    Login
                                </Link>
                            </p>
                        </div>
                        <div className="mt-4 text-center text-xs text-gray-500">
                            By registering, you agree to our Terms and Privacy Policy
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;