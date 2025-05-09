import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const API_URL = 'http://localhost:5374';

const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
    const [retailerId, setRetailerId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const navigate = useNavigate();

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_URL}/getCategories`);
                setCategories(response.data[0]);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    // Get retailer ID from localStorage
    useEffect(() => {
        const storedRetailer = localStorage.getItem('retailer');
        if (storedRetailer) {
            const retailer = JSON.parse(storedRetailer);
            setRetailerId(retailer.retailerId);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    // Form validation schema
    const validationSchema = Yup.object({
        productName: Yup.string().required('Product Name is required').max(100, 'Product Name must be less than 100 characters'),
        description: Yup.string().required('Description is required').max(500, 'Description must be less than 500 characters'),
        category: Yup.string().required('Category is required'),
        subcategory: Yup.string().required('Subcategory is required').max(50, 'Subcategory must be less than 50 characters'),
        brand: Yup.string().required('Brand is required').max(50, 'Brand must be less than 50 characters'),
        quantity: Yup.number().required('Quantity is required').positive('Quantity must be positive').integer('Quantity must be a whole number').max(9999, 'Quantity must be less than 10,000'),
        price: Yup.number().required('Price is required').positive('Price must be positive').max(999999, 'Price must be less than 1,000,000'),
        images: Yup.mixed().required('Images are required')
            .test('fileCount', 'At least one image is required', (value) => {
                return value && value.length > 0;
            })
            .test('fileSize', 'File too large (max 5MB)', (value) => {
                if (!value) return true;
                return Array.from(value).every(file => file.size <= 5 * 1024 * 1024);
            })
            .test('fileType', 'Unsupported file format', (value) => {
                if (!value) return true;
                return Array.from(value).every(file => 
                    ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
                );
            }),
        video: Yup.mixed()
            .test('fileSize', 'File too large (max 20MB)', (value) => {
                if (!value) return true;
                return value.size <= 20 * 1024 * 1024;
            })
            .test('fileType', 'Unsupported file format', (value) => {
                if (!value) return true;
                return ['video/mp4', 'video/webm', 'video/quicktime'].includes(value.type);
            }),
    });

    // Formik initialization
    const formik = useFormik({
        initialValues: { productName: '', description: '', category: '', subcategory: '', brand: '', quantity: '', price: '', images: null, video: null, },
        validationSchema,
        onSubmit: async (values) => {
            setIsSubmitting(true);
            setSubmitError(null);
            setSubmitSuccess(false);
            
            if (!retailerId) {
                setSubmitError('Retailer ID is missing. Please log in again.');
                setIsSubmitting(false);
                return;
            }

            try {
                const formData = new FormData();
                
                // Append all text fields
                formData.append('retailerId', retailerId);
                formData.append('productName', values.productName);
                formData.append('description', values.description);
                formData.append('category', values.category);
                formData.append('subcategory', values.subcategory);
                formData.append('brand', values.brand);
                formData.append('quantity', values.quantity);
                formData.append('price', values.price);

                // Append image files
                Array.from(values.images).forEach(file => {
                    formData.append('images', file);
                });

                // Append video
                if (values.video) {
                    formData.append('video', values.video);
                }

                const response = await axios.post(`${API_URL}/addProduct`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                });

                if (!response.data.success || !response.data.product) {
                    throw new Error(response.data.message || 'Invalid response from server');
                }

                setSubmitSuccess(true);
                onProductAdded(response.data.product);
                
                // Reset form after successful submission
                setTimeout(() => {
                    formik.resetForm();
                    onClose();
                }, 1500);
            } catch (error) {
                console.error('Error:', error);
                const errorMessage = error.response?.data?.message || 
                                  error.message || 
                                  'Error adding product. Please try again.';
                setSubmitError(errorMessage);
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
                        <button  onClick={() => { onClose(); formik.resetForm(); setSubmitError(null); setSubmitSuccess(false); }} className="text-gray-500 hover:text-gray-700 text-2xl" disabled={isSubmitting} > &times; </button>
                    </div>
                    
                    {submitError && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg"> {submitError} </div>
                    )}
                    
                    {submitSuccess && (
                        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg"> Product added successfully! </div>
                    )}

                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Product Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"> Product Name * </label>
                                <input type="text" name="productName" value={formik.values.productName} onChange={formik.handleChange} onBlur={formik.handleBlur} className={`w-full px-4 py-2 border rounded-lg ${     formik.touched.productName && formik.errors.productName  ? 'border-red-500'  : 'border-gray-300' } focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Enter product name" disabled={isSubmitting} />
                                {formik.touched.productName && formik.errors.productName && (
                                    <p className="mt-1 text-sm text-red-500">{formik.errors.productName}</p>
                                )}
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"> Category * </label>
                                <select name="category" value={formik.values.category} onChange={formik.handleChange} onBlur={formik.handleBlur} className={`w-full px-4 py-2 border rounded-lg ${     formik.touched.category && formik.errors.category ? 'border-red-500' : 'border-gray-300' } focus:outline-none focus:ring-2 focus:ring-blue-500`} disabled={isSubmitting} >
                                    <option value="" selected disabled>Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.catId} value={cat.catName}> {cat.catName} </option>
                                    ))}
                                </select>
                                {formik.touched.category && formik.errors.category && (
                                    <p className="mt-1 text-sm text-red-500">{formik.errors.category}</p>
                                )}
                            </div>

                            {/* Subcategory */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"> Subcategory * </label>
                                <input type="text" name="subcategory" value={formik.values.subcategory} onChange={formik.handleChange} onBlur={formik.handleBlur} className={`w-full px-4 py-2 border rounded-lg ${     formik.touched.subcategory && formik.errors.subcategory ? 'border-red-500' : 'border-gray-300' } focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Enter subcategory" disabled={isSubmitting} />
                                {formik.touched.subcategory && formik.errors.subcategory && (
                                    <p className="mt-1 text-sm text-red-500">{formik.errors.subcategory}</p>
                                )}
                            </div>

                            {/* Brand */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"> Brand * </label>
                                <input type="text" name="brand" value={formik.values.brand} onChange={formik.handleChange} onBlur={formik.handleBlur} className={`w-full px-4 py-2 border rounded-lg ${     formik.touched.brand && formik.errors.brand ? 'border-red-500' : 'border-gray-300' } focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Enter brand name" disabled={isSubmitting} />
                                {formik.touched.brand && formik.errors.brand && (
                                    <p className="mt-1 text-sm text-red-500">{formik.errors.brand}</p>
                                )}
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"> Quantity * </label>
                                <input type="number" name="quantity" value={formik.values.quantity} onChange={formik.handleChange} onBlur={formik.handleBlur} min="1" className={`w-full px-4 py-2 border rounded-lg ${     formik.touched.quantity && formik.errors.quantity ? 'border-red-500' : 'border-gray-300' } focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Enter quantity" disabled={isSubmitting} />
                                {formik.touched.quantity && formik.errors.quantity && (
                                    <p className="mt-1 text-sm text-red-500">{formik.errors.quantity}</p>
                                )}
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"> Price * </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"> ₹ </span>
                                    <input type="number" name="price" value={formik.values.price} onChange={formik.handleChange} onBlur={formik.handleBlur} min="0.01" step="0.01" className={`w-full pl-10 px-4 py-2 border rounded-lg ${     formik.touched.price && formik.errors.price         ? 'border-red-500'         : 'border-gray-300' } focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="0.00" disabled={isSubmitting} />
                                </div>
                                {formik.touched.price && formik.errors.price && (
                                    <p className="mt-1 text-sm text-red-500">{formik.errors.price}</p>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1"> Description * </label>
                            <textarea name="description" value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur} rows={4} className={`w-full px-4 py-2 border rounded-lg ${     formik.touched.description && formik.errors.description          ? 'border-red-500'          : 'border-gray-300' } focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Enter detailed product description" disabled={isSubmitting} />
                            {formik.touched.description && formik.errors.description && (
                                <p className="mt-1 text-sm text-red-500">{formik.errors.description}</p>
                            )}
                        </div>

                        {/* Images Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1"> Product Images * </label>
                            <input type="file" name="images" onChange={(event) => {     formik.setFieldValue("images", event.currentTarget.files); }} onBlur={formik.handleBlur} className={`w-full px-4 py-2 border rounded-lg ${     formik.touched.images && formik.errors.images         ? 'border-red-500'         : 'border-gray-300' } focus:outline-none focus:ring-2 focus:ring-blue-500`} multiple accept="image/jpeg, image/png, image/webp" disabled={isSubmitting} />
                            <p className="mt-1 text-xs text-gray-500"> Upload multiple product images (JPEG, PNG, WEBP). Max 5MB per image. </p>
                            {formik.touched.images && formik.errors.images && (
                                <p className="mt-1 text-sm text-red-500">{formik.errors.images}</p>
                            )}
                        </div>

                        {/* Video Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1"> Product Video (Optional) </label>
                            <input type="file" name="video" onChange={(event) => { formik.setFieldValue("video", event.currentTarget.files[0]); }} onBlur={formik.handleBlur} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" accept="video/mp4, video/webm, video/quicktime" disabled={isSubmitting} />
                            <p className="mt-1 text-xs text-gray-500"> Upload a product video (MP4, WEBM, MOV). Max 20MB. </p>
                            {formik.touched.video && formik.errors.video && (
                                <p className="mt-1 text-sm text-red-500">{formik.errors.video}</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-4 pt-6">
                            <button type="button" onClick={() => { onClose(); formik.resetForm(); setSubmitError(null); setSubmitSuccess(false); }} className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50" disabled={isSubmitting} > Cancel </button>
                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400" disabled={isSubmitting} >
                                {isSubmitting ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Adding...
                                    </span>
                                ) : 'Add Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProductModal;