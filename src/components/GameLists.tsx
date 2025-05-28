import { usePreferences } from '@/contexts/PreferencesContext';
import { useAuth } from '@/contexts/AuthContext';
import GameCard from './GameCard';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { RatedGame } from '@/types';

export default function GameLists() {
  const { user } = useAuth();
  const { preferences, isLoading } = usePreferences();
  const { ratedGames } = preferences;

  // Group games by rating
  const gamesByRating = ratedGames.reduce((acc, game) => {
    if (!acc[game.rating]) {
      acc[game.rating] = [];
    }
    acc[game.rating].push(game);
    return acc;
  }, {} as Record<number, RatedGame[]>);

  // Sort games within each rating by date (most recent first)
  Object.keys(gamesByRating).forEach(rating => {
    gamesByRating[parseFloat(rating)].sort((a, b) => {
      const dateA = a.dateRated ? new Date(a.dateRated).getTime() : 0;
      const dateB = b.dateRated ? new Date(b.dateRated).getTime() : 0;
      return dateB - dateA;
    });
  });

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 5: return 'Loved These Games';
      case 4.5: return 'Almost Loved These Games';
      case 4: return 'Really Liked These Games';
      case 3.5: return 'Liked These Games';
      case 3: return 'Enjoyed These Games';
      case 2.5: return 'Mixed Feelings About These Games';
      case 2: return 'Didn\'t Love These Games';
      case 1.5: return 'Didn\'t Really Like These Games';
      case 1: return 'Disliked These Games';
      case 0.5: return 'Really Disliked These Games';
      default: return `${rating} Star Games`;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-yellow-500';
    if (rating >= 3.5) return 'text-green-500';
    if (rating >= 2.5) return 'text-blue-500';
    if (rating >= 1.5) return 'text-orange-500';
    return 'text-red-500';
  };

  const renderStarsForRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar key={`full-${i}`} className={`${getRatingColor(rating)}`} />
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <FaStarHalfAlt key="half" className={`${getRatingColor(rating)}`} />
      );
    }

    // Add empty stars to reach 5 total
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaStar key={`empty-${i}`} className="text-gray-300 dark:text-gray-600" />
      );
    }

    return stars;
  };

  // All possible ratings in descending order
  const possibleRatings = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5];

  return (
    <div className="space-y-8">
      {user && (
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {user.username}'s Game Library
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your personal collection of rated games
          </p>
        </div>
      )}
      
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ) : ratedGames.length > 0 ? (
        // Display games grouped by rating (5 stars to 0.5 stars)
        possibleRatings.map((rating) => {
          const games = gamesByRating[rating];
          if (!games || games.length === 0) return null;

          return (
            <div key={rating} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="flex items-center space-x-1 mr-3">
                  {renderStarsForRating(rating)}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getRatingLabel(rating)}
                </h2>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  ({games.length} game{games.length !== 1 ? 's' : ''})
                </span>
              </div>
              
              <div className="space-y-4">
                {games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-center p-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <FaStar className="mx-auto text-4xl mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium mb-2">No rated games yet</h3>
            <p>Start by rating some games you've played!</p>
          </div>
        </div>
      )}
    </div>
  );
} 