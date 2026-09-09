<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import DetectionView from '../ui/detection_view.vue'
import ProcessStepList from '../ui/process_step_list.vue'
import { formatTime, formatDate } from '../utils/time_utils.js'

const headerInfo = {
  title: 'SOP 工序检测',
  userName: '张晓明',
  workOrder: 'WO-20260821-0001',
  workstation: '工位 GW20'
}

const currentTime = ref(formatTime(new Date()))
const currentDate = ref(formatDate(new Date()))
const activeMenu = ref('detection')
const steps = ref([
  { id: 1, num: '01', name: '放置产品', status: 'pending' },
  { id: 2, num: '02', name: '安装后端盖', status: 'pending' },
  { id: 3, num: '03', name: '打钉', status: 'pending' },
  { id: 4, num: '04', name: '移走产品', status: 'pending' }
])

let timer = null

onMounted(() => {
  timer = setInterval(() => {
    const now = new Date()
    currentTime.value = formatTime(now)
    currentDate.value = formatDate(now)
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-left">
        <div class="logo-badge">AI</div>
        <span class="header-title">{{ headerInfo.title }}</span>
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          class="header-menu"
          background-color="transparent"
          text-color="#a0a0b8"
          active-text-color="#e0e0e0"
        >
          <el-menu-item index="detection">检测监控</el-menu-item>
          <el-menu-item index="history">历史记录</el-menu-item>
          <el-menu-item index="config">配置管理</el-menu-item>
          <el-menu-item index="help">帮助</el-menu-item>
        </el-menu>
      </div>
      <div class="header-center">
        <div class="info-chip">
          <span class="chip-label">工单</span>
          <span class="chip-value">{{ headerInfo.workOrder }}</span>
        </div>
        <div class="info-chip">
          <span class="chip-label">工位</span>
          <span class="chip-value">{{ headerInfo.workstation }}</span>
        </div>
      </div>
      <div class="header-right">
        <div class="clock-group">
          <span class="clock-date">{{ currentDate }}</span>
          <span class="clock-time">{{ currentTime }}</span>
        </div>
        <el-avatar :size="28" class="user-avatar">{{ headerInfo.userName[0] }}</el-avatar>
        <span class="header-user">{{ headerInfo.userName }}</span>
      </div>
    </header>

    <main class="app-main">
      <div class="main-left">
        <DetectionView />
      </div>
      <div class="main-right">
        <ProcessStepList :steps="steps" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary);
}

.app-header {
  display: flex;
  align-items: center;
  height: 52px;
  padding: 0 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.header-left {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-menu {
  border-bottom: none !important;
}

.header-menu .el-menu-item {
  height: 52px;
  line-height: 52px;
  font-size: 13px;
  border-bottom: 2px solid transparent;
}

.header-menu .el-menu-item.is-active {
  border-bottom-color: #6366f1;
}

.logo-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.info-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.chip-label {
  font-size: 11px;
  color: var(--text-muted);
}

.chip-value {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

.header-right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.clock-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.2;
}

.clock-date {
  font-size: 10px;
  color: var(--text-muted);
}

.clock-time {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.user-avatar {
  background: #6366f1;
  font-size: 12px;
  font-weight: 600;
}

.header-user {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

.app-main {
  display: flex;
  flex: 1;
  gap: 1px;
  background: var(--border-color);
  overflow: hidden;
}

.main-left {
  flex: 1;
  background: var(--bg-primary);
  overflow: hidden;
}

.main-right {
  width: 300px;
  background: var(--bg-secondary);
  flex-shrink: 0;
  overflow: hidden;
}
</style>
