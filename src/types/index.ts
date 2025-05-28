export interface Game {
  id: string;
  title: string;
  coverImage?: string;
  platforms?: Array<{
    id: number;
    name: string;
  }>;
  genres?: Array<{
    id: number;
    name: string;
  }>;
  first_release_date?: number; // IGDB timestamp
}

export interface RatedGame extends Game {
  rating: number; // 0.5-5 stars in 0.5 increments
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