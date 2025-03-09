export interface Game {
  id: string;
  title: string;
  coverImage?: string;
}

export interface GameRecommendation extends Game {
  explanation: string;
  matchScore?: number; // Optional score from 0-100 indicating how well it matches preferences
}

export interface UserPreferences {
  likedGames: Game[];
  dislikedGames: Game[];
}

export interface RecommendationRequest {
  likedGames: Game[];
  dislikedGames: Game[];
  count?: number; // Number of recommendations to return
}

export interface RecommendationResponse {
  recommendations: GameRecommendation[];
  error?: string;
} 