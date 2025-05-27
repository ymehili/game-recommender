'use client';

import { useState } from 'react';
import AddGameForm from '@/components/AddGameForm';
import GameLists from '@/components/GameLists';
import GameRecommendations from '@/components/GameRecommendations';
import AuthButton from '@/components/AuthButton';
import { useAuth } from '@/contexts/AuthContext';
import { FaGamepad, FaSignInAlt } from 'react-icons/fa';

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean>(
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ? true : false
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="text-center mb-12 relative">
        <div className="absolute top-0 right-0">
          <AuthButton />
        </div>
        
        <div className="flex items-center justify-center mb-4">
          <FaGamepad className="text-4xl text-blue-600 dark:text-blue-400 mr-3" />
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            AI Game Recommender
          </h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Tell us about games you like and dislike, and we'll use AI to recommend new games tailored to your taste.
        </p>
      </header>

      {!process.env.NEXT_PUBLIC_GEMINI_API_KEY && (
        <div className="max-w-3xl mx-auto mb-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 rounded-md">
          <p className="font-medium">Gemini API Key Not Configured</p>
          <p className="mt-1">
            To enable game recommendations, add your Gemini API key as an environment variable: NEXT_PUBLIC_GEMINI_API_KEY.
          </p>
        </div>
      )}

      {authLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : !user ? (
        <div className="max-w-3xl mx-auto text-center py-12">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8">
            <FaSignInAlt className="mx-auto text-5xl text-blue-600 dark:text-blue-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Sign in to Get Started
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Create an account or sign in to rate games and get personalized recommendations. 
              Your game preferences will be saved and synced across all your devices.
            </p>
            <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <p>✨ Rate games you've played</p>
              <p>🎯 Get AI-powered game recommendations</p>
              <p>📱 Sync your preferences across devices</p>
              <p>🔒 Your data is secure and private</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <section className="max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Add a Game</h2>
            <AddGameForm />
          </section>

          <section className="mb-12">
            <GameLists />
          </section>

          <section className="mb-12">
            <GameRecommendations />
          </section>
        </>
      )}

      <footer className="text-center text-gray-500 dark:text-gray-400 mt-20 pb-8">
      </footer>
    </main>
  );
}
