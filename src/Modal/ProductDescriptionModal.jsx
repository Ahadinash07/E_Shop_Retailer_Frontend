import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://ahadinash07-e-shop-backend2-for-admin-retailer.vercel.app';

const ProductDescriptionModal = ({ isOpen, onClose, productId }) => {
  const [description, setDescription] = useState({
    colors: [],
    sizes: [],
    weight: '',
    dimensions: '',
    materials: [],
    features: [],
    images: [],
    videos: [],
  });
  const [newColor, setNewColor] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productId && isOpen) {
      fetchDescription();
    }
  }, [productId, isOpen]);

  const fetchDescription = async () => {
    try {
      const response = await axios.get(`${API_URL}/productDescriptions/${productId}`);
      if (response.data.success) {
        setDescription({
          colors: response.data.data.colors || [],
          sizes: response.data.data.sizes || [],
          weight: response.data.data.weight || '',
          dimensions: response.data.data.dimensions || '',
          materials: response.data.data.materials || [],
          features: response.data.data.features || [],
          images: response.data.data.images || [],
          videos: response.data.data.videos || [],
        });
      }
    } catch (error) {
      console.error('Error fetching description:', error);
      setError('Failed to load product description');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Validate file counts
      const totalImages = description.images.length + imageFiles.length;
      const totalVideos = description.videos.length + videoFiles.length;
      if (totalImages > 5) {
        throw new Error(`Cannot add ${imageFiles.length} images. Only ${5 - description.images.length} more allowed.`);
      }
      if (totalVideos > 2) {
        throw new Error(`Cannot add ${videoFiles.length} videos. Only ${2 - description.videos.length} more allowed.`);
      }

      // Validate file types and sizes
      const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      const maxImageSize = 5 * 1024 * 1024; // 5MB
      const maxVideoSize = 20 * 1024 * 1024; // 20MB

      for (const file of imageFiles) {
        if (!validImageTypes.includes(file.type)) {
          throw new Error(`Invalid image type for ${file.name}. Allowed: JPEG, PNG, WEBP.`);
        }
        if (file.size > maxImageSize) {
          throw new Error(`Image ${file.name} exceeds 5MB.`);
        }
      }

      for (const file of videoFiles) {
        if (!validVideoTypes.includes(file.type)) {
          throw new Error(`Invalid video type for ${file.name}. Allowed: MP4, WEBM, MOV.`);
        }
        if (file.size > maxVideoSize) {
          throw new Error(`Video ${file.name} exceeds 20MB.`);
        }
      }

      // Prepare FormData
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('colors', JSON.stringify(description.colors));
      formData.append('sizes', JSON.stringify(description.sizes));
      formData.append('weight', description.weight || '');
      formData.append('dimensions', description.dimensions || '');
      formData.append('materials', JSON.stringify(description.materials));
      formData.append('features', JSON.stringify(description.features));
      // Send only existing images/videos to preserve them
      formData.append('images', JSON.stringify(description.images));
      formData.append('videos', JSON.stringify(description.videos));

      // Append new files
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      videoFiles.forEach((file) => {
        formData.append('videos', file);
      });

      console.log('Submitting FormData:', {
        productId,
        images: imageFiles.map((f) => f.name),
        videos: videoFiles.map((f) => f.name),
        existingImages: description.images,
        existingVideos: description.videos,
      });

      const response = await axios.post(`${API_URL}/productDescriptions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        console.log('Description saved successfully:', response.data);
        setImageFiles([]);
        setVideoFiles([]);
        // Update local state with new media from response
        setDescription((prev) => ({
          ...prev,
          images: response.data.data.images || prev.images,
          videos: response.data.data.videos || prev.videos,
        }));
        onClose();
      } else {
        throw new Error(response.data.error || 'Failed to save description');
      }
    } catch (error) {
      console.error('Error saving description:', error);
      setError(error.message || 'Failed to save description');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    console.log('Selected image files:', files.map((f) => f.name));
    const remainingSlots = 5 - description.images.length;
    if (files.length > remainingSlots) {
      setError(`Cannot add ${files.length} images. Only ${remainingSlots} more allowed.`);
      setImageFiles(files.slice(0, remainingSlots));
    } else {
      setImageFiles(files);
    }
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    console.log('Selected video files:', files.map((f) => f.name));
    const remainingSlots = 2 - description.videos.length;
    if (files.length > remainingSlots) {
      setError(`Cannot add ${files.length} videos. Only ${remainingSlots} more allowed.`);
      setVideoFiles(files.slice(0, remainingSlots));
    } else {
      setVideoFiles(files);
    }
  };

  const handleAddToArray = (field, value, setValue) => {
    if (value.trim()) {
      setDescription((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
      setValue('');
    }
  };

  const handleRemoveFromArray = (field, index) => {
    setDescription((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleRemoveMedia = (field, index) => {
    setDescription((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Product Description for ID: {productId}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isLoading}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {isLoading && (
            <div className="mb-4">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Colors</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Add color"
                  disabled={isLoading}
                  aria-label="Add new color"
                />
                <button
                  type="button"
                  onClick={() => handleAddToArray('colors', newColor, setNewColor)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={isLoading || !newColor.trim()}
                  aria-label="Add color"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {description.colors.map((color, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 px-3 py-1 rounded-full flex items-center"
                  >
                    {color}
                    <button
                      type="button"
                      onClick={() => handleRemoveFromArray('colors', index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                      disabled={isLoading}
                      aria-label={`Remove color ${color}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sizes</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Add size"
                  disabled={isLoading}
                  aria-label="Add new size"
                />
                <button
                  type="button"
                  onClick={() => handleAddToArray('sizes', newSize, setNewSize)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={isLoading || !newSize.trim()}
                  aria-label="Add size"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {description.sizes.map((size, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 px-3 py-1 rounded-full flex items-center"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => handleRemoveFromArray('sizes', index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                      disabled={isLoading}
                      aria-label={`Remove size ${size}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={description.weight}
                onChange={(e) =>
                  setDescription({ ...description, weight: e.target.value })
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
                aria-label="Product weight in kilograms"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dimensions (L×W×H)
              </label>
              <input
                type="text"
                value={description.dimensions}
                onChange={(e) =>
                  setDescription({ ...description, dimensions: e.target.value })
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10×5×2"
                disabled={isLoading}
                aria-label="Product dimensions"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Materials
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Add material"
                  disabled={isLoading}
                  aria-label="Add new material"
                />
                <button
                  type="button"
                  onClick={() => handleAddToArray('materials', newMaterial, setNewMaterial)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={isLoading || !newMaterial.trim()}
                  aria-label="Add material"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {description.materials.map((material, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 px-3 py-1 rounded-full flex items-center"
                  >
                    {material}
                    <button
                      type="button"
                      onClick={() => handleRemoveFromArray('materials', index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                      disabled={isLoading}
                      aria-label={`Remove material ${material}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Add feature"
                  disabled={isLoading}
                  aria-label="Add new feature"
                />
                <button
                  type="button"
                  onClick={() => handleAddToArray('features', newFeature, setNewFeature)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={isLoading || !newFeature.trim()}
                  aria-label="Add feature"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {description.features.map((feature, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 px-3 py-1 rounded-full flex items-center"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleRemoveFromArray('features', index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                      disabled={isLoading}
                      aria-label={`Remove feature ${feature}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4 col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Images ({description.images.length}/5)
              </label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isLoading || description.images.length >= 5}
                aria-label="Upload product images"
              />
              <p className="mt-1 text-xs text-gray-500">
                Upload up to 5 images (JPEG, PNG, WEBP). Max 5MB per image. Hold Ctrl (Windows) or Cmd (Mac) to select multiple files.
              </p>
              {imageFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-700">Selected Images:</p>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    {imageFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {description.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia('images', index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isLoading}
                      aria-label={`Remove image ${index + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4 col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Videos ({description.videos.length}/2)
              </label>
              <input
                type="file"
                multiple
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoChange}
                className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isLoading || description.videos.length >= 2}
                aria-label="Upload product videos"
              />
              <p className="mt-1 text-xs text-gray-500">
                Upload up to 2 videos (MP4, WEBM, MOV). Max 20MB per video. Hold Ctrl (Windows) or Cmd (Mac) to select multiple files.
              </p>
              {videoFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-700">Selected Videos:</p>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    {videoFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-4 grid grid-cols-1 gap-4">
                {description.videos.map((video, index) => (
                  <div key={index} className="relative group">
                    <video controls className="w-full rounded-md">
                      <source src={video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia('videos', index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isLoading}
                      aria-label={`Remove video ${index + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              disabled={isLoading}
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center"
              aria-label="Save description"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Description'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductDescriptionModal;





























// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const API_URL = "http://localhost:5374";

// const ProductDescriptionModal = ({ isOpen, onClose, productId }) => {
//   // State management
//   const [description, setDescription] = useState({ colors: [], sizes: [], weight: '', dimensions: '', materials: [], features: [], images: [], videos: [] });
//   const [newColor, setNewColor] = useState('');
//   const [newSize, setNewSize] = useState('');
//   const [newMaterial, setNewMaterial] = useState('');
//   const [newFeature, setNewFeature] = useState('');
//   const [imageFiles, setImageFiles] = useState([]);
//   const [videoFiles, setVideoFiles] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [error, setError] = useState(null);

//   // Fetch description when modal opens
//   useEffect(() => {
//     if (productId && isOpen) {
//       fetchDescription();
//     }
//   }, [productId, isOpen]);

//   const fetchDescription = async () => {
//     try {
//       const response = await axios.get(`${API_URL}/productDescriptions/${productId}`);
//       if (response.data.success) {
//         setDescription({
//           colors: response.data.data.colors || [],
//           sizes: response.data.data.sizes || [],
//           weight: response.data.data.weight || '',
//           dimensions: response.data.data.dimensions || '',
//           materials: response.data.data.materials || [],
//           features: response.data.data.features || [],
//           images: response.data.data.images || [],
//           videos: response.data.data.videos || []
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching description:", error);
//       setError("Failed to load product description");
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError(null);
//     setUploadProgress(0);
    
//     try {
//       // Process uploads sequentially with progress tracking
//       const uploadedMedia = [];
//       const totalFiles = imageFiles.length + videoFiles.length;
//       let filesProcessed = 0;
      
//       // Upload images
//       for (const file of imageFiles) {
//         try {
//           const url = await uploadMedia(file, 'image');
//           if (url) {
//             uploadedMedia.push({ type: 'image', url });
//           }
//           filesProcessed++;
//           setUploadProgress((filesProcessed / totalFiles) * 100);
//         } catch (error) {
//           console.error(`Failed to upload image ${file.name}:`, error);
//           setError(`Failed to upload image ${file.name}: ${error.message}`);
//           filesProcessed++;
//           setUploadProgress((filesProcessed / totalFiles) * 100);
//           continue;
//         }
//       }

//       // Upload videos
//       for (const file of videoFiles) {
//         try {
//           const url = await uploadMedia(file, 'video');
//           if (url) {
//             uploadedMedia.push({ type: 'video', url });
//           }
//           filesProcessed++;
//           setUploadProgress((filesProcessed / totalFiles) * 100);
//         } catch (error) {
//           console.error(`Failed to upload video ${file.name}:`, error);
//           setError(`Failed to upload video ${file.name}: ${error.message}`);
//           filesProcessed++;
//           setUploadProgress((filesProcessed / totalFiles) * 100);
//           continue;
//         }
//       }

//       // Prepare final payload with proper array validation
//       const payload = {
//         productId,
//         colors: Array.isArray(description.colors) ? description.colors : [],
//         sizes: Array.isArray(description.sizes) ? description.sizes : [],
//         weight: description.weight || null,
//         dimensions: description.dimensions || '',
//         materials: Array.isArray(description.materials) ? description.materials : [],
//         features: Array.isArray(description.features) ? description.features : [],
//         images: Array.isArray(description.images) ? [...description.images] : [],
//         videos: Array.isArray(description.videos) ? [...description.videos] : []
//       };

//       // Add successfully uploaded media URLs to payload
//       uploadedMedia.forEach(item => {
//         if (item.url) {
//           if (item.type === 'image') {
//             payload.images.push(item.url);
//           } else {
//             payload.videos.push(item.url);
//           }
//         }
//       });

//       // console.log('Sending payload to server:', payload);

//       // Save description
//       const response = await axios.post(`${API_URL}/productDescriptions`, payload, {
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.data.success) {
//         onClose(); // Close modal on success
//       } else {
//         throw new Error(response.data.message || 'Failed to save description');
//       }

//     } catch (error) {
//       console.error("Error saving description:", {
//         error: error.response?.data || error.message,
//         stack: error.stack
//       });
//       setError(error.response?.data?.error || error.message || "Failed to save description");
//     } finally {
//       setIsLoading(false);
//       setUploadProgress(0);
//     }
//   };

//   const uploadMedia = async (file, type) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('productId', productId);
//     formData.append('type', type);

//     try {
//       const response = await axios.post(`${API_URL}/uploadMedia`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         },
//         onUploadProgress: (progressEvent) => {
//           const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//           setUploadProgress(percentCompleted);
//         }
//       });

//       if (!response.data.success || !response.data.url) {
//         throw new Error(response.data.error || 'Upload failed - no URL returned');
//       }

//       return response.data.url;

//     } catch (error) {
//       console.error("Upload failed:", {
//         file: file.name,
//         type,
//         error: error.response?.data || error.message
//       });
//       throw error;
//     }
//   };

//   // Helper functions for managing arrays
//   const handleAddToArray = (field, value, setValue) => {
//     if (value.trim()) {
//       setDescription(prev => ({
//         ...prev,
//         [field]: [...prev[field], value.trim()]
//       }));
//       setValue('');
//     }
//   };

//   const handleRemoveFromArray = (field, index) => {
//     setDescription(prev => ({
//       ...prev,
//       [field]: prev[field].filter((_, i) => i !== index)
//     }));
//   };

//   const handleRemoveMedia = (field, index) => {
//     setDescription(prev => ({
//       ...prev,
//       [field]: prev[field].filter((_, i) => i !== index)
//     }));
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold">Product Description for ID: {productId}</h2>
//           <button  onClick={onClose}  className="text-gray-500 hover:text-gray-700 text-2xl" disabled={isLoading} > &times; </button>
//         </div>
 
//         {error && ( <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md"> {error} </div> )}

//         <form onSubmit={handleSubmit}>
//           {/* Progress Bar */}
//           {isLoading && (
//             <div className="mb-4">
//               <div className="h-2 bg-gray-200 rounded-full">
//                 <div className="h-2 bg-blue-500 rounded-full"  style={{ width: `${uploadProgress}%` }} ></div>
//               </div>
//               <p className="text-sm text-gray-500 mt-1"> Uploading... {Math.round(uploadProgress)}% </p>
//             </div>
//           )}

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Colors Section */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Colors</label>
//               <div className="flex gap-2">
//                 <input type="text" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Add color" disabled={isLoading} required />
//                 <button type="button" onClick={() => handleAddToArray('colors', newColor, setNewColor)} className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300" disabled={isLoading || !newColor.trim()} > Add </button>
//               </div>
//               <div className="mt-2 flex flex-wrap gap-2">
//                 {description.colors.map((color, index) => (
//                   <span key={index} className="bg-gray-200 px-3 py-1 rounded-full flex items-center"> {color}
//                     <button type="button" onClick={() => handleRemoveFromArray('colors', index)} className="ml-2 text-red-500 hover:text-red-700" disabled={isLoading} > &times; </button>
//                   </span>
//                 ))}
//               </div>
//             </div>

//             {/* Sizes Section */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Sizes</label>
//               <div className="flex gap-2">
//                 <input type="text" value={newSize} onChange={(e) => setNewSize(e.target.value)} className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Add size" disabled={isLoading} />
//                 <button type="button" onClick={() => handleAddToArray('sizes', newSize, setNewSize)} className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300" disabled={isLoading || !newSize.trim()} > Add </button>
//               </div>
//               <div className="mt-2 flex flex-wrap gap-2">
//                 {description.sizes.map((size, index) => (
//                   <span key={index} className="bg-gray-200 px-3 py-1 rounded-full flex items-center"> {size}
//                     <button type="button" onClick={() => handleRemoveFromArray('sizes', index)} className="ml-2 text-red-500 hover:text-red-700" disabled={isLoading} > &times; </button>
//                   </span>
//                 ))}
//               </div>
//             </div>

//             {/* Weight */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
//               <input type="number" step="0.01" value={description.weight} onChange={(e) => setDescription({...description, weight: e.target.value})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" disabled={isLoading} />
//             </div>

//             {/* Dimensions */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (L×W×H)</label>
//               <input type="text" value={description.dimensions} onChange={(e) => setDescription({...description, dimensions: e.target.value})} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" placeholder="e.g., 10×5×2" disabled={isLoading} />
//             </div>

//             {/* Materials Section */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Materials</label>
//               <div className="flex gap-2">
//                 <input type="text" value={newMaterial} onChange={(e) => setNewMaterial(e.target.value)} className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Add material" disabled={isLoading} />
//                 <button type="button" onClick={() => handleAddToArray('materials', newMaterial, setNewMaterial)} className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300" disabled={isLoading || !newMaterial.trim()} > Add </button>
//               </div>
//               <div className="mt-2 flex flex-wrap gap-2">
//                 {description.materials.map((material, index) => (
//                   <span key={index} className="bg-gray-200 px-3 py-1 rounded-full flex items-center"> {material}
//                     <button type="button" onClick={() => handleRemoveFromArray('materials', index)} className="ml-2 text-red-500 hover:text-red-700" disabled={isLoading} > &times; </button>
//                   </span>
//                 ))}
//               </div>
//             </div>

//             {/* Features Section */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
//               <div className="flex gap-2">
//                 <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Add feature" disabled={isLoading} />
//                 <button type="button" onClick={() => handleAddToArray('features', newFeature, setNewFeature)} className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300" disabled={isLoading || !newFeature.trim()} > Add </button>
//               </div>
//               <div className="mt-2 flex flex-wrap gap-2">
//                 {description.features.map((feature, index) => (
//                   <span key={index} className="bg-gray-200 px-3 py-1 rounded-full flex items-center"> {feature}
//                     <button type="button" onClick={() => handleRemoveFromArray('features', index)} className="ml-2 text-red-500 hover:text-red-700" disabled={isLoading} > &times; </button>
//                   </span>
//                 ))}
//               </div>
//             </div>

//             {/* Images Section */}
//             <div className="mb-4 col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-1"> Images ({description.images.length}/5) </label>
//               <input type="file" multiple accept="image/*" onChange={(e) => setImageFiles([...e.target.files])} className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" disabled={isLoading || description.images.length >= 5} />
//               <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
//                 {description.images.map((image, index) => (
//                   <div key={index} className="relative group">
//                     <img  src={image} alt={`Product ${index}`} className="w-full h-32 object-cover rounded-md" />
//                     <button type="button" onClick={() => handleRemoveMedia('images', index)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" disabled={isLoading} > &times; </button>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Videos Section */}
//             <div className="mb-4 col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-1"> Videos ({description.videos.length}/2) </label>
//               <input type="file" multiple accept="video/*" onChange={(e) => setVideoFiles([...e.target.files])} className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" disabled={isLoading || description.videos.length >= 2} />
//               <div className="mt-4 grid grid-cols-1 gap-4">
//                 {description.videos.map((video, index) => (
//                   <div key={index} className="relative group">
//                     <video controls className="w-full rounded-md"> <source src={video} type="video/mp4" /> Your browser does not support the video tag. </video>
//                     <button type="button" onClick={() => handleRemoveMedia('videos', index)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" disabled={isLoading} > &times; </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-end mt-6 gap-2">
//             <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled={isLoading} > Cancel </button>
//             <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center" >
//               {isLoading ? (
//                 <>
//                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Saving...
//                 </>
//               ) : 'Save Description'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ProductDescriptionModal;