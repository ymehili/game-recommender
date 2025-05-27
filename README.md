# AI Game Recommender

An intelligent game recommendation system that learns from your preferences to suggest new games you might enjoy. Built with Next.js, TypeScript, and powered by Google Gemini AI.

## Features

- **Personalized Recommendations**: Add games you like and dislike to get tailored suggestions
- **AI-Powered Analysis**: Uses Google Gemini AI to understand your gaming preferences and generate relevant recommendations  
- **Game Search Integration**: Search and add games with covers using the IGDB API
- **Smart Persistence**: Your preferences are saved locally and persist between sessions
- **Dark Mode Support**: Responsive design that works in both light and dark themes
- **Match Scoring**: See how well each recommendation matches your stated preferences

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn package manager
- Google Gemini API key
- IGDB/Twitch API credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-game-recommender.git
   cd ai-game-recommender
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   NEXT_PUBLIC_TWITCH_CLIENT_ID=your_twitch_client_id_here
   NEXT_PUBLIC_TWITCH_ACCESS_TOKEN=your_twitch_access_token_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Keys Setup

### Google Gemini API

1. Visit the [Google AI Studio](https://ai.google.dev/gemini-api)
2. Create a new API key
3. Add it to your `.env.local` file as `NEXT_PUBLIC_GEMINI_API_KEY`

### IGDB API (via Twitch)

To use game covers and search functionality, you need IGDB API access through Twitch:

1. **Register a Twitch Application**:
   - Go to [Twitch Developers Console](https://dev.twitch.tv/console)
   - Create a new application
   - Set OAuth Redirect URLs to `http://localhost:3000` (for development)
   - Note down your Client ID

2. **Get an Access Token**:
   ```bash
   curl -X POST 'https://id.twitch.tv/oauth2/token' \
   -H 'Content-Type: application/x-www-form-urlencoded' \
   -d 'client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&grant_type=client_credentials'
   ```

3. **Add to your `.env.local` file**:
   ```env
   NEXT_PUBLIC_TWITCH_CLIENT_ID=your_twitch_client_id_here
   NEXT_PUBLIC_TWITCH_ACCESS_TOKEN=your_twitch_access_token_here
   ```

## Usage

1. **Add Games**: Use the search form to find and add games you like or dislike
2. **Get Recommendations**: The AI will automatically generate recommendations based on your preferences
3. **Refine Your Profile**: Continue adding games to improve recommendation accuracy
4. **Explore Suggestions**: View detailed explanations for why each game was recommended

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini AI API
- **Game Data**: IGDB API (Internet Game Database)
- **Icons**: React Icons
- **Deployment**: Vercel (recommended)

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
├── contexts/           # React contexts (preferences management)
├── types/              # TypeScript type definitions
└── utils/              # Utility functions (API calls, local storage)
```

## Technologies Used

- **Next.js**: Full-stack React framework
- **TypeScript**: For type safety and developer experience
- **Tailwind CSS**: For responsive styling
- **Google Gemini AI**: For game analysis and recommendation generation
- **React Icons**: For UI elements
- **LocalStorage**: For persisting user preferences between sessions

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Google Gemini AI](https://ai.google.dev/gemini-api) for powering the recommendation engine
- [Next.js](https://nextjs.org/) for the application framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [IGDB](https://www.igdb.com/) for comprehensive game data
