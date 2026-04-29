# Fantasy Pomodoro Timer

## Idea
A browser-based Pomodoro timer with integrated YouTube music playback and automatic phase-switching audio cues, wrapped in an immersive fantasy library aesthetic.

## Who It's For
Primarily Aspen — someone who is most productive in the 25/5 Pomodoro cycle with music playing, but can't find a browser tool that automatically signals phase transitions with audio and controls music playback simultaneously. Secondary audience: anyone who works the same way and stumbles onto a well-built version of this.

The specific unmet need: no existing browser tool handles both the audio cue at the phase switch AND the music play/pause automatically. The user currently juggles YouTube (with adblocker) in a separate tab and manages the timer manually — this app closes that gap.

## Inspiration & References

**Audio design reference:**
- Study With Me in Skyrim (YouTube): https://www.youtube.com/watch?v=NgyAFeu6-lU
  - Drum hit between phases — signals transition without being jarring
  - Short piano intro as a "study mode starting now" sound
  - The gold standard for what phase-switch audio should feel like in this aesthetic

**Layout/UX references:**
- WonderSpace (https://www.wonderspace.app/) — environmental, "inside a space" layout. The feeling of being situated somewhere, not looking at a widget.
- PomoFox (https://www.pomofox.com/) — circle timer as compact glanceable progress indicator. Informed the decision to make the timer a corner HUD element rather than the visual centerpiece.

**Visual/aesthetic references:**
- Baldur's Gate 3 — ornate, high-fantasy, detailed UI
- Disco Elysium — painterly, atmospheric, literary
- Elder Scrolls Online — classic fantasy MMO UI conventions

**Design energy:** Warm, rich, inviting. A scholar's library, not a dungeon. The environment is the hero; the UI elements are situated within it.

## Goals
- Build something Aspen actually uses for her own work sessions
- Demonstrate vibecoding as a real workflow: idea → scoped plan → working product
- Create a genuinely differentiated Pomodoro tool — not another minimal timer, but something with a specific aesthetic identity and the one feature (audio phase-switching) that the market is missing
- Keep it clean enough that others could use it, even though it's built for one person first

## What "Done" Looks Like
A browser tab showing a fantasy library scene — warm ambers and greens, candlelight, floating orbs, a window looking out onto a meadow. In the corner, a large-text timer and progress bar (HUD-style) showing the current phase (Work / Rest / Long Break) and time remaining. Below or alongside: a clean YouTube URL input field with decorative border, and basic music controls. On phase transition: a drum sound fires, music pauses or resumes automatically. On session start: a short piano intro plays. After 4 work sessions, a 30-minute long break triggers. Ornate serif typography throughout. Decorative borders frame functional UI elements; the input fields themselves are clean and readable.

## What's Explicitly Cut
- **ATproto / Bluesky login** — genuinely interesting, but account systems add auth complexity that would eat the hackathon clock. Save for post-hackathon.
- **Stats and productivity celebrations** — compelling feature, but requires persistent state (local storage or server). Out for now.
- **Configurable phase lengths** — nice-to-have, but the standard 25/5 is the right default for MVP. Settings UI adds scope without changing the core experience.
- **Floating widget / native app** — requires browser extension or native packaging. Browser tab is the right constraint for this build.
- **Instrumental vs. lyrics toggle** — a personal workflow detail that's hard to automate without metadata. User manages this manually by choosing what URL they paste.

## Loose Implementation Notes
- Pure browser app — HTML/CSS/JavaScript, no backend needed for MVP
- YouTube embed API or iframe for in-browser music playback with play/pause control
- Web Audio API or HTML5 `<audio>` for phase-switch sound effects (drum, piano intro as audio files)
- Timer state machine: Work (25m) → Rest (5m) → Work → Rest → Work → Rest → Work → Long Break (30m) → repeat
- Background: a rich illustrated or CSS-rendered fantasy library scene; the environment should feel immersive, not like a wallpaper pasted behind widgets
- Typography: ornate serif (e.g. Cinzel, IM Fell English, or similar Google Fonts)
- Color palette: warm amber + forest green background; gold + white for interactive elements
- Decorative CSS borders or SVG border elements around input fields and controls
