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
      <div className="flex items-center space-x-2">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-10 w-20"></div>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-10 w-20"></div>
      </div>
    );
  }

  if (user) {
    return <UserMenu />;
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <button
          onClick={openLoginModal}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
        >
          <FaSignInAlt className="h-4 w-4" />
          <span>Sign In</span>
        </button>

        <button
          onClick={openRegisterModal}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FaUserPlus className="h-4 w-4" />
          <span>Sign Up</span>
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