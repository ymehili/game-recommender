import { GoogleGenerativeAI } from '@google/generative-ai';
import { GameRecommendation, RecommendationRequest } from '@/types';

// Initialize the Gemini API with an API key
// In production, you would want to use environment variables for this
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export const generateGameRecommendations = async (
  request: RecommendationRequest
): Promise<GameRecommendation[]> => {
  try {
    if (!API_KEY) {
      throw new Error('API key is not configured');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-04-17' });

    // Format the liked and disliked games into a prompt
    const likedGameTitles = request.likedGames.map(game => game.title).join(', ');
    const dislikedGameTitles = request.dislikedGames.map(game => game.title).join(', ');
    const count = request.count || 5; // Default to 5 recommendations

    const prompt = `
    Based on the following user preferences, please recommend ${count} video games:
    
    Games the user likes: ${likedGameTitles || 'None specified'}
    Games the user dislikes: ${dislikedGameTitles || 'None specified'}
    
    Please respond in the following JSON format:
    [
      {
        "id": "unique-id-1",
        "title": "Game Title 1",
        "explanation": "A brief explanation why this game is recommended based on the user's preferences",
        "matchScore": 90
      },
      ...additional games
    ]
    
    Analyze what elements make the liked games enjoyable and what elements make the disliked games unenjoyable. Recommend games that share positive elements with the liked games and avoid elements from the disliked games.
    For each recommendation, provide a brief explanation of why it matches the user's preferences.
    Assign a match score (0-100) based on how well it aligns with the user's preferences.
    Your response should ONLY contain the JSON array, with no additional text before or after.
    `;

    console.log('Sending prompt to Gemini API:', prompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Raw API response:', text);

    // Extract the JSON from the response
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
    if (!jsonMatch) {
      console.error('Failed to extract JSON from response:', text);
      throw new Error('Could not extract valid JSON from the API response');
    }

    try {
      const jsonText = jsonMatch[0].trim();
      const recommendations = JSON.parse(jsonText) as GameRecommendation[];
      return recommendations;
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Failed to parse:', jsonMatch[0]);
      throw new Error(`Invalid JSON in API response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
};

export const isApiKeyConfigured = (): boolean => {
  return !!API_KEY;
}; 
