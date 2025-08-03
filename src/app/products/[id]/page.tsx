'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchProduct, clearCurrentProduct } from '@/lib/features/products/productsSlice';
import { addToCart, openCart } from '@/lib/features/cart/cartSlice';
import { formatRupiah } from '@/lib/currency';
import LoginModal from '@/components/LoginModal';
import { useLoginModal } from '@/hooks/useLoginModal';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const { currentProduct: product, loading, error } = useAppSelector((state) => state.products);
  const [quantity, setQuantity] = useState(1);
  const { isOpen: isLoginModalOpen, openModal: openLoginModal, closeModal: closeLoginModal } = useLoginModal();
  
  // Check if user is admin and authentication status
  const isAuthenticated = session?.user;
  const isAdmin = isAuthenticated && session?.user?.role === 'admin';
  const isRegularUser = isAuthenticated && !isAdmin;

  // Calculate total price
  const totalPrice = product ? product.price * quantity : 0;

  // Handle quantity changes
  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  // Handle buy button click
  const handleBuyClick = () => {
    if (!product || !isRegularUser) return;
    
    const cartItem = {
      productId: product.id,
      productName: product.name,
      productImage: product.imageUrl,
      price: product.price,
      quantity: quantity,
      total: totalPrice
    };

    // Add to cart
    dispatch(addToCart(cartItem));
    
    // Show success toast
    (window as any).toast?.showSuccess(`Added ${quantity} ${product.name} to cart!`);
    
    // Open cart modal
    dispatch(openCart());
    
    // Reset quantity to 1
    setQuantity(1);
  };

  const handleLoginSuccess = () => {
    // Login modal will close automatically
    // Session will update automatically via NextAuth
    // Stay on the same product detail page - no redirect needed
    // The page will automatically re-render with shopping functionality
    
    // Show success message
    (window as any).toast?.showSuccess('Login successful! You can now purchase products.');
  };

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
            src={product.imageUrl || '/placeholder-image.jpg'}
            alt={product.name}
            fill
            className='object-cover'
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={true}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </div>

        <div className='space-y-6 relative'>
          <div>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>
              {product.name}
            </h1>
            <p className='text-3xl font-bold text-blue-600'>
              {formatRupiah(product.price)}
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

          {/* Quantity Controls - Only show for regular users */}
          {isRegularUser && (
            <div className='flex items-center gap-4'>
              <span className='text-lg font-medium text-gray-700'>Quantity:</span>
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className='w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors'
                  disabled={quantity <= 1}
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 12H4' />
                  </svg>
                </button>
                
                <span className='text-2xl font-bold text-gray-800 min-w-[3rem] text-center'>
                  {quantity}
                </span>
                
                <button
                  onClick={() => handleQuantityChange(1)}
                  className='w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className='flex gap-4'>
            {isAdmin && (
              <Link
                href={`/admin/edit/${product.id}`}
                className='bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors'
              >
                Edit Product
              </Link>
            )}
          </div>

          {/* Total Price and Buy Button - Bottom Right - Only show for regular users */}
          {isRegularUser && (
            <div className='absolute bottom-0 right-0 flex flex-col items-end gap-3'>
              {/* Total Price */}
              <div className='bg-white bg-opacity-90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg'>
                <div className='text-sm text-gray-600'>Total</div>
                <div className='text-xl font-bold text-green-600'>
                  {formatRupiah(totalPrice)}
                </div>
              </div>
              
              {/* Buy Button */}
              <button
                onClick={handleBuyClick}
                className='bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg transition-colors font-semibold text-lg shadow-lg'
              >
                Buy Now
              </button>
            </div>
          )}

          {/* Login Prompt Button - Bottom Right - Only show for unauthenticated users */}
          {!isAuthenticated && (
            <div className='absolute bottom-0 right-0'>
              <button
                onClick={openLoginModal}
                className='bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg transition-colors font-semibold text-lg shadow-lg border-2 border-red-600'
              >
                Please Login to Buy
              </button>
            </div>
          )}

          {product.createdAt && (
            <div className='text-sm text-gray-500 pb-16'>
              <p>Created: {new Date(product.createdAt).toLocaleDateString()}</p>
              {product.updatedAt && product.updatedAt !== product.createdAt && (
                <p>Updated: {new Date(product.updatedAt).toLocaleDateString()}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
