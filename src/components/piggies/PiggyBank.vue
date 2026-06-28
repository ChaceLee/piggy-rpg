<script setup lang="ts">
import type { PiggyBank } from '../../stores/piggyStore'

const props = defineProps<{
  bank: PiggyBank
  allocation: number
  isAllocating: boolean
}>()

const emit = defineEmits<{
  adjust: [delta: number]
}>()
</script>

<template>
  <div
    class="piggy-bank"
    :class="{
      'is-allocating': isAllocating,
      'is-locked': bank.locked,
    }"
    :style="{ '--bank-color': bank.color }"
  >
    <!-- 小猪形象 -->
    <div class="piggy-face" :class="{ wiggle: isAllocating }">
      <div class="piggy-body">
        <div class="ear ear-left"></div>
        <div class="ear ear-right"></div>
        <div class="eye eye-left"></div>
        <div class="eye eye-right"></div>
        <div class="nose"></div>
      </div>
      <div class="piggy-coin-slot">🪙</div>
    </div>

    <!-- 名字 -->
    <div class="piggy-name">{{ bank.name }}</div>
    <div class="piggy-nickname">{{ bank.nickname }}</div>

    <!-- 当前分配数量 -->
    <div v-if="isAllocating && !bank.locked" class="allocation-control">
      <button class="adj-btn minus" @click="emit('adjust', -1)">−</button>
      <span class="allocation-amount">{{ allocation }}元</span>
      <button class="adj-btn plus" @click="emit('adjust', 1)">+</button>
    </div>

    <!-- 余额 -->
    <div class="balance-display">
      <span class="balance-label">当前</span>
      <span class="balance-amount">{{ bank.balance }}元</span>
    </div>

    <!-- 锁定标记 -->
    <div v-if="bank.locked && !isAllocating" class="locked-badge">
      🔒 封印中
    </div>

    <!-- 性格描述 -->
    <div class="personality">{{ bank.personality }}</div>
  </div>
</template>

<style scoped>
.piggy-bank {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: white;
  border: 3px solid var(--bank-color);
  border-radius: 20px;
  min-width: 120px;
  transition: all 0.2s;
  position: relative;
}

.piggy-bank.is-allocating {
  background: color-mix(in srgb, var(--bank-color) 8%, white);
}

.piggy-bank.is-locked {
  opacity: 0.6;
}

/* 小猪脸 - 纯CSS绘制 */
.piggy-face {
  position: relative;
  width: 70px;
  height: 70px;
  margin-bottom: 4px;
}

.piggy-body {
  position: relative;
  width: 60px;
  height: 55px;
  background: var(--bank-color);
  border-radius: 50%;
  margin: 0 auto;
}

.ear {
  position: absolute;
  width: 16px;
  height: 16px;
  background: var(--bank-color);
  border-radius: 50%;
  top: -6px;
}

.ear-left { left: 8px; }
.ear-right { right: 8px; }

.eye {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #333;
  border-radius: 50%;
  top: 18px;
}

.eye-left { left: 14px; }
.eye-right { right: 14px; }

.nose {
  position: absolute;
  width: 18px;
  height: 12px;
  background: color-mix(in srgb, var(--bank-color) 60%, #333);
  border-radius: 50%;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
}

.piggy-coin-slot {
  position: absolute;
  top: -12px;
  right: -8px;
  font-size: 18px;
  filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));
}

.piggy-name {
  font-size: 18px;
  font-weight: 900;
  color: var(--bank-color);
}

.piggy-nickname {
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
}

.allocation-control {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 4px 0;
}

.adj-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--bank-color);
  background: white;
  color: var(--bank-color);
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.adj-btn:active {
  transform: scale(0.9);
}

.allocation-amount {
  font-size: 20px;
  font-weight: 900;
  min-width: 48px;
  text-align: center;
  color: var(--bank-color);
}

.balance-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 4px;
}

.balance-label {
  font-size: 10px;
  color: #aaa;
}

.balance-amount {
  font-size: 16px;
  font-weight: 900;
  color: var(--warm-brown);
}

.locked-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.6);
  color: white;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}

.personality {
  font-size: 10px;
  color: #aaa;
  text-align: center;
  line-height: 1.3;
  margin-top: 4px;
}

.wiggle {
  animation: wiggle 0.5s ease-in-out infinite;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}
</style>
