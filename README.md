# BrainBoost - 5-Minute Brain Training

A browser-based cognitive training app with multiple 5-minute challenges designed to exercise different areas of your brain. Perfect for short breaks or daily mental workouts.

## Features

- **Multiple Game Types**: Choose from Memory Match, Speed Math, Pattern Recognition, Word Scramble, and Reaction Test
- **Adjustable Difficulty**: Select a difficulty level that matches your skill
- **Score Tracking**: Keep track of high scores across all games
- **Timer System**: Every game is designed to fit within a 5-minute session
- **Progressive Levels**: Games get harder as you complete levels
- **Sound Effects**: Audio feedback to enhance user experience (with mute option)

## Games

1. **Memory Match**: Flip and match pairs of cards to test your visual memory
2. **Speed Math**: Solve math problems quickly to challenge your numerical processing
3. **Pattern Recognition**: Identify patterns to exercise your logical thinking
4. **Word Scramble**: Unscramble words to improve your verbal processing
5. **Reaction Test**: Test your reaction time with timed challenges

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **State Management**: Zustand, React Context
- **Backend**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Bundling**: Vite

## Running Locally

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/brainboost.git
   cd brainboost
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5000`

## Project Structure

```
├── client/               # Frontend React application
│   ├── public/           # Static assets
│   └── src/              # React components and logic
│       ├── components/   # UI components
│       ├── context/      # React context providers
│       ├── games/        # Individual game implementations
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utilities and stores
│       └── types/        # TypeScript type definitions
├── server/               # Backend Express server
├── shared/               # Shared code between client and server
└── README.md            # This file
```

## Development

### Building for Production

```bash
npm run build
# or
yarn build
```

### Starting Production Server

```bash
npm run start
# or
yarn start
```

## License

MIT
