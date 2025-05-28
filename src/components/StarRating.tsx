import React from 'react';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showClearButton?: boolean;
  allowHalfStars?: boolean;
}

export default function StarRating({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  disabled = false,
  size = 'md',
  showClearButton = false,
  allowHalfStars = true
}: StarRatingProps) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const isInteractive = !readonly && !disabled;

  const handleStarClick = (starIndex: number, isHalfClick: boolean = false) => {
    if (isInteractive && onRatingChange) {
      const newRating = allowHalfStars && isHalfClick ? starIndex - 0.5 : starIndex;
      onRatingChange(newRating);
    }
  };

  const handleStarMouseEvent = (event: React.MouseEvent, starIndex: number) => {
    if (!allowHalfStars) {
      handleStarClick(starIndex);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const isLeftHalf = clickX < rect.width / 2;
    
    handleStarClick(starIndex, isLeftHalf);
  };

  const handleClear = () => {
    if (isInteractive && onRatingChange) {
      onRatingChange(0);
    }
  };

  const renderStar = (starIndex: number) => {
    const isFullStar = rating >= starIndex;
    const isHalfStar = rating >= starIndex - 0.5 && rating < starIndex;
    const isEmpty = rating < starIndex - 0.5;

    let starIcon;
    let starColor;

    if (isFullStar) {
      starIcon = <FaStar />;
      starColor = 'text-yellow-400';
    } else if (isHalfStar) {
      starIcon = <FaStarHalfAlt />;
      starColor = 'text-yellow-400';
    } else {
      starIcon = <FaStar />;
      starColor = 'text-gray-300 dark:text-gray-600';
    }

    return (
      <button
        key={starIndex}
        type="button"
        onClick={(e) => handleStarMouseEvent(e, starIndex)}
        disabled={readonly || disabled}
        className={`relative ${sizes[size]} ${
          !isInteractive
            ? 'cursor-default opacity-50' 
            : 'cursor-pointer hover:scale-110 transition-transform'
        } ${starColor}`}
        aria-label={`${starIndex} star${starIndex !== 1 ? 's' : ''}`}
      >
        {starIcon}
        {/* Invisible overlay for half-star click detection */}
        {allowHalfStars && isInteractive && (
          <div className="absolute inset-0 flex">
            <div 
              className="w-1/2 h-full"
              onClick={(e) => {
                e.stopPropagation();
                handleStarClick(starIndex, true);
              }}
            />
            <div 
              className="w-1/2 h-full"
              onClick={(e) => {
                e.stopPropagation();
                handleStarClick(starIndex, false);
              }}
            />
          </div>
        )}
      </button>
    );
  };

  const formatRating = (rating: number) => {
    if (rating === 0) return '0/5';
    if (rating % 1 === 0) return `${rating}/5`;
    return `${rating}/5`;
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => renderStar(star))}
      {showClearButton && rating > 0 && isInteractive && (
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
          {formatRating(rating)}
        </span>
      )}
    </div>
  );
} 