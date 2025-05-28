import { useState, useEffect } from 'react';
import { Game, GameRecommendation } from '@/types';
import { usePreferences } from '@/contexts/PreferencesContext';
import { FaTimes, FaEye, FaHeart } from 'react-icons/fa';
import { getGameCover } from '@/utils/igdbApi';
import Image from 'next/image';
import StarRating from './StarRating';
import { useRouter } from 'next/navigation';

interface GameCardProps {
  game: Game | GameRecommendation;
  showActions?: boolean;
  isRecommendation?: boolean;
  size?: 'small' | 'medium' | 'large';
  enableQuickRating?: boolean;
}

export default function GameCard({ 
  game, 
  showActions = true,
  isRecommendation = false,
  size = 'medium',
  enableQuickRating = false
}: GameCardProps) {
  const router = useRouter();
  const { rateGame, removeGameFromLists, getGameRating } = usePreferences();
  const [isExpanded, setIsExpanded] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(game.coverImage || null);
  const [isLoadingCover, setIsLoadingCover] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  const [isRemoveLoading, setIsRemoveLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: { width: 'w-full', height: 'aspect-[2/3]', textSize: 'text-xs' },
    medium: { width: 'w-40', height: 'h-56', textSize: 'text-base' },
    large: { width: 'w-48', height: 'h-64', textSize: 'text-lg' }
  };

  const config = sizeConfig[size];

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

  const recommendation = isRecommendation ? game as GameRecommendation : null;

  // Fetch cover image if not already available
  useEffect(() => {
    const fetchCover = async () => {
      if (game.coverImage) {
        setCoverImage(game.coverImage);
        return;
      }

      setIsLoadingCover(true);
      try {
        const imageUrl = await getGameCover(game.title);
        setCoverImage(imageUrl);
      } catch (error) {
        console.error('Error fetching cover for game:', game.title, error);
      } finally {
        setIsLoadingCover(false);
      }
    };

    fetchCover();
  }, [game.title, game.coverImage]);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractiveElement = target.closest('button') || 
                                target.closest('[role="button"]') || 
                                target.closest('input') ||
                                target.closest('.star-rating') ||
                                target.tagName === 'BUTTON';
    
    if (!isInteractiveElement) {
      const numericId = parseInt(game.id);
      if (!isNaN(numericId)) {
        router.push(`/game/${game.id}`);
      }
    }
  };

  const isClickable = !isNaN(parseInt(game.id));

  return (
    <div 
      className={`relative group ${config.width} overflow-visible`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Game Poster */}
      <div 
        className={`${config.height} relative rounded-lg overflow-hidden shadow-lg transition-all duration-300 ${
          isClickable ? 'cursor-pointer hover:scale-105 hover:shadow-xl' : ''
        } bg-letterboxd-card border border-letterboxd`}
        onClick={handleCardClick}
        title={isClickable ? `View details for ${game.title}` : game.title}
      >
        {isLoadingCover ? (
          <div className="w-full h-full bg-letterboxd-tertiary animate-pulse flex items-center justify-center">
            <div className="text-muted text-xs">Loading...</div>
          </div>
        ) : coverImage ? (
          <Image 
            src={coverImage} 
            alt={`Cover for ${game.title}`}
            fill
            sizes={size === 'small' ? '160px' : size === 'medium' ? '200px' : '240px'}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-letterboxd-tertiary flex items-center justify-center">
            <div className="text-muted text-xs text-center p-2">
              <FaEye className="mx-auto mb-2" />
              No Cover
            </div>
          </div>
        )}

        {/* Rating Badge - only show for small size on hover */}
        {size === 'small' && enableQuickRating && isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-85 flex flex-col items-center justify-center transition-all duration-300 backdrop-blur-sm">
            <div className="text-white text-xs mb-3 font-medium text-center px-2">
              {currentRating > 0 ? 'Update rating' : 'Rate this game'}
            </div>
            <div className="star-rating flex items-center" onClick={(e) => e.stopPropagation()}>
              <StarRating 
                rating={currentRating}
                onRatingChange={handleRatingChange}
                showClearButton={false}
                size="sm"
                disabled={isRatingLoading}
                allowHalfStars={true}
              />
            </div>
            {isRatingLoading && (
              <div className="text-white text-xs mt-2 animate-pulse">Updating...</div>
            )}
            <div className="text-white text-xs mt-2 opacity-75">Click to view details</div>
          </div>
        )}

        {/* Simple rating display for small cards without quick rating */}
        {size === 'small' && !enableQuickRating && currentRating > 0 && isHovered && !isRecommendation && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center transition-opacity duration-300">
            <div className="text-white text-lg font-bold">
              {currentRating}★
            </div>
          </div>
        )}

        {/* Match score display for small recommendation cards on hover */}
        {size === 'small' && isRecommendation && recommendation && recommendation.matchScore && isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-85 flex flex-col items-center justify-center transition-opacity duration-300">
            <div className="text-letterboxd-orange text-lg font-bold mb-1">
              {recommendation.matchScore}%
            </div>
            <div className="text-white text-xs">Match Score</div>
            {recommendation.explanation && (
              <div className="text-white text-xs mt-2 opacity-75 text-center px-2">
                Click to see why
              </div>
            )}
          </div>
        )}

        {/* Rating Badge for medium/large */}
        {size !== 'small' && currentRating > 0 && !isRecommendation && (
          <div className="absolute top-2 right-2 bg-letterboxd-green text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
            {currentRating}★
          </div>
        )}

        {/* Match Score for Recommendations */}
        {recommendation && recommendation.matchScore && size !== 'small' && (
          <div className="absolute top-2 left-2 bg-letterboxd-orange text-white text-xs font-bold px-2 py-1 rounded shadow-lg z-10">
            {recommendation.matchScore}%
          </div>
        )}

        {/* Remove Button */}
        {showActions && size !== 'small' && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            disabled={isRemoveLoading}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-lg"
            aria-label="Remove game"
          >
            {isRemoveLoading ? (
              <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
            ) : (
              <FaTimes className="text-xs" />
            )}
          </button>
        )}

        {/* Small rating indicator for small cards */}
        {size === 'small' && currentRating > 0 && !isRecommendation && (
          <div className="absolute top-1 right-1 w-6 h-6 bg-letterboxd-green rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg z-10">
            {currentRating}
          </div>
        )}

        {/* Small match score indicator for small recommendation cards */}
        {size === 'small' && isRecommendation && recommendation && recommendation.matchScore && (
          <div className="absolute top-1 right-1 min-w-[28px] h-5 bg-letterboxd-orange rounded flex items-center justify-center text-white text-xs font-bold shadow-lg z-10 px-1">
            {recommendation.matchScore}%
          </div>
        )}
      </div>

      {/* Game Title and actions - only show for medium/large sizes */}
      {size !== 'small' && (
        <div className="mt-3 px-1">
          <h3 className={`${config.textSize} font-semibold text-white line-clamp-2 leading-tight`}>
            {game.title}
          </h3>
          
          {/* Star Rating */}
          {showActions && (
            <div className="mt-2 star-rating">
              <StarRating 
                rating={currentRating}
                onRatingChange={handleRatingChange}
                showClearButton={false}
                size="sm"
                disabled={isRatingLoading}
              />
              {isRatingLoading && (
                <div className="mt-1 text-xs text-muted">
                  Updating...
                </div>
              )}
            </div>
          )}

          {/* Recommendation Explanation */}
          {recommendation && recommendation.explanation && (
            <div className="mt-3">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs letterboxd-green hover:underline focus:outline-none font-medium"
              >
                {isExpanded ? "Hide" : "Why recommended?"}
              </button>
              
              {isExpanded && (
                <p className="mt-2 text-xs text-secondary bg-letterboxd-tertiary p-3 rounded-lg leading-relaxed border border-letterboxd">
                  {recommendation.explanation}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 