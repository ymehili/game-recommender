import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/types/auth';
import { UserPreferences, RatedGame } from '@/types';
// Import database functions
import {
  createUser as dbCreateUser,
  findUserByEmail as dbFindUserByEmail,
  findUserById as dbFindUserById,
  getUserPreferences as dbGetUserPreferences,
  updateUserPreferences as dbUpdateUserPreferences
} from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

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

// User storage functions using database
export const createUser = async (userData: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<User> => {
  // Hash password before storing
  const hashedPassword = await hashPassword(userData.password);
  const userDataWithHashedPassword = {
    ...userData,
    password: hashedPassword,
  };
  
  return dbCreateUser(userDataWithHashedPassword);
};

export const findUserByEmail = async (email: string): Promise<(User & { password: string }) | null> => {
  return dbFindUserByEmail(email);
};

export const findUserById = async (id: string): Promise<User | null> => {
  return dbFindUserById(id);
};

// User preferences functions
export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  return dbGetUserPreferences(userId);
};

export const updateUserPreferences = async (userId: string, preferences: UserPreferences): Promise<UserPreferences | null> => {
  return dbUpdateUserPreferences(userId, preferences);
};

export const rateGameForUser = async (userId: string, game: RatedGame): Promise<UserPreferences | null> => {
  const currentPreferences = await getUserPreferences(userId);
  if (!currentPreferences) return null;
  
  // Remove existing rating for this game if it exists
  const filteredGames = currentPreferences.ratedGames.filter(g => g.id !== game.id);
  
  // Add the new rating (only if rating > 0)
  const updatedGames = game.rating > 0 
    ? [...filteredGames, { ...game, dateRated: new Date() }]
    : filteredGames;
  
  const updatedPreferences = {
    ...currentPreferences,
    ratedGames: updatedGames
  };
  
  return updateUserPreferences(userId, updatedPreferences);
};

export const removeGameRatingForUser = async (userId: string, gameId: string): Promise<UserPreferences | null> => {
  const currentPreferences = await getUserPreferences(userId);
  if (!currentPreferences) return null;
  
  const updatedPreferences = {
    ...currentPreferences,
    ratedGames: currentPreferences.ratedGames.filter(g => g.id !== gameId)
  };
  
  return updateUserPreferences(userId, updatedPreferences);
};

export const getGameRatingForUser = async (userId: string, gameId: string): Promise<number> => {
  const preferences = await getUserPreferences(userId);
  if (!preferences) return 0;
  
  const ratedGame = preferences.ratedGames.find(g => g.id === gameId);
  return ratedGame ? ratedGame.rating : 0;
}; 