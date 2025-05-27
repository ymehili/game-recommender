import { useState, useEffect } from 'react';
import { Game, GameRecommendation } from '@/types';
import { usePreferences } from '@/contexts/PreferencesContext';
import { FaTimes } from 'react-icons/fa';
import { getGameCover } from '@/utils/igdbApi';
import Image from 'next/image';
import StarRating from './StarRating';

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
  const { rateGame, removeGameFromLists, getGameRating } = usePreferences();
  const [isExpanded, setIsExpanded] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(game.coverImage || null);
  const [isLoadingCover, setIsLoadingCover] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);

  // Load the current rating for this game
  useEffect(() => {
    const rating = getGameRating(game.id);
    setCurrentRating(rating);
  }, [game.id, getGameRating]);

  const handleRatingChange = (rating: number) => {
    rateGame(game, rating);
    setCurrentRating(rating);
  };

  const handleRemove = () => removeGameFromLists(game.id);

  // Check if this game has an explanation (is a recommendation)
  const recommendation = isRecommendation ? game as GameRecommendation : null;

  // Fetch cover image if not already available
  useEffect(() => {
    const fetchCover = async () => {
      // Skip fetching if we already have a cover image
      if (game.coverImage) {
        setCoverImage(game.coverImage);
        return;
      }

      setIsLoadingCover(true);
      try {
        const imageUrl = await getGameCover(game.title);
        setCoverImage(imageUrl);
        
        // If this is a rated game, we could potentially update it with the cover
        // but we'll leave that for another feature as it would require modifying the preferences context
      } catch (error) {
        console.error('Error fetching cover for game:', game.title, error);
      } finally {
        setIsLoadingCover(false);
      }
    };

    fetchCover();
  }, [game.title, game.coverImage]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-xl">
      <div className="flex flex-row">
        {/* Game cover image */}
        <div className="relative w-24 h-32 flex-shrink-0">
          {isLoadingCover ? (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : coverImage ? (
            <Image 
              src={coverImage} 
              alt={`Cover for ${game.title}`}
              fill
              sizes="(max-width: 768px) 96px, 96px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center p-1">No cover</span>
            </div>
          )}
        </div>

        {/* Game details */}
        <div className="p-4 flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{game.title}</h3>
            {showActions && (
              <div className="flex items-center space-x-2">
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
          
          {/* Star Rating */}
          {showActions && (
            <div className="mt-2">
              <StarRating 
                rating={currentRating}
                onRatingChange={handleRatingChange}
                showClearButton={true}
                size="sm"
              />
            </div>
          )}
          
          {/* Recommendation details */}
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
    </div>
  );
} 