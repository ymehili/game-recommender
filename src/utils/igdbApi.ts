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
  screenshots?: Array<{
    id: number;
    url: string;
  }>;
  videos?: Array<{
    id: number;
    video_id: string;
  }>;
  rating?: number;
  rating_count?: number;
  storyline?: string;
  involved_companies?: Array<{
    id: number;
    company: {
      id: number;
      name: string;
    };
    developer: boolean;
    publisher: boolean;
  }>;
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
 * Get detailed information about a specific game by ID (DEPRECATED - use getGameFromServer instead)
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
 * Get detailed game information from our server-side cache
 * This uses server-side caching to avoid redundant IGDB API calls
 */
export const getGameFromServer = async (gameId: number): Promise<IGDBGame | null> => {
  try {
    const response = await fetch(`/api/games/${gameId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server game fetch failed:', errorData.error);
      return null;
    }

    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching game from server:', error);
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

/**
 * Search for a game's IGDB ID by title - useful for recommendation games
 */
export const getGameIdByTitle = async (gameTitle: string): Promise<number | null> => {
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
        action: 'getIdByTitle',
        searchTerm: gameTitle.trim(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('IGDB ID search failed:', errorData.error);
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error searching for game ID:', error);
    return null;
  }
}; 