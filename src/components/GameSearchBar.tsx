import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchGames, IGDBGame } from '@/utils/igdbApi';
import { FaSearch, FaTimes } from 'react-icons/fa';

interface GameSearchBarProps {
  placeholder?: string;
  className?: string;
}

export default function GameSearchBar({ 
  placeholder = "Search for a game...", 
  className = "" 
}: GameSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IGDBGame[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchGames(searchTerm);
      setSearchResults(results);
      setIsOpen(results.length > 0);
    } catch (error) {
      console.error('Error fetching games:', error);
      setSearchResults([]);
      setIsOpen(false);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedFetchGames = useCallback(debounce(fetchGames, 300), []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedFetchGames(newQuery);
  };

  const handleGameSelect = (game: IGDBGame) => {
    setQuery('');
    setSearchResults([]);
    setIsOpen(false);
    router.push(`/game/${game.id}`);
  };

  const handleClear = () => {
    setQuery('');
    setSearchResults([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatReleaseDate = (timestamp?: number): string => {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).getFullYear().toString();
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
            focus:ring-2 focus:ring-blue-500 focus:border-transparent 
            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
            placeholder-gray-500 dark:placeholder-gray-400 text-lg"
        />
        
        {/* Search icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <FaSearch className="text-gray-400 dark:text-gray-500" />
        </div>
        
        {/* Clear button */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <FaTimes className="text-gray-400 dark:text-gray-500 text-sm" />
          </button>
        )}
        
        {/* Loading indicator */}
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Search results dropdown */}
      {isOpen && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {searchResults.map((game) => (
            <button
              key={game.id}
              onClick={() => handleGameSelect(game)}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 
                text-gray-900 dark:text-white first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 dark:border-gray-600 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                {/* Game cover thumbnail */}
                {game.cover?.url ? (
                  <div className="relative w-10 h-14 flex-shrink-0">
                    <img
                      src={`https:${game.cover.url}`}
                      alt={`Cover for ${game.name}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-14 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                    <FaSearch className="text-gray-400 text-xs" />
                  </div>
                )}
                
                {/* Game info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{game.name}</div>
                  {game.first_release_date && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatReleaseDate(game.first_release_date)}
                    </div>
                  )}
                  {game.platforms && game.platforms.length > 0 && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {game.platforms.slice(0, 2).map(p => p.name).join(', ')}
                      {game.platforms.length > 2 && ` +${game.platforms.length - 2} more`}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && !isSearching && query.trim() && searchResults.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
            No games found for "{query}"
          </div>
        </div>
      )}
    </div>
  );
} 