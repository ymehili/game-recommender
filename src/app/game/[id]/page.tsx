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
import { FaArrowLeft, FaCalendar, FaGamepad, FaTags, FaStickyNote, FaEye } from 'react-icons/fa';

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
        // Check if gameId is numeric (valid IGDB ID)
        const numericGameId = parseInt(gameId);
        if (isNaN(numericGameId)) {
          setError('This game is not available for detailed viewing. It may be from a recommendation that could not be matched to our game database.');
          return;
        }

        const gameData = await getGameFromServer(numericGameId);
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
      <div className="min-h-screen bg-letterboxd">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-letterboxd-tertiary rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="h-96 bg-letterboxd-tertiary rounded-lg"></div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="h-12 bg-letterboxd-tertiary rounded"></div>
                <div className="h-32 bg-letterboxd-tertiary rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-letterboxd">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 letterboxd-green hover:text-green-400 mb-8 transition-colors duration-200"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-white mb-4">
              {error || 'Game not found'}
            </h1>
            <p className="text-muted">
              The game you're looking for could not be loaded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-letterboxd">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 letterboxd-green hover:text-green-400 mb-8 transition-colors duration-200"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game cover */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg border border-letterboxd">
                {game.cover?.url ? (
                  <Image
                    src={`https:${game.cover.url.replace('t_thumb', 't_cover_big')}`}
                    alt={`Cover for ${game.name}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-letterboxd-tertiary flex items-center justify-center">
                    <FaEye className="text-6xl text-muted" />
                  </div>
                )}
              </div>

              {/* Rating section */}
              {user && (
                <div className="mt-6 bg-letterboxd-card rounded-lg shadow-lg p-6 border border-letterboxd">
                  <h3 className="text-lg font-semibold text-white mb-4">
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
                    <p className="text-sm text-muted mt-2">
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
            <div className="bg-letterboxd-card rounded-lg shadow-lg p-6 border border-letterboxd">
              <h1 className="text-4xl font-bold text-white mb-4">
                {game.name}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {game.first_release_date && (
                  <div className="flex items-center space-x-2 text-muted">
                    <FaCalendar />
                    <span>Released: {formatReleaseDate(game.first_release_date)}</span>
                  </div>
                )}

                {game.platforms && game.platforms.length > 0 && (
                  <div className="flex items-center space-x-2 text-muted">
                    <FaGamepad />
                    <span>{game.platforms.length} platform{game.platforms.length !== 1 ? 's' : ''}</span>
                  </div>
                )}

                {game.genres && game.genres.length > 0 && (
                  <div className="flex items-center space-x-2 text-muted">
                    <FaTags />
                    <span>{game.genres.length} genre{game.genres.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            {game.summary && (
              <div className="bg-letterboxd-card rounded-lg shadow-lg p-6 border border-letterboxd">
                <h2 className="text-2xl font-bold text-white mb-4">
                  About This Game
                </h2>
                <p className="text-secondary leading-relaxed">
                  {game.summary}
                </p>
              </div>
            )}

            {/* Platforms */}
            {game.platforms && game.platforms.length > 0 && (
              <div className="bg-letterboxd-card rounded-lg shadow-lg p-6 border border-letterboxd">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Platforms
                </h2>
                <div className="flex flex-wrap gap-2">
                  {game.platforms.map((platform) => (
                    <span
                      key={platform.id}
                      className="bg-letterboxd-green/20 text-letterboxd-green px-3 py-1 rounded-full text-sm border border-letterboxd-green/30"
                    >
                      {platform.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Genres */}
            {game.genres && game.genres.length > 0 && (
              <div className="bg-letterboxd-card rounded-lg shadow-lg p-6 border border-letterboxd">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Genres
                </h2>
                <div className="flex flex-wrap gap-2">
                  {game.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="bg-letterboxd-orange/20 text-letterboxd-orange px-3 py-1 rounded-full text-sm border border-letterboxd-orange/30"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* User notes */}
            {user && (
              <div className="bg-letterboxd-card rounded-lg shadow-lg p-6 border border-letterboxd">
                <div className="flex items-center space-x-2 mb-4">
                  <FaStickyNote className="text-letterboxd-orange" />
                  <h2 className="text-2xl font-bold text-white">
                    Your Notes
                  </h2>
                </div>
                <textarea
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="Add your thoughts about this game..."
                  className="w-full h-32 px-4 py-3 border border-letterboxd rounded-lg 
                    focus:ring-2 focus:ring-letterboxd-green focus:border-letterboxd-green 
                    bg-letterboxd-tertiary text-white placeholder-text-muted resize-none transition-all duration-200"
                />
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleNoteSave}
                    disabled={isNoteSaving}
                    className="px-6 py-2 bg-letterboxd-green text-white rounded-lg hover:bg-green-600 
                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                  >
                    {isNoteSaving ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      'Save Note'
                    )}
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