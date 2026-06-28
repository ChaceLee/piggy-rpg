<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { usePiggyStore } from '../stores/piggyStore'
import { usePlayerStore } from '../stores/playerStore'
import { useQuestStore } from '../stores/questStore'
import PixiScene from '../components/characters/PixiScene.vue'
import DragCoin from '../components/piggies/DragCoin.vue'
import PiggyBank from '../components/piggies/PiggyBank.vue'
import { playCoinDrop, playCoinRain, playSuccess, playError, speak } from '../composables/useSound'

const game = useGameStore()
const piggy = usePiggyStore()
const player = usePlayerStore()
const quest = useQuestStore()

const pixiRef = ref<InstanceType<typeof PixiScene>>()

const incomeToAllocate = ref(0)
const allocation = ref({ spend: 0, save: 0, invest: 0 })
const step = ref<'idle' | 'allocating' | 'done'>('idle')
const feedback = ref('')
const showReward = ref(false)
const isDragging = ref(false)
const xpEarned = ref(0)

const investVisible = computed(() => game.currentChapter === 'chapter2')

const dragTargets = computed(() => {
  const targets = ['piggy-spend', 'piggy-save']
  if (investVisible.value) targets.push('piggy-invest')
  return targets
})

const coinPool = ref<number[]>([])

const availableToAllocate = computed(() => {
  return Math.min(player.gold, 20)
})

onMounted(() => {
  player.loadFromLocal()
  quest.loadFromLocal()
  game.loadFromLocal()
  piggy.loadFromLocal()
})

function startAllocation() {
  const amount = availableToAllocate.value
  if (amount < 2) {
    feedback.value = '至少需要2元才能分给三只小猪哦！先去完成任务赚钱吧！'
    speak('至少需要2元才能分给三只小猪，先去赚钱吧')
    return
  }
  incomeToAllocate.value = amount

  allocation.value = { spend: 0, save: 0, invest: 0 }

  coinPool.value = []
  const coinCount = Math.min(amount, 6)
  let remaining = amount
  for (let i = 0; i < coinCount; i++) {
    const val = i === coinCount - 1 ? remaining : 1
    coinPool.value.push(val)
    remaining -= val
  }

  step.value = 'allocating'
  feedback.value = `拖拽硬币分给三只小猪！花花和存存最少1元～`
  speak(`你赚了${amount}元，拖拽硬币分给三只小猪吧`)
}

function handleDrop(targetId: string, coinAmount: number, coinIndex: number) {
  coinPool.value.splice(coinIndex, 1)
  onCoinDropped(targetId, coinAmount)
}

function onCoinDropped(targetId: string, coinAmount: number) {
  let type: 'spend' | 'save' | 'invest'
  switch (targetId) {
    case 'piggy-spend': type = 'spend'; break
    case 'piggy-save': type = 'save'; break
    case 'piggy-invest': type = 'invest'; break
    default: return
  }

  const newAlloc = { ...allocation.value }
  newAlloc[type] += coinAmount

  allocation.value = newAlloc

  playCoinDrop()
  pixiRef.value?.playAnimation(type, 'coinDrop')

  const name = type === 'spend' ? '花花' : type === 'save' ? '存存' : '投投'
  speak(`${name}得到${coinAmount}元`)

  if (coinPool.value.length === 0) {
    const total = newAlloc.spend + newAlloc.save + newAlloc.invest
    if (total < incomeToAllocate.value) {
      feedback.value = `还有 ${incomeToAllocate.value - total} 元要分完哦！`
    }
  }
}

function confirmAllocation() {
  const total = allocation.value.spend + allocation.value.save + allocation.value.invest
  if (total !== incomeToAllocate.value) {
    feedback.value = '要把钱全部分完哦！'
    return
  }
  if (allocation.value.spend < 1 || allocation.value.save < 1) {
    feedback.value = '花花和存存最少要分到1元，不然它们会哭的！'
    return
  }

  piggy.deposit('spend', allocation.value.spend)
  piggy.deposit('save', allocation.value.save)
  if (allocation.value.invest > 0) {
    piggy.deposit('invest', allocation.value.invest)
  }

  player.spendGold(incomeToAllocate.value)

  game.saveToPiggy('spend', allocation.value.spend)
  game.saveToPiggy('save', allocation.value.save)
  if (allocation.value.invest > 0) {
    game.saveToPiggy('invest', allocation.value.invest)
  }

  const xpGain = Math.floor(incomeToAllocate.value * 1.5) + 5
  xpEarned.value = xpGain
  player.addXp(xpGain)
  player.addSkillXp('saving-skill', Math.floor(incomeToAllocate.value * 0.8))
  player.addSkillXp('money-knowledge', Math.floor(incomeToAllocate.value * 0.5))

  const mq3 = quest.getQuest('mq-003')
  if (mq3 && mq3.status === 'in-progress') {
    quest.updateQuestProgress('mq-003', 1)
  }

  const mq6 = quest.getQuest('mq-006')
  if (mq6 && mq6.status === 'in-progress') {
    const saveBank = piggy.getBank('save')
    if (saveBank) {
      const currentProgress = Math.min(50, saveBank.balance)
      mq6.progress = currentProgress
      if (currentProgress >= 50) {
        mq6.status = 'completed'
      }
    }
  }

  player.checkBadges({
    totalEarned: player.gold + game.totalSaved + game.totalSpent,
    totalSaved: game.totalSaved,
    tasksCompleted: 0,
    knowledgeEvents: game.knowledgeEventsCompleted.length,
    bankUsed: game.unlocks.bankScene,
    interestEarned: false,
    npcsMet: quest.metNpcs.map(n => n.id),
    moneyLearned: game.unlocks.moneyConvert,
  })

  step.value = 'done'
  feedback.value = '太棒了！分配完成！'
  showReward.value = true
  piggy.saveToLocal()
  game.saveToLocal()
  player.saveToLocal()
  quest.saveToLocal()

  playCoinRain()
  speak('分配完成，真棒！')
  pixiRef.value?.setEmotion('spend', 'happy')
  pixiRef.value?.setEmotion('save', 'happy')
  pixiRef.value?.setEmotion('invest', 'happy')
}

function resetAllocation() {
  step.value = 'idle'
  feedback.value = ''
  showReward.value = false
  coinPool.value = []
  allocation.value = { spend: 0, save: 0, invest: 0 }
}

const totalAllocated = computed(() =>
  allocation.value.spend + allocation.value.save + allocation.value.invest
)
</script>

<template>
  <div class="piggies-page">
    <h2 class="page-title">🐷 三只小猪存钱罐</h2>

    <!-- PixiJS 动画场景（投投第二章才显示） -->
    <PixiScene
      ref="pixiRef"
      :piggies="[
        { type: 'spend', scale: 0.8 },
        { type: 'save', scale: 0.8 },
        ...(investVisible ? [{ type: 'invest' as const, scale: 0.8 }] : []),
      ]"
      :show-background="true"
      :height="200"
      @piggy-click="(type) => speak(type === 'spend' ? '花花想吃糖果' : type === 'save' ? '存存在看书' : '投投在魔法修炼')"
    />

    <!-- 状态提示 -->
    <div class="feedback-bar" :class="{ active: !!feedback }" v-if="feedback">
      {{ feedback }}
    </div>

    <!-- 拖拽投币区 -->
    <div class="drag-zone" v-if="step === 'allocating'">
      <div class="coin-pool">
        <span class="pool-label">收入：</span>
        <DragCoin
          v-for="(amount, i) in coinPool"
          :key="'coin-' + i"
          :amount="amount"
          :drag-targets="dragTargets"
          @dropped="(targetId, coinAmount) => handleDrop(targetId, coinAmount, i)"
          @dragging="isDragging = $event"
        />
      </div>

      <!-- 小猪投币口（投投第二章才显示） -->
      <div class="piggy-drop-targets">
        <div
          v-for="bank in piggy.banks.filter(b => b.id !== 'invest' || investVisible)"
          :key="bank.id"
          :id="'piggy-' + bank.id"
          class="drop-target"
          :class="{ 'has-allocation': allocation[bank.id] > 0 }"
          :style="{ '--target-color': bank.color }"
        >
          <div class="target-emoji">{{ bank.emoji }}</div>
          <div class="target-name">{{ bank.name }}</div>
          <div class="target-amount" v-if="allocation[bank.id] > 0">
            +{{ allocation[bank.id] }}元
          </div>
        </div>
      </div>
    </div>

    <!-- 分配总额显示 -->
    <div class="total-row" v-if="step === 'allocating'">
      <span>已分配：{{ totalAllocated }} / {{ incomeToAllocate }} 元</span>
    </div>

    <!-- 操作按钮 -->
    <div class="action-row">
      <button v-if="step === 'idle'" class="btn btn-primary" @click="startAllocation">
        🪙 开始分钱
      </button>
      <template v-if="step === 'allocating'">
        <button class="btn btn-success" @click="confirmAllocation">✅ 确认分配</button>
        <button class="btn btn-danger" @click="resetAllocation">🔄 重新分配</button>
      </template>
      <button v-if="step === 'done'" class="btn btn-primary" @click="resetAllocation">
        🔄 再赚再分
      </button>
    </div>

    <!-- 分配完成庆祝 -->
    <Transition name="pop">
      <div v-if="showReward" class="reward-overlay" @click="showReward = false">
        <div class="reward-content card">
          <div class="reward-stars">⭐✨🌟</div>
          <h2>🎉 分配成功！</h2>
          <div class="reward-detail">
            <p>❤️ 花花得到：{{ allocation.spend }} 元</p>
            <p>📚 存存得到：{{ allocation.save }} 元</p>
            <p v-if="allocation.invest > 0">✨ 投投得到：{{ allocation.invest }} 元</p>
          </div>
          <div class="reward-actions">
            <button class="btn btn-primary" @click="showReward = false">👍 我知道了</button>
            <button class="btn btn-info" @click="$router.push('/tasks')">📋 继续做任务</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 存钱罐余额（投投第二章才显示） -->
    <div class="bank-details card">
      <h3>📊 存钱罐余额</h3>
      <div v-for="bank in piggy.banks.filter(b => b.id !== 'invest' || investVisible)" :key="bank.id" class="bank-row">
        <div class="bank-info">
          <span class="bank-emoji">{{ bank.emoji }}</span>
          <div>
            <div class="bank-name">{{ bank.name }} · {{ bank.nickname }}</div>
            <div class="bank-personality">{{ bank.personality }}</div>
          </div>
        </div>
        <div class="bank-balance">{{ bank.balance }} 元</div>
      </div>
    </div>

    <div class="tip-card card">
      <h3>💡 财商小提示</h3>
      <p>"先支付给自己"——每次拿到钱，先把储蓄的部分存好！</p>
    </div>
  </div>
</template>

<style scoped>
.piggies-page {
  padding: 16px;
  padding-bottom: 100px;
}

.feedback-bar {
  background: var(--sunny-yellow);
  border: 3px solid var(--warm-brown);
  border-radius: 16px;
  padding: 12px 16px;
  margin: 8px 0 16px;
  font-weight: 700;
  text-align: center;
  font-size: 15px;
  transition: all 0.3s;
}

/* 拖拽区 */
.drag-zone {
  margin: 16px 0;
  padding: 16px;
  background: #F8F8F8;
  border: 3px dashed var(--warm-brown);
  border-radius: 20px;
}

.coin-pool {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  min-height: 70px;
  padding: 8px;
  background: #FFFDF5;
  border: 2px dashed var(--sunny-yellow);
  border-radius: 14px;
}

.pool-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--warm-brown);
  margin-right: 4px;
}

.piggy-drop-targets {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.drop-target {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100px;
  padding: 12px 8px;
  border: 3px dashed var(--target-color);
  border-radius: 16px;
  background: rgba(255,255,255,0.8);
  transition: all 0.2s;
  min-height: 80px;
}

.drop-target.has-allocation {
  border-style: solid;
  background: color-mix(in srgb, var(--target-color) 10%, white);
}

.drop-target.is-locked {
  opacity: 0.4;
  filter: grayscale(1);
}

.target-emoji { font-size: 28px; }
.target-name { font-weight: 700; font-size: 13px; }
.target-amount {
  font-size: 16px;
  font-weight: 900;
  color: var(--target-color);
  animation: bounce 0.3s ease;
}

.total-row {
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: var(--ocean-blue);
  margin: 12px 0;
}

.action-row {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 20px 0;
}

.reward-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.reward-content { text-align: center; max-width: 360px; }
.reward-stars { font-size: 36px; margin-bottom: 8px; }
.reward-content h2 { font-size: 24px; color: var(--warm-brown); margin-bottom: 16px; }
.reward-detail { text-align: left; margin-bottom: 16px; line-height: 2; font-size: 15px; }
.reward-actions { display: flex; gap: 8px; justify-content: center; }
.reward-actions .btn { font-size: 14px; padding: 10px 16px; }

.bank-details { margin-top: 20px; }
.bank-details h3 { font-size: 16px; margin-bottom: 12px; }

.bank-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 2px dashed var(--light-gray);
}
.bank-row:last-child { border-bottom: none; }
.bank-info { display: flex; align-items: center; gap: 10px; }
.bank-emoji { font-size: 28px; }
.bank-name { font-weight: 700; font-size: 15px; }
.bank-personality { font-size: 12px; color: #888; }
.bank-balance { font-size: 24px; font-weight: 900; color: var(--warm-brown); }

.tip-card { margin-top: 12px; background: #F0FFF0; }
.tip-card h3 { font-size: 15px; margin-bottom: 8px; }
.tip-card p { font-size: 14px; line-height: 1.8; color: #555; }

.pop-enter-active, .pop-leave-active { transition: all 0.3s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: scale(0.8); }

@keyframes bounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>
