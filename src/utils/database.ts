import { kv } from '@vercel/kv';
import { User } from '@/types/auth';
import { UserPreferences } from '@/types';

// Database keys
const USERS_KEY = 'users';
const USER_PREFIX = 'user:';
const USER_EMAIL_PREFIX = 'user_email:';
const USER_PREFERENCES_PREFIX = 'preferences:';

// User storage functions using Vercel KV
export const createUser = async (userData: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<User> => {
  const user: User = {
    id: Math.random().toString(36).substr(2, 9),
    email: userData.email,
    username: userData.username,
    createdAt: new Date().toISOString(),
  };
  
  // Store user with password
  const userWithPassword = {
    ...user,
    password: userData.password,
  };
  
  // Store user data
  await kv.set(`${USER_PREFIX}${user.id}`, userWithPassword);
  // Store email to ID mapping for fast lookup
  await kv.set(`${USER_EMAIL_PREFIX}${userData.email}`, user.id);
  // Initialize empty preferences
  await kv.set(`${USER_PREFERENCES_PREFIX}${user.id}`, { ratedGames: [] });
  
  return user;
};

export const findUserByEmail = async (email: string): Promise<(User & { password: string }) | null> => {
  try {
    // Get user ID from email mapping
    const userId = await kv.get<string>(`${USER_EMAIL_PREFIX}${email}`);
    if (!userId) return null;
    
    // Get user data
    const user = await kv.get<User & { password: string }>(`${USER_PREFIX}${userId}`);
    return user || null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
};

export const findUserById = async (id: string): Promise<User | null> => {
  try {
    const user = await kv.get<User & { password: string }>(`${USER_PREFIX}${id}`);
    if (!user) return null;
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
};

// User preferences functions
export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  try {
    const preferences = await kv.get<UserPreferences>(`${USER_PREFERENCES_PREFIX}${userId}`);
    
    if (!preferences) {
      return { ratedGames: [] };
    }
    
    // Ensure lastRecommendationRefresh is properly converted to Date if it exists
    if (preferences.lastRecommendationRefresh && typeof preferences.lastRecommendationRefresh === 'string') {
      preferences.lastRecommendationRefresh = new Date(preferences.lastRecommendationRefresh);
    }
    
    // Ensure cachedRecommendations exist (for migration)
    if (!preferences.cachedRecommendations) {
      preferences.cachedRecommendations = undefined;
    }
    
    return preferences;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
};

export const updateUserPreferences = async (userId: string, preferences: UserPreferences): Promise<UserPreferences | null> => {
  try {
    await kv.set(`${USER_PREFERENCES_PREFIX}${userId}`, preferences);
    return preferences;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return null;
  }
};

// Admin functions for viewing/managing data
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const keys = await kv.keys(`${USER_PREFIX}*`);
    const users: User[] = [];
    
    for (const key of keys) {
      const user = await kv.get<User & { password: string }>(key);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        users.push(userWithoutPassword);
      }
    }
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const user = await kv.get<User & { password: string }>(`${USER_PREFIX}${userId}`);
    if (!user) return false;
    
    // Delete user data
    await kv.del(`${USER_PREFIX}${userId}`);
    // Delete email mapping
    await kv.del(`${USER_EMAIL_PREFIX}${user.email}`);
    // Delete preferences
    await kv.del(`${USER_PREFERENCES_PREFIX}${userId}`);
    
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

// Database stats
export const getDatabaseStats = async () => {
  try {
    const userKeys = await kv.keys(`${USER_PREFIX}*`);
    const preferencesKeys = await kv.keys(`${USER_PREFERENCES_PREFIX}*`);
    
    return {
      totalUsers: userKeys.length,
      totalPreferences: preferencesKeys.length,
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return {
      totalUsers: 0,
      totalPreferences: 0,
    };
  }
}; 