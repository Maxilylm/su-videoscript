# VideoScript Studio

> One topic in, a full short-form video package out: hooks, a timestamped script, a storyboard, and CTAs.

**[Live demo](https://su-videoscript.vercel.app)**

Scripting a video means solving four separate problems — the opening hook, the spoken script, what the camera shows, and how you ask for the follow. VideoScript Studio asks Llama 3.3 for all four in one structured response, keyed to the platform you chose so the timestamps match its runtime: 15-60 seconds for TikTok, 60 for Shorts, 30-90 for Reels, or 5-15 minutes for long-form YouTube. Each of the five hooks uses a different persuasion style and comes with an explanation of why it works, so you can pick rather than guess.

## Features

- Five hooks per run in distinct styles — Question, Shock, Story, Stat, Controversial — each with a "why it works" rationale
- Timestamped script sections paired with visual directions
- Storyboard of 4-8 scenes covering duration, on-screen text, visuals, and audio notes
- Three to four CTA options tagged by placement (end, middle, pinned comment)
- Auto-scrolling teleprompter mode for reading the script while filming
- Platform and tone selectors, plus estimated duration, word count, and reading pace
- Tabbed output with copy-to-clipboard throughout

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Groq API — `llama-3.3-70b-versatile` in JSON mode
- Deployed on Vercel

## Running locally

```bash
npm install
npm run dev
```

Requires `GROQ_API_KEY` in `.env.local`, read by the `/api/generate` route.

---

Part of a series of 91 small web apps. [Browse them all](https://su-slopmachine.vercel.app).
