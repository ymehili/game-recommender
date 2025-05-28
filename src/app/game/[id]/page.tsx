/**
 * Individual Game Page Component
 * 
 * This page displays detailed information about a specific game using server-side caching.
 * - Game data is cached on the server (Vercel KV) for 24 hours
 * - All users share the same cached game data from IGDB API
 * - Only user-specific data (ratings, notes) are personalized
 * - Reduces API calls and improves performance significantly
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IGDBGame, getGameFromServer } from '@/utils/igdbApi';
import { getAuthHeaders } from '@/utils/cookies';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import StarRating from '@/components/StarRating';
import Image from 'next/image';
import { FaArrowLeft, FaCalendar, FaGamepad, FaTags, FaStickyNote } from 'react-icons/fa';

interface GameNote {
  id: string;
  gameId: string;
  userId: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { getGameRating, rateGame } = usePreferences();
  
  const gameId = params.id as string;
  const [game, setGame] = useState<IGDBGame | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  const [userNote, setUserNote] = useState('');
  const [isNoteSaving, setIsNoteSaving] = useState(false);
  const [noteId, setNoteId] = useState<string | null>(null);

  // Load game data from server-side cache
  useEffect(() => {
    const loadGameData = async () => {
      if (!gameId) return;

      setIsLoading(true);
      setError(null);

      try {
        const gameData = await getGameFromServer(parseInt(gameId));
        if (gameData) {
          setGame(gameData);
        } else {
          setError('Game not found');
        }
      } catch (err) {
        console.error('Error loading game:', err);
        setError('Failed to load game data');
      } finally {
        setIsLoading(false);
      }
    };

    loadGameData();
  }, [gameId]);

  // Load user rating and note
  useEffect(() => {
    if (game && user) {
      // Load rating
      const rating = getGameRating(gameId);
      setCurrentRating(rating);

      // Load user note
      loadUserNote();
    }
  }, [game, user, gameId, getGameRating]);

  const loadUserNote = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/user/notes?gameId=${gameId}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.note) {
          setUserNote(data.note.note);
          setNoteId(data.note.id);
        }
      }
    } catch (error) {
      console.error('Error loading user note:', error);
    }
  };

  const handleRatingChange = async (rating: number) => {
    if (!game || !user) return;

    setIsRatingLoading(true);
    try {
      const gameObject = {
        id: gameId,
        title: game.name,
        coverImage: game.cover?.url ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : undefined,
      };

      await rateGame(gameObject, rating);
      setCurrentRating(rating);
    } catch (error) {
      console.error('Error rating game:', error);
    } finally {
      setIsRatingLoading(false);
    }
  };

  const handleNoteSave = async () => {
    if (!user) return;

    setIsNoteSaving(true);
    try {
      const method = noteId ? 'PUT' : 'POST';
      const url = noteId ? `/api/user/notes/${noteId}` : '/api/user/notes';
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          gameId,
          note: userNote,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNoteId(data.note.id);
        }
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsNoteSaving(false);
    }
  };

  const formatReleaseDate = (timestamp?: number): string => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).getFullYear().toString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline mb-8"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {error || 'Game not found'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              The game you're looking for could not be loaded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline mb-8"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game cover */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg">
                {game.cover?.url ? (
                  <Image
                    src={`https:${game.cover.url.replace('t_thumb', 't_cover_big')}`}
                    alt={`Cover for ${game.name}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <FaGamepad className="text-6xl text-gray-400" />
                  </div>
                )}
              </div>

              {/* Rating section */}
              {user && (
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Your Rating
                  </h3>
                  <StarRating
                    rating={currentRating}
                    onRatingChange={handleRatingChange}
                    showClearButton={true}
                    size="lg"
                    disabled={isRatingLoading}
                  />
                  {isRatingLoading && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Updating rating...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Game details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and basic info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {game.name}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {game.first_release_date && (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <FaCalendar />
                    <span>Released: {formatReleaseDate(game.first_release_date)}</span>
                  </div>
                )}

                {game.platforms && game.platforms.length > 0 && (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <FaGamepad />
                    <span>{game.platforms.length} platform{game.platforms.length !== 1 ? 's' : ''}</span>
                  </div>
                )}

                {game.genres && game.genres.length > 0 && (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <FaTags />
                    <span>{game.genres.length} genre{game.genres.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            {game.summary && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  About This Game
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {game.summary}
                </p>
              </div>
            )}

            {/* Platforms */}
            {game.platforms && game.platforms.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Platforms
                </h2>
                <div className="flex flex-wrap gap-2">
                  {game.platforms.map((platform) => (
                    <span
                      key={platform.id}
                      className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                    >
                      {platform.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Genres */}
            {game.genres && game.genres.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Genres
                </h2>
                <div className="flex flex-wrap gap-2">
                  {game.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* User notes */}
            {user && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FaStickyNote className="text-yellow-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Your Notes
                  </h2>
                </div>
                <textarea
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="Add your thoughts about this game..."
                  className="w-full h-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                />
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleNoteSave}
                    disabled={isNoteSaving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isNoteSaving ? 'Saving...' : 'Save Note'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 