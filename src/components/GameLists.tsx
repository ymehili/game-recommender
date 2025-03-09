import { usePreferences } from '@/contexts/PreferencesContext';
import GameCard from './GameCard';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

export default function GameLists() {
  const { preferences, isLoading } = usePreferences();
  const { likedGames, dislikedGames } = preferences;

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* Liked Games List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <FaThumbsUp className="text-green-600 dark:text-green-400 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Games I Liked</h2>
        </div>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ) : likedGames.length > 0 ? (
          <div className="space-y-4">
            {likedGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            No liked games yet. Add games you enjoy!
          </div>
        )}
      </div>

      {/* Disliked Games List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <FaThumbsDown className="text-red-600 dark:text-red-400 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Games I Disliked</h2>
        </div>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ) : dislikedGames.length > 0 ? (
          <div className="space-y-4">
            {dislikedGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            No disliked games yet. Add games you didn't enjoy!
          </div>
        )}
      </div>
    </div>
  );
} 