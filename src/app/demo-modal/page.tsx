'use client';

import { useState } from 'react';
import LoginModal from '../../components/LoginModal';
import { useLoginModal } from '../../hooks/useLoginModal';

export default function DemoModalPage() {
  const { isOpen, openModal, closeModal } = useLoginModal();
  const [message, setMessage] = useState('');

  const handleLoginSuccess = () => {
    setMessage('Login successful! Modal closed automatically.');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-white mb-8">
          LoginModal Demo
        </h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Features Demonstration
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-blue-200">✨ Animation Features</h3>
              <ul className="text-white/80 space-y-1 text-sm">
                <li>• Starts in compact mode (300×80px)</li>
                <li>• Expands on hover/focus (380×550px)</li>
                <li>• Smooth 0.5s transitions</li>
                <li>• Rotating gradient backgrounds</li>
                <li>• Modal fade-in/slide-in effects</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-green-200">🔐 Authentication</h3>
              <ul className="text-white/80 space-y-1 text-sm">
                <li>• Email/password login</li>
                <li>• Google OAuth integration</li>
                <li>• User registration with OTP</li>
                <li>• Email verification system</li>
                <li>• Auto-close on success</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={openModal}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🚀 Open Login Modal
          </button>
          
          {message && (
            <div className="bg-green-500/20 border border-green-400 text-green-200 px-4 py-2 rounded-lg">
              {message}
            </div>
          )}
        </div>

        <div className="mt-12 bg-white/5 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Usage Instructions</h3>
          <div className="text-white/80 space-y-2 text-sm">
            <p>1. Click the button above to open the modal</p>
            <p>2. The modal starts compact - hover over it to see the expansion animation</p>
            <p>3. Try the different authentication methods:</p>
            <div className="ml-4 space-y-1">
              <p>• Login with existing credentials</p>
              <p>• Register a new account (requires email verification)</p>
              <p>• Sign in with Google</p>
            </div>
            <p>4. Press ESC or click outside to close the modal</p>
            <p>5. The modal will auto-close on successful authentication</p>
          </div>
        </div>

        <div className="mt-8 text-white/60 text-sm">
          <p>This modal can be integrated into any page using the useLoginModal hook.</p>
          <p>Check the Navbar for a live integration example.</p>
        </div>
      </div>

      <LoginModal 
        isOpen={isOpen} 
        onClose={closeModal} 
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}