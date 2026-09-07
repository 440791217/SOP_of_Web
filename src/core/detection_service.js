import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000'
})

export async function getStepList() {
  const res = await api.get('/api/steps')
  return res.data.steps
}

export async function getErrorInfo() {
  const res = await api.get('/api/steps')
  return res.data.errorInfo
}

export async function getHeaderInfo() {
  const res = await api.get('/api/steps')
  return res.data.headerInfo
}

export function connectWebSocket(onMessage) {
  const ws = new WebSocket('ws://localhost:8000/ws/steps')

  ws.onopen = () => {
    console.log('WebSocket connected')
  }

  ws.onmessage = (event) => {
    const data = event.data
    if (data === 'waiting') {
      ws.send('start')
      return
    }
    try {
      const msg = JSON.parse(data)
      onMessage(msg)
    } catch {
      // ignore non-JSON
    }
  }

  ws.onclose = () => {
    console.log('WebSocket disconnected')
  }

  ws.onerror = (err) => {
    console.error('WebSocket error', err)
  }

  return ws
}
