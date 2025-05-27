import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/types/auth';
import { UserPreferences, RatedGame } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Simple in-memory storage for users (in production, use a proper database)
let users: (User & { password: string; preferences: UserPreferences })[] = [];

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
  
  // Store user with hashed password and empty preferences
  const userWithPassword = {
    ...user,
    password: await hashPassword(userData.password),
    preferences: { ratedGames: [] } as UserPreferences,
  };
  
  users.push(userWithPassword);
  return user;
};

export const findUserByEmail = async (email: string): Promise<(User & { password: string }) | null> => {
  const user = users.find(user => user.email === email);
  if (!user) return null;
  
  // Return user without preferences for authentication
  const { preferences, ...userWithoutPreferences } = user;
  return userWithoutPreferences as User & { password: string };
};

export const findUserById = async (id: string): Promise<User | null> => {
  const user = users.find(user => user.id === id);
  if (!user) return null;
  
  // Return user without password and preferences
  const { password, preferences, ...userWithoutSensitiveData } = user;
  return userWithoutSensitiveData;
};

// User preferences functions
export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  const user = users.find(user => user.id === userId);
  return user ? user.preferences : null;
};

export const updateUserPreferences = async (userId: string, preferences: UserPreferences): Promise<UserPreferences | null> => {
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) return null;
  
  users[userIndex].preferences = preferences;
  return preferences;
};

export const rateGameForUser = async (userId: string, game: RatedGame): Promise<UserPreferences | null> => {
  const user = users.find(user => user.id === userId);
  if (!user) return null;
  
  // Remove existing rating for this game if it exists
  const filteredGames = user.preferences.ratedGames.filter(g => g.id !== game.id);
  
  // Add the new rating (only if rating > 0)
  const updatedGames = game.rating > 0 
    ? [...filteredGames, { ...game, dateRated: new Date() }]
    : filteredGames;
  
  user.preferences.ratedGames = updatedGames;
  return user.preferences;
};

export const removeGameRatingForUser = async (userId: string, gameId: string): Promise<UserPreferences | null> => {
  const user = users.find(user => user.id === userId);
  if (!user) return null;
  
  user.preferences.ratedGames = user.preferences.ratedGames.filter(g => g.id !== gameId);
  return user.preferences;
};

export const getGameRatingForUser = async (userId: string, gameId: string): Promise<number> => {
  const user = users.find(user => user.id === userId);
  if (!user) return 0;
  
  const ratedGame = user.preferences.ratedGames.find(g => g.id === gameId);
  return ratedGame ? ratedGame.rating : 0;
}; 