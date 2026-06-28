<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  color: string
  label: string
}>()

const flipped = ref(false)
const showSparkle = ref(false)

function handleClick() {
  flipped.value = !flipped.value
  showSparkle.value = true
  setTimeout(() => { showSparkle.value = false }, 600)

  // 语音播报
  if ('speechSynthesis' in window) {
    const msg = new SpeechSynthesisUtterance(props.label)
    msg.lang = 'zh-CN'
    window.speechSynthesis.speak(msg)
  }
}
</script>

<template>
  <div class="coin-3d" :class="{ flipped }" @click="handleClick">
    <div class="coin-inner" :style="{ '--coin-color': color }">
      <div class="coin-front">
        <span class="coin-emoji">🪙</span>
        <span class="coin-value-label">{{ label }}</span>
      </div>
      <div class="coin-back">
        <span class="coin-pattern">🌾</span>
        <span class="coin-year">2024</span>
      </div>
    </div>
    <Transition name="pop">
      <span v-if="showSparkle" class="sparkle" style="top: -10px; right: -10px;">✨</span>
    </Transition>
  </div>
</template>

<style scoped>
.coin-3d {
  width: 80px;
  height: 80px;
  perspective: 300px;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
}

.coin-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s ease;
  border-radius: 50%;
}

.flipped .coin-inner {
  transform: rotateY(180deg);
}

.coin-front, .coin-back {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  border: 3px solid var(--coin-color);
  background: linear-gradient(135deg, #FFE5B4, var(--coin-color));
  box-shadow: 0 4px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5);
}

.coin-back {
  transform: rotateY(180deg);
  background: linear-gradient(135deg, var(--coin-color), #C8A96E);
}

.coin-emoji { font-size: 28px; }
.coin-value-label { font-size: 10px; font-weight: 700; margin-top: 2px; }
.coin-pattern { font-size: 24px; }
.coin-year { font-size: 10px; font-weight: 700; margin-top: 2px; }

.sparkle {
  position: absolute;
  font-size: 24px;
  animation: sparkle 0.6s ease-out;
}

@keyframes sparkle {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.5) translateY(-10px); }
}

.pop-enter-active { animation: popIn 0.3s ease; }
@keyframes popIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>
