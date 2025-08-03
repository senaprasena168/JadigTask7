'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { clearCart } from '@/lib/features/cart/cartSlice';
import { formatRupiah } from '@/lib/currency';
import Image from 'next/image';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const { items, totalPrice } = useAppSelector((state) => state.cart);

  // Check authentication
  useEffect(() => {
    if (!session?.user) {
      router.push('/products');
      return;
    }

    // If cart is empty, redirect to products
    if (items.length === 0) {
      router.push('/products');
      return;
    }
  }, [session, items, router]);

  const handleBackToProducts = () => {
    dispatch(clearCart());
    router.push('/products');
  };

  if (!session?.user || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Checkout</h1>

        {/* Order Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 p-4 bg-white rounded-lg">
                  <div className="w-16 h-16 relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.productImage || '/placeholder-image.jpg'}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.productName}</h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-blue-600 font-medium">{formatRupiah(item.price)} each</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{formatRupiah(item.total)}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span className="text-green-600">{formatRupiah(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Instructions</h2>
          
          <div className="space-y-4">
            <p className="text-gray-700 font-medium">Silahkan Transfer ke Rekening:</p>
            
            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Bank Name:</p>
                  <p className="font-bold text-gray-800">ABCD</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Name:</p>
                  <p className="font-bold text-gray-800">Aing Meong</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Account Number:</p>
                  <p className="font-bold text-gray-800 text-lg">1234567890</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Amount to Transfer:</p>
                  <p className="font-bold text-green-600 text-2xl">{formatRupiah(totalPrice)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Instructions */}
        <div className="bg-green-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">After Payment</h2>
          
          <div className="space-y-4">
            <p className="text-gray-700">
              Setelah Transfer Silahkan Kirim bukti Screenshot bersama data dan alamat ke nomor berikut:
            </p>
            
            <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 text-white p-2 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">WhatsApp Number:</p>
                  <p className="font-bold text-gray-800 text-lg">081876543210</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleBackToProducts}
            className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg transition-colors font-semibold"
          >
            Back to Products
          </button>
          
          <a
            href={`https://wa.me/6281876543210?text=Hi, I have completed the payment for my order. Total: ${formatRupiah(totalPrice)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg transition-colors font-semibold inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            Contact WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}