# Calorie Tracker

A mobile-first, single-page calorie tracker built with Next.js, TypeScript, and Tailwind CSS. It has no login or database. OpenAI vision analyzes meal photos and returns an estimate for user confirmation.

## Run locally

```bash
npm install
```

Create `.env.local` first:

```bash
OPENAI_API_KEY=your_api_key
npm run dev
```

Open `http://localhost:3000`. Use `npm run build` to create a production build.

## Local storage

The app stores meal entries (including compressed photo data URLs) under `calorie-tracker-meals` and the daily calorie goal under `calorie-tracker-target`. Data stays in the current browser and is not synced or backed up.

Browser localStorage is typically limited to roughly 5–10 MB per origin. Photos are resized to a maximum dimension of 1000 pixels and saved as JPEG at approximately 70% quality, but enough entries can still fill the quota. The app shows an error if a save exceeds it. Clearing site data removes all meals and settings.

## AI integration

The server-only endpoint at `app/api/analyze/route.ts` sends the compressed image and optional user notes to OpenAI. The key never ships to the browser. The model returns a description, ingredient/portion basis, and estimated calories. Users can adjust and must explicitly confirm the estimate before it is saved locally.
