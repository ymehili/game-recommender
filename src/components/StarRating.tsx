import React from 'react';
import { FaStar } from 'react-icons/fa';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showClearButton?: boolean;
}

export default function StarRating({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = 'md',
  showClearButton = false 
}: StarRatingProps) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleClear = () => {
    if (!readonly && onRatingChange) {
      onRatingChange(0);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleStarClick(star)}
          disabled={readonly}
          className={`${sizes[size]} ${
            readonly 
              ? 'cursor-default' 
              : 'cursor-pointer hover:scale-110 transition-transform'
          } ${
            star <= rating 
              ? 'text-yellow-400' 
              : 'text-gray-300 dark:text-gray-600'
          }`}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          <FaStar />
        </button>
      ))}
      {showClearButton && rating > 0 && !readonly && (
        <button
          type="button"
          onClick={handleClear}
          className="ml-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          Clear
        </button>
      )}
      {rating > 0 && (
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {rating}/5
        </span>
      )}
    </div>
  );
} 