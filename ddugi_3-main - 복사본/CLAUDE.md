# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Travel AI Service (GuideGeek clone) that provides personalized travel recommendations using Claude API and Brave Search API. It's a full-stack TypeScript application with React frontend and Node.js/Express backend.

## Development Commands

### Backend (travel-ai-service/backend/)
```bash
npm run dev      # Start development server with hot reload (port 3001)
npm run build    # Compile TypeScript to JavaScript
npm run start    # Run production server
npm run lint     # Run ESLint on .ts files
npm run test     # Run Jest tests
```

### Frontend (travel-ai-service/frontend/)
```bash
npm run dev        # Start Vite dev server (port 5173)
npm run build      # Build for production (TypeScript check + Vite build)
npm run preview    # Preview production build
npm run lint       # Run ESLint on .ts and .tsx files
npm run type-check # TypeScript type checking without emit
```

## Architecture Overview

### Three-Layer Structure
1. **Frontend** (`/frontend`): React + TypeScript + Vite application
   - Uses Zustand for state management
   - React Query for server state
   - Tailwind CSS for styling
   - Path aliases configured (@components, @pages, @services, etc.)

2. **Backend** (`/backend`): Node.js + Express + TypeScript API server
   - Controllers handle HTTP requests
   - Services contain business logic (AI integration, search)
   - Middleware for validation, rate limiting, error handling
   - Integrates with Claude API (@anthropic-ai/sdk) and Google Custom Search API

3. **Shared** (`/shared`): Common TypeScript type definitions
   - Core interfaces: TravelQuery, Itinerary, ChatMessage, etc.
   - Shared between frontend and backend for type safety

### API Integration Points

#### Claude API Integration
- Service: `backend/src/services/aiService.ts`
- Model: `claude-3-5-sonnet-20241022`
- Used for: Travel recommendations, itinerary generation, chat interactions

#### Google Custom Search API Integration  
- Service: `backend/src/services/searchService.ts`
- Used for: Real-time web search for places, restaurants, attractions

### Key API Endpoints
- `POST /api/chat` - AI conversation
- `POST /api/travel/itinerary` - Generate travel itinerary
- `GET /api/travel/recommendations` - Get recommendations
- `POST /api/search` - Web search

## Environment Configuration

### Required API Keys
Backend `.env` must have:
- `ANTHROPIC_API_KEY` - Claude API key
- `GOOGLE_SEARCH_API_KEY` - Google Custom Search API key
- `GOOGLE_SEARCH_ENGINE_ID` - Google Custom Search Engine ID

### Port Configuration
- Backend: 3001
- Frontend: 5173 (proxies `/api` to backend)

## Type System

All shared types are in `/shared/types/index.ts`. Key interfaces:
- `TravelQuery` - User's travel request parameters
- `Itinerary` - Complete travel plan with days, activities, budget
- `ChatMessage` - Chat interaction structure
- `ApiResponse<T>` - Standardized API response wrapper

## Development Workflow

1. **Always run both servers**: Backend and Frontend need to run simultaneously
2. **Type safety**: Changes to shared types affect both frontend and backend
3. **API calls**: Frontend uses axios, all API calls go through `/api` proxy
4. **State management**: 
   - Frontend: Zustand for client state, React Query for server state
   - Backend: Stateless, relies on request/response cycle

## Activity Logging

When implementing features or fixing issues:
1. Track all code changes with clear commit messages
2. Document API endpoint changes
3. Update shared types when modifying data structures
4. Test both frontend and backend after changes
5. Ensure environment variables are documented in `.env.example`