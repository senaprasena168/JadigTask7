'use client';

import React, { useState, useRef, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks';
import { loginSuccess } from '@/lib/features/auth/authSlice';
import styles from './LoginCard.module.css';

const LoginCard = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessageState, setShowMessageState] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: '',
  });

  const boxRef = useRef<HTMLDivElement>(null);

  // Sync NextAuth session with Redux store
  useEffect(() => {
    const handleSessionLogin = async () => {
      if (session?.user) {
        dispatch(
          loginSuccess({
            username: session.user.name || session.user.email || 'User',
            email: session.user.email || '',
            role: (session.user as { role?: string }).role || 'admin',
          })
        );

        // Use requestAnimationFrame to ensure DOM updates are complete
        await new Promise((resolve) => requestAnimationFrame(resolve));

        // Check for redirect parameter
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        if (redirect) {
          router.push(redirect);
        } else {
          router.push('/admin');
        }
      }
    };

    handleSessionLogin();
  }, [session, dispatch, router]);

  const showMessage = (text: string) => {
    setMessage(text);
    setShowMessageState(true);
    setTimeout(() => {
      setShowMessageState(false);
      setMessage('');
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(
          'Registration successful! Please check your email for OTP.'
        );
        setPendingEmail(formData.email);
        setShowOtpForm(true);
        setFormData((prev) => ({ ...prev, name: '', password: '' }));
      } else {
        showMessage(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showMessage('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      showMessage('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Login successful!');
        dispatch(
          loginSuccess({
            username: data.user.name,
            email: data.user.email,
            role: data.user.role,
          })
        );

        // Use requestAnimationFrame to ensure DOM updates are complete
        await new Promise((resolve) => requestAnimationFrame(resolve));
        router.push('/admin');
      } else {
        showMessage(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      showMessage('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otp) {
      showMessage('Please enter OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: pendingEmail,
          otp: formData.otp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Account verified successfully! You can now login.');
        setShowOtpForm(false);
        setIsRegistering(false);
        setFormData({ name: '', email: '', password: '', otp: '' });
        setPendingEmail('');
      } else {
        showMessage(data.error || 'OTP verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      showMessage('OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    showMessage('Redirecting to Google...');
    try {
      // Remove redirect: false to allow proper redirect to Google OAuth
      await signIn('google', {
        callbackUrl: '/admin',
      });
    } catch (error) {
      console.error('Login error:', error);
      showMessage('Login failed. Please try again.');
      setLoading(false);
    }
    // Don't set loading to false here since we're redirecting
  };

  return (
    <div className={styles.container}>
      <div
        ref={boxRef}
        className={`${styles.box} ${isHovered ? styles.hovered : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={styles.gradientContainer}>
          <div className={`${styles.gradientBox} ${styles.gradientBox1}`}></div>
          <div className={`${styles.gradientBox} ${styles.gradientBox2}`}></div>
        </div>
        <div className={styles.redGradientContainer}>
          <div
            className={`${styles.redGradientBox} ${styles.redGradientBox1}`}
          ></div>
          <div
            className={`${styles.redGradientBox} ${styles.redGradientBox2}`}
          ></div>
        </div>

        <div className={styles.form}>
          <h2 className={isHovered ? '' : styles.scaled}>
            {showOtpForm ? 'VERIFY OTP' : isRegistering ? 'REGISTER' : 'LOGIN'}
          </h2>

          <div className={styles.inputContainer}>
            {showOtpForm ? (
              // OTP Verification Form
              <form onSubmit={handleOtpVerification}>
                <div style={{ marginBottom: '16px' }}>
                  <input
                    type='text'
                    name='otp'
                    placeholder='Enter 6-digit OTP'
                    value={formData.otp}
                    onChange={handleInputChange}
                    maxLength={6}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      fontSize: '16px',
                      textAlign: 'center',
                      letterSpacing: '2px',
                    }}
                    disabled={loading}
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
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <div style={{ textAlign: 'center' }}>
                  <button
                    type='button'
                    onClick={() => {
                      setShowOtpForm(false);
                      setIsRegistering(false);
                      setFormData({
                        name: '',
                        email: '',
                        password: '',
                        otp: '',
                      });
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#007bff',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
              // Login/Register Form
              <form onSubmit={isRegistering ? handleRegister : handleLogin}>
                {isRegistering && (
                  <div style={{ marginBottom: '16px' }}>
                    <input
                      type='text'
                      name='name'
                      placeholder='Full Name'
                      value={formData.name}
                      onChange={handleInputChange}
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
            )}

            {!showOtpForm && (
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
  );
};

export default LoginCard;
