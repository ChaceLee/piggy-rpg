<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  mode: string
  available: number
}>()

const emit = defineEmits<{
  confirm: [amount: number]
  close: []
}>()

const amount = ref(0)
const quickAmounts = computed(() => {
  if (props.mode === 'fixed7' || props.mode === 'fixed30') {
    return [5, 10, 20, 50]
  }
  return [1, 2, 5, 10]
})

const title = computed(() => {
  switch (props.mode) {
    case 'current': return '存入活期'
    case 'fixed7': return '开立7天定期'
    case 'fixed30': return '开立30天定期'
    default: return '存款'
  }
})

function setAmount(val: number) {
  amount.value = Math.min(val, props.available)
}

function confirm() {
  if (amount.value <= 0 || amount.value > props.available) return
  emit('confirm', amount.value)
}
</script>

<template>
  <div class="deposit-overlay" @click.self="emit('close')">
    <div class="deposit-card card">
      <h3>{{ title }}</h3>

      <div class="available-row">
        <span>可用余额</span>
        <span class="available-amount">{{ available.toFixed(1) }} 元</span>
      </div>

      <div class="amount-input">
        <div class="amount-display">
          <span class="amount-value">{{ amount }}</span>
          <span class="amount-unit">元</span>
        </div>
      </div>

      <div class="quick-btns">
        <button
          v-for="q in quickAmounts"
          :key="q"
          class="quick-btn"
          :class="{ active: amount === q }"
          :disabled="q > available"
          @click="setAmount(q)"
        >
          {{ q }}元
        </button>
        <button
          class="quick-btn"
          :class="{ active: amount === available }"
          @click="setAmount(available)"
        >
          全部
        </button>
      </div>

      <div class="action-row">
        <button
          class="btn btn-success"
          :disabled="amount <= 0 || amount > available"
          @click="confirm"
        >
          ✅ 确认存入
        </button>
        <button class="btn btn-danger" @click="emit('close')">
          ❌ 取消
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.deposit-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.deposit-card {
  width: 100%;
  max-width: 340px;
  text-align: center;
}

.deposit-card h3 {
  font-size: 18px;
  margin-bottom: 16px;
  color: var(--ocean-blue);
}

.available-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #888;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #F8F8F8;
  border-radius: 10px;
}

.available-amount { font-weight: 700; color: var(--charcoal); }

.amount-input { margin-bottom: 16px; }

.amount-display {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}

.amount-value {
  font-size: 48px;
  font-weight: 900;
  color: var(--ocean-blue);
}

.amount-unit {
  font-size: 20px;
  color: var(--warm-brown);
}

.quick-btns {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.quick-btn {
  padding: 8px 16px;
  border: 2px solid var(--light-gray);
  border-radius: 12px;
  background: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.quick-btn.active {
  background: var(--ocean-blue);
  color: white;
  border-color: var(--ocean-blue);
}

.quick-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.action-row {
  display: flex;
  gap: 8px;
}

.action-row .btn { flex: 1; font-size: 14px; }
</style>
