'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessageState, setShowMessageState] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasInputFocus, setHasInputFocus] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [collapseTimeout, setCollapseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  // Handle authenticated users
  useEffect(() => {
    if (status === 'authenticated' && session?.user && isOpen) {
      // Close modal and call success callback
      onClose();
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }
  }, [session, status, isOpen, onClose, onLoginSuccess]);

  // Expand when either focused or hovered
  useEffect(() => {
    setIsExpanded(hasInputFocus || isMouseOver);
  }, [hasInputFocus, isMouseOver]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (collapseTimeout) {
        clearTimeout(collapseTimeout);
      }
    };
  }, [collapseTimeout]);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsExpanded(false);
      setHasInputFocus(false);
      setIsMouseOver(false);
      setIsRegistering(false);
      setShowOTPVerification(false);
      setOtpCode('');
      setUserEmail('');
      setFormData({ name: '', email: '', password: '' });
      setMessage('');
      setShowMessageState(false);
      if (collapseTimeout) {
        clearTimeout(collapseTimeout);
        setCollapseTimeout(null);
      }
    }
  }, [isOpen, collapseTimeout]);

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

  // Show loading if checking session
  if (status === 'loading') {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <div className={styles.loadingText}>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  const showMessage = (text: string) => {
    setMessage(text);
    setShowMessageState(true);
    setTimeout(() => {
      setShowMessageState(false);
      setMessage('');
    }, 4000);
  };

  const handleMouseEnter = () => {
    if (collapseTimeout) {
      clearTimeout(collapseTimeout);
      setCollapseTimeout(null);
    }
    setIsMouseOver(true);
  };

  const handleMouseLeave = () => {
    // Only start collapse timer if no input has focus
    if (!hasInputFocus) {
      const timeout = setTimeout(() => {
        setIsMouseOver(false);
      }, 200);
      setCollapseTimeout(timeout);
    } else {
      setIsMouseOver(false);
    }
  };

  const handleInputFocus = () => {
    setHasInputFocus(true);
    if (collapseTimeout) {
      clearTimeout(collapseTimeout);
      setCollapseTimeout(null);
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Check if focus is moving to autocomplete or another input
    setTimeout(() => {
      const activeElement = document.activeElement;
      const isStillInForm = e.currentTarget.contains(activeElement as Node);

      if (!isStillInForm) {
        setHasInputFocus(false);
        // If mouse is also not over, start collapse
        if (!isMouseOver) {
          const timeout = setTimeout(() => {
            setIsExpanded(false);
          }, 100);
          setCollapseTimeout(timeout);
        }
      }
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      showMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresOTP) {
          showMessage(data.message);
          setUserEmail(data.email);
          setShowOTPVerification(true);
          setIsRegistering(false);
          setFormData({ name: '', email: '', password: '' });
        } else {
          showMessage('Registration successful! You can now log in.');
          setIsRegistering(false);
          setFormData({ name: '', email: '', password: '' });
        }
      } else {
        showMessage(data.error || 'Registration failed');
      }
    } catch (error) {
      showMessage('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      showMessage('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        showMessage('Invalid email or password');
      } else if (result?.ok) {
        // Success - NextAuth will handle the session
        showMessage('Login successful!');
        
        // Close modal and call success callback
        setTimeout(() => {
          onClose();
          if (onLoginSuccess) {
            onLoginSuccess();
          }
        }, 1000);
      }
    } catch (error) {
      showMessage('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signIn('google', {
        redirect: false,
      });

      if (result?.url) {
        // For OAuth, we need to redirect to complete the flow
        window.location.href = result.url;
      } else if (result?.ok) {
        // Success - close modal
        onClose();
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }
    } catch (error) {
      showMessage('Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      showMessage('Please enter a valid 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          otpCode: otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message);
        setShowOTPVerification(false);
        setOtpCode('');
        setUserEmail('');
        // User can now login
      } else {
        showMessage(data.error || 'OTP verification failed');
      }
    } catch (error) {
      showMessage('OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!userEmail) {
      showMessage('Email not found. Please register again.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message);
      } else {
        showMessage(data.error || 'Failed to resend OTP');
      }
    } catch (error) {
      showMessage('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
          ×
        </button>
        
        <div className={styles.container}>
          <div
            className={`${styles.box} ${isExpanded ? styles.hovered : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className={styles.gradientContainer}>
              <div className={`${styles.gradientBox} ${styles.gradientBox1}`}></div>
              <div className={`${styles.gradientBox} ${styles.gradientBox2}`}></div>
            </div>
            <div className={styles.redGradientContainer}>
              <div className={`${styles.redGradientBox} ${styles.redGradientBox1}`}></div>
              <div className={`${styles.redGradientBox} ${styles.redGradientBox2}`}></div>
            </div>

            <div className={styles.form}>
              <h2 className={isExpanded ? '' : styles.scaled}>
                {showOTPVerification
                  ? 'VERIFY OTP'
                  : isRegistering
                  ? 'REGISTER'
                  : 'LOGIN'}
              </h2>

              <div className={styles.inputContainer}>
                {showOTPVerification ? (
                  /* OTP Verification Form */
                  <form onSubmit={handleVerifyOTP}>
                    <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                      <p
                        style={{
                          color: '#666',
                          fontSize: '14px',
                          marginBottom: '16px',
                        }}
                      >
                        Please enter the 6-digit OTP code sent to:
                        <br />
                        <strong>{userEmail}</strong>
                      </p>
                      <input
                        type='text'
                        placeholder='Enter 6-digit OTP'
                        value={otpCode}
                        onChange={(e) =>
                          setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                        }
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          fontSize: '18px',
                          textAlign: 'center',
                          letterSpacing: '4px',
                        }}
                        disabled={loading}
                        maxLength={6}
                        required
                      />
                    </div>
                    <button
                      type='submit'
                      disabled={loading || otpCode.length !== 6}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        background:
                          loading || otpCode.length !== 6 ? '#ccc' : '#28a745',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor:
                          loading || otpCode.length !== 6
                            ? 'not-allowed'
                            : 'pointer',
                        marginBottom: '16px',
                      }}
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <div style={{ textAlign: 'center' }}>
                      <button
                        type='button'
                        onClick={handleResendOTP}
                        disabled={loading}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#007bff',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          textDecoration: 'underline',
                          fontSize: '14px',
                          marginRight: '16px',
                        }}
                      >
                        Resend OTP
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          setShowOTPVerification(false);
                          setOtpCode('');
                          setUserEmail('');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#666',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontSize: '14px',
                        }}
                      >
                        Back to Login
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Login/Register Form */
                  <>
                    <form
                      onSubmit={
                        isRegistering ? handleRegister : handleCredentialsLogin
                      }
                    >
                      {isRegistering && (
                        <div style={{ marginBottom: '16px' }}>
                          <input
                            type='text'
                            name='name'
                            placeholder='Full Name'
                            value={formData.name}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            style={{
                              width: '100%',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid #ddd',
                              fontSize: '16px',
                            }}
                            disabled={loading}
                            required
                          />
                        </div>
                      )}
                      <div style={{ marginBottom: '16px' }}>
                        <input
                          type='email'
                          name='email'
                          placeholder='Email'
                          value={formData.email}
                          onChange={handleInputChange}
                          onFocus={handleInputFocus}
                          onBlur={handleInputBlur}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            fontSize: '16px',
                          }}
                          disabled={loading}
                          required
                        />
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <input
                          type='password'
                          name='password'
                          placeholder='Password'
                          value={formData.password}
                          onChange={handleInputChange}
                          onFocus={handleInputFocus}
                          onBlur={handleInputBlur}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            fontSize: '16px',
                          }}
                          disabled={loading}
                          required
                        />
                      </div>
                      <button
                        type='submit'
                        disabled={loading}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: loading ? '#ccc' : '#007bff',
                          color: 'white',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          marginBottom: '16px',
                        }}
                      >
                        {loading
                          ? isRegistering
                            ? 'Registering...'
                            : 'Logging in...'
                          : isRegistering
                          ? 'Register'
                          : 'Login'}
                      </button>
                    </form>

                    {!isRegistering && (
                      <>
                        <div style={{ textAlign: 'center', margin: '16px 0' }}>
                          <span style={{ color: '#666' }}>or</span>
                        </div>

                        <button
                          type='button'
                          onClick={handleGoogleSignIn}
                          disabled={loading}
                          className={`${styles.button} ${styles.googleButton}`}
                          style={{
                            background: loading
                              ? '#ccc'
                              : 'linear-gradient(45deg, #4285f4, #34a853, #fbbc05, #ea4335)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            width: '100%',
                            marginBottom: '16px',
                          }}
                        >
                          {loading ? (
                            'Signing in...'
                          ) : (
                            <>
                              <svg width='20' height='20' viewBox='0 0 24 24'>
                                <path
                                  fill='currentColor'
                                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                                />
                                <path
                                  fill='currentColor'
                                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                                />
                                <path
                                  fill='currentColor'
                                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                                />
                                <path
                                  fill='currentColor'
                                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                                />
                              </svg>
                              Sign in with Google
                            </>
                          )}
                        </button>
                      </>
                    )}

                    <div className={styles.links}>
                      <button
                        type='button'
                        onClick={() => setIsRegistering(!isRegistering)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#007bff',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        {isRegistering
                          ? 'Already have an account? Login'
                          : 'Need an account? Register'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div
            className={`${styles.message} ${showMessageState ? styles.show : ''}`}
          >
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;