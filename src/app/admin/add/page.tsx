'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks';
import { addProduct } from '@/lib/features/products/productsSlice';
import AdminProtection from '@/components/AdminProtection';

function AddProductPageContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError('');
    
    if (!file) {
      setImageFile(null);
      setImagePreview('');
      return;
    }

    // Validate file type - only JPG and PNG
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setImageError('Please select a JPG or PNG image file');
      e.target.value = '';
      return;
    }

    // Validate file size - max 1MB
    const maxSize = 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      setImageError('Image size must be less than 1MB');
      e.target.value = '';
      return;
    }

    setImageFile(file);
    
    // Clear URL input when file is selected
    setFormData(prev => ({ ...prev, image: '' }));
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File): Promise<{ url: string, imageId: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.image;
      let imageId = null;
      
      // Upload image if file is selected
      if (imageFile) {
        const uploadResponse = await uploadImage(imageFile);
        imageUrl = uploadResponse.url;
        imageId = uploadResponse.imageId;
      }

      await dispatch(addProduct({
        ...formData,
        image: imageUrl,
        imageId: imageId,
        price: parseFloat(formData.price)
      })).unwrap();
      
      router.push('/admin');
    } catch (error) {
      console.error('Failed to add product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Add New Product</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter product name"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Price *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            required
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image
          </label>
          
          {/* File Upload */}
          <div className="mb-4">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload JPG or PNG image (max 1MB)
            </p>
            {imageError && (
              <p className="text-red-500 text-sm mt-1">{imageError}</p>
            )}
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover border rounded-md"
              />
            </div>
          )}

          {/* OR URL Input */}
          <div className="border-t pt-4">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Or enter Image URL
            </label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter product description"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Product'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <AdminProtection>
      <AddProductPageContent />
    </AdminProtection>
  );
}
