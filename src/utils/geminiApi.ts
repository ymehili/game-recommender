import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerationConfig, Part, Content, Schema, SchemaType } from '@google/generative-ai';
import { GameRecommendation, RecommendationRequest } from '@/types';

// Initialize the Gemini API with an API key
// In production, you would want to use environment variables for this
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

const gameRecommendationSchema: Schema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      id: { type: SchemaType.STRING },
      title: { type: SchemaType.STRING },
      explanation: { type: SchemaType.STRING },
      matchScore: { type: SchemaType.NUMBER },
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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-04-17' });

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

    const generationConfig: GenerationConfig = {
      responseMimeType: "application/json",
      responseSchema: gameRecommendationSchema,
    };

    const parts: Part[] = [{ text: prompt }];
    const contents: Content[] = [{ role: "user", parts }];

    const result = await model.generateContent({
      contents: contents,
      generationConfig: generationConfig,
    });

    const response = await result.response;
    const text = response.text();

    console.log('Raw API response (should be JSON):', text);

    try {
      // The response text should now be a valid JSON string according to the schema
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
