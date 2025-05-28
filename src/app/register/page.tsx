'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import RegisterForm from '@/components/RegisterForm';

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