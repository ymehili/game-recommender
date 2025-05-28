'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import RegisterForm from '@/components/RegisterForm';
import { FaArrowLeft, FaGamepad } from 'react-icons/fa';
import Link from 'next/link';

export default function RegisterPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-letterboxd flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-letterboxd-green border-t-transparent"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to home
  }

  return (
    <div className="min-h-screen bg-letterboxd flex flex-col">
      {/* Header */}
      <div className="w-full px-4 py-6 border-b border-letterboxd">
        <div className="container mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 text-muted hover:letterboxd-green transition-colors duration-200"
          >
            <FaArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center space-x-3">
            <FaGamepad className="text-2xl letterboxd-green" />
            <span className="text-xl font-bold text-white">
              gamelogd
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <RegisterForm
            onSwitchToLogin={() => router.push('/login')}
            onClose={() => router.push('/')}
          />
        </div>
      </div>
    </div>
  );
} 