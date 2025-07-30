'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchProduct, clearCurrentProduct } from '@/lib/features/products/productsSlice';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentProduct: product, loading, error } = useAppSelector((state) => state.products);

  useEffect(() => {
    if (params.id) {
      dispatch(fetchProduct(params.id as string));
    }
    
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, params.id]);

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {error || 'Product not found'}
        </div>
        <Link
          href='/products'
          className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors'
        >
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-6'>
        <Link
          href='/products'
          className='text-blue-500 hover:text-blue-600 flex items-center gap-2'
        >
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
          </svg>
          Back to Products
        </Link>
      </div>

      <div className='grid md:grid-cols-2 gap-8'>
        <div className='aspect-square relative bg-gray-100 rounded-lg overflow-hidden'>
          <Image
            src={product.imageUrl || product.image || `/api/images/${product.id}`}
            alt={product.name}
            fill
            className='object-cover'
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={true}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </div>

        <div className='space-y-6'>
          <div>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>
              {product.name}
            </h1>
            <p className='text-3xl font-bold text-blue-600'>
              ${product.price}
            </p>
          </div>

          {product.description && (
            <div>
              <h2 className='text-xl font-semibold text-gray-800 mb-2'>Description</h2>
              <p className='text-gray-600 leading-relaxed'>
                {product.description}
              </p>
            </div>
          )}

          <div className='flex gap-4'>
            <Link
              href={`/admin/edit/${product.id}`}
              className='bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors'
            >
              Edit Product
            </Link>
            <button
              onClick={() => router.back()}
              className='bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors'
            >
              Go Back
            </button>
          </div>

          {product.createdAt && (
            <div className='text-sm text-gray-500'>
              <p>Created: {new Date(product.createdAt).toLocaleDateString()}</p>
              {product.updatedAt && product.updatedAt !== product.createdAt && (
                <p>Updated: {new Date(product.updatedAt).toLocaleDateString()}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
