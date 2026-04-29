import { timer } from './timer.js'

const elUrlInput = document.getElementById('youtube-url')
const elUrlError = document.getElementById('url-error')
const elUrlCheck = document.getElementById('url-check')

function setUrlError(msg) {
  elUrlError.textContent = msg
  elUrlError.classList.toggle('hidden', !msg)
  elUrlInput.classList.toggle('error', !!msg)
  elUrlCheck.classList.toggle('hidden', !!msg)
}

function setUrlValid(valid) {
  elUrlCheck.classList.toggle('hidden', !valid)
  elUrlError.classList.add('hidden')
  elUrlInput.classList.remove('error')
}

elUrlInput.addEventListener('input', () => {
  const url = elUrlInput.value.trim()
  if (!url) {
    setUrlError('')
    setUrlValid(false)
    return
  }
  if (!window.audio.isValidYoutubeUrl(url)) {
    setUrlError('Enter a valid YouTube link (watch?v=... or youtu.be/...)')
  } else {
    setUrlValid(true)
    window.audio.loadVideo(url)
  }
})

const elCountdown = document.getElementById('hud-countdown')
const elPhase = document.getElementById('hud-phase')
const elProgressBar = document.getElementById('hud-progress-bar')
const btnPlay = document.getElementById('btn-play')
const btnSkip = document.getElementById('btn-skip')

// Add hex class and bottom corner ornaments
btnPlay.classList.add('hex-btn')
btnSkip.classList.add('hex-btn')

const hud = document.getElementById('hud')
const cornerBL = document.createElement('span')
cornerBL.className = 'corner-bl'
const cornerBR = document.createElement('span')
cornerBR.className = 'corner-br'
hud.appendChild(cornerBL)
hud.appendChild(cornerBR)

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function phaseLabel(phase, phaseNumber) {
  if (phase === 'work') return `Pomodoro ${Math.ceil(phaseNumber / 2)}`
  if (phase === 'longRest') return 'Long Rest'
  return `Rest ${Math.floor(phaseNumber / 2)}`
}

let isPlaying = false

timer.onTick = (timeRemaining, totalTime) => {
  elCountdown.textContent = formatTime(timeRemaining)
  const pct = ((totalTime - timeRemaining) / totalTime) * 100
  elProgressBar.style.width = pct + '%'
}

timer.onPhaseEnd = (phase, phaseNumber) => {
  elPhase.textContent = phaseLabel(phase, phaseNumber)
  elProgressBar.style.width = '0%'
  elCountdown.textContent = formatTime(timer.getState().totalTime)
  window.audio.playTransitionBell(phase)
  if (phase === 'work') {
    window.audio.playMusic()
  } else {
    window.audio.pauseMusic()
  }
  timer.start()
}

timer.onReset = () => {
  isPlaying = false
  btnPlay.textContent = 'Play'
  elCountdown.textContent = '25:00'
  elPhase.textContent = 'Pomodoro 1'
  elProgressBar.style.width = '0%'
  setSessionRunning(false)
  window.audio.resetMusic()
}

btnPlay.addEventListener('click', () => {
  if (!isPlaying) {
    isPlaying = true
    btnPlay.textContent = 'Pause'
    setSessionRunning(true)
    if (!timer.getState().sessionStarted) {
      window.audio.playStartupSequence()
      window.audio.playMusic()
      timer.start()
    } else {
      window.audio.playMusic()
      timer.play()
    }
  } else {
    isPlaying = false
    btnPlay.textContent = 'Play'
    setSessionRunning(false)
    window.audio.pauseMusic()
    timer.pause()
  }
})

btnSkip.addEventListener('click', () => {
  timer.skip()
})

const elVolume = document.getElementById('volume-slider')
const elVolumeIcon = document.getElementById('volume-icon')
const elVolumePopup = document.getElementById('volume-popup')
const elVolumeSliderPopup = document.getElementById('volume-slider-popup')
const elVolumeGroup = document.getElementById('volume-group')

function isMobileVolume() {
  return window.matchMedia('(max-width: 540px)').matches
}

function openVolumePopup() {
  elVolumePopup.classList.remove('hidden')
  elVolumeIcon.setAttribute('aria-expanded', 'true')
}

function closeVolumePopup() {
  elVolumePopup.classList.add('hidden')
  elVolumeIcon.setAttribute('aria-expanded', 'false')
}

// Track whether the upcoming focus event was caused by a pointer press.
// If so, the click handler manages the popup — focus handler should stay out.
let pointerActivating = false

elVolumeIcon.addEventListener('pointerdown', () => {
  pointerActivating = true
})

elVolumeIcon.addEventListener('click', (e) => {
  if (!isMobileVolume()) return
  e.stopPropagation()
  elVolumePopup.classList.contains('hidden') ? openVolumePopup() : closeVolumePopup()
})

elVolumePopup.addEventListener('click', (e) => {
  e.stopPropagation()
})

elVolumeIcon.addEventListener('focus', () => {
  if (!isMobileVolume()) return
  if (pointerActivating) {
    pointerActivating = false
    return
  }
  // Keyboard focus: open popup and move focus straight to the slider
  openVolumePopup()
  requestAnimationFrame(() => elVolumeSliderPopup.focus())
})

elVolumeGroup.addEventListener('focusout', (e) => {
  if (!elVolumeGroup.contains(e.relatedTarget)) closeVolumePopup()
})

document.addEventListener('click', () => {
  if (isMobileVolume()) closeVolumePopup()
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeVolumePopup()
    elVolumeIcon.blur()
  }
})

function setVolume(val) {
  elVolume.value = val
  elVolumeSliderPopup.value = val
  elVolume.style.setProperty('--pct', val + '%')
  elVolumeSliderPopup.style.setProperty('--pct', val + '%')
  if (window.audio.youtubePlayer?.setVolume) {
    window.audio.youtubePlayer.setVolume(val)
  }
}

function updateVolumeFill() {
  elVolume.style.setProperty('--pct', elVolume.value + '%')
  elVolumeSliderPopup.style.setProperty('--pct', elVolume.value + '%')
}

updateVolumeFill()
elVolumeSliderPopup.value = elVolume.value

elVolume.addEventListener('input', () => {
  setVolume(Number(elVolume.value))
})

elVolumeSliderPopup.addEventListener('input', () => {
  setVolume(Number(elVolumeSliderPopup.value))
})

const btnReset = document.getElementById('btn-reset')
btnReset.addEventListener('click', () => {
  timer.reset()
})

function setSessionRunning(running) {
  elUrlInput.disabled = running
  if (running) {
    elUrlError.textContent = 'Pause the session to make changes'
    elUrlError.classList.remove('hidden')
    elUrlError.style.color = 'rgba(255,255,255,0.45)'
  } else {
    elUrlError.classList.add('hidden')
    elUrlError.style.color = ''
  }
}
