import { useState, useEffect, useCallback } from 'react';
import { Game } from '@/types';
import { usePreferences } from '@/contexts/PreferencesContext';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

// Define a type for the RAWG API response
interface RawgGame {
  id: number;
  name: string;
  slug: string;
}

export default function AddGameForm() {
  const [title, setTitle] = useState('');
  const [searchResults, setSearchResults] = useState<RawgGame[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { likeGame, dislikeGame } = usePreferences();

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
      // IMPORTANT: Replace YOUR_API_KEY with your actual RAWG API key
      // You can get a free API key at https://rawg.io/apikey
      const apiKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;
      if (!apiKey) {
        console.error("RAWG API key is not configured. Please set NEXT_PUBLIC_RAWG_API_KEY environment variable.");
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      const response = await fetch(
        `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(searchTerm)}&page_size=5`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      const data = await response.json();
      setSearchResults(data.results || []);
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
    return {
      id: generateGameId(),
      title: title.trim()
    };
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debouncedFetchGames(newTitle);
  };

  const handleSelectGame = (game: RawgGame) => {
    setTitle(game.name);
    setSearchResults([]);
  };

  const handleAddToLiked = () => {
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    try {
      const game = createGame();
      likeGame(game);
      setTitle('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToDisliked = () => {
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    try {
      const game = createGame();
      dislikeGame(game);
      setTitle('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddToLiked();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-3">
        <div className="flex-grow relative">
          <label htmlFor="game-title" className="sr-only">Game title</label>
          <input
            id="game-title"
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Enter a game title..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={isSubmitting}
            required
            autoComplete="off"
          />
          {isSearching && <p className="text-sm text-gray-500 dark:text-gray-400">Searching...</p>}
          {searchResults.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto dark:bg-gray-700 dark:border-gray-600">
              {searchResults.map((game) => (
                <li
                  key={game.id}
                  onClick={() => handleSelectGame(game)}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                >
                  {game.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleAddToLiked}
            disabled={isSubmitting || !title.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <FaThumbsUp />
            <span>Like</span>
          </button>
          <button
            type="button"
            onClick={handleAddToDisliked}
            disabled={isSubmitting || !title.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <FaThumbsDown />
            <span>Dislike</span>
          </button>
        </div>
      </div>
    </form>
  );
} 