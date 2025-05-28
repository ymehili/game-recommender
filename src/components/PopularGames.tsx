'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaStar, FaCalendarAlt, FaGamepad, FaFire } from 'react-icons/fa';
import Link from 'next/link';

interface Game {
  id: number;
  name: string;
  slug: string;
  cover?: {
    url: string;
  };
  first_release_date?: number;
  summary?: string;
  platforms?: Array<{ name: string }>;
  genres?: Array<{ name: string }>;
  rating?: number;
  rating_count?: number;
  total_rating?: number;
}

export default function PopularGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchPopularGames = useCallback(async (currentOffset: number, append: boolean = false) => {
    try {
      if (currentOffset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch('/api/igdb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'popular',
          limit: 20,
          offset: currentOffset
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch popular games');
      }

      const result = await response.json();
      const newGames = result.data || [];
      
      if (append) {
        setGames(prevGames => [...prevGames, ...newGames]);
      } else {
        setGames(newGames);
      }
      
      setHasMore(result.hasMore !== false && newGames.length > 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const newOffset = offset + 20;
      setOffset(newOffset);
      fetchPopularGames(newOffset, true);
    }
  }, [offset, loadingMore, hasMore, fetchPopularGames]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 1000 && // Load when 1000px from bottom
        !loadingMore && 
        hasMore
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, loadingMore, hasMore]);

  // Initial load
  useEffect(() => {
    fetchPopularGames(0);
  }, [fetchPopularGames]);

  const formatReleaseDate = (timestamp?: number) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const getCoverUrl = (coverUrl?: string) => {
    if (!coverUrl) return '/placeholder-game.svg';
    return `https:${coverUrl.replace('t_thumb', 't_cover_big')}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <FaFire className="text-orange-500" />
            <span>Most Popular Games</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="aspect-[3/4] bg-letterboxd-tertiary rounded-lg animate-pulse" />
              <div className="h-4 bg-letterboxd-tertiary rounded animate-pulse" />
              <div className="h-3 bg-letterboxd-tertiary rounded animate-pulse w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && games.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <FaFire className="text-orange-500" />
            <span>Most Popular Games</span>
          </h2>
        </div>
        <div className="bg-letterboxd-card border border-letterboxd rounded-lg p-8 text-center">
          <FaGamepad className="mx-auto text-4xl text-muted mb-4" />
          <p className="text-white font-medium mb-2">Unable to load popular games</p>
          <p className="text-muted text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <FaFire className="text-orange-500" />
          <span>Most Popular Games</span>
        </h2>
        <div className="text-muted text-sm">
          Based on community activity and visits
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {games.map((game, index) => (
          <Link
            key={`${game.id}-${index}`}
            href={`/game/${game.id}`}
            className="group space-y-2"
          >
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-letterboxd-tertiary border border-letterboxd group-hover:border-letterboxd-green transition-colors">
              <img
                src={getCoverUrl(game.cover?.url)}
                alt={game.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-game.svg';
                }}
              />
              
              {game.total_rating && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                  <FaStar className="text-yellow-400" />
                  <span>{Math.round(game.total_rating)}</span>
                </div>
              )}
              
              {/* Show popularity rank for top 10 */}
              {index < 10 && (
                <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded font-bold">
                  #{index + 1}
                </div>
              )}
              
              <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                <FaFire />
                <span>POPULAR</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-white font-medium text-sm leading-tight group-hover:text-letterboxd-green transition-colors line-clamp-2">
                {game.name}
              </h3>
              
              <div className="flex items-center space-x-2 text-xs text-muted">
                {game.first_release_date && (
                  <div className="flex items-center space-x-1">
                    <FaCalendarAlt />
                    <span>{formatReleaseDate(game.first_release_date)}</span>
                  </div>
                )}
                
                {game.rating_count && game.rating_count > 0 && (
                  <span>
                    {game.rating_count.toLocaleString()} ratings
                  </span>
                )}
              </div>
              
              {game.genres && game.genres.length > 0 && (
                <div className="text-xs text-muted">
                  {game.genres.slice(0, 2).map(genre => genre.name).join(', ')}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Loading more indicator */}
      {loadingMore && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`loading-${index}`} className="space-y-2">
              <div className="aspect-[3/4] bg-letterboxd-tertiary rounded-lg animate-pulse" />
              <div className="h-4 bg-letterboxd-tertiary rounded animate-pulse" />
              <div className="h-3 bg-letterboxd-tertiary rounded animate-pulse w-3/4" />
            </div>
          ))}
        </div>
      )}

      {/* End of results message */}
      {!hasMore && games.length > 0 && (
        <div className="text-center py-8">
          <div className="bg-letterboxd-card border border-letterboxd rounded-lg p-6">
            <FaFire className="mx-auto text-3xl text-orange-500 mb-3" />
            <p className="text-white font-medium mb-1">You've seen all the popular games!</p>
            <p className="text-muted text-sm">
              That's {games.length} games total. Check back later for updates.
            </p>
          </div>
        </div>
      )}

      {games.length === 0 && !loading && (
        <div className="bg-letterboxd-card border border-letterboxd rounded-lg p-8 text-center">
          <FaGamepad className="mx-auto text-4xl text-muted mb-4" />
          <p className="text-white font-medium mb-2">No popular games found</p>
          <p className="text-muted text-sm">Check back later or try refreshing the page</p>
        </div>
      )}
    </div>
  );
} 