'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterData } from '@/types/auth';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaCheck, FaTimes, FaGamepad } from 'react-icons/fa';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onClose?: () => void;
}

export default function RegisterForm({ onSwitchToLogin, onClose }: RegisterFormProps) {
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await register(formData);
      if (response.success) {
        onClose?.();
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password validation helpers
  const hasMinLength = formData.password.length >= 8;
  const hasLowercase = /[a-z]/.test(formData.password);
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  const passwordChecks = [
    { label: 'At least 8 characters', isValid: hasMinLength },
    { label: 'One lowercase letter', isValid: hasLowercase },
    { label: 'One uppercase letter', isValid: hasUppercase },
    { label: 'One number', isValid: hasNumber },
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-letterboxd-card rounded-2xl shadow-2xl p-8 border border-letterboxd">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <FaGamepad className="text-3xl letterboxd-green" />
            <h1 className="text-2xl font-bold text-white">gamelogd</h1>
          </div>
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-muted mt-2">Join the gamelogd community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-muted" />
              </div>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                className="w-full pl-10 pr-4 py-3 border border-letterboxd rounded-lg focus:ring-2 focus:ring-letterboxd-green focus:border-letterboxd-green bg-letterboxd-tertiary text-white placeholder-text-muted transition-all duration-200"
                placeholder="Choose a username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-muted" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-letterboxd rounded-lg focus:ring-2 focus:ring-letterboxd-green focus:border-letterboxd-green bg-letterboxd-tertiary text-white placeholder-text-muted transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-muted" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-12 py-3 border border-letterboxd rounded-lg focus:ring-2 focus:ring-letterboxd-green focus:border-letterboxd-green bg-letterboxd-tertiary text-white placeholder-text-muted transition-all duration-200"
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-muted hover:text-secondary" />
                ) : (
                  <FaEye className="h-5 w-5 text-muted hover:text-secondary" />
                )}
              </button>
            </div>

            {/* Password strength indicator */}
            {formData.password && (
              <div className="mt-3 space-y-1">
                {passwordChecks.map((check, index) => (
                  <div key={index} className="flex items-center text-sm">
                    {check.isValid ? (
                      <FaCheck className="h-3 w-3 text-letterboxd-green mr-2" />
                    ) : (
                      <FaTimes className="h-3 w-3 text-red-400 mr-2" />
                    )}
                    <span className={check.isValid ? 'text-letterboxd-green' : 'text-red-400'}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-muted" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-12 py-3 border border-letterboxd rounded-lg focus:ring-2 focus:ring-letterboxd-green focus:border-letterboxd-green bg-letterboxd-tertiary text-white placeholder-text-muted transition-all duration-200"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-muted hover:text-secondary" />
                ) : (
                  <FaEye className="h-5 w-5 text-muted hover:text-secondary" />
                )}
              </button>
            </div>

            {/* Password match indicator */}
            {formData.confirmPassword && (
              <div className="mt-2 flex items-center text-sm">
                {passwordsMatch ? (
                  <>
                    <FaCheck className="h-3 w-3 text-letterboxd-green mr-2" />
                    <span className="text-letterboxd-green">Passwords match</span>
                  </>
                ) : (
                  <>
                    <FaTimes className="h-3 w-3 text-red-400 mr-2" />
                    <span className="text-red-400">Passwords don't match</span>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-letterboxd-green hover:bg-green-600 disabled:bg-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-letterboxd disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="letterboxd-green hover:text-green-400 font-semibold transition-colors duration-200"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
} 