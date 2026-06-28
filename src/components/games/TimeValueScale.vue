<script setup lang="ts">
import { ref, computed } from 'vue'
import { speak } from '../../composables/useSound'

const props = defineProps<{
  days: number
  extraEarnings: number
}>()

const emit = defineEmits<{
  complete: []
}>()

const balance = ref(0) // -100 to 100, negative = left heavier, positive = right heavier
const isDragging = ref(false)
const stage = ref<'intro' | 'playing' | 'result'>('intro')

const leftLabel = `${props.days}天等待`
const rightLabel = `${props.extraEarnings.toFixed(1)}元额外利息`

const leftWeight = computed(() => {
  // 初始两边平衡，拖动后按 balance 值倾斜
  return 50 - balance.value * 0.3
})

const rightWeight = computed(() => {
  return 50 + balance.value * 0.3
})

function onPointerDown() { isDragging.value = true }
function onPointerUp() {
  isDragging.value = false
  stage.value = 'result'
  // 检查结论
  if (balance.value > 20) {
    speak('等待比多赚的钱更值钱？再想想')
  } else if (balance.value < -20) {
    speak('对！耐心等待，多赚的钱是值得的')
  } else {
    speak('两边都重要，但耐心让你收获更多')
  }
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  const slider = e.currentTarget as HTMLElement
  if (!slider) return
  const rect = slider.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width
  balance.value = (x - 0.5) * 200
}

function reset() {
  balance.value = 0
  stage.value = 'playing'
}

function finish() {
  emit('complete')
}
</script>

<template>
  <div class="time-scale card">
    <h3 class="scale-title">⚖️ 时间值多少钱？</h3>

    <div v-if="stage === 'intro'" class="intro">
      <p class="intro-question">
        龟爷爷问："同样{{ props.days }}元，存存等了{{ props.days }}天多赚了{{ extraEarnings.toFixed(1) }}元。
        <br/>多等的{{ props.days }}天，值这{{ extraEarnings.toFixed(1) }}元吗？"
      </p>
      <button class="btn btn-primary" @click="stage = 'playing'">
        拖一拖天平就知道了！
      </button>
    </div>

    <div v-else class="scale-area">
      <!-- 天平可视化 -->
      <div class="balance-scene">
        <div class="beam" :style="{ transform: `rotate(${balance * 0.15}deg)` }">
          <div class="pan left" :style="{ bottom: (30 - balance * 0.15) + 'px' }">
            <div class="pan-label">{{ leftLabel }}</div>
            <div class="pan-icon">⏳</div>
          </div>
          <div class="fulcrum">△</div>
          <div class="pan right" :style="{ bottom: (30 + balance * 0.15) + 'px' }">
            <div class="pan-label">{{ rightLabel }}</div>
            <div class="pan-icon">💰</div>
          </div>
        </div>
      </div>

      <!-- 拖拽滑块 -->
      <div
        class="balance-slider"
        @pointerdown="onPointerDown"
        @pointerup="onPointerUp"
        @pointermove="onPointerMove"
        @pointerleave="isDragging = false"
        :class="{ dragging: isDragging }"
      >
        <div class="slider-track">
          <div class="slider-fill" :style="{ width: (balance + 100) / 2 + '%' }"></div>
        </div>
        <div class="slider-thumb" :style="{ left: ((balance + 100) / 2) + '%' }">
          <span v-if="balance < -10">⏳</span>
          <span v-else-if="balance > 10">💰</span>
          <span v-else>⚖️</span>
        </div>
        <div class="slider-labels">
          <span>耐心更值钱 ←</span>
          <span>→ 钱更重要</span>
        </div>
      </div>

      <!-- 结果 -->
      <div v-if="stage === 'result'" class="scale-result">
        <div class="result-box" :class="{ left: balance < -10, right: balance > 10, balanced: balance >= -10 && balance <= 10 }">
          <p v-if="balance < -10">
            ✅ 多等{{ props.days }}天，多赚{{ extraEarnings.toFixed(1) }}元，值得！耐心是有回报的！
          </p>
          <p v-else-if="balance > 10">
            钱确实重要，但多等几天就能多赚钱，<strong>忍耐也是赚钱</strong>哦！
          </p>
          <p v-else>
            两者平衡！时间就是金钱，耐心等待能让你得到更多～
          </p>
        </div>
        <div class="scale-actions">
          <button class="btn btn-info" @click="reset">🔄 再拖一次</button>
          <button class="btn btn-success" @click="finish">✅ 我明白了！</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.time-scale {
  text-align: center;
}

.scale-title {
  font-size: 16px;
  margin-bottom: 16px;
  color: var(--ocean-blue);
}

.intro-question {
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 20px;
}

/* 天平场景 */
.balance-scene {
  height: 140px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-bottom: 20px;
}

.beam {
  display: flex;
  align-items: flex-end;
  gap: 40px;
  transition: transform 0.1s;
  transform-origin: center bottom;
}

.fulcrum {
  font-size: 28px;
  color: var(--warm-brown);
  align-self: flex-end;
  margin-bottom: -4px;
}

.pan {
  width: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: bottom 0.1s;
  position: relative;
}

.pan-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--charcoal);
  margin-bottom: 4px;
}

.pan-icon { font-size: 28px; }

.pan.left .pan-icon { color: var(--sky-blue); }
.pan.right .pan-icon { color: var(--grass-green); }

/* 滑条 */
.balance-slider {
  position: relative;
  height: 60px;
  cursor: grab;
  user-select: none;
  touch-action: none;
  margin-bottom: 16px;
}

.balance-slider.dragging { cursor: grabbing; }

.slider-track {
  position: absolute;
  top: 24px;
  left: 10px;
  right: 10px;
  height: 8px;
  background: var(--light-gray);
  border-radius: 4px;
  overflow: hidden;
}

.slider-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--sky-blue), var(--grass-green));
  border-radius: 4px;
  transition: width 0.05s;
}

.slider-thumb {
  position: absolute;
  top: 14px;
  width: 36px;
  height: 36px;
  background: white;
  border: 3px solid var(--warm-brown);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateX(-50%);
  font-size: 16px;
  box-shadow: 2px 2px 0 rgba(0,0,0,0.1);
  z-index: 2;
}

.slider-labels {
  position: absolute;
  bottom: 0;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #888;
}

/* 结果 */
.scale-result { margin-top: 12px; }

.result-box {
  padding: 12px;
  border-radius: 14px;
  font-size: 15px;
  line-height: 1.8;
  margin-bottom: 12px;
}

.result-box.left { background: #E8F4FD; }
.result-box.right { background: #FFF3CD; }
.result-box.balanced { background: #F0FFF0; }

.scale-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.scale-actions .btn { font-size: 13px; padding: 8px 16px; }
</style>
