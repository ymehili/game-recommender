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

// PUT - Update an existing note
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ noteId: string }> }
) {
  try {
    const params = await context.params;
    const noteId = params.noteId;
    
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

    // Get the existing note to check ownership
    const noteKey = `${NOTES_PREFIX}${decoded.userId}:${body.gameId}`;
    const existingNote = await kv.get<GameNote>(noteKey);

    if (!existingNote) {
      return NextResponse.json(
        { success: false, message: 'Note not found' },
        { status: 404 }
      );
    }

    if (existingNote.userId !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update the note
    const updatedNote: GameNote = {
      ...existingNote,
      note: body.note,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(noteKey, updatedNote);

    return NextResponse.json({
      success: true,
      note: updatedNote,
    });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 