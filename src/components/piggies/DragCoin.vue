<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  amount: number
  dragTargets: string[]  // 存钱罐 DOM id
}>()

const emit = defineEmits<{
  dropped: [targetId: string, amount: number]
  dragging: [active: boolean]
}>()

const coinRef = ref<HTMLDivElement>()
const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const startPos = ref({ x: 0, y: 0 })
const offset = ref({ x: 0, y: 0 })
const showCoin = ref(true)

let hammer: any = null

onMounted(() => {
  if (!coinRef.value) return

  import('hammerjs').then(Hammer => {
    const element = coinRef.value!
    hammer = new Hammer.default(element)

    hammer.get('pan').set({ direction: Hammer.default.DIRECTION_ALL, threshold: 5 })

    hammer.on('panstart', (e: any) => {
      isDragging.value = true
      emit('dragging', true)
      startPos.value = { x: element.offsetLeft, y: element.offsetTop }
      offset.value = { x: 0, y: 0 }

      // 提升层级
      element.style.zIndex = '100'
    })

    hammer.on('pan', (e: any) => {
      offset.value = {
        x: e.deltaX,
        y: e.deltaY,
      }
    })

    hammer.on('panend', (e: any) => {
      isDragging.value = false
      emit('dragging', false)
      element.style.zIndex = '10'

      // 检测是否落在目标区域
      const dropX = startPos.value.x + e.deltaX
      const dropY = startPos.value.y + e.deltaY

      let hitTarget: string | null = null
      for (const targetId of props.dragTargets) {
        const target = document.getElementById(targetId)
        if (!target) continue

        const rect = target.getBoundingClientRect()
        const coinRect = element.getBoundingClientRect()
        const coinCenterX = coinRect.left + coinRect.width / 2
        const coinCenterY = coinRect.top + coinRect.height / 2

        if (
          coinCenterX >= rect.left &&
          coinCenterX <= rect.right &&
          coinCenterY >= rect.top &&
          coinCenterY <= rect.bottom
        ) {
          hitTarget = targetId
          break
        }
      }

      if (hitTarget) {
        emit('dropped', hitTarget, props.amount)
        showCoin.value = false
        offset.value = { x: 0, y: 0 }
      } else {
        // 回到原位
        offset.value = { x: 0, y: 0 }
      }
    })
  })
})

onUnmounted(() => {
  hammer?.destroy()
})

function resetCoin() {
  showCoin.value = true
  offset.value = { x: 0, y: 0 }
}
</script>

<template>
  <div
    v-if="showCoin"
    ref="coinRef"
    class="drag-coin"
    :class="{ dragging: isDragging }"
    :style="{
      transform: `translate(${offset.x}px, ${offset.y}px)`,
      cursor: isDragging ? 'grabbing' : 'grab',
    }"
  >
    <div class="coin-body">
      <span class="coin-emoji">🪙</span>
      <span class="coin-value">{{ amount }}元</span>
    </div>
  </div>
</template>

<style scoped>
.drag-coin {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  user-select: none;
  touch-action: none;
  z-index: 10;
  position: relative;
  transition: transform 0.1s ease;
}

.drag-coin.dragging {
  filter: drop-shadow(0 8px 12px rgba(0,0,0,0.3));
  transform: scale(1.15);
}

.coin-body {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border: 3px solid #DAA520;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 4px 8px rgba(0,0,0,0.2),
    inset 0 2px 0 rgba(255,255,255,0.4);
}

.coin-emoji {
  font-size: 18px;
  line-height: 1;
}

.coin-value {
  font-size: 10px;
  font-weight: 900;
  color: #8B4513;
  line-height: 1;
}

@keyframes coinGlow {
  0%, 100% { box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
  50% { box-shadow: 0 4px 16px rgba(255,215,0,0.5); }
}

.drag-coin:not(.dragging) .coin-body {
  animation: coinGlow 2s ease-in-out infinite;
}
</style>
