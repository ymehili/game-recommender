'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { Game, UserPreferences, RatedGame } from '@/types';
import { useAuth } from './AuthContext';
import { 
  loadUserPreferences, 
  saveUserPreferences, 
  rateGame as rateGameLocal, 
  removeGameRating,
  getGameRating
} from '@/utils/localStorage';
import { getGameIdByTitle } from '@/utils/igdbApi';
import { getAuthHeaders } from '@/utils/cookies';

interface PreferencesContextType {
  preferences: UserPreferences;
  rateGame: (game: Game, rating: number) => Promise<void>;
  removeGameFromLists: (gameId: string) => Promise<void>;
  getGameRating: (gameId: string) => number;
  isLoading: boolean;
  syncPreferences: () => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({ 
    ratedGames: [] 
  });
  const [isLoading, setIsLoading] = useState(true);

  // Function to get auth headers
  const getAuthHeaders = (): HeadersInit => {
    const token = Cookies.get('token');
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }
    return {
      'Content-Type': 'application/json',
    };
  };

  // Function to sync preferences from server
  const syncPreferences = async () => {
    if (!user) {
      // If no user, load from localStorage (for backward compatibility)
      const localPreferences = loadUserPreferences();
      setPreferences(localPreferences);
      return;
    }

    try {
      const response = await fetch('/api/user/preferences', {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.preferences) {
          setPreferences(data.preferences);
          return;
        }
      }
    } catch (error) {
      console.error('Error syncing preferences from server:', error);
    }

    // Fallback to localStorage if server fails
    const localPreferences = loadUserPreferences();
    setPreferences(localPreferences);
  };

  // Function to save preferences to server
  const savePreferencesToServer = async (newPreferences: UserPreferences) => {
    if (!user) {
      // If no user, save to localStorage
      saveUserPreferences(newPreferences);
      return;
    }

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(newPreferences),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences to server');
      }
    } catch (error) {
      console.error('Error saving preferences to server:', error);
      // Fallback to localStorage
      saveUserPreferences(newPreferences);
    }
  };

  // Load preferences when user changes or component mounts
  useEffect(() => {
    if (!authLoading) {
      setIsLoading(true);
      syncPreferences().finally(() => setIsLoading(false));
    }
  }, [user, authLoading]);

  const handleRateGame = async (game: Game, rating: number) => {
    // Check if this is a recommendation game (non-numeric ID) and try to get IGDB ID
    let gameToRate = game;
    if (isNaN(parseInt(game.id))) {
      console.log('Detected recommendation game, looking up IGDB ID for:', game.title);
      try {
        const igdbId = await getGameIdByTitle(game.title);
        if (igdbId) {
          console.log('Found IGDB ID:', igdbId, 'for game:', game.title);
          gameToRate = {
            ...game,
            id: igdbId.toString()
          };
        } else {
          console.log('No IGDB ID found for game:', game.title, 'keeping original ID');
        }
      } catch (error) {
        console.error('Error looking up IGDB ID for game:', game.title, error);
        // Continue with original game if lookup fails
      }
    }

    if (!user) {
      // If no user, use localStorage
      const updatedPreferences = rateGameLocal(gameToRate, rating);
      setPreferences(updatedPreferences);
      return;
    }

    try {
      const response = await fetch('/api/user/games/rate', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ game: gameToRate, rating }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.preferences) {
          setPreferences(data.preferences);
          return;
        }
      }
      
      throw new Error('Failed to rate game on server');
    } catch (error) {
      console.error('Error rating game:', error);
      // Fallback to localStorage
      const updatedPreferences = rateGameLocal(gameToRate, rating);
      setPreferences(updatedPreferences);
    }
  };

  const removeGameFromLists = async (gameId: string) => {
    if (!user) {
      // If no user, use localStorage
      const updatedPreferences = removeGameRating(gameId);
      setPreferences(updatedPreferences);
      return;
    }

    try {
      const response = await fetch('/api/user/games/remove', {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ gameId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.preferences) {
          setPreferences(data.preferences);
          return;
        }
      }
      
      throw new Error('Failed to remove game on server');
    } catch (error) {
      console.error('Error removing game:', error);
      // Fallback to localStorage
      const updatedPreferences = removeGameRating(gameId);
      setPreferences(updatedPreferences);
    }
  };

  const handleGetGameRating = (gameId: string): number => {
    const ratedGame = preferences.ratedGames.find(g => g.id === gameId);
    return ratedGame ? ratedGame.rating : 0;
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        rateGame: handleRateGame,
        removeGameFromLists,
        getGameRating: handleGetGameRating,
        isLoading: isLoading || authLoading,
        syncPreferences,
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