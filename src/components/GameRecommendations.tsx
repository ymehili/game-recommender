import { useState, useEffect } from 'react';
import { GameRecommendation, RecommendationResponse } from '@/types';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useAuth } from '@/contexts/AuthContext';
import GameCard from './GameCard';
import { FaSync, FaRobot, FaMagic } from 'react-icons/fa';
import { getGameIdByTitle } from '@/utils/igdbApi';

export default function GameRecommendations() {
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecommendations = async () => {
    // Don't fetch if there are no rated games yet
    if (preferences.ratedGames.length === 0) {
      setRecommendations([]);
      setError('Add some rated games to get recommendations');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, get recommendations from Gemini API
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ratedGames: preferences.ratedGames,
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

      const geminiRecommendations = data.recommendations || [];
      
      // Now look up IGDB IDs for each recommended game
      const recommendationsWithIds = await Promise.all(
        geminiRecommendations.map(async (rec: GameRecommendation, index: number) => {
          try {
            const igdbId = await getGameIdByTitle(rec.title);
            return {
              ...rec,
              id: igdbId ? igdbId.toString() : `temp-${index}-${rec.title.replace(/\s+/g, '-').toLowerCase()}`
            };
          } catch (error) {
            console.error(`Failed to get IGDB ID for ${rec.title}:`, error);
            return {
              ...rec,
              id: `temp-${index}-${rec.title.replace(/\s+/g, '-').toLowerCase()}`
            };
          }
        })
      );

      setRecommendations(recommendationsWithIds);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch recommendations whenever rated games change
  useEffect(() => {
    if (user && preferences.ratedGames.length > 0) {
      fetchRecommendations();
    }
  }, [user, preferences.ratedGames.length]);

  // Check if we have no rated games
  const hasNoGames = preferences.ratedGames.length === 0;

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
            <FaRobot className="letterboxd-green" />
            <span>AI Recommendations</span>
          </h2>
          {user && (
            <p className="text-xl text-secondary mt-2">
              Curated for {user.username} based on your ratings
            </p>
          )}
        </div>
        <button
          onClick={fetchRecommendations}
          disabled={isLoading || hasNoGames || !user}
          className="flex items-center space-x-2 px-6 py-3 bg-letterboxd-green text-white rounded-lg 
            hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 
            focus:ring-offset-letterboxd transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <FaSync className={isLoading ? 'animate-spin' : ''} />
          <span>Get Fresh Picks</span>
        </button>
      </div>

      {!user ? (
        <div className="bg-letterboxd-card border border-letterboxd rounded-lg p-12">
          <div className="text-center">
            <FaMagic className="mx-auto text-6xl text-muted mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">AI-Powered Recommendations</h3>
            <p className="text-xl text-secondary">
              Sign in to get personalized game recommendations based on your ratings and taste
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-letterboxd-card border border-letterboxd rounded-lg p-6">
          <div className="text-center">
            <p className="text-letterboxd-orange font-medium">{error}</p>
            {hasNoGames && (
              <p className="text-muted mt-2">
                Rate at least a few games to get started with recommendations
              </p>
            )}
          </div>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          <div className="text-center text-muted mb-6">
            <FaRobot className="mx-auto text-3xl mb-2 animate-pulse letterboxd-green" />
            <p>AI is analyzing your taste and finding game details...</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="w-40 h-56 bg-letterboxd-tertiary rounded-lg"></div>
                <div className="mt-3 space-y-2">
                  <div className="h-4 bg-letterboxd-tertiary rounded w-3/4"></div>
                  <div className="h-3 bg-letterboxd-tertiary rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {recommendations.map((game) => (
            <GameCard 
              key={game.id} 
              game={game} 
              isRecommendation={true} 
              showActions={false}
              size="medium"
            />
          ))}
        </div>
      ) : (
        <div className="bg-letterboxd-card border border-letterboxd rounded-lg p-12">
          <div className="text-center">
            <FaMagic className="mx-auto text-6xl text-muted mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">
              {hasNoGames ? 'Start Your Journey' : 'No Recommendations Yet'}
            </h3>
            <p className="text-xl text-secondary">
              {hasNoGames 
                ? 'Rate some games to unlock AI-powered recommendations tailored to your taste' 
                : 'Try refreshing or adding more game ratings to improve recommendations'}
            </p>
          </div>
        </div>
      )}
    </section>
  );
} 