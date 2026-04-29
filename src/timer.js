const DURATIONS = {
  work: 25 * 60,
  rest: 5 * 60,
  longRest: 30 * 60,
}

const state = {
  phase: 'work',
  phaseNumber: 1,
  workCount: 0,
  timeRemaining: DURATIONS.work,
  totalTime: DURATIONS.work,
  isRunning: false,
  sessionStarted: false,
  phaseStartTime: null,
}

let tickInterval = null

export const timer = {
  onTick: null,
  onPhaseEnd: null,
  onReset: null,

  getState: () => ({ ...state }),

  play() {
    if (state.isRunning) return
    state.isRunning = true
    if (!state.sessionStarted) {
      state.sessionStarted = true
    }
    state.phaseStartTime = Date.now() - (state.totalTime - state.timeRemaining) * 1000
    tickInterval = setInterval(() => this._tick(), 100)
  },

  pause() {
    state.isRunning = false
    clearInterval(tickInterval)
    tickInterval = null
  },

  skip() {
    this._advancePhase()
  },

  reset() {
    clearInterval(tickInterval)
    tickInterval = null
    state.phase = 'work'
    state.phaseNumber = 1
    state.workCount = 0
    state.timeRemaining = DURATIONS.work
    state.totalTime = DURATIONS.work
    state.isRunning = false
    state.sessionStarted = false
    state.phaseStartTime = null
    if (this.onReset) this.onReset()
  },

  // Called by audio after bells finish — starts the countdown
  start() {
    state.sessionStarted = true
    state.phaseStartTime = Date.now()
    tickInterval = setInterval(() => this._tick(), 100)
    state.isRunning = true
  },

  _tick() {
    if (!state.isRunning) return
    const elapsed = Date.now() - state.phaseStartTime
    state.timeRemaining = Math.max(0, state.totalTime - Math.floor(elapsed / 1000))
    if (this.onTick) this.onTick(state.timeRemaining, state.totalTime)
    if (state.timeRemaining <= 0) {
      clearInterval(tickInterval)
      tickInterval = null
      state.isRunning = false
      this._advancePhase()
    }
  },

  _advancePhase() {
    if (state.phase === 'work') {
      state.workCount++
      const isLongRest = state.workCount % 4 === 0
      state.phase = isLongRest ? 'longRest' : 'rest'
    } else {
      state.phase = 'work'
    }
    state.phaseNumber++
    state.totalTime = DURATIONS[state.phase]
    state.timeRemaining = state.totalTime
    state.phaseStartTime = null
    if (this.onPhaseEnd) this.onPhaseEnd(state.phase, state.phaseNumber)
  },
}
