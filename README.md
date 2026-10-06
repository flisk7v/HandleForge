# handleforge — modern username generator

Modern, usable handles — not DarkSlayer99. Built for Twitch / YouTube / gaming / socials.

No build step. Just open `index.html` in a browser. 100% client-side, no dependencies.

## Features

**3 generation modes:**
- **word combos** — real + real (`northloop`, `mistybrook`), length-aware
- **made-up** — pronounceable syllables, 2–3 syllables (`lumora`, `cinathyra`-style)
- **streamer style** — short root + suffix (`rhixxttv`, `imrhix`)

**Customization:**
- base word / seed (optional, e.g. `rhix`)
- vibe: clean / soft-cozy / tech-glitchy
- length: short (4–8) / medium (6–12) / long (12–20) / any (3–20)
- numbers: count (0–3), placement (start / end / random / leet-swap / mixed), style (gamer `404/808/247` / random digits)
- separators: `.` `_` `-` with count control (twitch = `_` only, `_` is safest cross-platform)
- force lowercase + platform-safe cleanup toggles

**Per-name metadata:**
- char count
- platform badge: `twitch + youtube ok` / `youtube ok · not twitch-safe` / `bad length`
- rarity hint: `common — likely taken` / `better odds` / `unique-ish`

**Actions per card:** copy (click name also copies), ☆ save / unsave, ↻ reroll single name. Saved names persist via `localStorage`.

## Usage

Option A — just open it:
```
index.html
```
Double-click or drag into a browser.

Option B — serve locally (avoids clipboard/file:// quirks):
```bash
npx serve .
# or
python -m http.server 8000
```
Then visit `http://localhost:8000` (or `:3000` for `serve`).

## Project structure

```
index.html  — UI: mode tabs, seed/vibe/length, numbers + separators, results + saved
app.js      — all generator logic (word pools, syllable builder, numbers/separators, badges, render + favorites)
style.css   — dark theme, responsive grid
```

No npm, no bundler, no backend.

## How it works (brief)

1. Build a raw name from the active mode + vibe + length.
2. Apply numbers (`app.js:applyNumbers`), then separators (`app.js:applySeparators`).
3. Cleanup (`app.js:platformCleanup`): lowercase (optional), strip illegal chars, collapse doubled separators, trim edges, cap at 24 chars.
4. Retry up to 200x until `fitsLength()` passes, else force-fit fallback.
5. Render 12 unique names. Badge each with `platformBadge()`.

Leet mode (`supreme → supr3me`) falls back to suffix-append if no replaceable letters exist.

## Platform notes

- Twitch usernames: letters, numbers, `_` only, 4–25 chars.
- YouTube handles: letters, numbers, `_` `.` `-`, 3–30 chars.
- Plain dictionary words are almost always taken — add 1–2 numbers / a separator / leet swap.
