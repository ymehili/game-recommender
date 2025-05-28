import { NextRequest, NextResponse } from 'next/server';
import { generateGameRecommendations, isApiKeyConfigured } from '@/utils/geminiApi';
import { RecommendationRequest, RecommendationResponse } from '@/types';
import { verifyToken, getUserPreferences, updateUserPreferences } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!isApiKeyConfigured()) {
      console.error('API key not configured');
      return NextResponse.json(
        { 
          recommendations: [],
          error: 'Gemini API key is not configured. Please set the NEXT_PUBLIC_GEMINI_API_KEY environment variable.' 
        } as RecommendationResponse,
        { status: 500 }
      );
    }

    // Check authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          recommendations: [],
          error: 'Authentication required for personalized recommendations' 
        } as RecommendationResponse,
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { 
          recommendations: [],
          error: 'Invalid authentication token' 
        } as RecommendationResponse,
        { status: 401 }
      );
    }

    // Get user preferences to check last refresh time
    const userPreferences = await getUserPreferences(decoded.userId);
    if (!userPreferences) {
      return NextResponse.json(
        { 
          recommendations: [],
          error: 'User preferences not found' 
        } as RecommendationResponse,
        { status: 404 }
      );
    }

    // Parse request body
    let requestData: RecommendationRequest;
    try {
      requestData = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request JSON:', parseError);
      return NextResponse.json(
        { 
          recommendations: [],
          error: 'Invalid request format: Could not parse JSON body' 
        } as RecommendationResponse,
        { status: 400 }
      );
    }

    // Validate request
    if (!requestData.ratedGames || requestData.ratedGames.length === 0) {
      return NextResponse.json(
        { 
          recommendations: [],
          error: 'Please provide at least one rated game for recommendations.' 
        } as RecommendationResponse,
        { status: 400 }
      );
    }

    const now = new Date();
    const lastRefresh = userPreferences.lastRecommendationRefresh;
    
    // Check if we have cached recommendations that are less than 24 hours old
    if (lastRefresh && userPreferences.cachedRecommendations && userPreferences.cachedRecommendations.length > 0) {
      const timeSinceLastRefresh = now.getTime() - new Date(lastRefresh).getTime();
      const hoursElapsed = timeSinceLastRefresh / (1000 * 60 * 60);
      
      if (hoursElapsed < 24) {
        // Return cached recommendations
        return NextResponse.json({ 
          recommendations: userPreferences.cachedRecommendations 
        } as RecommendationResponse);
      }
    }

    // Generate new recommendations
    const recommendations = await generateGameRecommendations(requestData);

    // Update the last refresh timestamp and store the recommendations
    const updatedPreferences = {
      ...userPreferences,
      lastRecommendationRefresh: now,
      cachedRecommendations: recommendations
    };
    
    await updateUserPreferences(decoded.userId, updatedPreferences);

    // Return response
    return NextResponse.json({ recommendations } as RecommendationResponse);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        recommendations: [],
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      } as RecommendationResponse,
      { status: 500 }
    );
  }
} 