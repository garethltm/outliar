# outLIAR — the social deduction party game

**Blend in. Spot the liar.**
Produced by **@garethltm**.

Everyone gets a secret word on their phone. Most players share the *same* word — the liar gets a *similar but different* one. Give clues, listen for the one that doesn't fit, then vote.

Built with Next.js 16 + Supabase, deployable to Vercel. No app download: players join by QR code or 6-digit room code.

## How a round works
1. Host creates a room (Individual or 2 Teams, player limit, liars, word categories, optional **Blind mode**).
2. Players scan the QR / enter the code and pick a nickname.
3. Host starts the round. Each player **presses and holds** to peek at their word (it hides the moment they let go).
4. A shared **speaking order** appears. Everyone gives one short clue, never saying the word.
5. Host opens voting. Everyone locks in a vote; the host sees live progress and reveals.
6. Reveal shows both words, who the liars were, how the votes landed, points earned and the running scoreboard.

**Scoring** — truth-tellers: **+2** when a liar is caught, **+1** more for voting for a liar. Liars: **+3** for escaping, **+1** for staying hidden while a fellow liar is caught. A tie (or no votes) means the liars escape. In Teams mode the scoreboard also totals each team.

## What's new in this version
- **Rebrand to outLIAR** — new name, logo (a ring of players where one dot steps *out*), favicon, home-screen icons, colour theme, share-preview image (WhatsApp/Telegram/iMessage link cards) and installable web-app manifest.
- **Scoring & scoreboard** across rounds, with team totals.
- **Host can play too** (one phone as host + player), plus **kick** players, players can **leave**, and the host can **end the game**.
- **Blind mode** — liars aren't told their role; they must work it out.
- **Selectable word categories** — choose from 11 everyday topics, Bible topics, and 8 wildcards including myths, space, fantasy, spooky mysteries, superpowers, internet culture, strange snacks, and history; selected topics are mixed together. The word bank has no repeats within a room and random civilian/liar word assignment.
- **Press-and-hold to peek** at your word (shoulder-surfing protection); auto-hides on new phase or when the tab is hidden.
- **Speaking order** (identical on every phone) and a **phase timer**.
- **Voting upgrades** — vote lock-in confirmation, live "votes in" progress bar, per-player ✓ markers, "Reveal anyway" when someone is stalling, and a vote breakdown on reveal.
- **Fair-play rules enforced** — liars must always be a minority (1 liar needs 3+ players in Individual mode and 3+ per team in Teams mode).
- **Robustness** — duplicate nicknames rejected, phase guards (no double-start / out-of-order actions), balanced team assignment, unbiased shuffle, cryptographically random room codes, room-code collision retry, best-effort rate limiting, polling pauses on hidden tabs, helpful messages when a room closes or you're removed.

## Requirements
- Node.js 20+
- A Supabase project
- A Vercel account (for deployment)

## 1. Install
```bash
npm install
cp .env.example .env.local
```
Fill `.env.local` (Supabase URL, anon key, service-role key, a random `TOKEN_SECRET`, and your site URL). Generate a secret with `openssl rand -hex 32`.

## 2. Set up Supabase
- **New project:** SQL Editor → run `supabase/schema.sql`.
- **Already running the original UNDERCOVER version:** SQL Editor → run `supabase/migration-v2.sql` first, then `supabase/migration-v3.sql`, `supabase/migration-v5.sql`, and `supabase/migration-v6.sql`.
- **Already running an earlier outLIAR schema:** SQL Editor → run `supabase/migration-v5.sql` and `supabase/migration-v6.sql` to update the selectable word topics. Run `supabase/migration-v3.sql` as well if you have not already applied it.
- Keep the service-role key private — never prefix it with `NEXT_PUBLIC_`.

## 3. Run locally
```bash
npm run dev
```
Open `http://localhost:3000`. For phone testing on the same Wi-Fi use your computer's LAN IP. For real parties, deploy to Vercel.

## 4. Deploy to Vercel
1. Push this folder to a (private) GitHub repo and import it in Vercel.
2. Add every variable from `.env.example` under Settings → Environment Variables.
3. Set `NEXT_PUBLIC_SITE_URL` to your deployed URL (e.g. `https://outliar.vercel.app`) — it powers the QR code, invite links and the share-preview image.
4. Deploy. Tip: players can "Add to Home Screen" for a full-screen, bar-free experience.

## Housekeeping
Supabase Cron is configured to periodically delete rooms older than 24 hours. Review the job and its run history in **Supabase Dashboard → Integrations → Cron → Jobs**. Deleting a room also removes its related game data.

To run the cleanup manually:
```sql
delete from public.rooms where created_at < now() - interval '24 hours';
```

## Notes
- State updates use polling (every 2 s, paused when the tab is hidden) rather than Realtime — simple and reliable for party-sized groups.
- Secret words live in a server-only table and are returned only to the matching player's token; in Blind mode the role is also withheld until the reveal. RLS is on with no client policies; every database call goes through the route handlers using the service role key.
- Rate limiting is best-effort (in-memory per server instance). For a large public launch, add a shared limiter (e.g. Upstash) and automated tests.
- Database column names (`imposter_count`, `is_imposter`) are unchanged from the original so existing data keeps working; the UI calls them "liars".

---
**outLIAR** · Produced by **@garethltm**
