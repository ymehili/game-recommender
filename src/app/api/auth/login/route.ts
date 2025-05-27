import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, comparePassword, generateToken, validateEmail } from '@/utils/auth';
import { LoginData, AuthResponse } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body: LoginData = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      const response: AuthResponse = {
        success: false,
        message: 'Email and password are required',
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!validateEmail(email)) {
      const response: AuthResponse = {
        success: false,
        message: 'Invalid email format',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      const response: AuthResponse = {
        success: false,
        message: 'Invalid email or password',
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      const response: AuthResponse = {
        success: false,
        message: 'Invalid email or password',
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    const response: AuthResponse = {
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    const response: AuthResponse = {
      success: false,
      message: 'Internal server error',
    };
    return NextResponse.json(response, { status: 500 });
  }
} 