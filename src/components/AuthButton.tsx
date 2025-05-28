'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import AuthModal from './AuthModal';
import UserMenu from './UserMenu';

export default function AuthButton() {
  const { user, isLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'register'>('login');

  const openLoginModal = () => {
    setModalMode('login');
    setIsModalOpen(true);
  };

  const openRegisterModal = () => {
    setModalMode('register');
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="animate-pulse bg-letterboxd-tertiary rounded-lg h-10 w-20"></div>
        <div className="animate-pulse bg-letterboxd-tertiary rounded-lg h-10 w-20"></div>
      </div>
    );
  }

  if (user) {
    return <UserMenu />;
  }

  return (
    <>
      <div className="flex items-center space-x-3">
        <button
          onClick={openLoginModal}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-secondary hover:text-white transition-colors duration-200"
        >
          <FaSignInAlt className="h-4 w-4" />
          <span>Sign In</span>
        </button>

        <button
          onClick={openRegisterModal}
          className="flex items-center space-x-2 bg-letterboxd-green hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-letterboxd"
        >
          <FaUserPlus className="h-4 w-4" />
          <span>Create Account</span>
        </button>
      </div>

      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultMode={modalMode}
      />
    </>
  );
} 