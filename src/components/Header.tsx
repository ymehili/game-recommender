'use client';

import { useAuth } from '@/contexts/AuthContext';
import { FaGamepad, FaHome } from 'react-icons/fa';
import Link from 'next/link';
import GameSearchBar from './GameSearchBar';
import AuthButton from './AuthButton';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-letterboxd-secondary border-b border-letterboxd sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <FaGamepad className="text-2xl letterboxd-green" />
            <h1 className="text-xl font-bold text-white">gamelogd</h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-white hover:letterboxd-green transition-colors flex items-center space-x-1 font-medium border-b-2 border-letterboxd-green pb-1">
              <FaHome className="text-sm" />
              <span>HOME</span>
            </Link>
            {user && (
              <Link href="/profile" className="text-secondary hover:text-white transition-colors font-medium">
                PROFILE
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <GameSearchBar 
              placeholder="Search"
              className="w-64 hidden lg:block"
            />
            
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
} 