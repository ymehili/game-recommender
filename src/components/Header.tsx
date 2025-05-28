'use client';

import { useAuth } from '@/contexts/AuthContext';
import { FaGamepad, FaHome, FaUser } from 'react-icons/fa';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GameSearchBar from './GameSearchBar';
import AuthButton from './AuthButton';

export default function Header() {
  const { user } = useAuth();
  const pathname = usePathname();

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
            <Link 
              href="/" 
              className={`hover:letterboxd-green transition-colors flex items-center space-x-1 font-medium ${
                pathname === '/' ? 'text-white' : 'text-secondary'
              }`}
            >
              <FaHome className="text-sm" />
              <span>HOME</span>
            </Link>
            {user && (
              <Link 
                href="/profile" 
                className={`hover:text-white transition-colors font-medium flex items-center space-x-1 ${
                  pathname === '/profile' ? 'text-white' : 'text-secondary'
                }`}
              >
                <FaUser className="text-sm" />
                <span>PROFILE</span>
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