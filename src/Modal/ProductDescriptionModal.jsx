import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5374";

const ProductDescriptionModal = ({ isOpen, onClose, productId }) => {
  const [description, setDescription] = useState({
    colors: [],
    sizes: [],
    weight: "",
    dimensions: "",
    materials: [],
    features: [],
    images: [],
    videos: [],
  });
  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("");
  const [newMaterial, setNewMaterial] = useState("");
  const [newFeature, setNewFeature] = useState("");
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
      const response = await axios.get(
        `${API_URL}/productDescriptions/${productId}`
      );
      if (response.data.success) {
        setDescription({
          colors: response.data.data.colors || [],
          sizes: response.data.data.sizes || [],
          weight: response.data.data.weight || "",
          dimensions: response.data.data.dimensions || "",
          materials: response.data.data.materials || [],
          features: response.data.data.features || [],
          images: response.data.data.images || [],
          videos: response.data.data.videos || [],
        });
      }
    } catch (error) {
      console.error("Error fetching description:", error);
      setError("Failed to load product description");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const totalFiles = imageFiles.length + videoFiles.length;
      console.log("Total files to upload:", totalFiles, {
        imageFiles: imageFiles.map((f) => f.name),
        videoFiles: videoFiles.map((f) => f.name),
      });

      // Upload images
      let uploadedImages = [];
      if (imageFiles.length > 0) {
        const imageFormData = new FormData();
        imageFormData.append("productId", productId);
        imageFormData.append("type", "image");
        imageFiles.forEach((file) => {
          imageFormData.append("files", file);
        });

        console.log("Uploading images:", imageFiles.map((f) => f.name));
        const imageResponse = await axios.post(
          `${API_URL}/uploadMedia`,
          imageFormData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted / 2); // Images are half the progress
            },
          }
        );

        if (imageResponse.data.success) {
          uploadedImages = imageResponse.data.uploads.map((upload) => upload.url);
          console.log("Uploaded images:", uploadedImages);
        } else {
          throw new Error(imageResponse.data.error || "Image upload failed");
        }
      }

      // Upload videos
      let uploadedVideos = [];
      if (videoFiles.length > 0) {
        const videoFormData = new FormData();
        videoFormData.append("productId", productId);
        videoFormData.append("type", "video");
        videoFiles.forEach((file) => {
          videoFormData.append("files", file);
        });

        console.log("Uploading videos:", videoFiles.map((f) => f.name));
        const videoResponse = await axios.post(
          `${API_URL}/uploadMedia`,
          videoFormData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(50 + percentCompleted / 2); // Videos are the other half
            },
          }
        );

        if (videoResponse.data.success) {
          uploadedVideos = videoResponse.data.uploads.map((upload) => upload.url);
          console.log("Uploaded videos:", uploadedVideos);
        } else {
          throw new Error(videoResponse.data.error || "Video upload failed");
        }
      }

      // Prepare payload
      const payload = {
        productId,
        colors: Array.isArray(description.colors) ? description.colors : [],
        sizes: Array.isArray(description.sizes) ? description.sizes : [],
        weight: description.weight || null,
        dimensions: description.dimensions || "",
        materials: Array.isArray(description.materials)
          ? description.materials
          : [],
        features: Array.isArray(description.features) ? description.features : [],
        images: [...description.images, ...uploadedImages],
        videos: [...description.videos, ...uploadedVideos],
      };

      // Enforce limits (5 images, 2 videos)
      payload.images = payload.images.slice(0, 5);
      payload.videos = payload.videos.slice(0, 2);

      console.log("Sending payload to server:", payload);

      const response = await axios.post(
        `${API_URL}/productDescriptions`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        console.log("Description saved successfully:", response.data);
        setImageFiles([]);
        setVideoFiles([]);
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to save description");
      }
    } catch (error) {
      console.error("Error saving description:", error);
      setError(
        error.response?.data?.error ||
          error.message ||
          "Failed to save description"
      );
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    console.log("Selected image files:", files.map((f) => f.name));
    const remainingSlots = 5 - description.images.length;
    if (files.length > remainingSlots) {
      setError(
        `Cannot add ${files.length} images. Only ${remainingSlots} more allowed.`
      );
      setImageFiles(files.slice(0, remainingSlots));
    } else {
      setImageFiles(files);
    }
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    console.log("Selected video files:", files.map((f) => f.name));
    const remainingSlots = 2 - description.videos.length;
    if (files.length > remainingSlots) {
      setError(
        `Cannot add ${files.length} videos. Only ${remainingSlots} more allowed.`
      );
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
      setValue("");
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
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Product Description for ID: {productId}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Colors
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Add color"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => handleAddToArray("colors", newColor, setNewColor)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={isLoading || !newColor.trim()}
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
                      onClick={() => handleRemoveFromArray("colors", index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sizes
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Add size"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => handleAddToArray("sizes", newSize, setNewSize)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={isLoading || !newSize.trim()}
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
                      onClick={() => handleRemoveFromArray("sizes", index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                      disabled={isLoading}
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
                value={description.weight}
                onChange={(e) =>
                  setDescription({ ...description, weight: e.target.value })
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
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
                />
                <button
                  type="button"
                  onClick={() =>
                    handleAddToArray("materials", newMaterial, setNewMaterial)
                  }
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={isLoading || !newMaterial.trim()}
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
                      onClick={() => handleRemoveFromArray("materials", index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                      disabled={isLoading}
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
                />
                <button
                  type="button"
                  onClick={() =>
                    handleAddToArray("features", newFeature, setNewFeature)
                  }
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={isLoading || !newFeature.trim()}
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
                      onClick={() => handleRemoveFromArray("features", index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                      disabled={isLoading}
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
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isLoading || description.images.length >= 5}
              />
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {description.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia("images", index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isLoading}
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
                accept="video/*"
                onChange={handleVideoChange}
                className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isLoading || description.videos.length >= 2}
              />
              <div className="mt-4 grid grid-cols-1 gap-4">
                {description.videos.map((video, index) => (
                  <div key={index} className="relative group">
                    <video controls className="w-full rounded-md">
                      <source src={video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia("videos", index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isLoading}
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
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center"
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
                "Save Description"
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