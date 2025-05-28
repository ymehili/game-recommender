import { useState, useEffect } from 'react';
import { Game, GameRecommendation } from '@/types';
import { usePreferences } from '@/contexts/PreferencesContext';
import { FaTimes } from 'react-icons/fa';
import { getGameCover } from '@/utils/igdbApi';
import Image from 'next/image';
import StarRating from './StarRating';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const { rateGame, removeGameFromLists, getGameRating } = usePreferences();
  const [isExpanded, setIsExpanded] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(game.coverImage || null);
  const [isLoadingCover, setIsLoadingCover] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  const [isRemoveLoading, setIsRemoveLoading] = useState(false);

  // Load the current rating for this game
  useEffect(() => {
    const rating = getGameRating(game.id);
    setCurrentRating(rating);
  }, [game.id, getGameRating]);

  const handleRatingChange = async (rating: number) => {
    setIsRatingLoading(true);
    try {
      await rateGame(game, rating);
      setCurrentRating(rating);
    } catch (error) {
      console.error('Error rating game:', error);
      // Revert to previous rating on error
      const previousRating = getGameRating(game.id);
      setCurrentRating(previousRating);
    } finally {
      setIsRatingLoading(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoveLoading(true);
    try {
      await removeGameFromLists(game.id);
    } catch (error) {
      console.error('Error removing game:', error);
    } finally {
      setIsRemoveLoading(false);
    }
  };

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

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if the user clicked on an interactive element
    const target = e.target as HTMLElement;
    const isInteractiveElement = target.closest('button') || 
                                target.closest('[role="button"]') || 
                                target.closest('input') ||
                                target.closest('.star-rating') ||
                                target.tagName === 'BUTTON';
    
    if (!isInteractiveElement) {
      router.push(`/game/${game.id}`);
    }
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-xl cursor-pointer"
      onClick={handleCardClick}
    >
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
                  disabled={isRemoveLoading}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 
                    hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Remove game"
                >
                  {isRemoveLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  ) : (
                    <FaTimes className="text-sm" />
                  )}
                </button>
              </div>
            )}
          </div>
          
          {/* Star Rating */}
          {showActions && (
            <div className="mt-2 star-rating">
              <StarRating 
                rating={currentRating}
                onRatingChange={handleRatingChange}
                showClearButton={true}
                size="sm"
                disabled={isRatingLoading}
              />
              {isRatingLoading && (
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Updating rating...
                </div>
              )}
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