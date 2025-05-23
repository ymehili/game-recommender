import { useState } from 'react';
import { Game, GameRecommendation } from '@/types';
import { usePreferences } from '@/contexts/PreferencesContext';
import { FaThumbsUp, FaThumbsDown, FaTimes } from 'react-icons/fa';

interface GameCardProps {
  game: Game | GameRecommendation;
  showActions?: boolean;
  isRecommendation?: boolean;
}

export default function GameCard({ 
  game, 
  showActions = true,
  isRecommendation = false 
}: GameCardProps) {
  const { likeGame, dislikeGame, removeGameFromLists, isGameLiked, isGameDisliked } = usePreferences();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLike = () => likeGame(game);
  const handleDislike = () => dislikeGame(game);
  const handleRemove = () => removeGameFromLists(game.id);

  // Check if this game has an explanation (is a recommendation)
  const recommendation = isRecommendation ? game as GameRecommendation : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-xl">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{game.title}</h3>
          {showActions && (
            <div className="flex space-x-2">
              <button 
                onClick={handleLike}
                className={`p-2 rounded-full ${isGameLiked(game.id) 
                  ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'} 
                  hover:bg-green-200 dark:hover:bg-green-800 transition-colors`}
                aria-label="Like game"
              >
                <FaThumbsUp className="text-sm" />
              </button>
              <button 
                onClick={handleDislike}
                className={`p-2 rounded-full ${isGameDisliked(game.id)
                  ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'} 
                  hover:bg-red-200 dark:hover:bg-red-800 transition-colors`}
                aria-label="Dislike game"
              >
                <FaThumbsDown className="text-sm" />
              </button>
              <button 
                onClick={handleRemove}
                className="p-2 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 
                  hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Remove game"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
          )}
        </div>
        
        {recommendation && recommendation.matchScore && (
          <div className="mt-2 flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs font-medium text-blue-800 dark:text-blue-200">
              Match: {recommendation.matchScore}%
            </div>
          </div>
        )}
        
        {recommendation && recommendation.explanation && (
          <div className="mt-3">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
            >
              {isExpanded ? "Hide explanation" : "Why this recommendation?"}
            </button>
            
            {isExpanded && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                {recommendation.explanation}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 