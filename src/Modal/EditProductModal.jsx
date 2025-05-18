import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiX } from 'react-icons/fi';

const API_URL = "https://e-shop-backend-sage.vercel.app";

const EditProductModal = ({ isOpen, onClose, product, onProductUpdated }) => {
  const [formData, setFormData] = useState({
    price: product?.price || '',
    quantity: product?.quantity || '',
    description: product?.description || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const updateData = {};

      // Check if any field has a value
      if (formData.price || formData.quantity || formData.description) {
        if (formData.price) updateData.price = parseFloat(formData.price);
        if (formData.quantity) updateData.quantity = parseInt(formData.quantity);
        if (formData.description) updateData.description = formData.description;
      } else {
        throw new Error('At least one field must be provided');
      }

      await axios.put(
        `${API_URL}/updateProduct/${product.productId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      onProductUpdated({
        ...product,
        ...updateData
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-6 rounded-lg max-w-md w-full"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Product</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <motion.button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-indigo-600 text-white rounded-md ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSubmitting ? 'Updating...' : 'Update'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditProductModal;