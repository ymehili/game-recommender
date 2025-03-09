import { useState } from 'react';
import { Game } from '@/types';
import { usePreferences } from '@/contexts/PreferencesContext';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

export default function AddGameForm() {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { likeGame, dislikeGame } = usePreferences();

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
        <div className="flex-grow">
          <label htmlFor="game-title" className="sr-only">Game title</label>
          <input
            id="game-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a game title..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={isSubmitting}
            required
          />
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