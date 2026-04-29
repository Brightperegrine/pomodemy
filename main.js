import './style.css'
import { timer } from './src/timer.js'
import { audio } from './src/audio.js'
import './src/ui.js'

// Make audio available to ui.js via window (avoids circular imports)
window.timer = timer
window.audio = audio

audio.initAudio()
