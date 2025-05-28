'use client';

import PopularGames from '@/components/PopularGames';
import GameSearchBar from '@/components/GameSearchBar';
import { useAuth } from '@/contexts/AuthContext';
import { FaGamepad, FaSignInAlt, FaUser } from 'react-icons/fa';
import Link from 'next/link';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-letterboxd">
      <main className="container mx-auto px-4 py-8">
        {!user ? (
          <>
            {/* Hero Section for non-logged in users */}
            <section className="text-center mb-12">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Track games you've played.
                </h2>
                <h3 className="text-3xl md:text-4xl font-bold mb-6">
                  <span className="text-secondary">Save those you want to see.</span>
                </h3>
                <p className="text-xl text-muted max-w-2xl mx-auto mb-8">
                  Keep track of every game you've played (or just start from the day you join)
                </p>
                
                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-6">
                  <GameSearchBar 
                    placeholder="Search games..."
                    className="w-full"
                  />
                </div>
              </div>
            </section>

            {!process.env.NEXT_PUBLIC_GEMINI_API_KEY && (
              <div className="max-w-4xl mx-auto mb-8 p-4 bg-letterboxd-tertiary border border-letterboxd rounded-lg">
                <p className="font-medium text-white">Gemini API Key Not Configured</p>
                <p className="mt-1 text-muted">
                  To enable AI recommendations, add your Gemini API key as an environment variable.
                </p>
              </div>
            )}

            {/* Popular Games Section */}
            <section className="mb-12">
              <PopularGames />
            </section>

            <div className="max-w-4xl mx-auto text-center py-12">
              <div className="bg-letterboxd-card border border-letterboxd rounded-lg p-8">
                <FaSignInAlt className="mx-auto text-5xl letterboxd-green mb-6" />
                <h2 className="text-3xl font-bold text-white mb-4">
                  Join gamelogd
                </h2>
                <p className="text-xl text-secondary mb-8">
                  The social network for gamers. Track your gaming journey.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-letterboxd-green mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="text-white font-semibold">Keep a diary</h4>
                        <p className="text-muted">Record and rate every game you play</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-letterboxd-green mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="text-white font-semibold">Show your taste</h4>
                        <p className="text-muted">Rate games and show off your favorites</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-letterboxd-green mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="text-white font-semibold">Write and share reviews</h4>
                        <p className="text-muted">Add personal notes to remember what you thought</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-letterboxd-green mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="text-white font-semibold">Make lists</h4>
                        <p className="text-muted">Organize games any way you want</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-letterboxd-green mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="text-white font-semibold">Get recommendations</h4>
                        <p className="text-muted">AI-powered suggestions based on your taste</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-letterboxd-green mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="text-white font-semibold">Find new favorites</h4>
                        <p className="text-muted">Discover games you never knew you'd love</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <Link 
                    href="/register"
                    className="bg-letterboxd-green text-white px-6 py-3 rounded font-medium hover:bg-green-600 transition-colors inline-block"
                  >
                    Get Started
                  </Link>
                  <div className="text-muted">
                    Already have an account? <Link href="/login" className="text-letterboxd-green hover:underline">Sign in here</Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Welcome section for logged in users */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome back, {user.username}!
                  </h1>
                  <p className="text-muted">
                    Discover new games and see what's trending in the gaming community.
                  </p>
                </div>
                <Link 
                  href="/profile"
                  className="bg-letterboxd-green text-white px-4 py-2 rounded font-medium hover:bg-green-600 transition-colors flex items-center space-x-2"
                >
                  <FaUser />
                  <span>View Profile</span>
                </Link>
              </div>
            </section>

            {/* Popular Games Section */}
            <section className="mb-12">
              <PopularGames />
            </section>
          </>
        )}
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
