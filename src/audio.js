let audioCtx = null
const bells = { sessionStart: null, work: null, rest: null }
let youtubePlayer = null
let youtubeUrl = null

async function loadBell(url) {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  return audioCtx.decodeAudioData(arrayBuffer)
}

async function playBell(buffer, onEnded) {
  if (audioCtx.state === 'suspended') await audioCtx.resume()
  const source = audioCtx.createBufferSource()
  source.buffer = buffer
  source.connect(audioCtx.destination)
  if (onEnded) source.onended = onEnded
  source.start()
}

async function initAudio() {
  audioCtx = new AudioContext()
  ;[bells.sessionStart, bells.work, bells.rest] = await Promise.all([
    loadBell('/assets/sounds/bell-session-start.wav'),
    loadBell('/assets/sounds/bell-work.mp3'),
    loadBell('/assets/sounds/bell-rest.mp3'),
  ])
}

function playStartupSequence() {
  playBell(bells.sessionStart)
}

function playTransitionBell(nextPhase) {
  const buffer = nextPhase === 'work' ? bells.work : bells.rest
  playBell(buffer)
}

// Extract YouTube video ID from watch or short URL
function extractVideoId(url) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v')
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0]
  } catch {
    return null
  }
  return null
}

function isValidYoutubeUrl(url) {
  return extractVideoId(url) !== null
}

function loadVideo(url) {
  const videoId = extractVideoId(url)
  if (!videoId) return false
  youtubeUrl = url
  // cueVideoById loads the video without auto-playing, leaving the player in
  // a clean CUED state so playVideo() works reliably when Play is pressed.
  if (youtubePlayer?.cueVideoById) {
    youtubePlayer.cueVideoById(videoId)
  }
  return true
}

function initYouTubePlayer() {
  youtubePlayer = new YT.Player('youtube-player', {
    events: {
      onReady: () => {
        // Cue any URL that was entered before the player finished initializing
        if (youtubeUrl) {
          const videoId = extractVideoId(youtubeUrl)
          if (videoId) youtubePlayer.cueVideoById(videoId)
        }
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.ENDED) {
          youtubePlayer.seekTo(0)
          youtubePlayer.playVideo()
        }
      },
      onError: () => {
        if (window.onYouTubePlayerError) window.onYouTubePlayerError()
      },
    },
  })
}

// YouTube IFrame API calls this automatically when the script loads
window.onYouTubeIframeAPIReady = initYouTubePlayer

export const audio = {
  initAudio,
  playStartupSequence,
  playTransitionBell,
  isValidYoutubeUrl,
  loadVideo,
  get youtubePlayer() { return youtubePlayer },
  playMusic() {
    if (youtubeUrl && youtubePlayer?.playVideo) youtubePlayer.playVideo()
  },
  pauseMusic() {
    if (youtubePlayer?.pauseVideo) youtubePlayer.pauseVideo()
  },
  resetMusic() {
    if (youtubePlayer?.seekTo) {
      youtubePlayer.seekTo(0)
      youtubePlayer.pauseVideo()
    }
  },
}
