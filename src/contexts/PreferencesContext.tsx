'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Game, UserPreferences } from '@/types';
import { 
  loadUserPreferences, 
  saveUserPreferences, 
  addLikedGame, 
  addDislikedGame, 
  removeGame 
} from '@/utils/localStorage';

interface PreferencesContextType {
  preferences: UserPreferences;
  likeGame: (game: Game) => void;
  dislikeGame: (game: Game) => void;
  removeGameFromLists: (gameId: string) => void;
  isGameLiked: (gameId: string) => boolean;
  isGameDisliked: (gameId: string) => boolean;
  isLoading: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({ 
    likedGames: [], 
    dislikedGames: [] 
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from localStorage on component mount
  useEffect(() => {
    // Only load preferences on the client side
    if (typeof window !== 'undefined') {
      const loadedPreferences = loadUserPreferences();
      setPreferences(loadedPreferences);
      setIsLoading(false);
    }
  }, []);

  const likeGame = (game: Game) => {
    const updatedPreferences = addLikedGame(game);
    setPreferences(updatedPreferences);
  };

  const dislikeGame = (game: Game) => {
    const updatedPreferences = addDislikedGame(game);
    setPreferences(updatedPreferences);
  };

  const removeGameFromLists = (gameId: string) => {
    const updatedPreferences = removeGame(gameId);
    setPreferences(updatedPreferences);
  };

  const isGameLiked = (gameId: string): boolean => {
    return preferences.likedGames.some(game => game.id === gameId);
  };

  const isGameDisliked = (gameId: string): boolean => {
    return preferences.dislikedGames.some(game => game.id === gameId);
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        likeGame,
        dislikeGame,
        removeGameFromLists,
        isGameLiked,
        isGameDisliked,
        isLoading
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}; 