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

    const likedGameTitles = request.likedGames.map(game => game.title).join(', ');
    const dislikedGameTitles = request.dislikedGames.map(game => game.title).join(', ');
    const count = request.count || 5; // Default to 5 recommendations

    const prompt = `
    Based on the following user preferences, please recommend ${count} video games.
    Games the user likes: ${likedGameTitles || 'None specified'}
    Games the user dislikes: ${dislikedGameTitles || 'None specified'}

    Analyze what elements make the liked games enjoyable and what elements make the disliked games unenjoyable. 
    Recommend games that share positive elements with the liked games and avoid elements from the disliked games.
    For each recommendation, provide a brief explanation of why it matches the user's preferences.
    Assign a match score (0-100) based on how well it aligns with the user's preferences.
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
