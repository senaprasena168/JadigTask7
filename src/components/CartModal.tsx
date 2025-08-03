'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { closeCart, removeFromCart, updateQuantity, clearCart } from '@/lib/features/cart/cartSlice';
import { formatRupiah } from '@/lib/currency';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CartModal() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, totalItems, totalPrice, isOpen } = useAppSelector((state) => state.cart);

  if (!isOpen) return null;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(productId));
    } else {
      dispatch(updateQuantity({ productId, quantity: newQuantity }));
    }
  };

  const handleCheckout = () => {
    // Close cart modal
    dispatch(closeCart());
    
    // Redirect to checkout page
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
          <button
            onClick={() => dispatch(closeCart())}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Cart Items */}
        <div className="p-6 overflow-y-auto max-h-96">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg mb-4">Your cart is empty</div>
              <button
                onClick={() => dispatch(closeCart())}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 p-4 border rounded-lg">
                  {/* Product Image */}
                  <div className="w-16 h-16 relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.productImage || '/placeholder-image.jpg'}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.productName}</h3>
                    <p className="text-blue-600 font-medium">{formatRupiah(item.price)}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    
                    <span className="text-lg font-semibold text-gray-800 min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                      className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <div className="font-bold text-green-600">{formatRupiah(item.total)}</div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => dispatch(removeFromCart(item.productId))}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg">
                <span className="text-gray-600">Total Items: </span>
                <span className="font-semibold">{totalItems}</span>
              </div>
              <div className="text-xl font-bold text-green-600">
                {formatRupiah(totalPrice)}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => dispatch(clearCart())}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
              >
                Clear Cart
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors font-semibold"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}