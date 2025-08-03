'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SpinLightContainer } from './SpinLightContainer';

/**
 * Toast Component - Refactored with SpinLightContainer
 *
 * This is the new toast notification system using the modular SpinLightContainer component.
 * It replaces the original custom spinning light implementation with a reusable module.
 *
 * Key Changes from Original:
 * - Uses SpinLightContainer for spinning light effects (reduces code complexity)
 * - Maintains the same animation sequence and timing
 * - Simplified container structure (from 9 containers to using the modular component)
 * - Same API and functionality as the original
 *
 * Benefits:
 * - More maintainable code
 * - Reusable spinning light effects
 * - Cleaner separation of concerns
 * - Easier to customize and extend
 *
 * Original backup available in: Toast.backup.tsx
 */

export interface ToastProps {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({
  id,
  message,
  type = 'success',
  duration = 4000,
  onClose,
}: ToastProps) {
  const [animationState, setAnimationState] = useState<
    | 'hidden'
    | 'sliding-down'
    | 'shrunk'
    | 'expanding'
    | 'expanded'
    | 'shrinking'
    | 'sliding-up'
  >('hidden');

  useEffect(() => {
    // Same animation sequence as original - maintains exact timing
    const sequence = async () => {
      // 1. Start sliding down in shrunk state
      setTimeout(() => setAnimationState('sliding-down'), 10);

      // 2. Reach destination in shrunk state
      setTimeout(() => setAnimationState('shrunk'), 500);

      // 3. Start expanding to show full message
      setTimeout(() => setAnimationState('expanding'), 700);

      // 4. Fully expanded state
      setTimeout(() => setAnimationState('expanded'), 1000);

      // 5. Show full message for 2 seconds, then start shrinking
      setTimeout(() => setAnimationState('shrinking'), 3000);

      // 6. Back to shrunk state
      setTimeout(() => setAnimationState('shrunk'), 3300);

      // 7. Start sliding up to disappear
      setTimeout(() => setAnimationState('sliding-up'), 3800);

      // 8. Remove from DOM
      setTimeout(() => onClose(id), 4300);
    };

    sequence();
  }, [id, onClose]);

  const getTypeIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return '#00ff88';
      case 'error':
        return '#ff4444';
      case 'warning':
        return '#ffaa00';
      default:
        return '#00ccff';
    }
  };

  // Determine container dimensions based on animation state
  const isExpanded =
    animationState === 'expanding' ||
    animationState === 'expanded' ||
    animationState === 'shrinking';

  const showOnlyNotification =
    animationState === 'sliding-down' ||
    animationState === 'shrunk' ||
    animationState === 'sliding-up';

  // Dynamic sizing - increased width to prevent text cropping
  // Based on SpinLightContainer documentation examples
  const containerWidth = isExpanded ? 380 : 140;
  const containerHeight = isExpanded ? 80 : 50;

  // Container positioning and animation classes
  const getContainerStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      top: '4rem',
      left: '50%',
      transform: 'translate(-50%, 0)',
      zIndex: 10000, // Higher than modal overlay (9999)
      transition: 'all 0.5s ease-in-out',
    };

    switch (animationState) {
      case 'hidden':
        return {
          ...baseStyle,
          transform: 'translate(-50%, -400px)',
          opacity: 0,
        };
      case 'sliding-down':
        return {
          ...baseStyle,
          animation: 'slideDown 0.5s ease-out',
        };
      case 'sliding-up':
        return {
          ...baseStyle,
          transform: 'translate(-50%, -400px)',
          opacity: 0,
        };
      default:
        return {
          ...baseStyle,
          transform: 'translate(-50%, 0)',
          opacity: 1,
        };
    }
  };

  return (
    <div style={getContainerStyle()}>
      <SpinLightContainer
        width={containerWidth}
        height={containerHeight}
        expandOnHover={false} // Toast doesn't need hover expansion
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isExpanded ? '10px' : '4px',
            padding: isExpanded ? '10px 20px' : '6px 10px',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: isExpanded ? '0.95em' : '0.85em',
            lineHeight: 1.2,
            transition: 'all 0.3s ease-in-out',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Show icon only when expanded */}
          {isExpanded && (
            <div
              style={{
                fontSize: '1.2em',
                color: getTypeColor(),
                flexShrink: 0,
              }}
            >
              {getTypeIcon()}
            </div>
          )}

          {/* Message content */}
          <div
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transition: 'all 0.3s ease-in-out',
            }}
          >
            {showOnlyNotification ? 'Notification' : message}
          </div>
        </div>
      </SpinLightContainer>

      {/* Add keyframe animations via style tag */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translate(-50%, -400px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translate(-50%, 0);
            opacity: 1;
          }
          to {
            transform: translate(-50%, -400px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: removeToast,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const showSuccess = (message: string) => {
    showToast({ message, type: 'success' });
  };

  const showError = (message: string) => {
    showToast({ message, type: 'error' });
  };

  const showWarning = (message: string) => {
    showToast({ message, type: 'warning' });
  };

  const showInfo = (message: string) => {
    showToast({ message, type: 'info' });
  };

  // Make toast functions available globally - same API as original
  useEffect(() => {
    (window as any).toast = {
      showToast,
      showSuccess,
      showError,
      showWarning,
      showInfo,
    };
  }, []);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </>,
    document.body
  );
}
