'use client';

import React, { useState, useEffect } from 'react';
import { SpinLightContainer } from './spinlightcontainermodule';
import styles from './LoginModal.module.css';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName?: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productName,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsExpanded(false);
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label='Close modal'
        >
          ×
        </button>

        <SpinLightContainer
          width={300}
          height={80}
          expandedWidth={380}
          expandedHeight={260}
          expandOnHover={true}
          onHoverChange={setIsExpanded}
        >
          <div style={{
            color: 'white',
            padding: isExpanded ? '40px 20px' : '20px',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <h2 style={{
              textAlign: 'center',
              marginTop: isExpanded ? '10px' : '0',
              marginBottom: isExpanded ? '25px' : '0',
              fontSize: '1.5em',
              fontWeight: '600',
              letterSpacing: '2px'
            }}>
              {isExpanded ? 'DELETE PRODUCT?' : 'DELETE?'}
            </h2>

            {isExpanded && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '25px',
                animation: 'fadeIn 0.5s ease-in-out',
                flex: 1,
                justifyContent: 'center'
              }}>
                {productName && (
                  <div style={{
                    textAlign: 'center',
                    marginBottom: '20px',
                    color: '#ccc',
                    fontSize: '0.9em',
                    lineHeight: '1.4'
                  }}>
                    Are you sure you want to delete "{productName}"?
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  gap: '15px',
                  justifyContent: 'center',
                  marginTop: '20px',
                  marginBottom: '20px'
                }}>
                  <button
                    onClick={handleConfirm}
                    style={{
                      padding: '8px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#dc2626',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      minWidth: '80px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#b91c1c';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#dc2626';
                    }}
                  >
                    Yes
                  </button>
                  
                  <button
                    onClick={onClose}
                    style={{
                      padding: '8px 24px',
                      borderRadius: '8px',
                      border: '2px solid #6b7280',
                      background: 'transparent',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      minWidth: '80px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#6b7280';
                      e.currentTarget.style.borderColor = '#6b7280';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = '#6b7280';
                    }}
                  >
                    No
                  </button>
                </div>
              </div>
            )}
          </div>
        </SpinLightContainer>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;