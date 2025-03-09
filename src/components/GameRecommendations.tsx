import { useState, useEffect } from 'react';
import { GameRecommendation, RecommendationResponse } from '@/types';
import { usePreferences } from '@/contexts/PreferencesContext';
import GameCard from './GameCard';
import { FaSync } from 'react-icons/fa';

export default function GameRecommendations() {
  const { preferences } = usePreferences();
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecommendations = async () => {
    // Don't fetch if there are no preferences yet
    if (preferences.likedGames.length === 0 && preferences.dislikedGames.length === 0) {
      setRecommendations([]);
      setError('Add some games to your lists to get recommendations');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          likedGames: preferences.likedGames,
          dislikedGames: preferences.dislikedGames,
          count: 5
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API error response:', data);
        throw new Error(`Error fetching recommendations: ${response.status}${data.error ? ` - ${data.error}` : ''}`);
      }
      
      if (data.error) {
        setError(data.error);
        return;
      }

      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch recommendations whenever preferences change
  useEffect(() => {
    fetchRecommendations();
  }, [preferences.likedGames.length, preferences.dislikedGames.length]);

  // Check if we have no games in either list
  const hasNoGames = preferences.likedGames.length === 0 && preferences.dislikedGames.length === 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recommended Games</h2>
        <button
          onClick={fetchRecommendations}
          disabled={isLoading || hasNoGames}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaSync className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error ? (
        <div className="p-4 mb-4 text-sm text-amber-800 bg-amber-100 rounded-lg dark:bg-amber-900 dark:text-amber-100">
          {error}
        </div>
      ) : isLoading ? (
        <div className="p-8 flex justify-center">
          <div className="animate-pulse text-center">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto mb-2"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded max-w-md w-full mx-auto"></div>
          </div>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((game) => (
            <GameCard key={game.id} game={game} isRecommendation={true} />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 text-gray-500 dark:text-gray-400">
          {hasNoGames 
            ? 'Add games to your "Liked" and "Disliked" lists to get recommendations' 
            : 'No recommendations found. Try refreshing or adding more games to your lists.'}
        </div>
      )}
    </div>
  );
} 