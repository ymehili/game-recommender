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
    if (!requestData.likedGames && !requestData.dislikedGames) {
      return NextResponse.json(
        { 
          recommendations: [],
          error: 'Please provide at least one liked or disliked game for recommendations.' 
        } as RecommendationResponse,
        { status: 400 }
      );
    }

    // Generate recommendations
    const recommendations = await generateGameRecommendations(requestData);

    // Return response
    return NextResponse.json({ recommendations } as RecommendationResponse);
  } catch (error) {
    console.error('Error in recommendation API:', error);
    
    // Handle specific errors
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          recommendations: [],
          error: `Error generating recommendations: ${error.message}` 
        } as RecommendationResponse,
        { status: 500 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { 
        recommendations: [],
        error: 'An unexpected error occurred while generating recommendations.' 
      } as RecommendationResponse,
      { status: 500 }
    );
  }
} 