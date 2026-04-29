# Fantasy Pomodoro Timer — Product Requirements

## Problem Statement

People who use the Pomodoro method with background music have no browser tool that handles both the audio phase-transition cue AND automatic music play/pause together. They currently run a timer in one tab and YouTube in another, manually pausing music and watching the clock — interrupting the focus the technique is supposed to create. This app closes that gap, wrapped in a fantasy library aesthetic that makes it feel like a place to be, not a widget to stare at.

## User Stories

### First Load and Session Start

- As a first-time visitor, I want to see a YouTube URL input and a play button immediately so that I know exactly how to begin.
  - [ ] On load, timer is frozen and the play button is visible
  - [ ] URL input labeled "YouTube URL" is visible and ready for input
  - [ ] Play button is accessible without entering a URL (music is optional)
  - [ ] If a URL is entered, it is validated on paste — an error message appears below the input if the link is not a valid YouTube URL

- As a user ready to start, I want pressing play to trigger the startup sound sequence so that the transition into focus mode feels intentional and ceremonial.
  - [ ] Pressing play fires the startup piano intro
  - [ ] Drum hit fires immediately after the piano intro ends
  - [ ] Timer begins counting Pomodoro 1 only after the drum hit
  - [ ] If no YouTube URL was entered, audio cues still fire; music simply doesn't play

### Phase Transitions

- As a focused user, I want phases to switch automatically with a sound cue so that I never have to watch the timer to know when to stop or start.
  - [ ] When a work phase ends: drum hit fires, music pauses, rest phase begins immediately — no user action required
  - [ ] When a short rest ends: drum hit fires, music resumes, next work phase begins immediately
  - [ ] After Pomodoro 4, a long rest (30 min) begins instead of a short rest
  - [ ] When the long rest ends: drum hit fires, music resumes, Pomodoro 5 begins
  - [ ] The cycle continues indefinitely — pomodoro and rest numbers increment forever, never reset
  - [ ] All audio (phase sounds and music) continues firing when the browser tab is in the background

### Timer HUD

- As a user mid-session, I want a glanceable corner HUD so that I can check my place without breaking focus.
  - [ ] HUD displays: large countdown text, current phase label, session label below the countdown, and a progress bar
  - [ ] Phase labels read: "Pomodoro 1", "Rest 1", "Pomodoro 2", "Rest 2", "Pomodoro 3", "Rest 3", "Pomodoro 4", "Long Rest", "Pomodoro 5", "Rest 5" — and so on, incrementing sequentially
  - [ ] Long rest label reads "Long Rest" (not "Rest 4")
  - [ ] Progress bar fills as the current phase counts down toward zero
  - [ ] Long rest phase looks identical to short rest phase — same layout, just different label and duration

### Session Controls

- As a user, I want to pause, skip phases, and reset my session so that I stay in control without losing the flow.
  - [ ] Play/pause button near the timer pauses and resumes the session; timer freezes on pause
  - [ ] No visual change to the UI when paused other than the timer stopping
  - [ ] Skip button near the timer advances to the next phase and triggers the drum hit sound
  - [ ] "Reset Session" button resets the timer back to Pomodoro 1 with no confirmation dialog
  - [ ] Reset does not affect the YouTube URL or music controls
  - [ ] Reset button is visually separated from the play/pause and skip buttons

### Music Controls

- As a user, I want basic music controls in the bottom bar so that I can adjust playback without leaving the app.
  - [ ] Music play/pause button is visible in the bottom bar
  - [ ] Volume control is visible in the bottom bar
  - [ ] YouTube video is audio-only — no video embed is shown on screen
  - [ ] If a video fails to play after passing URL validation (e.g. geo-blocked or taken down), a popup notifies the user

- As a user mid-session, I want to be protected from accidentally changing my music so that I don't disrupt a running session.
  - [ ] URL input is locked while the session is running
  - [ ] If the user interacts with the URL input while the session is running, a prompt appears asking if they want to pause the session to make changes
  - [ ] URL input becomes editable when the session is paused

### Visual Environment

- As a user, I want an immersive fantasy library environment so that this timer feels meaningfully different from any other productivity tool.
  - [ ] Full-screen static fantasy library illustration fills the background (stock image placeholder, swappable)
  - [ ] Timer HUD is positioned in a corner of the screen
  - [ ] Bottom bar is always visible but visually secondary — not in primary or interactive colors
  - [ ] Ornate serif typography throughout (e.g. Cinzel, IM Fell English, or similar)
  - [ ] Decorative borders frame the URL input and UI element groups
  - [ ] Color palette: warm amber and forest green background; gold and white for interactive elements
  - [ ] No visible YouTube video embed anywhere on screen

## What We're Building

Everything the app must do to be complete at the end of the hackathon:

- **Fantasy library environment:** Full-screen static illustration background with corner HUD and always-visible bottom bar. Ornate serif typography, decorative borders, warm amber/green palette, gold/white for interactive elements.
- **Pomodoro timer:** Work 25m → Rest 5m (×4) → Long Rest 30m → repeat. Phase labels increment sequentially forever. Progress bar fills within each phase.
- **Startup sequence:** Piano intro → drum hit → Pomodoro 1 begins. Timer does not start until drum hit completes.
- **Automatic phase transitions:** Drum hit fires on every transition — automatic or user-triggered via skip. No user action required between phases.
- **Music automation:** Plays during work phases, pauses during rest and long rest, resumes automatically when next work phase begins.
- **Session controls:** Play/pause (near HUD), skip to next phase (near HUD, triggers drum hit), Reset Session (bottom bar, visually separated, no confirmation).
- **Music controls:** Play/pause and volume in bottom bar. YouTube URL input with label, paste validation, and inline error message.
- **Error handling:** Popup notification if video fails at playback. Prompt to pause if user tries to edit URL mid-session.
- **Background audio:** All timer logic and audio cues continue running when the browser tab is not in focus.

## What We'd Add With More Time

- **Animated background:** A 3–5 second looping animation — flickering candles, drifting light orbs — to make the library feel alive.
- **Bluesky/ATproto login:** Saves YouTube URL and session preferences to an account so users don't repaste every session.
- **Custom illustration:** Replace the stock image placeholder with a commissioned or AI-generated fantasy library scene built to spec.
- **Stats and productivity celebrations:** Session history, streak tracking, milestone moments.
- **Configurable phase lengths:** Custom work/rest/long break durations for users who don't use standard 25/5.

## Non-Goals

- **User accounts or auth** — no login, no saved data. URL is re-entered each session.
- **Persistent stats or session history** — no local storage or server for this build.
- **Configurable phase lengths** — standard 25/5/30 is fixed. Settings UI is out of scope.
- **Floating widget or native app** — browser tab only.
- **Visible YouTube video embed** — audio only; no video shown.
- **Mobile optimization** — desktop browser only for this build.

## Open Questions

- **Audio assets:** What sound files will be used for the piano intro and drum hit? Needs to match the Skyrim Study With Me aesthetic. Must be resolved before /build.
- **Background image:** What stock image will be used? The build agent needs the asset (or a confirmed placeholder URL) before wiring up the background. Must be resolved before /build.
- **Background tab audio:** Keeping timers accurate and audio firing in backgrounded tabs may require specific browser API approaches. Can be resolved in /spec.
