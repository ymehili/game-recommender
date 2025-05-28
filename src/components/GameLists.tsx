import { usePreferences } from '@/contexts/PreferencesContext';
import { useAuth } from '@/contexts/AuthContext';
import GameCard from './GameCard';
import { FaStar, FaStarHalfAlt, FaHeart } from 'react-icons/fa';
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
    if (rating >= 4.5) return 'letterboxd-green';
    if (rating >= 3.5) return 'letterboxd-orange';
    if (rating >= 2.5) return 'text-blue-400';
    if (rating >= 1.5) return 'text-yellow-400';
    return 'text-red-400';
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
        <FaStar key={`empty-${i}`} className="text-muted" />
      );
    }

    return stars;
  };

  // All possible ratings in descending order
  const possibleRatings = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5];

  return (
    <div className="space-y-12">
      {user && (
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {user.username}'s Game Diary
          </h2>
          <p className="text-xl text-secondary">
            Your personal collection of rated games
          </p>
          <div className="mt-4 text-muted">
            {ratedGames.length} game{ratedGames.length !== 1 ? 's' : ''} rated
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-8 bg-letterboxd-tertiary rounded mb-4"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div key={j} className="w-40 h-56 bg-letterboxd-tertiary rounded-lg"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : ratedGames.length > 0 ? (
        // Display games grouped by rating (5 stars to 0.5 stars)
        possibleRatings.map((rating) => {
          const games = gamesByRating[rating];
          if (!games || games.length === 0) return null;

          return (
            <section key={rating} className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {renderStarsForRating(rating)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {getRatingLabel(rating)}
                  </h2>
                  <span className="text-muted">
                    {games.length} game{games.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {games.map((game) => (
                  <GameCard 
                    key={game.id} 
                    game={game} 
                    size="medium"
                  />
                ))}
              </div>
            </section>
          );
        })
      ) : (
        <div className="bg-letterboxd-card border border-letterboxd rounded-lg p-12">
          <div className="text-center">
            <FaHeart className="mx-auto text-6xl text-muted mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Start Your Game Diary</h3>
            <p className="text-xl text-secondary mb-6">
              Rate games you've played to keep track of your gaming journey
            </p>
            <p className="text-muted">
              Use the search bar above to find games and start rating them
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 