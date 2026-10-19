# EROS Path Finder

A-Level subjects → grouped fields → matching programmes, with motivational explanations,
advantages/disadvantages, full details and an AI helper (EROS).

## Structure
- `public/index.html` – the whole front end (subject picker, results, chat panel)
- `public/programmes.json` – ALL content: subject groups + programmes (edit this to grow the app)
- `api/chat.js` – serverless endpoint that calls Claude; holds the API key safely on the server

## Run it
1. Get an API key at console.anthropic.com.
2. `npm i -g vercel`, then in this folder: `vercel dev` (set `ANTHROPIC_API_KEY` when asked, or put it in `.env`).
3. Deploy: `vercel --prod`, and add `ANTHROPIC_API_KEY` under Project → Settings → Environment Variables.

## Adding programmes
Each entry in `programmes.json` has: `n` name, `g` group id, `s` key subjects, `e` emoji, `t` tagline,
`m` motivation, `p` advantages, `c` disadvantages, `j` careers, and optional `d` (full details:
study, entry, cost, dur, where, comp, day, sal, suits, alt). Entries with `d` show a "Full details"
section and give the AI much better answers. Fill `d` for every programme before launch.

## Before real students use it
- Replace sample content with verified data for your country (entry requirements, fees, institutions).
- Add real photos (planned `img` field) in place of the emoji banners.
- Add rate limiting on `/api/chat` (e.g. Vercel Firewall or Upstash) to control AI cost.
- Next step: move `programmes.json` into a database (Supabase) and add accounts and saved shortlists.
