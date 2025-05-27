import { useState, useEffect, useCallback } from 'react';
import { Game } from '@/types';
import { usePreferences } from '@/contexts/PreferencesContext';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { searchGames, RawgGame } from '@/utils/rawgApi';

export default function AddGameForm() {
  const [title, setTitle] = useState('');
  const [searchResults, setSearchResults] = useState<RawgGame[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGame, setSelectedGame] = useState<RawgGame | null>(null);
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
    // If we have a selected game with an image, use that
    if (selectedGame && selectedGame.background_image) {
      return {
        id: generateGameId(),
        title: selectedGame.name,
        coverImage: selectedGame.background_image
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

  const handleSelectGame = (game: RawgGame) => {
    setTitle(game.name);
    setSelectedGame(game);
    setSearchResults([]);
  };

  const handleAddToLiked = () => {
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    try {
      const game = createGame();
      likeGame(game);
      setTitle('');
      setSelectedGame(null);
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
      setSelectedGame(null);
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
          {searchResults.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto dark:bg-gray-700 dark:border-gray-600">
              {searchResults.map((game) => (
                <li
                  key={game.id}
                  onClick={() => handleSelectGame(game)}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center"
                >
                  {game.background_image && (
                    <div className="w-8 h-8 mr-2 flex-shrink-0 rounded overflow-hidden">
                      <img 
                        src={game.background_image} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <span>{game.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleAddToLiked}
            className="flex items-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
            disabled={isSubmitting || !title.trim()}
          >
            <FaThumbsUp className="mr-2" />
            <span>Like</span>
          </button>
          <button
            type="button"
            onClick={handleAddToDisliked}
            className="flex items-center px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={isSubmitting || !title.trim()}
          >
            <FaThumbsDown className="mr-2" />
            <span>Dislike</span>
          </button>
        </div>
      </div>
    </form>
  );
} 