import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, deleteUser, getDatabaseStats } from '@/utils/database';

// Simple admin authentication (in production, use proper admin authentication)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin-secret-change-this';

function isAdminAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  
  const token = authHeader.replace('Bearer ', '');
  return token === ADMIN_SECRET;
}

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        const stats = await getDatabaseStats();
        return NextResponse.json(stats);

      case 'users':
        const users = await getAllUsers();
        return NextResponse.json({ users });

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use ?action=stats or ?action=users' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const success = await deleteUser(userId);
    
    if (success) {
      return NextResponse.json({ message: 'User deleted successfully' });
    } else {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Admin delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 