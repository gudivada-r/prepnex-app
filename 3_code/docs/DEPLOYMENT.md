# Vercel Deployment Guide

This project is configured for a **unified deployment** on [Vercel](https://vercel.com). This means both the React frontend and the FastAPI backend are hosted on the same domain.

## 1. Prerequisites
- A Vercel account.
- [Vercel CLI](https://vercel.com/download) installed (`npm install -g vercel`).
- [Google Gemini API Key](https://aistudio.google.com/app/apikey).

## 2. Deployment Steps

### Method A: Using Vercel CLI (Recommended)
1. Open your terminal in the project root.
2. Run `vercel login` (if not already logged in).
3. Run `vercel`.
   - Follow the prompts to link the project.
   - When asked for "Output Directory" or "Build Command", the settings in `vercel.json` will take care of it automatically.
4. **Environment Variables**:
   Go to the Vercel Dashboard for your project -> Settings -> Environment Variables and add:
   - `GOOGLE_API_KEY`: Your Gemini API key.
   - `DATABASE_URL`: (Optional) Use a persistent DB URL like Neon (Postgres) or Supabase. If left blank, it uses a non-persistent SQLite file at `/tmp/database.db`.

### Method B: GitHub Integration
1. Push this code to a GitHub repository.
2. Import the project in Vercel.
3. Vercel will detect the `vercel.json` and deploy both the API and the Frontend.
4. Add your `GOOGLE_API_KEY` in the Vercel project settings.

## 3. Persistent Database
The current setup uses **SQLite** at `/tmp/database.db` on Vercel. 
**Warning**: This file is ephemeral and will be deleted whenever the serverless function spins down.

For a production app, you should:
1. Provision a free PostgreSQL database on [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com).
2. Add the connection string to Vercel as `DATABASE_URL`.

## 4. Local Development vs Production
- **Local**: Run `npm run dev` in `frontend/` and `uvicorn backend.app.main:app` in the root.
- **Production**: Vercel handles the routing. The frontend is served at `/` and the API at `/api`.
