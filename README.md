# Project DNA

Project DNA researches comparable public projects, identifies evidence-backed
product gaps, recommends feasible twists, and rescans the revised idea.

## Current vertical slice

- Responsive idea submission form
- Animated research-stage experience
- Differentiation coverage dashboard
- Competitor and feature-overlap views
- Practical, technical, and wild-card twist selection
- Before-and-after rescan comparison
- Deterministic demo corpus label

The current data is deliberately deterministic. The next milestone replaces the
demo corpus with the FastAPI, Apify, OpenAI, and Supabase pipeline.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://127.0.0.1:5173`.

## Build

```bash
pnpm build
```

The app uses the Sites-compatible Vinext runtime and requires Node.js 22.13 or
newer.
