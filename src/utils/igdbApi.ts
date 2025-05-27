// Define types for IGDB API responses
export interface IGDBGame {
  id: number;
  name: string;
  slug?: string;
  cover?: {
    id: number;
    url: string;
  };
  first_release_date?: number;
  platforms?: Array<{
    id: number;
    name: string;
  }>;
  genres?: Array<{
    id: number;
    name: string;
  }>;
  summary?: string;
}

export interface IGDBSearchResult {
  results: IGDBGame[];
}

/**
 * Search for games using the IGDB API via our server-side route
 */
export const searchGames = async (searchTerm: string): Promise<IGDBGame[]> => {
  if (!searchTerm.trim()) {
    return [];
  }

  try {
    const response = await fetch('/api/igdb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'search',
        searchTerm: searchTerm.trim(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('IGDB search failed:', errorData.error);
      return [];
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error searching games with IGDB:', error);
    return [];
  }
};

/**
 * Get game details including cover image for a specific game
 */
export const getGameCover = async (gameTitle: string): Promise<string | null> => {
  if (!gameTitle.trim()) {
    return null;
  }

  try {
    const response = await fetch('/api/igdb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getCover',
        searchTerm: gameTitle.trim(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('IGDB cover fetch failed:', errorData.error);
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching game cover from IGDB:', error);
    return null;
  }
};

/**
 * Get detailed information about a specific game by ID
 */
export const getGameById = async (gameId: number): Promise<IGDBGame | null> => {
  try {
    const response = await fetch('/api/igdb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getById',
        gameId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('IGDB game fetch failed:', errorData.error);
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching game by ID from IGDB:', error);
    return null;
  }
};

/**
 * Convert IGDB timestamp to readable date
 */
export const formatReleaseDate = (timestamp?: number): string => {
  if (!timestamp) return 'Unknown';
  return new Date(timestamp * 1000).getFullYear().toString();
}; 