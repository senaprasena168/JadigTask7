'use client';

import Image from 'next/image';
import { CircularSpinLightContainer } from './CircularSpinLightContainer';

export function TestToastButton() {
  const handleClick = () => {
    // Use the global toast function
    if (typeof window !== 'undefined' && (window as any).toast) {
      (window as any).toast.showSuccess('Product added successfully!');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleClick}
        className="block transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded-full"
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
        }}
      >
        <CircularSpinLightContainer
          width={64}
          height={64}
          expandOnHover={true}
          expandedWidth={72}
          expandedHeight={72}
        >
          <Image
            src="/wetkingcat.png"
            alt="Test Toast"
            width={54}
            height={54}
            className="rounded-full object-cover"
            style={{
              width: '54px',
              height: '54px',
              objectFit: 'cover',
              display: 'block',
              margin: 'auto',
            }}
          />
        </CircularSpinLightContainer>
      </button>
    </div>
  );
}