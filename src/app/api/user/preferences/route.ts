import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserPreferences, updateUserPreferences } from '@/utils/auth';
import { UserPreferences } from '@/types';

export async function GET(request: NextRequest) {
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

    const preferences = await getUserPreferences(decoded.userId);
    if (preferences === null) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body: UserPreferences = await request.json();
    
    // Validate the preferences structure
    if (!body.ratedGames || !Array.isArray(body.ratedGames)) {
      return NextResponse.json(
        { success: false, message: 'Invalid preferences format' },
        { status: 400 }
      );
    }

    const updatedPreferences = await updateUserPreferences(decoded.userId, body);
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
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 