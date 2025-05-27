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
    if (gamesByRating[5]) ratingDescriptions.push(`5-star games (absolutely loved): ${gamesByRating[5].join(', ')}`);
    if (gamesByRating[4]) ratingDescriptions.push(`4-star games (really liked): ${gamesByRating[4].join(', ')}`);
    if (gamesByRating[3]) ratingDescriptions.push(`3-star games (enjoyed): ${gamesByRating[3].join(', ')}`);
    if (gamesByRating[2]) ratingDescriptions.push(`2-star games (didn't love): ${gamesByRating[2].join(', ')}`);
    if (gamesByRating[1]) ratingDescriptions.push(`1-star games (disliked): ${gamesByRating[1].join(', ')}`);

    const count = request.count || 5; // Default to 5 recommendations

    const prompt = `
    Based on the following user game ratings, please recommend ${count} video games that would best match their preferences.
    
    User's rated games:
    ${ratingDescriptions.join('\n')}

    Analyze the patterns in the user's ratings:
    - Games rated 4-5 stars likely have elements the user enjoys
    - Games rated 1-2 stars likely have elements the user dislikes  
    - Games rated 3 stars are neutral/okay
    
    Recommend games that would likely receive 4-5 star ratings from this user based on their demonstrated preferences.
    Consider genres, themes, gameplay mechanics, art styles, and other game elements.
    
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
