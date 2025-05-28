import { useState, useEffect, useCallback } from 'react';
import { Game } from '@/types';
import { usePreferences } from '@/contexts/PreferencesContext';
import { searchGames, IGDBGame } from '@/utils/igdbApi';
import StarRating from './StarRating';
import { FaSearch, FaPlus } from 'react-icons/fa';

export default function AddGameForm() {
  const [title, setTitle] = useState('');
  const [searchResults, setSearchResults] = useState<IGDBGame[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGame, setSelectedGame] = useState<IGDBGame | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const { rateGame } = usePreferences();

  // Debounce function
  const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<F>): Promise<ReturnType<F>> => {
      return new Promise((resolve) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          resolve(func(...args));
        }, delay);
      });
    };
  };
  
  const fetchGames = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchGames(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error fetching games:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedFetchGames = useCallback(debounce(fetchGames, 300), []);

  // Generate a unique ID for the game
  const generateGameId = () => {
    return Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9);
  };

  const createGame = (): Game => {
    // If we have a selected game with a cover, use that
    if (selectedGame && selectedGame.cover?.url) {
      const coverUrl = selectedGame.cover.url.replace('t_thumb', 't_cover_big');
      return {
        id: generateGameId(),
        title: selectedGame.name,
        coverImage: `https:${coverUrl}`
      };
    }
    // Otherwise just use the title
    return {
      id: generateGameId(),
      title: title.trim()
    };
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    // Reset selected game when changing the search
    setSelectedGame(null);
    debouncedFetchGames(newTitle);
  };

  const handleSelectGame = (game: IGDBGame) => {
    setTitle(game.name);
    setSelectedGame(game);
    setSearchResults([]);
  };

  const handleAddGame = async () => {
    if (!title.trim() || selectedRating === 0) return;
    
    setIsSubmitting(true);
    try {
      const game = createGame();
      await rateGame(game, selectedRating);
      setTitle('');
      setSelectedGame(null);
      setSelectedRating(0);
      setSearchResults([]);
    } catch (error) {
      console.error('Error adding game:', error);
      // You could add a toast notification here for better UX
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAddGame();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-letterboxd-card rounded-lg shadow-lg p-6 mb-8 border border-letterboxd">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
        <FaPlus className="text-letterboxd-green" />
        <span>Rate a Game</span>
      </h2>
      
      <div className="space-y-4">
        {/* Game search input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-muted" />
          </div>
          <input
            type="text"
            placeholder="Search for a game..."
            value={title}
            onChange={handleTitleChange}
            className="w-full pl-10 pr-4 py-3 border border-letterboxd rounded-lg 
              focus:ring-2 focus:ring-letterboxd-green focus:border-letterboxd-green 
              bg-letterboxd-tertiary text-white placeholder-text-muted transition-all duration-200"
          />
          
          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-letterboxd-card border border-letterboxd rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => handleSelectGame(game)}
                  className="w-full px-4 py-3 text-left hover:bg-letterboxd-tertiary 
                    text-white first:rounded-t-lg last:rounded-b-lg transition-colors duration-200"
                >
                  <div className="font-medium">{game.name}</div>
                  {game.first_release_date && (
                    <div className="text-sm text-muted">
                      {new Date(game.first_release_date * 1000).getFullYear()}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
          
          {/* Loading indicator */}
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-letterboxd-green border-t-transparent"></div>
            </div>
          )}
        </div>

        {/* Rating selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Rate this game:
          </label>
          <StarRating 
            rating={selectedRating}
            onRatingChange={setSelectedRating}
            showClearButton={true}
            size="lg"
          />
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            onClick={handleAddGame}
            className="px-6 py-3 rounded-lg bg-letterboxd-green text-white hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
            disabled={isSubmitting || !title.trim() || selectedRating === 0}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <FaPlus className="h-4 w-4" />
                <span>Add Game</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
} 