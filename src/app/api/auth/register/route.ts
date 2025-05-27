import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail, generateToken, validateEmail, validatePassword } from '@/utils/auth';
import { RegisterData, AuthResponse } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json();
    const { username, email, password, confirmPassword } = body;

    // Validate input
    if (!username || !email || !password || !confirmPassword) {
      const response: AuthResponse = {
        success: false,
        message: 'All fields are required',
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (username.length < 3) {
      const response: AuthResponse = {
        success: false,
        message: 'Username must be at least 3 characters long',
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

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      const response: AuthResponse = {
        success: false,
        message: passwordValidation.message,
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (password !== confirmPassword) {
      const response: AuthResponse = {
        success: false,
        message: 'Passwords do not match',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      const response: AuthResponse = {
        success: false,
        message: 'User with this email already exists',
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Create new user
    const newUser = await createUser({
      username,
      email,
      password,
    });

    // Generate token
    const token = generateToken(newUser.id);

    const response: AuthResponse = {
      success: true,
      message: 'Registration successful',
      user: newUser,
      token,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    const response: AuthResponse = {
      success: false,
      message: 'Internal server error',
    };
    return NextResponse.json(response, { status: 500 });
  }
} 