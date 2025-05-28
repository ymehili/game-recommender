import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/utils/auth';
import { kv } from '@vercel/kv';

const NOTES_PREFIX = 'notes:';

interface GameNote {
  id: string;
  gameId: string;
  userId: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

// GET - Retrieve user's note for a specific game
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

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json(
        { success: false, message: 'Game ID is required' },
        { status: 400 }
      );
    }

    // Get the note for this user and game
    const noteKey = `${NOTES_PREFIX}${decoded.userId}:${gameId}`;
    const note = await kv.get<GameNote>(noteKey);

    return NextResponse.json({
      success: true,
      note: note || null,
    });
  } catch (error) {
    console.error('Error getting note:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new note
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

    const body: { gameId: string; note: string } = await request.json();
    
    if (!body.gameId || typeof body.note !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid gameId or note' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const noteId = `${decoded.userId}-${body.gameId}-${Date.now()}`;
    
    const gameNote: GameNote = {
      id: noteId,
      gameId: body.gameId,
      userId: decoded.userId,
      note: body.note,
      createdAt: now,
      updatedAt: now,
    };

    // Save the note
    const noteKey = `${NOTES_PREFIX}${decoded.userId}:${body.gameId}`;
    await kv.set(noteKey, gameNote);

    return NextResponse.json({
      success: true,
      note: gameNote,
    });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 