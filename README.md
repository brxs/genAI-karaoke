# Presentation Karaoke

An AI-powered party game where you present slides you've never seen before. Enter any topic, and AI generates absurd presentation slides that you must present with a straight face.

## Features

- **AI-Generated Slides** - Google Gemini creates unique presentations on any topic
- **18 Visual Styles** - From corporate to cyberpunk, kawaii to horror
- **Adjustable Absurdity** - Control how ridiculous the content gets
- **Custom Styles** - Define your own visual style with a text prompt
- **Grid & Slideshow Views** - Browse or present your slides
- **Keyboard Navigation** - Arrow keys, Space, Escape for smooth presenting
- **Download Slides** - Save individual slides or the entire presentation
- **Retry Failed Images** - Regenerate any slide that fails

## Getting Started

### Prerequisites

- Node.js 18+
- A Google AI API key ([get one here](https://aistudio.google.com/apikey))

### Installation

```bash
# Clone the repo
git clone https://github.com/brxs/genAI-karaoke.git
cd genAI-karaoke

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enter your Google AI API key when prompted.

## How to Play

1. **Enter a topic** - Any subject works: "quantum physics", "why cats are better than dogs", "the history of pizza"
2. **Pick a style** - Choose from 18 visual styles or create your own
3. **Adjust settings** - Set absurdity level, slide count, and bullet points
4. **Generate** - Wait ~30 seconds for AI to create your presentation
5. **Present!** - Click slideshow view and try to present with a straight face

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework
- [Google Gemini API](https://ai.google.dev/) - AI text and image generation
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/brxs/genAI-karaoke)

Or deploy manually:

```bash
npm run build
vercel deploy
```

## Privacy

Your API key is stored only in your browser's cookies and is never sent to any server except Google's AI API. Each user provides their own API key.

## License

MIT
