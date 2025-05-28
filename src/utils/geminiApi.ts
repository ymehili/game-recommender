import { GoogleGenAI, Schema, Part, Content, Type} from "@google/genai";
import { GameRecommendation, RecommendationRequest } from '@/types';

// Initialize the Gemini API with an API key
// In production, you would want to use environment variables for this
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenAI({ apiKey: API_KEY });

const gameRecommendationSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      title: { type: Type.STRING },
      explanation: { type: Type.STRING },
      matchScore: { type: Type.NUMBER },
    },
    required: ["id", "title", "explanation", "matchScore"],
  },
};

export const generateGameRecommendations = async (
  request: RecommendationRequest
): Promise<GameRecommendation[]> => {
  try {
    if (!API_KEY) {
      throw new Error('API key is not configured');
    }

    // Group games by rating and create descriptive text
    const gamesByRating = request.ratedGames.reduce((acc, game) => {
      if (!acc[game.rating]) acc[game.rating] = [];
      acc[game.rating].push(game.title);
      return acc;
    }, {} as Record<number, string[]>);

    const ratingDescriptions = [];
    
    // Helper function to format rating labels
    const getRatingDescription = (rating: number): string => {
      switch (rating) {
        case 5: return '5-star games (absolutely loved)';
        case 4.5: return '4.5-star games (almost loved)';
        case 4: return '4-star games (really liked)';
        case 3.5: return '3.5-star games (liked quite a bit)';
        case 3: return '3-star games (enjoyed/neutral)';
        case 2.5: return '2.5-star games (mixed feelings)';
        case 2: return '2-star games (didn\'t love)';
        case 1.5: return '1.5-star games (didn\'t really like)';
        case 1: return '1-star games (disliked)';
        case 0.5: return '0.5-star games (really disliked)';
        default: return `${rating}-star games`;
      }
    };

    // Sort ratings in descending order and include all possible ratings
    const possibleRatings = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5];
    
    for (const rating of possibleRatings) {
      if (gamesByRating[rating] && gamesByRating[rating].length > 0) {
        ratingDescriptions.push(`${getRatingDescription(rating)}: ${gamesByRating[rating].join(', ')}`);
      }
    }

    console.log('Games by rating (including half-stars):', gamesByRating);
    console.log('Rating descriptions being sent to AI:', ratingDescriptions);

    const count = request.count || 5; // Default to 5 recommendations

    const prompt = `
    Based on the following user game ratings, please recommend ${count} video games that would best match their preferences.
    
    User's rated games:
    ${ratingDescriptions.join('\n')}

    Analyze the patterns in the user's ratings using this half-star rating system:
    - Games rated 4.5-5 stars: User absolutely loves these games
    - Games rated 3.5-4 stars: User really likes these games  
    - Games rated 2.5-3 stars: User enjoys these games but they're neutral/okay
    - Games rated 1.5-2 stars: User doesn't love these games
    - Games rated 0.5-1 stars: User dislikes these games
    
    Focus on recommending games that would likely receive 4+ star ratings from this user based on their demonstrated preferences.
    Consider genres, themes, gameplay mechanics, art styles, difficulty levels, and other game elements.
    Pay attention to the nuanced differences between similar ratings (e.g., 4 vs 4.5 stars shows stronger preference).
    
    For each recommendation, provide a brief explanation of why it matches their rating patterns.
    Assign a match score (0-100) based on how well it aligns with the user's demonstrated preferences.
    The ID should be a unique string for each game.
    `;

    console.log('Sending prompt to Gemini API:', prompt);

    const parts: Part[] = [{ text: prompt }];
    const contents: Content[] = [{ role: "user", parts}];

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: gameRecommendationSchema,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });

    const text = result.text;

    console.log('Raw API response (should be JSON):', text);

    try {
      if (text === undefined) {
        throw new Error('Received undefined text from API response (structured output).');
      }
      const recommendations = JSON.parse(text) as GameRecommendation[];
      return recommendations;
    } catch (parseError) {
      console.error('JSON parsing error (structured output):', parseError);
      console.error('Failed to parse (structured output):', text);
      throw new Error(`Invalid JSON in API response (structured output): ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
};

export const isApiKeyConfigured = (): boolean => {
  return !!API_KEY;
}; 
