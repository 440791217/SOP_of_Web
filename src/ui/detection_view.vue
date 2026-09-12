<script setup>
import { ref, onUnmounted } from 'vue'
import { startCamera, stopCamera, startFramePolling } from '../core/detection_service.js'

const rtspUrl = ref('rtsp://admin:OWTNHQ@192.168.43.126:554/h264/ch1/main/av_stream')
const cameraId = 'cam-001'
const isRunning = ref(false)
const inferenceEnabled = ref(false)
const canvasRef = ref(null)
const inferTime = ref(0)
const detectCount = ref(0)
const statusText = ref('待机')
const errorMsg = ref('')
const latency = ref(0)
const dataRate = ref(0)

let sendTimestamp = 0
let bytesReceived = 0
let rateTimer = null

let polling = null

async function handleStart() {
  errorMsg.value = ''
  try {
    statusText.value = '启动摄像头…'
    await startCamera(cameraId, rtspUrl.value)
    statusText.value = '等待RTSP连接…'

    // 等3秒让RTSP拉到第一帧
    setTimeout(() => {
      polling = startFramePolling(cameraId, onFrame, () => {
        sendTimestamp = Date.now()
      }, 25, inferenceEnabled.value)

      isRunning.value = true
      rateTimer = setInterval(() => {
        dataRate.value = bytesReceived
        bytesReceived = 0
      }, 1000)
      statusText.value = inferenceEnabled.value ? '检测中' : '预览中'
    }, 3000)
  } catch (e) {
    errorMsg.value = '启动失败: ' + (e.response?.data?.message || e.message)
    statusText.value = '失败'
  }
}

async function handleStop() {
  if (polling) {
    polling.close()
    polling = null
  }
  if (rateTimer) {
    clearInterval(rateTimer)
    rateTimer = null
  }
  try {
    await stopCamera(cameraId)
  } catch {
    // ignore
  }
  isRunning.value = false
  statusText.value = '已停止'
}

function toggleInference() {
  inferenceEnabled.value = !inferenceEnabled.value
  if (polling) {
    polling.setInference(inferenceEnabled.value)
  }
  if (isRunning.value) {
    statusText.value = inferenceEnabled.value ? '检测中' : '预览中'
  }
}

function onFrame(img, detections) {
  if (sendTimestamp) {
    latency.value = Date.now() - sendTimestamp
  }

  // 估算数据量（JPEG大小 + 检测JSON大小）
  bytesReceived += img.naturalWidth * img.naturalHeight * 0.15 // 粗估JPEG字节数

  if (detections) {
    inferTime.value = detections.inferTimeMs || 0
    detectCount.value = detections.detections?.length || 0
  }

  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight

  ctx.drawImage(img, 0, 0)

  console.log('[onFrame] detections=', detections, 'hasDet=', detections?.detections?.length)

  if (detections && detections.detections && detections.detections.length > 0) {
    console.log('[画框] 画', detections.detections.length, '个框')
    const scaleX = canvas.width / (detections.origWidth || img.naturalWidth)
    const scaleY = canvas.height / (detections.origHeight || img.naturalHeight)
    ctx.lineWidth = 2
    ctx.font = '14px Arial'
    detections.detections.forEach(d => {
      const x1 = d.x1 * scaleX
      const y1 = d.y1 * scaleY
      const x2 = d.x2 * scaleX
      const y2 = d.y2 * scaleY
      ctx.strokeStyle = '#22c55e'
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
      const label = `cls${d.clsId} ${(d.confidence * 100).toFixed(0)}%`
      ctx.fillStyle = 'rgba(34,197,94,0.85)'
      ctx.fillRect(x1, y1 - 18, ctx.measureText(label).width + 8, 18)
      ctx.fillStyle = '#fff'
      ctx.fillText(label, x1 + 4, y1 - 4)
    })
  }
}

onUnmounted(() => {
  if (polling) polling.close()
  if (rateTimer) clearInterval(rateTimer)
})
</script>

<template>
  <div class="detection-view">
    <div class="video-area">
      <canvas v-show="isRunning" ref="canvasRef" class="video-canvas"></canvas>
      <div v-show="!isRunning" class="video-placeholder">
        <div class="play-btn" @click="handleStart">▶</div>
        <span class="placeholder-text">点击开始接入视频流</span>
      </div>

      <div v-show="isRunning" class="net-monitor">
        <div class="net-row">
          <span class="net-label">延迟</span>
          <span class="net-value" :class="{ good: latency < 50, ok: latency >= 50 && latency < 150, bad: latency >= 150 }">{{ latency }}ms</span>
        </div>
        <div class="net-row">
          <span class="net-label">速率</span>
          <span class="net-value">{{ (dataRate / 1024).toFixed(1) }} KB/s</span>
        </div>
      </div>

      <div class="rtsp-bar">
        <el-input
          v-model="rtspUrl"
          placeholder="rtsp://admin:password@ip:554/h264/ch1/main/av_stream"
          size="small"
          :disabled="isRunning"
          class="rtsp-input"
        />
        <el-button v-if="!isRunning" type="primary" size="small" @click="handleStart">开始预览</el-button>
        <el-button v-else type="danger" size="small" @click="handleStop">停止</el-button>
        <el-button
          v-if="isRunning"
          :type="inferenceEnabled ? 'success' : 'info'"
          size="small"
          @click="toggleInference"
        >
          {{ inferenceEnabled ? '检测中' : '仅预览' }}
        </el-button>
      </div>
    </div>

    <div class="detection-info-bar">
      <div class="info-group">
        <span class="info-label">状态</span>
        <span class="info-value" :class="{ running: isRunning }">{{ statusText }}</span>
      </div>
      <div class="info-group">
        <span class="info-label">检测目标</span>
        <span class="info-value">{{ detectCount }}</span>
      </div>
      <div class="info-group">
        <span class="info-label">推理耗时</span>
        <span class="info-value">{{ inferTime }}ms</span>
      </div>
      <div v-if="errorMsg" class="info-group error-msg">
        <span class="info-value error">{{ errorMsg }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detection-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.video-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-canvas {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.play-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.play-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.8);
}

.placeholder-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
}

.rtsp-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.6);
}

.net-monitor {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 6px 10px;
  z-index: 10;
}

.net-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.net-row + .net-row {
  margin-top: 2px;
}

.net-label {
  color: rgba(255, 255, 255, 0.45);
}

.net-value {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  font-family: monospace;
}

.net-value.good {
  color: #22c55e;
}

.net-value.ok {
  color: #f59e0b;
}

.net-value.bad {
  color: #ef4444;
}

.rtsp-input {
  flex: 1;
}

.detection-info-bar {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 20px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  gap: 32px;
  flex-shrink: 0;
}

.detection-info-bar .info-value {
  color: var(--text-primary);
}

.detection-info-bar .info-value.running {
  color: var(--color-success);
}

.info-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-size: 12px;
  color: var(--text-muted);
}

.info-value {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

.info-value.running {
  color: var(--color-success);
}

.info-value.error {
  color: var(--color-error);
}

.error-msg {
  margin-left: auto;
}
</style>
