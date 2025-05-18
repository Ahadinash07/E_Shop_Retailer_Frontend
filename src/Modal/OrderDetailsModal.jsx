import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 50,
      transition: { duration: 0.2, ease: 'easeIn' },
    },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto font-poppins"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-6 rounded-t-2xl flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Order #{order.orderId}
            </h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Order Info */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Order Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-secondary-500">Order ID:</span>{' '}
                  {order.orderId}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-secondary-500">User ID:</span>{' '}
                  {order.userId}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-secondary-500">Order Date:</span>{' '}
                  {new Date(order.orderDate).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-secondary-500">Total:</span> $
                  {typeof order.total === 'number' ? order.total.toFixed(2) : '0.00'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-secondary-500">Status:</span>{' '}
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
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-secondary-500">Payment Method:</span>{' '}
                  {order.payment_method || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-secondary-500">Payment Status:</span>{' '}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.payment_status === 'Completed'
                        ? 'bg-green-100 text-green-700'
                        : order.payment_status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : order.payment_status === 'Failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {order.payment_status || 'N/A'}
                  </span>
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Items Ordered
              </h3>
              {order.items.length > 0 ? (
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <motion.div
                      key={`${order.orderId}-${item.productId}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
                        ${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No items found.</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderDetailsModal;