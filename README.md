# TowGo

TowGo is an intelligent business discovery platform that leverages advanced AI and geolocation technologies to provide comprehensive, context-aware local search experiences, focusing on tow truck services.

🚀 **Live Demo**: [TowGo on Replit](https://towgo.replit.app)

📦 **Full Source Code**: [Download ZIP](https://github.com/mrmoe28/towgo/raw/main/towgo.zip)

## Features

- 🚗 Tow truck search by location
- 📍 Real-time geolocation tracking
- 🤖 AI-powered contextual search with Perplexity
- 🗺️ Google Maps integration
- 📱 Mobile-friendly responsive design
- 📸 Vehicle photo upload
- 📢 Social sharing features
- 🏆 Achievements and rewards system
- 👥 Referral program
- 🎨 Beautiful UI with animated gradients

## Tech Stack

- React with TypeScript
- Express.js backend
- PostgreSQL database
- Perplexity API for AI contextual search
- Google Maps API for location services
- shadcn/ui for UI components
- Tailwind CSS for styling
- Vite for fast development

## Getting Started

### Prerequisites

- Node.js 
- PostgreSQL database
- Google Maps API key
- Perplexity API key

### Installation

1. Clone the repository
```
git clone https://github.com/mrmoe28/towgo.git
cd towgo
```

2. Install dependencies
```
npm install
```

3. Create a `.env` file with your API keys
```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
DATABASE_URL=your_database_url
```

4. Start the development server
```
npm run dev
```

5. Open your browser to `http://localhost:5000`

## Deployment Options

### Vercel Deployment

This project includes configuration for easy deployment to Vercel:

1. Push your code to GitHub (or use the provided bundled code)
2. Set up a new project in Vercel linked to your GitHub repository
3. Configure environment variables in Vercel project settings
4. Deploy!

For detailed instructions, see [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md).

### Alternative Deployment Methods

If you prefer not to use GitHub or have issues with repository size, you can use:

- **Git Bundle**: Clone from the provided `towgo.bundle` file (62MB)
```
git clone towgo.bundle -b main towgo
```

- **Zip Archive**: Extract the `towgo.zip` file (79MB) to your preferred location

## GitHub Integration

Due to size limitations and GitHub integration challenges with Replit, this repository includes documentation on how to manage the code:

1. **[GITHUB_SETUP.md](GITHUB_SETUP.md)** - Instructions for pushing the code to GitHub
2. **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** - Instructions for deploying to Vercel
3. **towgo.bundle** - Git bundle for easy cloning (62MB)
4. **towgo.zip** - Complete source code archive (79MB)

For detailed instructions on setting up GitHub with this codebase, see [GITHUB_SETUP.md](GITHUB_SETUP.md).

## License

MIT

## Acknowledgments

- Built with [Replit](https://replit.com)
- Uses Perplexity AI for advanced contextual search
- Google Maps Platform for geolocation services