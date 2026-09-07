<script setup>
import { Warning } from '@element-plus/icons-vue'

defineProps({
  steps: {
    type: Array,
    default: () => [
      { id: 1, num: '01', name: '放置产品', status: 'pending' },
      { id: 2, num: '02', name: '安装后端盖', status: 'pending' },
      { id: 3, num: '03', name: '打钉', status: 'pending' },
      { id: 4, num: '04', name: '移走产品', status: 'pending' }
    ]
  }
})

const errorInfo = {
  workstation: '工位④',
  detection: '打钉缺失',
  step: '流程5-03 打钉',
  time: '14:33:07'
}

function nodeClass(status) {
  if (status === 'completed') return 'node-completed'
  if (status === 'error') return 'node-error'
  return 'node-pending'
}
</script>

<template>
  <div class="process-step-panel">
    <div class="panel-header">
      <span class="panel-title">当前流程步骤</span>
      <span class="process-badge">流程5</span>
    </div>

    <el-scrollbar class="panel-scroll">
      <el-timeline class="step-timeline">
        <el-timeline-item
          v-for="step in steps"
          :key="step.id"
          :class="step.status"
          :hollow="step.status === 'pending'"
        >
          <template #dot>
            <div
              v-if="step.status === 'sim' && step.color"
              class="timeline-dot"
              :style="{ background: step.color, color: '#fff' }"
            >
              <span>!</span>
            </div>
            <div v-else class="timeline-dot" :class="nodeClass(step.status)">
              <span v-if="step.status === 'completed'">✓</span>
              <span v-else-if="step.status === 'error'">!</span>
            </div>
          </template>
          <div class="step-content" :class="step.status">
            <span class="step-num">{{ step.num }}</span>
            <span class="step-name" :class="step.status">{{ step.name }}</span>
          </div>
        </el-timeline-item>
      </el-timeline>

      <div class="error-detail-section">
        <div class="error-banner">
          <el-icon class="banner-icon"><Warning /></el-icon>
          <span>异常详情</span>
        </div>
        <div class="error-card">
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="工位">{{ errorInfo.workstation }}</el-descriptions-item>
            <el-descriptions-item label="检测">
              <span class="error-text">{{ errorInfo.detection }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="步骤">{{ errorInfo.step }}</el-descriptions-item>
            <el-descriptions-item label="时间">
              <span class="mono">{{ errorInfo.time }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped>
.process-step-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.process-badge {
  color: var(--text-secondary);
  font-size: 13px;
}

.panel-scroll {
  flex: 1;
}

.step-timeline {
  padding: 16px 16px 8px;
}

.timeline-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
}

.node-completed {
  background: #3bce5a;
  color: #fff;
}

.node-error {
  background: #e54848;
  color: #fff;
}

.node-pending {
  border: 2px solid #8b8b8b;
  background: transparent;
}

.step-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.step-num {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
}

.step-name {
  font-size: 14px;
  color: var(--text-primary);
}

.step-name.error {
  color: var(--color-error);
  font-weight: 600;
}

.error-detail-section {
  margin-top: 8px;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #c0392b, #e74c3c);
}

.banner-icon {
  font-size: 15px;
}

.error-card {
  margin: 12px;
  padding: 4px;
  background: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.error-text {
  color: var(--color-error);
  font-weight: 600;
}

.mono {
  font-family: 'Courier New', monospace;
}
</style>
