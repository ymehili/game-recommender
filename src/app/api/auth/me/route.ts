import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, findUserById } from '@/utils/auth';
import { AuthResponse } from '@/types/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response: AuthResponse = {
        success: false,
        message: 'No token provided',
      };
      return NextResponse.json(response, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    if (!decoded) {
      const response: AuthResponse = {
        success: false,
        message: 'Invalid token',
      };
      return NextResponse.json(response, { status: 401 });
    }

    const user = await findUserById(decoded.userId);
    if (!user) {
      const response: AuthResponse = {
        success: false,
        message: 'User not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: AuthResponse = {
      success: true,
      message: 'User authenticated',
      user,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Auth verification error:', error);
    const response: AuthResponse = {
      success: false,
      message: 'Internal server error',
    };
    return NextResponse.json(response, { status: 500 });
  }
} 