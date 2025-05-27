import { useState, useEffect, useCallback } from 'react';
import { Game } from '@/types';
import { usePreferences } from '@/contexts/PreferencesContext';
import { searchGames, IGDBGame } from '@/utils/igdbApi';
import StarRating from './StarRating';

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
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Rate a Game</h2>
      
      <div className="space-y-4">
        {/* Game search input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a game..."
            value={title}
            onChange={handleTitleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              placeholder-gray-500 dark:placeholder-gray-400"
          />
          
          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => handleSelectGame(game)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 
                    text-gray-900 dark:text-white first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="font-medium">{game.name}</div>
                  {game.first_release_date && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(game.first_release_date * 1000).getFullYear()}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
          
          {/* Loading indicator */}
          {isSearching && (
            <div className="absolute right-3 top-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {/* Rating selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || !title.trim() || selectedRating === 0}
          >
            {isSubmitting ? 'Adding...' : 'Add Game'}
          </button>
        </div>
      </div>
    </form>
  );
} 