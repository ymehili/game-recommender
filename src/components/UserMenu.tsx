'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FaUser, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-letterboxd-card rounded-lg px-4 py-2 border border-letterboxd hover:bg-letterboxd-tertiary transition-colors duration-200"
      >
        <div className="w-8 h-8 bg-letterboxd-green rounded-full flex items-center justify-center text-white font-semibold">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-white">
            {user.username}
          </div>
          <div className="text-xs text-muted truncate max-w-[150px]">
            {user.email}
          </div>
        </div>
        <FaChevronDown
          className={`h-4 w-4 text-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-letterboxd-card rounded-lg shadow-lg border border-letterboxd py-1 z-50">
          <div className="px-4 py-3 border-b border-letterboxd">
            <div className="text-sm font-medium text-white">
              Signed in as
            </div>
            <div className="text-sm text-muted truncate">
              {user.email}
            </div>
          </div>

          <div className="py-1">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors duration-200"
            >
              <FaSignOutAlt className="h-4 w-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 