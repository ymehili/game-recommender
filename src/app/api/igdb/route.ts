import { NextRequest, NextResponse } from 'next/server';
import igdb from 'igdb-api-node';

// Initialize IGDB client
const getIGDBClient = () => {
  const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
  const accessToken = process.env.NEXT_PUBLIC_TWITCH_ACCESS_TOKEN;

  if (!clientId || !accessToken) {
    console.error('IGDB/Twitch credentials not configured. Please set NEXT_PUBLIC_TWITCH_CLIENT_ID and NEXT_PUBLIC_TWITCH_ACCESS_TOKEN environment variables.');
    return null;
  }

  return igdb(clientId, accessToken);
};

export async function POST(request: NextRequest) {
  try {
    const client = getIGDBClient();
    if (!client) {
      return NextResponse.json(
        { error: 'IGDB/Twitch credentials not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { action, searchTerm, gameId, limit = 20 } = body;

    switch (action) {
      case 'search':
        if (!searchTerm || !searchTerm.trim()) {
          return NextResponse.json({ data: [] });
        }

        const searchResponse = await client
          .fields(['name', 'slug', 'cover.url', 'first_release_date', 'summary', 'platforms.name', 'genres.name'])
          .search(searchTerm.trim())
          .limit(5)
          .request('/games');

        return NextResponse.json({ data: searchResponse.data || [] });

      case 'popular':
        // Get popular games based on rating count and total rating
        const popularResponse = await client
          .fields(['name', 'slug', 'cover.url', 'first_release_date', 'summary', 'platforms.name', 'genres.name', 'rating', 'rating_count', 'total_rating'])
          .where('rating_count > 100 & total_rating > 70 & category = 0')
          .sort('total_rating desc')
          .limit(limit)
          .request('/games');

        return NextResponse.json({ data: popularResponse.data || [] });

      case 'recent':
        // Get recently released games
        const currentDate = Math.floor(Date.now() / 1000);
        const oneYearAgo = currentDate - (365 * 24 * 60 * 60); // 1 year ago in seconds
        
        const recentResponse = await client
          .fields(['name', 'slug', 'cover.url', 'first_release_date', 'summary', 'platforms.name', 'genres.name', 'rating', 'rating_count', 'total_rating'])
          .where(`first_release_date > ${oneYearAgo} & first_release_date < ${currentDate} & category = 0`)
          .sort('first_release_date desc')
          .limit(limit)
          .request('/games');

        return NextResponse.json({ data: recentResponse.data || [] });

      case 'getById':
        if (!gameId) {
          return NextResponse.json(
            { error: 'Game ID is required' },
            { status: 400 }
          );
        }

        const gameResponse = await client
          .fields(['name', 'slug', 'cover.url', 'first_release_date', 'summary', 'platforms.name', 'genres.name'])
          .where(`id = ${gameId}`)
          .request('/games');

        return NextResponse.json({ data: gameResponse.data?.[0] || null });

      case 'getCover':
        if (!searchTerm || !searchTerm.trim()) {
          return NextResponse.json({ data: null });
        }

        const coverSearchResponse = await client
          .fields(['name', 'slug', 'cover.url'])
          .search(searchTerm.trim())
          .limit(1)
          .request('/games');

        const game = coverSearchResponse.data?.[0];
        if (game?.cover?.url) {
          const coverUrl = game.cover.url.replace('t_thumb', 't_cover_big');
          return NextResponse.json({ data: `https:${coverUrl}` });
        }

        return NextResponse.json({ data: null });

      case 'getIdByTitle':
        if (!searchTerm || !searchTerm.trim()) {
          return NextResponse.json({ data: null });
        }

        const idSearchResponse = await client
          .fields(['id', 'name'])
          .search(searchTerm.trim())
          .limit(1)
          .request('/games');

        const foundGame = idSearchResponse.data?.[0];
        if (foundGame?.id) {
          return NextResponse.json({ data: foundGame.id });
        }

        return NextResponse.json({ data: null });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('IGDB API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from IGDB' },
      { status: 500 }
    );
  }
} 