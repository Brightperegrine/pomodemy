# Build Checklist

## Build Preferences

- **Build mode:** Step-by-step
- **Comprehension checks:** Yes (Aspen will say to stop if it gets annoying)
- **Git:** Commit after each item with message: "Complete step N: [title]"
- **Verification:** Yes — run dev server and confirm expected output before moving on
- **Check-in cadence:** Minimal discussion — build fast, talk less

## Checklist

- [x] **1. Project scaffold**
  Spec ref: `spec.md > File Structure` + `spec.md > Stack`
  What to build: Initialize a Vite project. Create the full file structure: `index.html`, `main.js`, `src/timer.js`, `src/audio.js`, `src/ui.js`, `style.css`, `vite.config.js`. Add Google Fonts preconnect and Almendra/Almendra Display stylesheet link to `index.html`. Add the hidden YouTube iframe container (`#youtube-container` wrapping `#youtube-player`) to `index.html`. Add the YouTube IFrame API script tag. Import `style.css` and `src/main.js` in `index.html`. Leave all JS files as empty stubs.
  Acceptance: Dev server runs (`npm run dev`), browser opens to a blank or near-blank page with no console errors.
  Verify: Run `npm run dev`, open the local URL in Chrome, confirm the page loads and the browser console shows no errors.

- [x] **2. Visual environment**
  Spec ref: `spec.md > Visual Environment`
  What to build: In `style.css`: set the background image (`assets/pexels-michael-d-beckwith-2150568551-31267820.jpg`) with `cover`, `center`, `fixed`. Add the full-screen dark overlay div (or `::before`) at `rgba(20, 10, 5, 0.6)`, `position: fixed`, `inset: 0`, `z-index: 1`, `pointer-events: none`. Add the bottom gradient div at `position: fixed`, `bottom: 0`, `height: 200px`, `background: linear-gradient(to bottom, transparent, rgba(20, 10, 5, 0.85))`, `z-index: 2`, `pointer-events: none`. Set `font-family: 'Almendra', serif` as the body default. Add these structural divs to `index.html`.
  Acceptance: Browser shows the fantasy library background image filling the screen, with a warm dark overlay and a darker gradient fading in at the bottom. Almendra font is rendering.
  Verify: Run dev server, open in Chrome. You should see the background image with a dark warm tint and a gradient at the bottom. Right-click → Inspect → check that the font on any text element shows Almendra.

- [x] **3. Timer state machine**
  Spec ref: `spec.md > Timer State Machine`
  What to build: Build `src/timer.js` completely. Implement the state shape (phase, phaseNumber, workCount, timeRemaining, totalTime, isRunning, sessionStarted, phaseStartTime). Implement phase sequence logic: work 25m → rest 5m ×4 → long rest 30m → repeat; workCount mod 4 triggers long rest; phaseNumber increments forever; Long Rest label is "Long Rest" not "Rest 4". Implement Date.now() timing accuracy (calculate elapsed on each tick, not tick-counting). Implement onTick(timeRemaining, totalTime), onPhaseEnd(nextPhase, nextPhaseNumber), and onReset() event callbacks. Implement play/pause (toggles isRunning, sets sessionStarted on first press), skip (calls onPhaseEnd immediately), and reset (resets all state to initial, fires onReset).
  Acceptance: Timer logic is complete and correct — phase sequence, timing, and all three events fire at the right moments.
  Verify: In `main.js`, temporarily wire up `timer.onTick` to `console.log(timeRemaining)` and call `timer.play()`. Open dev server, open console — you should see countdown numbers ticking down in real time. Check that skip and reset work via console calls.

- [x] **4. Timer HUD, wired up**
  Spec ref: `spec.md > UI Layer > HUD`
  What to build: In `index.html`, add the HUD structure: a fixed top-right panel containing (top to bottom) progress bar, countdown text, phase label, and controls row (Play/Pause button + Skip button). In `style.css`: position the HUD fixed at `top: 1.5rem`, `right: 1.5rem`; style the panel as `rgba(20, 10, 5, 0.75)` with CSS corner ornaments (gold `#C9A84C` pseudo-elements at four corners); style countdown in Almendra Display; style Play/Pause and Skip buttons as stretched hexagons (`clip-path: polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)`), gold stroke. In `src/ui.js`: wire `timer.onTick` to update countdown text and progress bar width; wire `timer.onPhaseEnd` to update phase label; wire Play/Pause button click to `timer.play()`/`timer.pause()`; wire Skip button click to `timer.skip()`. Wire everything up in `main.js`.
  Acceptance: HUD is visible in the top right corner. Clicking Play starts the countdown. Countdown text updates every second. Progress bar fills left to right. Phase label updates on phase change. Skip and Play/Pause work.
  Verify: Run dev server, open in Chrome. Click Play — confirm countdown ticks, progress bar fills, phase label reads "Pomodoro 1". Click Skip — confirm phase advances and label updates.

- [x] **5. Bell system + startup sequence**
  Spec ref: `spec.md > Audio System > Bell Sound Effects`
  What to build: In `src/audio.js`, implement the Web Audio API bell system. On module init: create `AudioContext`, fetch and decode all three bell files (`assets/sounds/bell-session-start.wav`, `assets/sounds/bell-work.mp3`, `assets/sounds/bell-rest.mp3`) via `fetch()` + `decodeAudioData()`. Implement `playBell(buffer)` using `AudioBufferSourceNode`. Implement the startup sequence: Play press → `bell-session-start` plays → on end, `bell-work` plays → on end, `timer.start()` is called (timer does not start until this completes). Implement phase transition bells: `onPhaseEnd` into work phase → `bell-work`; `onPhaseEnd` into rest/longRest → `bell-rest`. Implement skip bell: skip during work → `bell-rest`; skip during rest → `bell-work`. Export an `initAudio()` function and a `playStartupSequence(onComplete)` callback. Wire into `main.js`.
  Acceptance: Pressing Play triggers a bell, then another bell, then the countdown starts. Phase transitions and skips trigger the correct bell.
  Verify: Run dev server with volume up. Click Play — hear two bells in sequence, then watch the countdown begin. Click Skip — hear a bell fire immediately.

- [x] **6. YouTube IFrame player + URL input**
  Spec ref: `spec.md > Audio System > YouTube Music` + `spec.md > UI Layer > Bottom Bar` + `spec.md > UI Layer > URL Input States`
  What to build: In `src/audio.js`: implement `onYouTubeIframeAPIReady()` to initialize the YouTube IFrame player targeting `#youtube-player`. Implement URL parsing: extract video ID from `youtube.com/watch?v=VIDEO_ID` and `youtu.be/VIDEO_ID` formats (ignore `&t=`, `&list=` params). Implement `loadVideo(url)` — validates URL, extracts ID, calls `player.loadVideoById(videoId)`. Handle `onError` event: show inline error under input. In `index.html`, add the bottom bar structure: URL input field (labeled "YouTube URL"), inline error/helper text element below it. In `style.css`: style the bottom bar as fixed bottom, full width, single row; style the URL input with corner ornament border, gold stroke, Almendra font; style inline error text in warm amber. In `src/ui.js`: wire the URL input paste event to `audio.loadVideo(url)`, show/hide inline error text based on validation result.
  Acceptance: Pasting a valid YouTube URL loads the video (no visible video on screen). Pasting an invalid URL shows the inline error message below the input.
  Verify: Run dev server. Paste a valid YouTube URL (`youtube.com/watch?v=...`) into the input — no error appears. Open DevTools → Network tab — confirm an iframe loaded the video. Paste a junk URL — confirm the error message appears below the input.

- [x] **7. Music automation + volume slider**
  Spec ref: `spec.md > Audio System > YouTube Music`
  What to build: In `src/audio.js`: wire YouTube playback to phase state. On work phase start → `player.playVideo()` (only if a URL has been loaded). On rest or long rest start → `player.pauseVideo()`. On session pause → `player.pauseVideo()`. On session resume → `player.playVideo()` (only if URL loaded). On reset → `player.seekTo(0)` then `player.pauseVideo()`. In `index.html`, add the volume slider to the bottom bar (after the URL input group). In `style.css`: style it as a compact horizontal slider, gold-colored track/thumb. In `src/ui.js`: wire volume slider `input` event to `player.setVolume(value)` (0–100).
  Acceptance: Music plays automatically during work phases and pauses during rest/long rest. Volume slider adjusts playback volume. Pause session → music pauses. Resume → music resumes. Reset → music stops and returns to start.
  Verify: Paste a YouTube URL, click Play, let the startup sequence finish — music should begin. Click Skip into a rest phase — music pauses. Click Skip back into work — music resumes. Drag volume slider — confirm audio level changes.

- [x] **8. Bottom bar polish + session state**
  Spec ref: `spec.md > UI Layer > Bottom Bar` + `spec.md > UI Layer > URL Input States`
  What to build: In `src/ui.js`: implement the three URL input states — (a) session not started / no URL: editable, no helper text; (b) session not started / invalid URL pasted: gold border turns red/amber, error message below; (c) session running: input `disabled`, `cursor: not-allowed`, helper text reads "Pause the session to make changes". Wire these states to timer events. In `index.html`, add the Reset button to the bottom bar (right side, visually separated with margin or a divider). In `style.css`: style Reset button as a stretched hexagon, gold stroke, Almendra font, visually separated from the URL group. In `src/ui.js`: wire Reset button click to `timer.reset()` + `audio.reset()`. Confirm all visual states are working correctly end-to-end.
  Acceptance: URL input locks while session is running. Reset button resets timer and music. All three URL input states display correctly. The full session flow (start → phases → skip → pause → resume → reset) works without errors.
  Verify: Start a session — confirm URL input disables and shows helper text. Pause — confirm input re-enables. Click Reset — confirm timer returns to Pomodoro 1, music stops. Do a full run-through of the app from Play to reset and confirm every interaction behaves as specced.

- [ ] **9. Deploy to Vercel**
  Spec ref: `spec.md > Runtime & Deployment`
  What to build: Create a new GitHub repository for the project (public). Initialize git in the project folder if not already done, add all files, make the initial commit, add the GitHub remote, and push to `main`. In Vercel: create a new project, import the GitHub repo, confirm the framework is detected as Vite, deploy. If assets aren't loading, set `base: '/'` in `vite.config.js` and redeploy.
  Acceptance: A live public URL (vercel.app or custom) loads the app correctly — background image, fonts, timer, and audio all work in a fresh browser tab.
  Verify: Open the live Vercel URL in an incognito Chrome window. Confirm the background image loads, fonts render, clicking Play triggers the startup bell sequence, and the countdown runs. Paste a YouTube URL and confirm music plays.

- [ ] **10. Submit your project to Devpost**
  Spec ref: `prd.md > What We're Building`
  What to build: Go to Devpost and create a new submission for the hackathon. Project name: Fantasy Pomodoro Timer (or your preferred name). Write the project description using this core story: "A fantasy-themed Pomodoro timer that plays YouTube music to get you in the right headspace when you need to work — all in one immersive package." Expand on what makes it different: automatic music play/pause on phase transitions, bell audio cues, and a fantasy library aesthetic that reframes focusing as something exciting. Add "built with" tags: JavaScript, Vite, Web Audio API, YouTube IFrame API, CSS, Vercel. Take a screenshot of the app mid-session (timer counting down, background visible) for the image gallery. Link your GitHub repo. Link the Vercel live URL. Upload any docs artifacts you want to include (scope.md, prd.md, spec.md, checklist.md). Submit.
  Acceptance: Submission is live on Devpost with project name, description, built-with tags, at least one screenshot, GitHub repo link, and Vercel live URL. All required fields are complete.
  Verify: Open your Devpost submission page and confirm the green "Submitted" badge appears. Read the project description out loud — would someone who knows nothing about your project understand what it does and why it matters?
