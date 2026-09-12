import axios from 'axios'

// 使用相对路径，走 Vite 代理，避免跨域
const API_BASE = ''

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

/**
 * 视频帧 25fps 拉取，检测：回来一个发下一个
 * @param {string} cameraId
 * @param {function} onFrame(img, detections) 回调
 * @param {function} onSend 每次请求前回调
 * @param {number} fps 视频帧率，默认25
 * @param {boolean} inferenceOn 是否开启推理
 */
export function startFramePolling(cameraId, onFrame, onSend = null, fps = 25, inferenceOn = false) {
  const frameInterval = 1000 / fps  
  let latestDetections = null
  let stopped = false
  let lastFrameImg = null
  let detRunning = false 

  // 检测：回来一个再发下一个，不堆积
  async function runDetection() {
    if (stopped || !inferenceOn || !lastFrameImg || detRunning) return
    detRunning = true
    try {
      const canvas = document.createElement('canvas')
      canvas.width = lastFrameImg.naturalWidth
      canvas.height = lastFrameImg.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(lastFrameImg, 0, 0)

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8))
      const formData = new FormData()
      formData.append('image', blob, 'frame.jpg')

      const res = await fetch(`${API_BASE}/api/v1/camera/detect`, {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        const json = await res.json()
        latestDetections = json.data || json
        console.log('[检测] 返回结果:', latestDetections)
      } else {
        console.log('[检测] 请求失败:', res.status)
      }
    } catch {
    } finally {
      detRunning = false
      // 立即发下一个
      if (!stopped && inferenceOn) {
        runDetection()
      }
    }
  }

  // 视频帧：每40ms拉一次JPEG，浏览器原生解码
  const frameTimer = setInterval(() => {
    if (stopped) return
    const img = new Image()
    if (onSend) onSend()
    img.onload = () => {
      if (stopped) return
      lastFrameImg = img
      onFrame(img, latestDetections)
    }
    img.onerror = () => {
    }
    img.src = `${API_BASE}/api/v1/camera/frame/${cameraId}?t=${Date.now()}`
  }, frameInterval)

  return {
    setInference(enabled) {
      inferenceOn = enabled
      if (enabled && !detRunning) {
        runDetection()
      }
    },
    close() {
      stopped = true
      clearInterval(frameTimer)
    }
  }
}
