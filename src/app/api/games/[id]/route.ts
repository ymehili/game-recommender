/**
 * Game Data API Route with Server-Side Caching
 * 
 * This API route handles fetching individual game data from IGDB with intelligent caching:
 * - Stores game data in Vercel KV with 24-hour expiration
 * - Shared cache between all users (game data is the same for everyone)
 * - Only calls IGDB API when cache is missing or expired
 * - Significantly reduces API usage and improves response times
 * 
 * Cache key format: `game_cache:{gameId}`
 * Cache duration: 24 hours (86,400,000 ms)
 */

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import igdb from 'igdb-api-node';

const GAMES_CACHE_PREFIX = 'game_cache:';

// Initialize IGDB client
const getIGDBClient = () => {
  const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
  const accessToken = process.env.NEXT_PUBLIC_TWITCH_ACCESS_TOKEN;

  if (!clientId || !accessToken) {
    console.error('IGDB/Twitch credentials not configured.');
    return null;
  }

  return igdb(clientId, accessToken);
};

interface CachedGameData {
  gameData: {
    id: number;
    name: string;
    slug?: string;
    cover?: {
      url: string;
    };
    first_release_date?: number;
    summary?: string;
    platforms?: Array<{
      name: string;
    }>;
    genres?: Array<{
      name: string;
    }>;
    screenshots?: Array<{
      url: string;
    }>;
    videos?: Array<{
      video_id: string;
    }>;
    rating?: number;
    rating_count?: number;
    storyline?: string;
    involved_companies?: Array<{
      company: {
        name: string;
      };
      developer: boolean;
      publisher: boolean;
    }>;
  };
  cachedAt: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const gameId = params.id;

    if (!gameId || isNaN(parseInt(gameId))) {
      return NextResponse.json(
        { error: 'Invalid game ID' },
        { status: 400 }
      );
    }

    const cacheKey = `${GAMES_CACHE_PREFIX}${gameId}`;
    
    // Check if we have cached data
    const cachedData = await kv.get<CachedGameData>(cacheKey);
    
    if (cachedData) {
      const cachedAt = new Date(cachedData.cachedAt);
      const now = new Date();
      const oneDayMs = 24 * 60 * 60 * 1000; // 24 hours
      
      // If cache is less than 24 hours old, return cached data
      if (now.getTime() - cachedAt.getTime() < oneDayMs) {
        return NextResponse.json({
          success: true,
          data: cachedData.gameData,
          cached: true,
          cachedAt: cachedData.cachedAt
        });
      }
    }

    // Cache is expired or doesn't exist, fetch fresh data
    const client = getIGDBClient();
    if (!client) {
      return NextResponse.json(
        { error: 'IGDB/Twitch credentials not configured' },
        { status: 500 }
      );
    }

    const gameResponse = await client
      .fields([
        'name', 
        'slug', 
        'cover.url', 
        'first_release_date', 
        'summary', 
        'platforms.name', 
        'genres.name',
        'screenshots.url',
        'videos.video_id',
        'rating',
        'rating_count',
        'storyline',
        'involved_companies.company.name',
        'involved_companies.developer',
        'involved_companies.publisher'
      ])
      .where(`id = ${parseInt(gameId)}`)
      .request('/games');

    const gameData = gameResponse.data?.[0];
    
    if (!gameData) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Cache the fresh data
    const dataToCache: CachedGameData = {
      gameData,
      cachedAt: new Date().toISOString()
    };

    await kv.set(cacheKey, dataToCache);

    return NextResponse.json({
      success: true,
      data: gameData,
      cached: false,
      cachedAt: dataToCache.cachedAt
    });

  } catch (error) {
    console.error('Error fetching game data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game data' },
      { status: 500 }
    );
  }
} 