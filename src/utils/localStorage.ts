import { Game, UserPreferences } from '@/types';

const USER_PREFERENCES_KEY = 'gameRecommender.userPreferences';

/**
 * Loads user preferences from local storage
 */
export const loadUserPreferences = (): UserPreferences => {
  if (typeof window === 'undefined') {
    return { likedGames: [], dislikedGames: [] };
  }

  try {
    const savedPreferences = localStorage.getItem(USER_PREFERENCES_KEY);
    if (savedPreferences) {
      return JSON.parse(savedPreferences);
    }
  } catch (error) {
    console.error('Error loading preferences from local storage:', error);
  }

  return { likedGames: [], dislikedGames: [] };
};

/**
 * Saves user preferences to local storage
 */
export const saveUserPreferences = (preferences: UserPreferences): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences to local storage:', error);
  }
};

/**
 * Adds a game to the liked list and removes it from disliked if present
 */
export const addLikedGame = (game: Game): UserPreferences => {
  const preferences = loadUserPreferences();

  // Remove from disliked list if present
  const filteredDisliked = preferences.dislikedGames.filter(g => g.id !== game.id);
  
  // Add to liked list if not already there
  if (!preferences.likedGames.some(g => g.id === game.id)) {
    const updatedPreferences = {
      likedGames: [...preferences.likedGames, game],
      dislikedGames: filteredDisliked
    };
    saveUserPreferences(updatedPreferences);
    return updatedPreferences;
  }
  
  // Just remove from disliked if already in liked
  if (filteredDisliked.length !== preferences.dislikedGames.length) {
    const updatedPreferences = {
      likedGames: preferences.likedGames,
      dislikedGames: filteredDisliked
    };
    saveUserPreferences(updatedPreferences);
    return updatedPreferences;
  }
  
  return preferences;
};

/**
 * Adds a game to the disliked list and removes it from liked if present
 */
export const addDislikedGame = (game: Game): UserPreferences => {
  const preferences = loadUserPreferences();

  // Remove from liked list if present
  const filteredLiked = preferences.likedGames.filter(g => g.id !== game.id);
  
  // Add to disliked list if not already there
  if (!preferences.dislikedGames.some(g => g.id === game.id)) {
    const updatedPreferences = {
      likedGames: filteredLiked,
      dislikedGames: [...preferences.dislikedGames, game]
    };
    saveUserPreferences(updatedPreferences);
    return updatedPreferences;
  }
  
  // Just remove from liked if already in disliked
  if (filteredLiked.length !== preferences.likedGames.length) {
    const updatedPreferences = {
      likedGames: filteredLiked,
      dislikedGames: preferences.dislikedGames
    };
    saveUserPreferences(updatedPreferences);
    return updatedPreferences;
  }
  
  return preferences;
};

/**
 * Removes a game from both liked and disliked lists
 */
export const removeGame = (gameId: string): UserPreferences => {
  const preferences = loadUserPreferences();
  
  const updatedPreferences = {
    likedGames: preferences.likedGames.filter(g => g.id !== gameId),
    dislikedGames: preferences.dislikedGames.filter(g => g.id !== gameId)
  };
  
  saveUserPreferences(updatedPreferences);
  return updatedPreferences;
}; 