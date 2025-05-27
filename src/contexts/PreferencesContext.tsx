'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Game, UserPreferences } from '@/types';
import { 
  loadUserPreferences, 
  saveUserPreferences, 
  rateGame, 
  removeGameRating,
  getGameRating
} from '@/utils/localStorage';

interface PreferencesContextType {
  preferences: UserPreferences;
  rateGame: (game: Game, rating: number) => void;
  removeGameFromLists: (gameId: string) => void;
  getGameRating: (gameId: string) => number;
  isLoading: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({ 
    ratedGames: [] 
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

  const handleRateGame = (game: Game, rating: number) => {
    const updatedPreferences = rateGame(game, rating);
    setPreferences(updatedPreferences);
  };

  const removeGameFromLists = (gameId: string) => {
    const updatedPreferences = removeGameRating(gameId);
    setPreferences(updatedPreferences);
  };

  const handleGetGameRating = (gameId: string): number => {
    return getGameRating(gameId);
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        rateGame: handleRateGame,
        removeGameFromLists,
        getGameRating: handleGetGameRating,
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