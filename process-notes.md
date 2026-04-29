# Process Notes

## /onboard

**Technical experience:** Beginner. Learns in coding bursts, forgets between projects. No established languages or frameworks. Needs visual feedback to validate that code is working. Claude Code is their first AI coding tool.

**Learning goals:** Understand when and how to integrate AI across both the design and engineering phases — wants a repeatable mental model, not just a one-off build.

**Creative sensibility:** Strong fantasy game UI aesthetic (BG3, Disco Elysium, ESO). Ornate, immersive, thematic design over clean minimalism. This should inform design suggestions throughout.

**Prior SDD experience:** Solid — user flows and multi-round mockups before developer handoff is their standard practice. They understand structured pre-work; this is an extension of that into engineering. /reflect should connect SDD back to their existing design process.

**Notable context:** Product designer by trade. Their design instincts are a real asset — they'll be a strong judge of visual output and UX quality. Primary motivation is learning vibecoding as a skill, not just shipping this one app.

**Energy/engagement:** Thoughtful, specific, and focused. Gave rich answers quickly. Good signal for investing in deepening rounds in later commands.

## /scope

**How the idea evolved:** Arrived with a clear core concept (Pomodoro + auto music control + audio cues). Conversation sharpened the YouTube URL input mechanism, confirmed the browser tab as the right form factor (ruled out widget/extension), and surfaced the ATproto/Bluesky login interest as a post-hackathon feature. The big addition was the Skyrim study video as a concrete audio reference — that gave the sound design real specificity.

**Pushback received:** Challenged on scope (ATproto login, stats, configurable phase lengths, widget). Aspen scoped herself well — cut confidently, kept the long break (30 min after 4 pomodoros) as the one "nice to have" worth fighting for. Good instinct: it's low implementation cost, high fidelity to the actual Pomodoro technique.

**References that resonated:** WonderSpace (environmental layout feel), PomoFox (compact circle timer, gamification potential noted for post-hackathon). Study With Me in Skyrim video (https://www.youtube.com/watch?v=NgyAFeu6-lU) was the most specific and useful reference — named the exact drum and piano sounds they want for phase transitions.

**Deepening rounds:** 1 round, focused on visual aesthetic. Surfaced: fantasy library with meadow view, warm amber/green palette, gold/white interactives, ornate serif typography, library as visual hero with corner HUD timer, decorative borders around clean functional inputs. This round materially improved the scope doc — design direction went from "fantasy UI" to a specific, buildable visual concept.

**Active shaping:** Aspen drove hard. They self-scoped the widget (ruled it out themselves before I pushed), named ATproto login as their preferred auth approach unprompted, specified the Skyrim audio reference independently, and made the "library as hero / timer as HUD" decision on their own. The decorative-border-around-clean-inputs solution came entirely from them. Minimal passive acceptance — they pushed back and contributed throughout.

## /prd

**What was added or changed vs. scope:** The scope sketched the experience; the PRD nailed down every moment. Key additions: the startup sequence (piano → drum hit → timer starts, not before), the sequential labeling system (Pomodoro 1, Rest 1, Pomodoro 2… Long Rest… Pomodoro 5), the URL-locking mechanic with "pause to change music?" prompt, the two-zone layout (corner HUD vs. bottom bar), the skip button triggering the drum hit, and the reset button's explicit non-confirmation behavior.

**"What if" moments that landed:** The "what if you close the tab and reopen it?" question produced a genuinely thoughtful response — Aspen immediately connected URL persistence to the Bluesky login they had already cut, naming it as the feature that makes that meaningful. That was a real "oh, I see why that's a separate thing" moment. The backgrounded tab question also landed — they'd thought about audio cues for other-tab use but hadn't explicitly named "the timer must keep running" as a requirement.

**Pushback and strong opinions:** Aspen was clear that the reset button should have no confirmation ("no" was immediate and firm). They also decided that long rest looks identical to short rest — no special visual treatment. Both were confident, aesthetic decisions.

**Scope guard:** No major scope creep this session. The animated background came up naturally and was cleanly deferred to "nice to have." The background illustration question ("what will it take for the build to produce it?") was redirected to /spec; Aspen resolved it themselves by deciding on a stock image placeholder — a pragmatic, submission-smart call.

**Deepening rounds:** Two rounds. Round 1 surfaced: reset behavior, skip button sounds, static vs. animated background, URL input prompt specifics, long rest visual treatment. Round 2 surfaced: background tab audio as an explicit requirement, the startup sequence timing (timer waits for drum hit), the stock image decision, and the Devpost wow moment (both audio and aesthetic equally). Both rounds added material requirements — especially the backgrounded tab audio, which would have been a surprise during build.

**Active shaping:** Strong. Aspen drove the sequential label system themselves ("Pomodoro 1, Rest 1, Pomodoro 2… Pomodoro 5, Rest 5") — that wasn't suggested. They also resolved the background illustration question pragmatically without prompting. The reset button behavior and the long rest visual decision were both definitive with no hedging. Minimal passive acceptance throughout.

## /spec

**Technical decisions made:**
- Stack: Vite v8 + Vanilla JavaScript + Vercel. No framework — single-page client-only app, no backend, no auth. Chosen for simplicity given beginner level.
- Timer uses `Date.now()` for accuracy in backgrounded tabs (not tick-counting).
- Initial Play button click serves as the Web Audio / YouTube autoplay unlock gesture — both a UX and technical requirement.
- Vercel free Hobby tier for deployment; auto-deploys from GitHub.

**Confident vs. uncertain:**
- Aspen was confident throughout — no hedging on any decision. UI choices (hexagon buttons, corner ornaments, Almendra font, gradient bottom bar) all came quickly and specifically.
- No uncertainty expressed about technical choices — deferred entirely to recommendations on stack and timing approach, then engaged immediately on the UI and interaction layer.

**Stack choices and why:**
- Vite + Vanilla JS: simplest viable for this app's scope; no framework overhead needed.
- Web Audio API: built-in browser API, no dependency, handles .wav and .mp3.
- YouTube IFrame Player API: only way to control YouTube playback programmatically in a browser.
- Almendra / Almendra Display (Google Fonts): Aspen's specific choice, replacing Cinzel/IM Fell English.

**Deepening rounds:** Three rounds. 
- Round 1 surfaced: typography (Almendra chosen specifically), button shapes (stretched hexagon), corner ornament borders, error handling simplified to inline text only.
- Round 2 surfaced: HUD placement (top right), warm off-black overlay treatment, reset resets music (seekTo(0) + pause), compact horizontal volume slider, one-screenshot Devpost strategy.
- Round 3 surfaced: progress bar fills left to right, HUD has semi-transparent dark panel, skip fires correct bell for destination phase, bottom bar uses gradient not panel, Devpost demo is single mid-session screenshot.
- All three rounds added material spec detail. The bell logic clarification (skip fires destination-phase bell) would have been ambiguous without Round 3.

**Active shaping:** Very strong. Aspen removed the separate music play/pause button entirely — unprompted, mid-architecture-proposal. Redesigned the audio identity from piano+drum to three bells (session-start, work, rest) with specific startup sequencing. Chose Almendra specifically over suggested options. Specified the bottom gradient vs. panel treatment as their own design solution. All UI decisions were driven by Aspen; technical decisions (timing, API choices) were deferred to recommendations.

**PRD deviations decided in /spec:**
- Music play/pause button removed from bottom bar (single HUD button controls all)
- No popup for failed YouTube video — inline error only
- Reset now affects music (seekTo(0) + pause)
- Startup audio redesigned: three bells instead of piano + drum

## /checklist

**Sequencing decisions:** Scaffold → visual environment (fast win, CSS only) → timer state machine (engine everything depends on) → HUD wired up (first interactive moment) → bells (risky, built early) → YouTube IFrame (risky, built early) → music automation → bottom bar polish → deploy → Devpost. Two risky items (Web Audio startup sequence, YouTube IFrame async init) placed at steps 5–6 to leave runway for troubleshooting.

**Build preferences chosen:**
- Mode: Step-by-step
- Comprehension checks: Yes (Aspen will opt out if it gets annoying)
- Verification: Yes — per item
- Git: Commit after each item
- Check-in cadence: Minimal discussion / speed-run

**Checklist shape:** 10 items, estimated 3–4 hours total build time.

**Sequencing engagement:** Aspen deferred entirely to recommended order, with one useful constraint: "whatever makes testing easiest." This maps well to the chosen sequence (visual wins early, risky items before midpoint).

**Submission planning:** Core story — "fantasy-themed Pomodoro timer that plays YouTube music to get me in the right headspace when I need to work." Wow moment — the immersive experience that reframes focusing as something exciting, all in one package. GitHub repo does not exist yet — creation is part of step 9 (Deploy). Vercel deploy is its own checklist item (step 9), separate from Devpost submission (step 10).

**Deepening rounds:** Zero — Aspen was ready to proceed immediately after mandatory questions. No refinement rounds taken; the spec was detailed enough that the checklist translated cleanly.

**Session note:** Aspen stopped for the night mid-/checklist after preferences were set. Checklist was written and saved before context clear so it's ready for /build when they return.

## Post-build UI polish

After completing steps 1–8 of the checklist, Aspen spent a significant session on UI refinements before moving to deployment. This reflects a pattern consistent with their background as a product designer — the initial build satisfied functional requirements, but visual and interaction quality required a dedicated pass.

**Changes made:**
- Added Bluesky and GitHub social icons to the credit label, linking to Aspen's profiles
- Moved credit label into the bottom bar as a flex child (rather than fixed-positioned separately), resolving a rendering bug where nested fixed positioning made it invisible
- Extracted YouTube URL checkmark from the layout flow (absolute positioned inside the input) so it no longer shifts the volume slider on appearance
- Widened the YouTube URL input and repositioned the checkmark inside the input box at all breakpoints
- Added responsive breakpoints: 768px (bottom bar wraps, URL left / volume right / credit below) and 540px (title centers, HUD stretches full width, volume collapses to popup)
- Built a vertical volume slider popup for the 540px breakpoint: tap to open/close, keyboard focus auto-opens and moves focus directly to the slider, styled to match HUD (dark panel, gold outline, corner brackets)
- Fixed a YouTube playback bug: replaced `loadVideoById()` + immediate `pauseVideo()` with `cueVideoById()` (avoids a race condition with the player's buffering state), and added an `onReady` handler to catch URLs pasted before the player finishes initializing

**Character of this session:** Aspen drove all visual decisions with specificity — exact measurements, interaction behaviors, edge cases (checkmark overlap, volume icon focus sequence, popup dismiss timing). The volume popup required several iteration cycles: visibility fix (specificity conflict between `display: flex` and `.hidden`), focus-open causing flicker (pointer vs. keyboard focus distinction), and immediate slider focus on keyboard open. Each bug was caught and fixed through direct testing.
