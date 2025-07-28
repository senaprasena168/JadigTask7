'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchProduct, updateProduct, clearCurrentProduct } from '@/lib/features/products/productsSlice';
import AdminProtection from '@/components/AdminProtection';

function EditProductPageContent() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentProduct: product, loading } = useAppSelector((state) => state.products);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
  });

  useEffect(() => {
    if (params.id) {
      dispatch(fetchProduct(params.id as string));
    }
    
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, params.id]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        image: product.image || '',
        description: product.description || '',
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    setSaving(true);
    try {
      await dispatch(updateProduct({ id: product.id, ...formData })).unwrap();
      router.push('/admin');
    } catch (error) {
      console.error('Failed to update product:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

  if (!product) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          Product not found
        </div>
        <Link
          href='/admin'
          className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors'
        >
          Back to Admin
        </Link>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-6'>
        <Link
          href='/admin'
          className='text-blue-500 hover:text-blue-600 flex items-center gap-2'
        >
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
          </svg>
          Back to Admin
        </Link>
      </div>

      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-800 mb-8'>Edit Product</h1>

        <form onSubmit={handleSubmit} className='bg-white rounded-lg shadow-md p-6 space-y-6'>
          <div>
            <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-2'>
              Product Name *
            </label>
            <input
              type='text'
              id='name'
              name='name'
              required
              value={formData.name}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label htmlFor='price' className='block text-sm font-medium text-gray-700 mb-2'>
              Price *
            </label>
            <input
              type='number'
              id='price'
              name='price'
              required
              step='0.01'
              min='0'
              value={formData.price}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label htmlFor='image' className='block text-sm font-medium text-gray-700 mb-2'>
              Image URL
            </label>
            <input
              type='url'
              id='image'
              name='image'
              value={formData.image}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label htmlFor='description' className='block text-sm font-medium text-gray-700 mb-2'>
              Description
            </label>
            <textarea
              id='description'
              name='description'
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div className='flex gap-4'>
            <button
              type='submit'
              disabled={saving}
              className='flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 px-6 rounded-md transition-colors'
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href='/admin'
              className='flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-md text-center transition-colors'
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditProductPage() {
  return (
    <AdminProtection>
      <EditProductPageContent />
    </AdminProtection>
  );
}