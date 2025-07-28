'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchProducts } from '@/lib/features/products/productsSlice';
import { validateProduct } from '@/lib/validations';
import Image from 'next/image';
import clsx from 'clsx';
import AdminProtection from '@/components/AdminProtection';

function AdminPageContent() {
  const dispatch = useAppDispatch();
  const { products = [], loading, error } = useAppSelector((state) => state.products);
  const [showAddForm, setShowAddForm] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');
  const [addingProduct, setAddingProduct] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        dispatch(fetchProducts()); // Refresh the list
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      alert('Error deleting product');
    }
  };

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
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File): Promise<{ url: string, imageId: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    // For new products, we don't need to specify productId since we're creating a new product
    // The backend will handle the image upload without needing to update an existing product

    const response = await fetch('/api/products/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Upload error:', errorData);
      throw new Error(`Failed to upload image: ${errorData.message}`);
    }

    const data = await response.json();
    return { url: data.imageUrl, imageId: data.imageUrl }; // Return the imageUrl
  };

  const handleAddProduct = async (formData: FormData) => {
    if (addingProduct) return;
    
    setAddingProduct(true);
    setFormErrors([]);
    
    try {
      // Validate form data first
      const productData = {
        name: formData.get('name') as string,
        price: formData.get('price') as string,
        description: formData.get('description') as string,
      };

      // Inline validation
      const errors: string[] = [];
      
      if (!productData.name || productData.name.trim().length === 0) {
        errors.push('Product name is required');
      }
      
      if (!productData.price || isNaN(parseFloat(productData.price)) || parseFloat(productData.price) <= 0) {
        errors.push('Valid price is required');
      }
      
      if (productData.price && parseFloat(productData.price) > 999999.99) {
        errors.push('Price cannot exceed $999,999.99');
      }

      if (errors.length > 0) {
        setFormErrors(errors);
        return;
      }

      let imageUrl = formData.get('image') as string;
      let imageId = null;
      
      if (imageFile) {
        const uploadResponse = await uploadImage(imageFile);
        imageUrl = uploadResponse.url;
        imageId = uploadResponse.imageId;
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...productData,
          price: parseFloat(productData.price),
          image: imageUrl,
          imageId: imageId,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setShowAddForm(false);
        setImageFile(null);
        setImagePreview('');
        setImageError('');
        setFormErrors([]);
        dispatch(fetchProducts());
      } else {
        setFormErrors([result.error || 'Failed to add product']);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setFormErrors(['Network error. Please try again.']);
    } finally {
      setAddingProduct(false);
    }
  };

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold text-gray-800'>Admin Dashboard</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors'
        >
          {showAddForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6'>
          Error: {error}
        </div>
      )}

      {showAddForm && (
        <div className='bg-white p-6 rounded-lg shadow-md mb-8'>
          <h2 className='text-xl font-semibold mb-4'>Add New Product</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddProduct(formData);
            }}
            className='space-y-4'
          >
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Product Name
              </label>
              <input
                type='text'
                name='name'
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Price
              </label>
              <input
                type='number'
                name='price'
                step='0.01'
                min='0'
                max='999999.99'
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='0.00'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Description
              </label>
              <textarea
                name='description'
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Product Image
              </label>
              
              {/* File Upload */}
              <div className='mb-4'>
                <input
                  type='file'
                  accept='image/jpeg,image/jpg,image/png'
                  onChange={handleImageChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Image must be in JPG or PNG format with 1MB max size.
                </p>
                {imageError && (
                  <p className='text-red-500 text-sm mt-1'>{imageError}</p>
                )}
              </div>

              {/* Image Preview with X button */}
              {imagePreview && (
                <div className='mb-4 relative inline-block'>
                  <img
                    src={imagePreview}
                    alt='Preview'
                    className='w-32 h-32 object-cover border rounded-md'
                  />
                  <button
                    type='button'
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                      setImageError('');
                      // Reset file input
                      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className='absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold'
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <button
              type='submit'
              disabled={addingProduct}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                addingProduct 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {addingProduct ? 'Adding...' : 'Add Product'}
            </button>
          </form>
        </div>
      )}

      <div className='bg-white rounded-lg shadow-md overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h2 className='text-xl font-semibold text-gray-800'>Products ({products.length})</h2>
        </div>
        
        {products.length === 0 ? (
          <div className='p-8 text-center text-gray-500'>
            No products found. Add some products to get started!
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Product
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Price
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Description
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0'>
                          <Image
                            src={product.image || `/api/images/${product.id}`}
                            alt={product.name}
                            width={48}
                            height={48}
                            className='w-full h-full object-cover'
                            priority={false}
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                          />
                        </div>
                        <div>
                          <h3 className='font-medium text-gray-900'>{product.name}</h3>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      ${product.price}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-900 max-w-xs truncate'>
                      {product.description || 'No description'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className='text-red-600 hover:text-red-900 transition-colors'
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminProtection>
      <AdminPageContent />
    </AdminProtection>
  );
}
