# Fantasy Pomodoro Timer — Technical Spec

## Stack

| Tool | Purpose | Docs |
|------|---------|------|
| [Vite v8](https://vite.dev/guide/) | Dev server + build tool | https://vite.dev/guide/ |
| Vanilla JavaScript (ES Modules) | App logic — no framework | — |
| [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | Bell sound effects (built-in browser API) | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API |
| [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) | Background music playback | https://developers.google.com/youtube/iframe_api_reference |
| [Almendra — Google Fonts](https://fonts.google.com/specimen/Almendra) | Body / label typography | https://fonts.google.com/specimen/Almendra |
| [Almendra Display — Google Fonts](https://fonts.google.com/specimen/Almendra+Display) | Countdown number | https://fonts.google.com/specimen/Almendra+Display |
| [Vercel](https://vercel.com/docs/frameworks/frontend/vite) | Deployment (free Hobby tier) | https://vercel.com/docs/frameworks/frontend/vite |

**Rationale:** The entire app is client-side — no backend, no auth, no database. Vite + Vanilla JS is the simplest viable stack: a live dev server, module support, and zero framework overhead. All complexity lives in two browser APIs (Web Audio, YouTube IFrame) that don't require any additional dependencies.

---

## Runtime & Deployment

- **Runs in:** Desktop browser tab (Chrome recommended; Firefox and Safari also supported)
- **Deployment target:** Live URL on Vercel, linked from Devpost submission
- **Deployment method:** Connect GitHub repo to Vercel → auto-deploys on every push to `main`
- **Environment requirements:** Node.js (for running Vite locally). No API keys required — YouTube IFrame API loads via a `<script>` tag, no key needed.
- **Mobile:** Out of scope. Desktop only.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   index.html                        │
│   (layout, Google Fonts, hidden YouTube iframe)     │
└──────────────────────┬──────────────────────────────┘
                       │ imports
                       ▼
               ┌───────────────┐
               │    main.js    │  ← entry point, wires everything together
               └───┬───┬───┬──┘
                   │   │   │
          ┌────────┘   │   └────────┐
          ▼            ▼            ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ timer.js │  │ audio.js │  │   ui.js  │
    │          │  │          │  │          │
    │ State    │  │ Web      │  │ DOM      │
    │ machine  │  │ Audio +  │  │ updates  │
    │ + timing │  │ YouTube  │  │ + events │
    └────┬─────┘  └──────────┘  └──────────┘
         │ fires events
         └──────────────────────────────────▶ audio.js + ui.js react
```

**Data flow — a typical session:**

```
User clicks Play
  → ui.js captures click → calls timer.start() + audio.playStartupSequence()
  → audio: bell-session-start fires → on end, bell-work fires → on end, timer begins

Every ~100ms tick:
  → timer.js checks Date.now() → calculates timeRemaining
  → timer.js fires onTick event
  → ui.js updates countdown text + progress bar fill

Phase ends (timeRemaining hits 0):
  → timer.js fires onPhaseEnd(nextPhase)
  → audio.js plays bell-rest (work→rest) or bell-work (rest→work)
  → audio.js pauses music (entering rest) or resumes music (entering work)
  → ui.js updates phase label, resets progress bar

User pastes YouTube URL:
  → ui.js validates: must match youtube.com/watch?v= or youtu.be/
  → if valid: audio.js loads YouTube iframe with that URL
  → if invalid: inline error shown below input

User clicks Skip:
  → ui.js calls timer.skip()
  → timer.js fires onPhaseEnd(nextPhase) immediately
  → same bell + music logic as automatic transition

User clicks Reset:
  → timer.js resets to Pomodoro 1, phase = work
  → audio.js calls player.seekTo(0) + player.pauseVideo()
  → ui.js resets all display elements
```

---

## Timer State Machine

*Implements `prd.md > Phase Transitions`, `prd.md > Session Controls`*

### State Shape

```javascript
{
  phase: 'work' | 'rest' | 'longRest',
  phaseNumber: number,       // increments forever: 1, 2, 3...
  isRest: boolean,           // true for rest and longRest
  timeRemaining: number,     // seconds remaining in current phase
  totalTime: number,         // total seconds for current phase (for progress bar)
  isRunning: boolean,
  sessionStarted: boolean,   // false until first Play press
  workCount: number          // tracks how many work phases completed (mod 4 for long rest)
}
```

### Phase Sequence Logic

```
Work 25m → Rest 5m → Work 25m → Rest 5m →
Work 25m → Rest 5m → Work 25m → Long Rest 30m → repeat
```

- After every 4th completed work phase, the next rest is a Long Rest (30m) instead of a short rest (5m)
- Phase labels increment sequentially and never reset (unless Reset is pressed): Pomodoro 1, Rest 1, Pomodoro 2, Rest 2, Pomodoro 3, Rest 3, Pomodoro 4, Long Rest, Pomodoro 5, Rest 5…
- Long Rest label reads "Long Rest", not "Rest 4"
- `workCount` tracks completions modulo 4; resets to 0 after a Long Rest

### Timing Accuracy (Background Tab)

The timer uses `Date.now()` to calculate elapsed time on each tick, not tick-counting:

```javascript
// On each setInterval tick:
const elapsed = Date.now() - phaseStartTime;
timeRemaining = totalTime - Math.floor(elapsed / 1000);
```

This keeps the timer accurate even when the browser throttles `setInterval` in backgrounded tabs.

### Events Fired

- `onTick(timeRemaining, totalTime)` — every ~100ms while running
- `onPhaseEnd(nextPhase, nextPhaseNumber)` — when a phase completes or skip is triggered
- `onReset()` — when Reset is pressed

### Controls

- **Play/Pause:** toggles `isRunning`; on first press sets `sessionStarted = true`
- **Skip:** calls `onPhaseEnd` immediately with next phase
- **Reset:** resets all state to initial (Pomodoro 1, work phase, timeRemaining = 25×60)

---

## Audio System

*Implements `prd.md > First Load and Session Start`, `prd.md > Phase Transitions`, `prd.md > Music Controls`*

### Bell Sound Effects (Web Audio API)

Three audio files loaded and decoded at startup via Web Audio API:

| File | Trigger |
|------|---------|
| `assets/sounds/bell-session-start.wav` | Once, on first Play press |
| `assets/sounds/bell-work.mp3` | Every work phase start (including after session-start bell) |
| `assets/sounds/bell-rest.mp3` | Every rest and long rest phase start |

**Startup sequence (precise order):**
1. User clicks Play → `bell-session-start` fires
2. `bell-session-start` ends → `bell-work` fires
3. `bell-work` ends → `timer.start()` called, Pomodoro 1 begins counting down

**Autoplay unlock:** Web Audio API requires a user gesture before playing audio. The initial Play button click serves as this gesture. All subsequent bell playback is unlocked for the session.

**Bell on skip:** Skip fires the same bell as an automatic transition would:
- Skip during work phase → `bell-rest` fires
- Skip during rest phase → `bell-work` fires

### YouTube Music (YouTube IFrame Player API)

A hidden `<iframe>` in `index.html` hosts the YouTube player. The iframe is visually hidden (`display: none` or `visibility: hidden`) — no video is ever shown on screen.

**Loading the API:**
```html
<script src="https://www.youtube.com/iframe_api"></script>
```

**Player initialization:** Called inside `onYouTubeIframeAPIReady()` callback (required by the API).

**Key player methods used:**

| Method | When |
|--------|------|
| `player.loadVideoById(videoId)` | On valid URL paste |
| `player.playVideo()` | Work phase starts |
| `player.pauseVideo()` | Rest/long rest starts, session paused, reset |
| `player.seekTo(0)` | Reset pressed (music goes back to beginning) |
| `player.setVolume(0–100)` | Volume slider interaction |

**Extracting video ID from URL:**
- `youtube.com/watch?v=VIDEO_ID` → extract `VIDEO_ID` query param
- `youtu.be/VIDEO_ID` → extract path segment

**Music automation:**
- Work phase starts → `playVideo()`
- Rest or Long Rest starts → `pauseVideo()`
- Reset → `seekTo(0)` then `pauseVideo()`
- Session paused → `pauseVideo()`
- Session resumed → `playVideo()` (only if a URL has been loaded)

**Error event (`onError`):** If the video fails to load or play after a valid URL is set, the inline error message under the input is shown: *"Enter a valid YouTube link (watch?v=... or youtu.be/...)"*

**`onAutoplayBlocked` event:** If the browser blocks autoplay, no action needed — the user will trigger play manually via the Play button, which serves as the gesture.

---

## UI Layer

*Implements `prd.md > Timer HUD`, `prd.md > Session Controls`, `prd.md > Music Controls`, `prd.md > Visual Environment`*

### HUD (Top Right Corner)

Positioned `fixed`, `top: 1.5rem`, `right: 1.5rem`. Contains a semi-transparent warm off-black panel (`rgba(20, 10, 5, 0.75)`) with corner ornaments (gold CSS `::before`/`::after` or SVG positioned at corners).

**Element order (top to bottom):**
1. Progress bar — fills left to right as time passes within the current phase
2. Countdown text — large, Almendra Display font
3. Phase label — "Pomodoro 1", "Rest 1", "Long Rest", etc. (Almendra)
4. Controls row — Play/Pause button + Skip button (stretched hexagon, gold stroke)

**Progress bar:** `width` transitions from `0%` to `100%` over the phase duration. Calculated as `(totalTime - timeRemaining) / totalTime * 100`.

### Bottom Bar

Positioned `fixed`, `bottom: 0`, `left: 0`, `width: 100%`. No dark panel — sits within the bottom gradient (see Visual Environment). Elements laid out in a single row.

**Element order (left to right):**
1. YouTube URL input field (Almendra, corner-ornament border, gold stroke)
2. Inline error/helper text (below input, shown conditionally — see URL input states)
3. Volume slider (compact horizontal, gold styled)
4. Reset button (stretched hexagon, gold stroke, visually separated with margin or divider)

**Note:** There is no separate music play/pause button. The single HUD Play/Pause button controls both the timer and music playback simultaneously. *(This is a deliberate change from the original PRD, decided in /spec.)*

### URL Input States

Three states:

| State | Appearance | Text below input |
|-------|-----------|-----------------|
| Session not started, no URL | Normal, editable | — |
| Session not started, invalid URL pasted | Gold border turns red/amber warning | *"Enter a valid YouTube link (watch?v=... or youtu.be/...)"* |
| Session running | `disabled`, `cursor: not-allowed` | *"Pause the session to make changes"* |

URL is validated on paste using a regex matching `youtube.com/watch?v=` or `youtu.be/`.

### Button Styles

All buttons use CSS `clip-path` to achieve a stretched hexagon shape:
```css
clip-path: polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%);
```
Gold stroke via `outline` or `box-shadow`. Button text in Almendra font.

### Box / Container Styles

All content boxes (HUD panel, URL input group) use CSS corner ornaments:
- Four `::before`/`::after` pseudo-elements or four small `<span>` elements positioned at each corner
- Gold stroke color matching buttons
- No full border on the sides — corner ornaments only (or subtle border with prominent corners)

---

## Visual Environment

*Implements `prd.md > Visual Environment`*

### Background Image

```css
body {
  background-image: url('/assets/pexels-michael-d-beckwith-2150568551-31267820.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}
```

### Overlay

A full-screen fixed `<div>` or `::before` pseudo-element over the background, under all UI:
```css
background: rgba(20, 10, 5, 0.6);
position: fixed;
inset: 0;
z-index: 1;
pointer-events: none;
```

### Bottom Gradient

A fixed `<div>` at the bottom of the screen (above overlay, below UI elements):
```css
position: fixed;
bottom: 0;
left: 0;
width: 100%;
height: 200px;
background: linear-gradient(to bottom, transparent, rgba(20, 10, 5, 0.85));
z-index: 2;
pointer-events: none;
```

### Typography

| Use | Font | Weight |
|-----|------|--------|
| Countdown number | Almendra Display | Regular |
| Phase label, button text, body | Almendra | Regular / Bold |

Google Fonts import in `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Almendra&family=Almendra+Display&display=swap" rel="stylesheet">
```

### Color Palette

| Element | Color |
|---------|-------|
| Background base | warm amber + forest green (from image) |
| Overlay | `rgba(20, 10, 5, 0.6)` warm off-black |
| Interactive elements (buttons, borders) | Gold: `#C9A84C` or `#D4AF37` |
| Text | White / off-white |
| Error/warning text | Warm amber |

### Hidden YouTube Iframe

```html
<div id="youtube-container" style="display:none;">
  <div id="youtube-player"></div>
</div>
```

The YouTube IFrame API replaces `#youtube-player` with an iframe internally. Keeping it in a hidden container ensures it's in the DOM (required by the API) but never visible.

---

## State Model

All application state lives in `timer.js`. No external state management library needed.

```javascript
// timer.js — canonical state
{
  phase: 'work',           // 'work' | 'rest' | 'longRest'
  phaseNumber: 1,          // display number, increments forever
  workCount: 0,            // tracks completed work phases (mod 4 for long rest trigger)
  timeRemaining: 1500,     // seconds (25 * 60 for work)
  totalTime: 1500,         // total seconds for current phase
  isRunning: false,
  sessionStarted: false,   // becomes true on first Play press, never resets
  phaseStartTime: null,    // Date.now() snapshot at phase start (for accurate timing)
}

// audio.js — own state
{
  youtubeUrl: null,        // last valid URL entered
  youtubePlayer: null,     // YouTube IFrame player instance
  audioCtx: null,          // Web Audio AudioContext
  bells: {                 // decoded AudioBuffer instances
    sessionStart: null,
    work: null,
    rest: null,
  }
}
```

`ui.js` holds no state — it reads from the DOM and calls functions on `timer.js` and `audio.js`.

---

## File Structure

```
Devposthackathon/
├── assets/
│   ├── pexels-michael-d-beckwith-2150568551-31267820.jpg  # background image
│   └── sounds/
│       ├── bell-session-start.wav   # startup bell (fires before Pomodoro 1)
│       ├── bell-work.mp3            # fires at start of every work phase
│       └── bell-rest.mp3            # fires at start of every rest / long rest
├── src/
│   ├── timer.js     # state machine: phase logic, Date.now() timing, events
│   ├── audio.js     # Web Audio API (bells) + YouTube IFrame API (music)
│   └── ui.js        # DOM updates, HUD rendering, button/input event handlers
├── docs/
│   ├── learner-profile.md
│   ├── scope.md
│   ├── prd.md
│   └── spec.md      # this file
├── process-notes.md
├── index.html       # page layout, Google Fonts, hidden YouTube iframe, script imports
├── style.css        # all visual styles: background, overlay, gradient, HUD, bottom bar
├── main.js          # entry point: imports timer/audio/ui, wires event listeners together
└── vite.config.js   # minimal Vite config (base path for Vercel deployment)
```

---

## Key Technical Decisions

**1. Vite + Vanilla JS (no framework)**
Chosen for simplicity given Aspen's beginner level and the app's single-page, client-only nature. No React, no component model — just organized JS modules. Tradeoff: manual DOM updates in `ui.js` instead of reactive rendering, but the app is simple enough that this isn't a problem.

**2. `Date.now()` for timer accuracy**
Standard `setInterval` tick-counting drifts when the browser tab is backgrounded. Using `Date.now()` to calculate actual elapsed time on each tick keeps the countdown accurate regardless of tab focus state. Tradeoff: slightly more arithmetic per tick, but negligible at this scale.

**3. Initial Play button as autoplay unlock**
Both Web Audio API and YouTube IFrame API require a user gesture before playing audio. The initial Play button press serves as this gesture, unlocking audio for the entire session. This is why the timer doesn't auto-start on load — it's both a UX choice (intentional session start) and a technical requirement.

**4. Single Play/Pause button controls timer and music together**
Decided during /spec. Removes the separate music play/pause button from the bottom bar. Simplifies the UI and the mental model: one button controls the whole session. Tradeoff: user cannot independently pause music without pausing the timer.

---

## Dependencies & External Services

| Service | Purpose | Pricing | Docs |
|---------|---------|---------|------|
| YouTube IFrame Player API | Background music | Free | [Reference](https://developers.google.com/youtube/iframe_api_reference) |
| Web Audio API | Bell sound effects | Free (browser built-in) | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) |
| Google Fonts (Almendra, Almendra Display) | Typography | Free | [Almendra](https://fonts.google.com/specimen/Almendra) · [Almendra Display](https://fonts.google.com/specimen/Almendra+Display) |
| Vercel (Hobby tier) | Hosting + deployment | Free | [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite) |

No API keys required. No rate limits relevant at this scale.

---

## PRD Deviations

These decisions were made during /spec and intentionally differ from the original PRD:

| PRD Says | Spec Decision | Reason |
|----------|--------------|--------|
| Music play/pause button in bottom bar | Removed — HUD Play/Pause controls both | Simpler UX, single control point |
| Popup notification if video fails to play | Removed — inline error under input instead | No popup needed; inline message covers all URL error cases |
| Reset does not affect music controls | Reset calls seekTo(0) + pauseVideo() | Aspen's explicit decision: full reset means full reset |
| Piano intro + drum hit startup sequence | Three bells: session-start → work → timer begins | Aspen's redesign of the audio identity |

---

## Open Issues

1. **`vite.config.js` base path:** When deploying to Vercel, the `base` option in `vite.config.js` may need to be set if assets aren't loading. Standard fix: `export default { base: '/' }`. Verify on first deploy.

2. **Web Audio API context on mobile Safari:** iOS requires the AudioContext to be created inside a user gesture handler. If testing on iPad/iPhone, the AudioContext initialization may need to move inside the Play button click handler. (Desktop is not affected — desktop only is in scope, but worth noting.)

3. **YouTube video ID extraction edge cases:** Some YouTube URLs include timestamps (`?t=`) or playlist parameters (`&list=`). The URL parser should extract only the `v=` parameter and ignore the rest. Note in build.

4. **Bell file formats:** `bell-session-start.wav` differs from `bell-work.mp3` and `bell-rest.mp3`. Web Audio API handles both — load all three the same way via `fetch()` + `decodeAudioData()`. No special handling needed, but worth confirming during build.
