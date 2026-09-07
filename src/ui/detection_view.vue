<script setup>
const processName = '流程5'
const stepName = '03 打钉'
const errorText = '漏打钉'
</script>

<template>
  <div class="detection-view">
    <div class="video-area">
      <div class="video-placeholder">
        <div class="play-btn">▶</div>
        <span class="placeholder-text">等待接入视频流</span>
      </div>
    </div>

    <div class="detection-info-bar">
      <div class="info-group">
        <span class="info-label">当前检测对象</span>
        <span class="info-value">{{ processName }} - {{ stepName }}</span>
      </div>
      <div class="info-group">
        <span class="info-label">状态</span>
        <span class="info-value error">异常</span>
      </div>
      <div class="info-group">
        <span class="info-label">异常类型</span>
        <span class="info-value">{{ errorText }}</span>
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
  background: #1e1e1e;
  display: flex;
  align-items: center;
  justify-content: center;
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
  background: rgba(255, 255, 255, 0.08);
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
  border-color: rgba(255, 255, 255, 0.4);
  color: rgba(255, 255, 255, 0.8);
}

.placeholder-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.25);
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

.info-value.error {
  color: var(--color-error);
}
</style>
