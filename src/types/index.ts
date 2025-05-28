export interface Game {
  id: string;
  title: string;
  coverImage?: string;
}

export interface RatedGame extends Game {
  rating: number; // 1-5 stars
  dateRated?: Date;
}

export interface GameRecommendation extends Game {
  explanation: string;
  matchScore?: number; // Optional score from 0-100 indicating how well it matches preferences
}

export interface GameNote {
  id: string;
  gameId: string;
  userId: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  ratedGames: RatedGame[];
}

export interface RecommendationRequest {
  ratedGames: RatedGame[];
  count?: number; // Number of recommendations to return
}

export interface RecommendationResponse {
  recommendations: GameRecommendation[];
  error?: string;
} 