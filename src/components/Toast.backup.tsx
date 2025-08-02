'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Toast.module.css';

/**
 * BACKUP - Original Toast Component
 * 
 * This is the original toast notification system with custom spinning light animations.
 * It has been replaced by a version using the modular SpinLightContainer component.
 * 
 * This backup is kept for reference and potential rollback if needed.
 * 
 * Original Features:
 * - Custom spinning light animations (9 containers)
 * - Complex animation sequence (slide down → expand → shrink → slide up)
 * - Integrated gradient containers and animation logic
 * - Type-specific styling (success, error, warning, info)
 * 
 * Date Backed Up: 2025-08-02
 * Reason: Replaced with modular SpinLightContainer implementation
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
    // Animation sequence
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

  const getContainerClass = () => {
    switch (animationState) {
      case 'hidden':
        return styles.hidden;
      case 'sliding-down':
      case 'shrunk':
      case 'shrinking':
      case 'expanding':
      case 'expanded':
        return styles.visible;
      case 'sliding-up':
        return styles.slidingUp;
      default:
        return styles.hidden;
    }
  };

  const isExpanded =
    animationState === 'expanding' ||
    animationState === 'expanded' ||
    animationState === 'shrinking';
  const showOnlyNotification =
    animationState === 'sliding-down' ||
    animationState === 'shrunk' ||
    animationState === 'sliding-up';

  return (
    <div className={`${styles.toastContainer} ${getContainerClass()}`}>
      <div
        className={`
          ${styles.toastBox}
          ${isExpanded ? styles.expanded : styles.shrunk}
          ${styles[type]}
          ${animationState === 'sliding-down' ? styles.slidingDown : ''}
          ${animationState === 'sliding-up' ? styles.slidingUp : ''}
        `}
      >
        {/* Animated gradient borders - Blue */}
        <div className={`${styles.gradientContainer} ${isExpanded ? styles.expanded : styles.shrunk}`}>
          <div
            className={`${styles.gradientBox} ${styles.gradientBox1}`}
          ></div>
          <div
            className={`${styles.gradientBox} ${styles.gradientBox2}`}
          ></div>
        </div>

        {/* Animated gradient borders - Red */}
        <div className={`${styles.redGradientContainer} ${isExpanded ? styles.expanded : styles.shrunk}`}>
          <div
            className={`${styles.redGradientBox} ${styles.redGradientBox1}`}
          ></div>
          <div
            className={`${styles.redGradientBox} ${styles.redGradientBox2}`}
          ></div>
        </div>

        {/* Content */}
        <div
          className={`
            ${styles.toastContent}
            ${isExpanded ? styles.expanded : styles.shrunk}
          `}
        >
          {/* Show icon only when expanded */}
          {isExpanded && (
            <div className={`${styles.toastIcon} ${styles[type]}`}>
              {getTypeIcon()}
            </div>
          )}

          {/* Message content */}
          <div
            className={`
              ${styles.toastMessage}
              ${isExpanded ? styles.expanded : styles.shrunk}
            `}
          >
            {showOnlyNotification ? 'Notification' : message}
          </div>
        </div>
      </div>
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

  // Make toast functions available globally
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