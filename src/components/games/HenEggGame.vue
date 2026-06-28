<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  principal: number
  interestEarned: number
  daysElapsed?: number
}>()

const emit = defineEmits<{
  compound: []
}>()

const showHarvest = ref(false)
const collectedEggs = ref(0)
const showCompoundOffer = ref(false)

const henCount = computed(() => Math.min(Math.floor(props.principal), 50))
const eggsToday = computed(() => Math.round(props.interestEarned * 100))

const hens = computed(() => {
  const result = []
  for (let i = 0; i < henCount.value; i++) {
    result.push({ id: i, hasEgg: Math.random() > 0.5 })
  }
  return result
})

function collectEggs() {
  collectedEggs.value += eggsToday.value
  showHarvest.value = true

  // 当累计利息达到1元（100个蛋）时，触发复利彩蛋
  if (collectedEggs.value >= 100 && !showCompoundOffer.value) {
    setTimeout(() => {
      showCompoundOffer.value = true
    }, 1500)
  }
}

function acceptCompound() {
  emit('compound')
  showCompoundOffer.value = false
}
</script>

<template>
  <div class="hen-game card">
    <div class="game-header">
      <span class="game-title">🐔 母鸡下蛋</span>
      <span class="game-subtitle">{{ henCount }} 只母鸡在努力</span>
    </div>

    <!-- 母鸡矩阵 -->
    <div class="hen-yard">
      <div v-for="hen in hens" :key="hen.id" class="hen-unit">
        <span class="hen-emoji">🐔</span>
        <span v-if="hen.hasEgg && !showHarvest" class="egg-above">🥚</span>
      </div>
      <div v-if="henCount === 0" class="no-hens">
        还没有母鸡……把钱存进银行就能养母鸡了！
      </div>
    </div>

    <!-- 今日蛋数 -->
    <div class="egg-counter">
      <div class="egg-today">
        <span class="egg-number">{{ eggsToday }}</span>
        <span class="egg-label">个蛋/天</span>
      </div>
      <div class="egg-total">
        <span class="egg-number">{{ collectedEggs }}</span>
        <span class="egg-label">已收集</span>
      </div>
    </div>

    <button class="btn btn-primary" @click="collectEggs" :disabled="showHarvest">
      🥚 收蛋！
    </button>

    <!-- 收蛋动画 -->
    <Transition name="pop">
      <div v-if="showHarvest" class="harvest-toast">
        +{{ eggsToday }} 🥚
      </div>
    </Transition>

    <!-- 复利彩蛋 -->
    <Transition name="pop">
      <div v-if="showCompoundOffer" class="compound-offer card">
        <div class="offer-emoji">🐣</div>
        <p class="offer-text">
          兔博士："你的蛋够大了！{{ collectedEggs }}个蛋 = 1元利息！
          要不要把这1元也存进去，让它也变成下蛋的母鸡？"
        </p>
        <div class="offer-actions">
          <button class="btn btn-success" @click="acceptCompound">
            ✅ 好！让蛋变母鸡！
          </button>
          <button class="btn btn-info" @click="showCompoundOffer = false">
            🤔 下次再说
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.hen-game {
  position: relative;
  overflow: hidden;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.game-title { font-weight: 900; font-size: 16px; }
.game-subtitle { font-size: 12px; color: #888; }

.hen-yard {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 80px;
  padding: 12px;
  background: #E8F5E9;
  border-radius: 14px;
  margin-bottom: 12px;
  justify-content: center;
  align-items: center;
}

.hen-unit {
  position: relative;
  font-size: 20px;
  transition: transform 0.2s;
}

.hen-unit:hover { transform: scale(1.2); }

.egg-above {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  animation: float 2s ease-in-out infinite;
}

.no-hens { color: #aaa; font-size: 14px; text-align: center; }

.egg-counter {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 12px;
}

.egg-today, .egg-total { text-align: center; }
.egg-number { display: block; font-size: 28px; font-weight: 900; color: var(--sunny-yellow); }
.egg-label { font-size: 12px; color: #888; }

.harvest-toast {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 36px;
  font-weight: 900;
  color: var(--sunny-yellow);
  text-shadow: 2px 2px 0 rgba(0,0,0,0.1);
  pointer-events: none;
}

/* 复利彩蛋 */
.compound-offer {
  position: absolute;
  inset: 10px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: white;
}

.offer-emoji { font-size: 48px; margin-bottom: 8px; }
.offer-text { font-size: 15px; line-height: 1.8; margin-bottom: 16px; }
.offer-actions { display: flex; gap: 8px; }
.offer-actions .btn { font-size: 13px; padding: 10px 16px; }

@keyframes float {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-6px); }
}

.pop-enter-active, .pop-leave-active { transition: all 0.3s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: scale(0.5); }
</style>
