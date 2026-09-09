import axios from 'axios'

const API_BASE = 'http://localhost:8080'
const WS_BASE = 'ws://localhost:8080'

const api = axios.create({
  baseURL: API_BASE
})

export async function startCamera(cameraId, rtspUrl) {
  const res = await api.post('/api/v1/camera/start', { cameraId, url: rtspUrl })
  return res.data
}

export async function stopCamera(cameraId) {
  const res = await api.post('/api/v1/camera/stop', { cameraId })
  return res.data
}

export function connectDetectionWS(cameraId, onMessage, fps = 10) {
  const ws = new WebSocket(`${WS_BASE}/ws/detect`)
  let timer = null

  ws.onopen = () => {
    console.log('[WS] detection connected, waiting 3s for RTSP stream...')
    setTimeout(() => {
      const interval = 1000 / fps
      timer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ cameraId }))
        }
      }, interval)
    }, 3000)
  }

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      onMessage(msg)
    } catch {
      // ignore non-JSON
    }
  }

  ws.onclose = () => {
    console.log('[WS] detection disconnected')
    if (timer) clearInterval(timer)
  }

  ws.onerror = (err) => {
    console.error('[WS] detection error', err)
  }

  return ws
}
