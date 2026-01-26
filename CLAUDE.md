# CLAUDE.md

## Project Overview

**banana.fyi** is an AI-powered presentation generator. Enter a topic, customize the style and tone, and Gemini creates a complete slide deck with generated images. Originally started as a "presentation karaoke" party game, it's now evolving into a full-featured online presentation tool.

## Tech Stack

- **Framework:** Next.js 16 with React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **AI:** Google Gemini 2.0 Flash (text) + Gemini imagen-3.0-generate-002 (images)
- **Other:** dnd-kit (drag-drop), Sonner (toasts), jsPDF (export)

## Architecture

- **API keys stored in browser cookies** - never sent to backend servers (privacy-first)
- **4 concurrent image generation requests** for performance
- **Client-side state** via custom `usePresentation` hook
- **Serverless API routes** under `app/api/`

## Key Files

```
app/
├── page.tsx                 # Main page layout
├── api/
│   ├── generate-outline/    # Creates slide structure & content
│   ├── generate-image-prompts/   # Creates image descriptions
│   ├── generate-image/      # Calls Gemini image model
│   └── check-api-key/       # Validates API key

components/
├── TopicForm.tsx            # Main input form (large - could be split)
├── GridView.tsx             # Slide grid with drag-drop
├── SlideshowView.tsx        # Fullscreen presentation mode
├── SlideEditModal.tsx       # Edit slide content
└── StylePicker.tsx          # 18 visual styles

hooks/
└── usePresentation.ts       # Core state management (generation, editing)

lib/
├── types.ts                 # TypeScript interfaces
├── styles.ts                # Style definitions (Corporate, Retro 80s, etc.)
├── absurdity.ts             # Absurdity levels (0=Factual to 5=Chaos)
├── prompts.ts               # System prompt builders
└── download.ts              # PDF/ZIP export logic
```

## Common Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Features

- Generate presentations with customizable absurdity (0=Factual to 5=Maximum chaos)
- 18 visual styles + custom style option
- Edit slides (title, bullets, images)
- Drag-drop reorder, add/delete slides
- Fullscreen slideshow with keyboard navigation
- Export as PDF or ZIP of PNGs
- Image attachments for context

## Current State

Feature-complete MVP. Clean codebase, no known bugs.

## Potential Next Steps

- **Persistence:** Save presentations to localStorage (currently lost on refresh)
- **Progress indicators:** Show which slide is generating (1/8, 2/8...)
- **Shareable links:** Let others view/present your deck
- **Testing:** No tests yet - good candidate for API routes and state management
- **Mobile:** Slideshow view needs optimization for smaller screens
- **Refactor:** TopicForm.tsx (565 lines) could be split into smaller components
