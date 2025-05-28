import { useState } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useAuth } from '@/contexts/AuthContext';
import GameCard from './GameCard';
import { FaStar, FaStarHalfAlt, FaHeart, FaFilter } from 'react-icons/fa';
import { RatedGame } from '@/types';

export default function GameLists() {
  const { user } = useAuth();
  const { preferences, isLoading } = usePreferences();
  const { ratedGames } = preferences;

  // Filter state
  const [selectedDecade, setSelectedDecade] = useState<string>('ALL');
  const [selectedGenre, setSelectedGenre] = useState<string>('ALL');
  const [selectedService, setSelectedService] = useState<string>('ALL');
  const [selectedRating, setSelectedRating] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('RATING');

  // Filter and organize games for the poster grid layout
  const watchedGames = ratedGames.filter(game => game.rating > 0);

  // Apply filters
  const filteredGames = watchedGames.filter(game => {
    // Decade filter
    if (selectedDecade !== 'ALL') {
      if (!game.first_release_date) return false;
      
      const releaseYear = new Date(game.first_release_date * 1000).getFullYear();
      const decade = Math.floor(releaseYear / 10) * 10;
      const selectedDecadeNum = parseInt(selectedDecade.replace('s', ''));
      
      if (decade !== selectedDecadeNum) return false;
    }

    // Genre filter
    if (selectedGenre !== 'ALL') {
      if (!game.genres || game.genres.length === 0) return false;
      
      const hasGenre = game.genres.some(genre => 
        genre.name.toLowerCase().includes(selectedGenre.toLowerCase())
      );
      if (!hasGenre) return false;
    }

    // Platform/Service filter
    if (selectedService !== 'ALL') {
      if (!game.platforms || game.platforms.length === 0) return false;
      
      const hasPlatform = game.platforms.some(platform => {
        const platformName = platform.name.toLowerCase();
        const serviceName = selectedService.toLowerCase();
        
        // Map service names to platform patterns
        switch (serviceName) {
          case 'steam':
            return platformName.includes('pc') || platformName.includes('windows') || platformName.includes('linux') || platformName.includes('mac');
          case 'playstation':
            return platformName.includes('playstation') || platformName.includes('ps') || platformName.includes('psp') || platformName.includes('vita');
          case 'xbox':
            return platformName.includes('xbox');
          case 'nintendo':
            return platformName.includes('nintendo') || platformName.includes('wii') || platformName.includes('switch') || platformName.includes('3ds') || platformName.includes('game boy');
          default:
            return platformName.includes(serviceName);
        }
      });
      if (!hasPlatform) return false;
    }

    // Rating filter
    if (selectedRating !== 'ALL') {
      const minRating = parseFloat(selectedRating.replace('+', ''));
      if (game.rating < minRating) return false;
    }

    return true;
  });
  
  // Sort games based on selected option
  const sortedGames = [...filteredGames].sort((a, b) => {
    switch (sortBy) {
      case 'RATING':
        if (b.rating !== a.rating) {
          return b.rating - a.rating; // Higher rating first
        }
        // If same rating, sort by date (most recent first)
        const dateA = a.dateRated ? new Date(a.dateRated).getTime() : 0;
        const dateB = b.dateRated ? new Date(b.dateRated).getTime() : 0;
        return dateB - dateA;
        
      case 'DATE_RATED':
        const ratedDateA = a.dateRated ? new Date(a.dateRated).getTime() : 0;
        const ratedDateB = b.dateRated ? new Date(b.dateRated).getTime() : 0;
        return ratedDateB - ratedDateA; // Most recently rated first
        
      case 'RELEASE_DATE':
        const releaseA = a.first_release_date || 0;
        const releaseB = b.first_release_date || 0;
        return releaseB - releaseA; // Newest games first
        
      case 'TITLE':
        return a.title.localeCompare(b.title); // Alphabetical order
        
      default:
        // Default to rating sort
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        const defaultDateA = a.dateRated ? new Date(a.dateRated).getTime() : 0;
        const defaultDateB = b.dateRated ? new Date(b.dateRated).getTime() : 0;
        return defaultDateB - defaultDateA;
    }
  });

  // Get unique genres and platforms from all rated games for dynamic filter options
  const allGenres = new Set<string>();
  const allPlatforms = new Set<string>();
  
  watchedGames.forEach(game => {
    if (game.genres) {
      game.genres.forEach(genre => allGenres.add(genre.name));
    }
    if (game.platforms) {
      game.platforms.forEach(platform => {
        // Simplify platform names for services
        const platformName = platform.name.toLowerCase();
        if (platformName.includes('pc') || platformName.includes('windows') || platformName.includes('linux') || platformName.includes('mac')) {
          allPlatforms.add('Steam');
        }
        if (platformName.includes('playstation') || platformName.includes('ps')) {
          allPlatforms.add('PlayStation');
        }
        if (platformName.includes('xbox')) {
          allPlatforms.add('Xbox');
        }
        if (platformName.includes('nintendo') || platformName.includes('wii') || platformName.includes('switch')) {
          allPlatforms.add('Nintendo');
        }
      });
    }
  });

  // Get stats for the header
  const totalGames = filteredGames.length;
  const averageRating = totalGames > 0 
    ? (filteredGames.reduce((sum, game) => sum + game.rating, 0) / totalGames).toFixed(1)
    : '0.0';

  const getStarDisplay = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-letterboxd-green" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-letterboxd-green" />);
    }

    return stars;
  };

  return (
    <div className="space-y-8">
      {isLoading ? (
        <div className="space-y-8">
          {/* Loading skeleton */}
          <div className="animate-pulse">
            <div className="h-6 bg-letterboxd-tertiary rounded mb-6 w-64"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-letterboxd-tertiary rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      ) : totalGames > 0 ? (
        <>
          {/* Stats and Filters Bar */}
          <div className="flex items-center justify-between border-b border-letterboxd pb-4">
            <div className="flex items-center space-x-6">
              <div className="uppercase text-lg font-bold tracking-wider text-white border-b-2 border-letterboxd-green pb-1">
                WATCHED
              </div>
              <div className="text-muted">
                {totalGames} game{totalGames !== 1 ? 's' : ''}
                {(selectedDecade !== 'ALL' || selectedGenre !== 'ALL' || selectedService !== 'ALL') && 
                  totalGames !== watchedGames.length && (
                  <span className="text-letterboxd-green ml-1">
                    (of {watchedGames.length} total)
                  </span>
                )}
              </div>
              <div className="text-muted">
                Average: {averageRating}★
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <select 
                value={selectedDecade}
                onChange={(e) => setSelectedDecade(e.target.value)}
                className="bg-letterboxd-tertiary text-white text-sm rounded px-3 py-1 border border-letterboxd"
              >
                <option value="ALL">DECADE</option>
                <option value="ALL">ALL</option>
                <option value="2020s">2020s</option>
                <option value="2010s">2010s</option>
                <option value="2000s">2000s</option>
                <option value="1990s">1990s</option>
                <option value="1980s">1980s</option>
                <option value="1970s">1970s</option>
              </select>
              
              <select 
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-letterboxd-tertiary text-white text-sm rounded px-3 py-1 border border-letterboxd"
              >
                <option value="ALL">GENRE</option>
                <option value="ALL">ALL</option>
                {Array.from(allGenres).sort().map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
              
              <select 
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="bg-letterboxd-tertiary text-white text-sm rounded px-3 py-1 border border-letterboxd"
              >
                <option value="ALL">SERVICE</option>
                <option value="ALL">ALL</option>
                {Array.from(allPlatforms).sort().map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
              
              <select 
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="bg-letterboxd-tertiary text-white text-sm rounded px-3 py-1 border border-letterboxd"
              >
                <option value="ALL">RATING</option>
                <option value="ALL">ALL</option>
                <option value="4.5+">★★★★★ (4.5+)</option>
                <option value="4+">★★★★☆ (4+)</option>
                <option value="3+">★★★☆☆ (3+)</option>
                <option value="2+">★★☆☆☆ (2+)</option>
                <option value="1+">★☆☆☆☆ (1+)</option>
              </select>
              
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-letterboxd-tertiary text-white text-sm rounded px-3 py-1 border border-letterboxd"
              >
                <option value="RATING">Sort by Rating</option>
                <option value="DATE_RATED">Sort by Date Rated</option>
                <option value="RELEASE_DATE">Sort by Release Date</option>
                <option value="TITLE">Sort by Title</option>
              </select>
              
              {/* Clear filters button */}
              {(selectedDecade !== 'ALL' || selectedGenre !== 'ALL' || selectedService !== 'ALL' || selectedRating !== 'ALL') && (
                <button
                  onClick={() => {
                    setSelectedDecade('ALL');
                    setSelectedGenre('ALL');
                    setSelectedService('ALL');
                    setSelectedRating('ALL');
                  }}
                  className="text-letterboxd-green hover:text-green-400 text-xs px-2 py-1 border border-letterboxd-green rounded transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedDecade !== 'ALL' || selectedGenre !== 'ALL' || selectedService !== 'ALL' || selectedRating !== 'ALL') && (
            <div className="flex items-center flex-wrap gap-2 mt-4 pt-4 border-t border-letterboxd/20">
              <span className="text-muted text-sm">Active filters:</span>
              {selectedDecade !== 'ALL' && (
                <span className="bg-letterboxd-green/20 text-letterboxd-green px-2 py-1 rounded-full text-xs border border-letterboxd-green/30">
                  {selectedDecade}
                </span>
              )}
              {selectedGenre !== 'ALL' && (
                <span className="bg-letterboxd-orange/20 text-letterboxd-orange px-2 py-1 rounded-full text-xs border border-letterboxd-orange/30">
                  {selectedGenre}
                </span>
              )}
              {selectedService !== 'ALL' && (
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs border border-blue-500/30">
                  {selectedService}
                </span>
              )}
              {selectedRating !== 'ALL' && (
                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs border border-yellow-500/30">
                  {selectedRating} stars
                </span>
              )}
            </div>
          )}

          {/* Game Poster Grid - Letterboxd Style */}
          {sortedGames.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8 gap-3 p-1">
              {sortedGames.map((game) => (
                <div key={game.id} className="group relative">
                  <GameCard 
                    game={game} 
                    size="small"
                    showActions={true}
                    enableQuickRating={true}
                  />
                </div>
              ))}
            </div>
          ) : (
            // No games match current filters
            <div className="bg-letterboxd-card border border-letterboxd rounded-lg p-12">
              <div className="text-center">
                <FaFilter className="mx-auto text-6xl text-muted mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">No games match your filters</h3>
                <p className="text-xl text-secondary mb-6">
                  Try adjusting your filters to see more games
                </p>
                <button
                  onClick={() => {
                    setSelectedDecade('ALL');
                    setSelectedGenre('ALL');
                    setSelectedService('ALL');
                    setSelectedRating('ALL');
                  }}
                  className="bg-letterboxd-green text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* Show more button if there are many games */}
          {sortedGames.length > 24 && (
            <div className="text-center pt-8">
              <button className="text-letterboxd-green hover:text-green-400 transition-colors font-medium">
                Show all {sortedGames.length} games →
              </button>
            </div>
          )}
        </>
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