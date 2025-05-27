import { Game, UserPreferences, RatedGame } from '@/types';

const USER_PREFERENCES_KEY = 'gameRecommender.userPreferences';

/**
 * Loads user preferences from local storage
 */
export const loadUserPreferences = (): UserPreferences => {
  if (typeof window === 'undefined') {
    return { ratedGames: [] };
  }

  try {
    const savedPreferences = localStorage.getItem(USER_PREFERENCES_KEY);
    if (savedPreferences) {
      const parsed = JSON.parse(savedPreferences);
      
      // Migration: Convert old liked/disliked system to ratings
      if (parsed.likedGames || parsed.dislikedGames) {
        const ratedGames: RatedGame[] = [];
        
        // Convert liked games to 4-5 star ratings
        if (parsed.likedGames) {
          parsed.likedGames.forEach((game: Game) => {
            ratedGames.push({
              ...game,
              rating: 4, // Default liked games to 4 stars
              dateRated: new Date()
            });
          });
        }
        
        // Convert disliked games to 1-2 star ratings
        if (parsed.dislikedGames) {
          parsed.dislikedGames.forEach((game: Game) => {
            ratedGames.push({
              ...game,
              rating: 2, // Default disliked games to 2 stars
              dateRated: new Date()
            });
          });
        }
        
        const migratedPreferences = { ratedGames };
        saveUserPreferences(migratedPreferences);
        return migratedPreferences;
      }
      
      return parsed;
    }
  } catch (error) {
    console.error('Error loading preferences from local storage:', error);
  }

  return { ratedGames: [] };
};

/**
 * Saves user preferences to local storage
 */
export const saveUserPreferences = (preferences: UserPreferences): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences to local storage:', error);
  }
};

/**
 * Adds or updates a game rating
 */
export const rateGame = (game: Game, rating: number): UserPreferences => {
  const preferences = loadUserPreferences();
  
  // Remove existing rating for this game if it exists
  const filteredGames = preferences.ratedGames.filter(g => g.id !== game.id);
  
  // Add the new rating (only if rating > 0)
  const updatedGames = rating > 0 
    ? [...filteredGames, { ...game, rating, dateRated: new Date() }]
    : filteredGames;
  
  const updatedPreferences = { ratedGames: updatedGames };
  saveUserPreferences(updatedPreferences);
  return updatedPreferences;
};

/**
 * Removes a game rating
 */
export const removeGameRating = (gameId: string): UserPreferences => {
  const preferences = loadUserPreferences();
  
  const updatedPreferences = {
    ratedGames: preferences.ratedGames.filter(g => g.id !== gameId)
  };
  
  saveUserPreferences(updatedPreferences);
  return updatedPreferences;
};

/**
 * Gets the rating for a specific game
 */
export const getGameRating = (gameId: string): number => {
  const preferences = loadUserPreferences();
  const ratedGame = preferences.ratedGames.find(g => g.id === gameId);
  return ratedGame ? ratedGame.rating : 0;
}; 