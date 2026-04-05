# Pawsom

A React + Supabase pet adoption dashboard built with Vite, Tailwind, and Supabase.

## Run locally

1. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_ANON_KEY
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## Notes

- The app expects a Supabase table named `animals` and a storage bucket named `animal-photos`.
- If you use Bun instead of npm, run `bun install` after updating dependencies.

