'use client';

import { useState } from 'react';
import GameLists from '@/components/GameLists';
import GameRecommendations from '@/components/GameRecommendations';
import GameSearchBar from '@/components/GameSearchBar';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { FaGamepad, FaSignInAlt, FaFilm, FaSearch, FaList, FaUser, FaHome, FaBars, FaBell, FaEllipsisH } from 'react-icons/fa';
import Link from 'next/link';

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const { preferences, isLoading: preferencesLoading } = usePreferences();
  const { ratedGames } = preferences;

  if (!user && !authLoading) {
    return (
      <div className="min-h-screen bg-letterboxd">
        {/* Navigation Header */}
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
                <Link href="/" className="text-secondary hover:text-white transition-colors font-medium">
                  HOME
                </Link>
                <Link href="/profile" className="text-white hover:letterboxd-green transition-colors font-medium border-b-2 border-letterboxd-green pb-1">
                  PROFILE
                </Link>
              </nav>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                <GameSearchBar 
                  placeholder="Search"
                  className="w-64 hidden lg:block"
                />
                
                <Link href="/login" className="bg-letterboxd-green text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-600 transition-colors">
                  SIGN IN
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center py-20">
            <div className="bg-letterboxd-card border border-letterboxd rounded-lg p-8">
              <FaSignInAlt className="mx-auto text-5xl letterboxd-green mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Sign in to view your profile
              </h2>
              <p className="text-xl text-secondary mb-8">
                You need to be logged in to access your profile page.
              </p>
              
              <div className="space-y-4">
                <Link 
                  href="/login"
                  className="bg-letterboxd-green text-white px-6 py-3 rounded font-medium hover:bg-green-600 transition-colors inline-block"
                >
                  Sign In
                </Link>
                <div className="text-muted">
                  Don't have an account? <Link href="/register" className="text-letterboxd-green hover:underline">Sign up here</Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-letterboxd">
      {/* Letterboxd-style Navigation Header */}
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
              <Link href="/" className="text-secondary hover:text-white transition-colors font-medium">
                HOME
              </Link>
              <Link href="/profile" className="text-white hover:letterboxd-green transition-colors font-medium border-b-2 border-letterboxd-green pb-1">
                PROFILE
              </Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <GameSearchBar 
                placeholder="Search"
                className="w-64 hidden lg:block"
              />
              
              {user && (
                <div className="flex items-center space-x-3">
                  <FaBell className="text-secondary hover:text-white cursor-pointer text-lg" />
                  <Link href="/profile">
                    <div className="w-8 h-8 rounded-full bg-letterboxd-green flex items-center justify-center text-white font-bold text-sm cursor-pointer">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {user && (
        // User Profile Section (like Letterboxd's profile header)
        <div className="bg-letterboxd-secondary border-b border-letterboxd">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 rounded-full bg-letterboxd-green flex items-center justify-center text-white font-bold text-2xl">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{user.username}</h1>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-muted text-sm">Sort by</span>
                <select className="bg-letterboxd-tertiary text-white text-sm rounded px-2 py-1 border border-letterboxd">
                  <option>RELEASE DATE</option>
                  <option>DATE RATED</option>
                  <option>RATING</option>
                  <option>TITLE</option>
                </select>
                <div className="flex border border-letterboxd rounded">
                  <button className="p-2 bg-letterboxd-tertiary text-white">
                    <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
                      <div className="bg-white rounded-sm"></div>
                      <div className="bg-white rounded-sm"></div>
                      <div className="bg-white rounded-sm"></div>
                      <div className="bg-white rounded-sm"></div>
                    </div>
                  </button>
                  <button className="p-2 text-muted hover:text-white">
                    <div className="flex space-x-1">
                      <div className="w-1 h-3 bg-current rounded"></div>
                      <div className="w-1 h-3 bg-current rounded"></div>
                      <div className="w-1 h-3 bg-current rounded"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {authLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-letterboxd-green border-t-transparent"></div>
          </div>
        ) : user ? (
          <>
            <section className="mb-12">
              <GameLists />
            </section>

            <section className="mb-12">
              <GameRecommendations />
            </section>
          </>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="bg-letterboxd-secondary border-t border-letterboxd mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <FaGamepad className="text-xl letterboxd-green" />
              <span className="text-white font-semibold">gamelogd</span>
            </div>
            <p className="text-muted text-sm">
              A social platform for gamers to discover and share their favorite games.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 