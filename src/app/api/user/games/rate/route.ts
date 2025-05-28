import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, rateGameForUser } from '@/utils/auth';
import { Game } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const body: { game: Game; rating: number } = await request.json();
    
    // Validate input
    if (!body.game || typeof body.rating !== 'number') {
      return NextResponse.json(
        { success: false, message: 'Invalid game or rating data' },
        { status: 400 }
      );
    }

    // Validate rating range and half-star increments
    if (body.rating < 0 || body.rating > 5 || (body.rating * 2) % 1 !== 0) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 0 and 5 in half-star increments (0, 0.5, 1, 1.5, etc.)' },
        { status: 400 }
      );
    }

    // Create rated game object
    const ratedGame = {
      ...body.game,
      rating: body.rating,
      dateRated: new Date(),
    };

    const updatedPreferences = await rateGameForUser(decoded.userId, ratedGame);
    if (updatedPreferences === null) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences,
    });
  } catch (error) {
    console.error('Error rating game:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 