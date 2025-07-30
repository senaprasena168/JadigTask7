'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchProducts } from '@/lib/features/products/productsSlice';

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { products = [], loading, error } = useAppSelector((state) => state.products);

  useEffect(() => {
    console.log('ProductsPage: Dispatching fetchProducts...');
    dispatch(fetchProducts());
  }, [dispatch]);

  // Debug logging
  useEffect(() => {
    console.log('ProductsPage state:', { products, loading, error });
  }, [products, loading, error]);

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold text-gray-800 mb-8'>Our Cat Food Products</h1>
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
          <span className='ml-4'>Loading products...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold text-gray-800 mb-8'>Our Cat Food Products</h1>
        
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6'>
          <div className='flex items-center gap-2'>
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
            </svg>
            <span>Unable to load products: {error}</span>
          </div>
          <button 
            onClick={() => dispatch(fetchProducts())}
            className='mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
          >
            Retry
          </button>
        </div>

        <div className='text-center py-12'>
          <div className='bg-yellow-100 p-6 rounded-lg mb-6 max-w-md mx-auto'>
            <h2 className='text-xl font-semibold text-yellow-800 mb-2'>
              Much Error. Very Sad. Wow.
            </h2>
            <p className='text-gray-700'>
              Such server problems. Very try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold text-gray-800 mb-8'>Our Cat Food Products</h1>
        <div className='text-center py-12'>
          <div className='bg-yellow-100 p-6 rounded-lg mb-6 max-w-md mx-auto'>
            <h2 className='text-xl font-semibold text-yellow-800 mb-2'>
              Much Empty. Very Store. Wow.
            </h2>
            <p className='text-gray-700'>
              Such no products. Very coming soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold text-gray-800'>Cat Food Products</h1>
        <Link
          href='/admin'
          className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors'
        >
          Manage Products
        </Link>
      </div>

      <div className='grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-200'
          >
            <div className='aspect-square relative bg-gray-100'>
              <Image
                src={product.imageUrl || product.image || `/api/images/${product.id}`}
                alt={product.name}
                fill
                className='object-cover'
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                priority={false}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            </div>

            <div className='p-4'>
              <h3 className='font-semibold text-gray-800 mb-2'>
                {product.name}
              </h3>
              <p className='text-blue-600 font-bold text-lg'>
                ${product.price}
              </p>
              {product.description && (
                <p className='text-gray-600 text-sm mt-2 line-clamp-2'>
                  {product.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
