// Define types for RAWG API responses
export interface RawgGame {
  id: number;
  name: string;
  slug: string;
  background_image: string;
}

export interface RawgSearchResult {
  count: number;
  results: RawgGame[];
}

/**
 * Search for games using the RAWG API
 */
export const searchGames = async (searchTerm: string): Promise<RawgGame[]> => {
  if (!searchTerm.trim()) {
    return [];
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;
    if (!apiKey) {
      console.error("RAWG API key is not configured. Please set NEXT_PUBLIC_RAWG_API_KEY environment variable.");
      return [];
    }

    const response = await fetch(
      `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(searchTerm)}&page_size=5`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch games');
    }

    const data: RawgSearchResult = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching games:', error);
    return [];
  }
};

/**
 * Get game details including cover image for a specific game
 */
export const getGameCover = async (gameTitle: string): Promise<string | null> => {
  try {
    const games = await searchGames(gameTitle);
    
    // Return the background image of the first result, if available
    if (games.length > 0 && games[0].background_image) {
      return games[0].background_image;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching game cover:', error);
    return null;
  }
}; 