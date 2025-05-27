import { NextRequest, NextResponse } from 'next/server';
import { generateGameRecommendations, isApiKeyConfigured } from '@/utils/geminiApi';
import { RecommendationRequest, RecommendationResponse } from '@/types';

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

    // Generate recommendations
    const recommendations = await generateGameRecommendations(requestData);

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