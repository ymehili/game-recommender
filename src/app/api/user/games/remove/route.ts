import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, removeGameRatingForUser } from '@/utils/auth';

export async function DELETE(request: NextRequest) {
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

    const body: { gameId: string } = await request.json();
    
    // Validate input
    if (!body.gameId) {
      return NextResponse.json(
        { success: false, message: 'Game ID is required' },
        { status: 400 }
      );
    }

    const updatedPreferences = await removeGameRatingForUser(decoded.userId, body.gameId);
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
    console.error('Error removing game rating:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 