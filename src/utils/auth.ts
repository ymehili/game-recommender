import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Simple in-memory storage for users (in production, use a proper database)
let users: User[] = [];

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  return { isValid: true, message: 'Password is valid' };
};

// User storage functions (replace with database operations in production)
export const createUser = async (userData: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<User> => {
  const user: User = {
    id: Math.random().toString(36).substr(2, 9),
    email: userData.email,
    username: userData.username,
    createdAt: new Date().toISOString(),
  };
  
  // Store user with hashed password
  const userWithPassword = {
    ...user,
    password: await hashPassword(userData.password),
  };
  
  users.push(userWithPassword as any);
  return user;
};

export const findUserByEmail = async (email: string): Promise<(User & { password: string }) | null> => {
  return (users as any[]).find(user => user.email === email) || null;
};

export const findUserById = async (id: string): Promise<User | null> => {
  const user = (users as any[]).find(user => user.id === id);
  if (!user) return null;
  
  // Return user without password
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}; 