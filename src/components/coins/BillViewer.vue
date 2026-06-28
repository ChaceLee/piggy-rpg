<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  value: number
  name: string
  emoji: string
  features: string[]
}>()

const showDetails = ref(false)

function speak() {
  if ('speechSynthesis' in window) {
    const msg = new SpeechSynthesisUtterance(`${props.name}纸币`)
    msg.lang = 'zh-CN'
    window.speechSynthesis.speak(msg)
  }
}
</script>

<template>
  <div class="bill-card card" @click="showDetails = !showDetails">
    <div class="bill-preview">
      <div class="bill-color-strip" :style="{ background: value === 5 ? '#7B2D8B' : value === 10 ? '#1E90FF' : value === 20 ? '#8B6914' : value === 50 ? '#2E8B57' : '#DC143C' }"></div>
      <div class="bill-info">
        <span class="bill-emoji">{{ emoji }}</span>
        <span class="bill-value">{{ name }}</span>
      </div>
      <div class="bill-symbol">¥{{ value }}</div>
      <button class="sound-btn" @click.stop="speak">🔊</button>
    </div>

    <Transition name="expand">
      <div v-if="showDetails" class="bill-details">
        <div class="detail-title">🔍 防伪特征：</div>
        <div v-for="(feat, i) in features" :key="i" class="feature-item">
          <span class="feature-check">✅</span>
          <span>{{ feat }}</span>
        </div>
        <div class="bill-tip">
          💡 三招辨真伪：一看水印、二摸凹凸、三听声音
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.bill-card {
  cursor: pointer;
  padding: 16px;
}

.bill-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.bill-color-strip {
  width: 8px;
  height: 48px;
  border-radius: 4px;
  flex-shrink: 0;
}

.bill-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bill-emoji { font-size: 28px; }
.bill-value { font-size: 20px; font-weight: 900; }

.bill-symbol {
  font-size: 28px;
  font-weight: 900;
  color: var(--warm-brown);
}

.sound-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
}

.bill-details {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px dashed var(--light-gray);
}

.detail-title {
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 8px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
  font-size: 14px;
}

.feature-check { font-size: 12px; }

.bill-tip {
  margin-top: 8px;
  background: #F0F8FF;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px;
  color: var(--ocean-blue);
}

.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  margin-top: 0;
}
</style>
