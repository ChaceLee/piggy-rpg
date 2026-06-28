<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  principal: number
  interest: number
  totalDays: number
  elapsedDays: number
  ruleName: string
}>()

const progress = computed(() =>
  props.totalDays > 0 ? Math.min(props.elapsedDays / props.totalDays, 1) : 0
)

const interestPerDay = computed(() =>
  props.totalDays > 0 ? (props.interest / props.totalDays).toFixed(2) : '0.00'
)

const daysLeft = computed(() =>
  Math.max(0, props.totalDays - props.elapsedDays)
)
</script>

<template>
  <div class="interest-timeline">
    <div class="timeline-header">
      <span class="timeline-title">{{ ruleName }}</span>
      <span class="timeline-days" v-if="daysLeft > 0">还剩 {{ daysLeft }} 天</span>
      <span class="timeline-days done" v-else>✅ 已到期</span>
    </div>

    <!-- 进度条 -->
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: (progress * 100) + '%' }">
        <div class="progress-glow"></div>
      </div>
    </div>

    <!-- 数值 -->
    <div class="timeline-numbers">
      <div class="num-item">
        <span class="num-label">本金</span>
        <span class="num-value">{{ principal }} 元</span>
      </div>
      <div class="num-item">
        <span class="num-label">累计利息</span>
        <span class="num-value interest">+{{ interest }} 元</span>
      </div>
      <div class="num-item">
        <span class="num-label">每日利息</span>
        <span class="num-value daily">{{ interestPerDay }} 元</span>
      </div>
    </div>

    <!-- 可视化蛋 -->
    <div class="egg-visual">
      <span
        v-for="i in Math.min(Math.ceil(interest * 10), 20)"
        :key="i"
        class="egg-icon"
        :style="{ animationDelay: (i * 0.1) + 's' }"
      >🥚</span>
      <span v-if="interest <= 0.05" class="egg-icon coming">🥚</span>
    </div>
  </div>
</template>

<style scoped>
.interest-timeline {
  padding: 12px;
  background: #F0F8FF;
  border-radius: 14px;
  margin: 8px 0;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.timeline-title { font-weight: 700; font-size: 14px; }
.timeline-days { font-size: 12px; color: #888; }
.timeline-days.done { color: var(--grass-green); font-weight: 700; }

.progress-track {
  height: 10px;
  background: var(--light-gray);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--sky-blue), var(--grass-green));
  border-radius: 6px;
  transition: width 0.5s ease;
  position: relative;
}

.progress-glow {
  position: absolute;
  right: 0;
  top: 0;
  width: 20px;
  height: 100%;
  background: rgba(255,255,255,0.3);
  border-radius: 6px;
  animation: glow 1.5s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

.timeline-numbers {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.num-item { flex: 1; text-align: center; }
.num-label { display: block; font-size: 10px; color: #aaa; }
.num-value { display: block; font-size: 16px; font-weight: 900; }
.num-value.interest { color: var(--grass-green); }
.num-value.daily { color: var(--sky-blue); }

.egg-visual {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  min-height: 24px;
}

.egg-icon {
  font-size: 16px;
  animation: eggAppear 0.3s ease both;
}

.egg-icon.coming {
  opacity: 0.3;
  animation: none;
}

@keyframes eggAppear {
  from { transform: scale(0) rotate(-45deg); opacity: 0; }
  to { transform: scale(1) rotate(0); opacity: 1; }
}
</style>
