# AI Game Recommender - Powered by Gemini AI

A web application that recommends video games based on your preferences using the Gemini AI API.

## Features

- **User Preference Management**: Create and manage two lists - "Games I Liked" and "Games I Disliked"
- **AI-Powered Recommendations**: Get personalized game recommendations based on your preferences
- **Smart Analysis**: The app analyzes what you love about your favorite games and avoids recommending games with elements you dislike
- **Explanations**: Each recommendation comes with an explanation of why it might appeal to you
- **Match Scores**: See how closely each recommendation matches your preferences
- **Responsive Design**: Works great on desktop and mobile devices
- **Persistence**: Your game lists are saved between sessions

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Gemini API key from Google AI Studio

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/game-recommender.git
cd game-recommender
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file in the root directory with:
```
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

## How It Works

1. **Add games to your lists**: Type in game titles you've played and add them to your "Liked" or "Disliked" lists
2. **Get recommendations**: Based on your preferences, the app will analyze patterns in your choices
3. **Explore new games**: Review recommendations along with explanations of why they might suit your taste
4. **Refine your lists**: As you play more games, continue updating your lists for better recommendations

## Technologies Used

- **Next.js**: React framework for building the application
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
# RAWG API Configuration
To use game covers, you need to get a free API key from https://rawg.io/apikey and add it to your .env.local file:
```
NEXT_PUBLIC_RAWG_API_KEY=your_rawg_api_key_here
```
