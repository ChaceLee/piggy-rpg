<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEventStore } from '../../stores/eventStore'
import { usePlayerStore } from '../../stores/playerStore'
import { useQuestStore } from '../../stores/questStore'
import { useGameStore } from '../../stores/gameStore'
import type { KnowledgeEvent, EventChoice } from '../../stores/eventStore'
import type { NPC } from '../../stores/questStore'

const props = defineProps<{
  eventId?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'complete', eventId: string): void
}>()

const events = useEventStore()
const player = usePlayerStore()
const quest = useQuestStore()
const game = useGameStore()

const battleState = ref<'intro' | 'battle' | 'victory' | 'defeat'>('intro')
const currentQuestionIndex = ref(0)
const playerHp = ref(100)
const enemyHp = ref(100)
const selectedChoice = ref<string | null>(null)
const showFeedback = ref(false)
const feedbackType = ref<'good' | 'bad' | 'neutral'>('neutral')
const feedbackText = ref('')
const xpEarned = ref(0)
const goldEarned = ref(0)
const battleLog = ref<string[]>([])

const currentEvent = computed(() => {
  if (props.eventId) {
    return events.availableEvents.find((e: KnowledgeEvent) => e.id === props.eventId)
  }
  return events.currentEvent
})

const enemyName = computed(() => currentEvent.value?.npc || '知识怪兽')
const enemyEmoji = computed(() => currentEvent.value?.npcEmoji || '👾')

function startBattle() {
  battleState.value = 'battle'
  playerHp.value = 100
  enemyHp.value = 100
  currentQuestionIndex.value = 0
  battleLog.value = [`⚔️ 你遇到了${enemyName.value}！`, '💡 用财商知识击败它！']
}

function selectChoice(choiceId: string) {
  if (showFeedback.value || !currentEvent.value) return

  selectedChoice.value = choiceId
  const choice = currentEvent.value.choices.find((c: EventChoice) => c.id === choiceId)
  if (!choice) return

  showFeedback.value = true
  feedbackType.value = choice.type
  feedbackText.value = choice.feedback

  if (choice.isCorrect) {
    const damage = 35 + Math.floor(Math.random() * 20)
    enemyHp.value = Math.max(0, enemyHp.value - damage)
    battleLog.value.push(`✅ 正确！对${enemyName.value}造成 ${damage} 点伤害！`)
  } else {
    const damage = choice.type === 'bad' ? 30 : 15
    playerHp.value = Math.max(0, playerHp.value - damage)
    battleLog.value.push(`❌ 错误！你受到了 ${damage} 点伤害...`)
  }

  setTimeout(() => {
    if (enemyHp.value <= 0) {
      victory()
    } else if (playerHp.value <= 0) {
      defeat()
    } else {
      nextQuestion()
    }
  }, 1500)
}

function nextQuestion() {
  showFeedback.value = false
  selectedChoice.value = null
  feedbackText.value = ''

  if (!currentEvent.value) return

  if (currentQuestionIndex.value < currentEvent.value.choices.length - 1) {
    currentQuestionIndex.value++
    battleLog.value.push(`💬 ${enemyName.value}又提出了新问题！`)
  } else {
    if (enemyHp.value > playerHp.value) {
      defeat()
    } else {
      victory()
    }
  }
}

function victory() {
  battleState.value = 'victory'
  if (!currentEvent.value) return

  const baseXp = currentEvent.value.reward * 3
  const baseGold = currentEvent.value.reward
  const hpBonus = Math.floor(playerHp.value / 10)
  xpEarned.value = baseXp + hpBonus
  goldEarned.value = baseGold

  player.addXp(xpEarned.value)
  player.addGold(goldEarned.value)
  player.addSkillXp('money-knowledge', baseXp / 2)

  events.completeEvent(currentEvent.value.id)
  game.completeEvent(currentEvent.value.id)

  player.checkBadges({
    totalEarned: player.gold,
    totalSaved: game.totalSaved,
    tasksCompleted: 0,
    knowledgeEvents: game.knowledgeEventsCompleted.length,
    bankUsed: game.unlocks.bankScene,
    interestEarned: false,
    npcsMet: quest.metNpcs.map((n: NPC) => n.id),
    moneyLearned: game.unlocks.moneyConvert,
  })

  player.saveToLocal()
  quest.saveToLocal()
  game.saveToLocal()

  battleLog.value.push(`🎉 你击败了${enemyName.value}！`)
  battleLog.value.push(`🪙 获得 ${goldEarned.value} 金币`)
  battleLog.value.push(`⭐ 获得 ${xpEarned.value} 经验值`)
}

function defeat() {
  battleState.value = 'defeat'
  battleLog.value.push('💔 你被打败了...')
  battleLog.value.push('💡 别灰心，多学习知识再来挑战吧！')
}

function closeBattle() {
  emit('close')
  if (currentEvent.value && battleState.value === 'victory') {
    emit('complete', currentEvent.value.id)
  }
}

function retry() {
  battleState.value = 'intro'
  showFeedback.value = false
  selectedChoice.value = null
  currentQuestionIndex.value = 0
  battleLog.value = []
}

onMounted(() => {
  player.loadFromLocal()
  quest.loadFromLocal()
  game.loadFromLocal()
})
</script>

<template>
  <div class="battle-overlay" @click.self="closeBattle">
    <div class="battle-container">
      <!-- 战斗场景 -->
      <div class="battle-scene">
        <div class="battle-bg">
          <div class="stars">
            <span v-for="i in 20" :key="i" class="star" :style="{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 2 + 's'
            }">✨</span>
          </div>
        </div>

        <!-- 敌人区域 -->
        <div class="enemy-area" :class="{ shake: showFeedback && feedbackType === 'good' }">
          <div class="enemy-avatar">{{ enemyEmoji }}</div>
          <div class="enemy-info">
            <div class="enemy-name">{{ enemyName }}</div>
            <div class="hp-bar">
              <div class="hp-fill enemy-hp" :style="{ width: enemyHp + '%' }"></div>
            </div>
            <div class="hp-text">{{ enemyHp }}/100</div>
          </div>
        </div>

        <!-- VS 标志 -->
        <div class="vs-text" v-if="battleState === 'battle'">VS</div>

        <!-- 玩家区域 -->
        <div class="player-area" :class="{ shake: showFeedback && feedbackType === 'bad' }">
          <div class="player-info">
            <div class="player-name">{{ player.playerName }}</div>
            <div class="hp-bar">
              <div class="hp-fill player-hp" :style="{ width: playerHp + '%' }"></div>
            </div>
            <div class="hp-text">{{ playerHp }}/100</div>
          </div>
          <div class="player-avatar">🐷</div>
        </div>
      </div>

      <!-- 介绍界面 -->
      <div v-if="battleState === 'intro'" class="battle-panel card">
        <div class="intro-content">
          <div class="intro-icon">{{ enemyEmoji }}</div>
          <h3>知识挑战！</h3>
          <p class="challenge-npc">{{ enemyName }} 要挑战你！</p>
          <p class="challenge-desc" v-if="currentEvent">{{ currentEvent.description }}</p>
          <div class="challenge-rewards">
            <p>🏆 胜利奖励：</p>
            <div class="reward-items">
              <span>🪙 {{ currentEvent?.reward }} 金币</span>
              <span>⭐ {{ currentEvent ? currentEvent.reward * 3 : 0 }} 经验</span>
            </div>
          </div>
          <button class="btn btn-primary start-btn" @click="startBattle">
            ⚔️ 开始战斗！
          </button>
          <button class="btn btn-secondary" @click="closeBattle">
            逃跑
          </button>
        </div>
      </div>

      <!-- 战斗界面 -->
      <div v-if="battleState === 'battle'" class="battle-panel card">
        <div class="question-section">
          <div class="question-header">
            <span class="question-number">第 {{ currentQuestionIndex + 1 }} 题</span>
          </div>
          <p class="question-text" v-if="currentEvent">
            {{ currentEvent.description }}
          </p>
        </div>

        <div class="choices-section">
          <button
            v-for="(choice, idx) in currentEvent?.choices"
            :key="choice.id"
            class="choice-btn"
            :class="{
              selected: selectedChoice === choice.id,
              correct: showFeedback && choice.isCorrect,
              wrong: showFeedback && selectedChoice === choice.id && !choice.isCorrect,
              disabled: showFeedback
            }"
            :disabled="showFeedback"
            @click="selectChoice(choice.id)"
          >
            <span class="choice-letter">{{ String.fromCharCode(65 + idx) }}</span>
            <span class="choice-text">{{ choice.text }}</span>
          </button>
        </div>

        <!-- 反馈提示 -->
        <Transition name="pop">
          <div v-if="showFeedback" class="feedback-popup" :class="feedbackType">
            <p>{{ feedbackText }}</p>
          </div>
        </Transition>

        <!-- 战斗日志 -->
        <div class="battle-log">
          <div v-for="(log, idx) in battleLog.slice(-4)" :key="idx" class="log-item">
            {{ log }}
          </div>
        </div>
      </div>

      <!-- 胜利界面 -->
      <div v-if="battleState === 'victory'" class="battle-panel card victory-panel">
        <div class="victory-content">
          <div class="victory-icon">🏆</div>
          <h2>胜利！</h2>
          <p class="victory-text">你成功击败了 {{ enemyName }}！</p>

          <div class="rewards-list">
            <div class="reward-row">
              <span class="reward-icon">🪙</span>
              <span class="reward-label">金币</span>
              <span class="reward-amount gain">+{{ goldEarned }}</span>
            </div>
            <div class="reward-row">
              <span class="reward-icon">⭐</span>
              <span class="reward-label">经验值</span>
              <span class="reward-amount gain">+{{ xpEarned }}</span>
            </div>
          </div>

          <div class="knowledge-point" v-if="currentEvent">
            <p>📚 知识要点：</p>
            <p class="kp-text">{{ currentEvent.knowledgePoint }}</p>
          </div>

          <button class="btn btn-primary" @click="closeBattle">
            太棒了！
          </button>
        </div>
      </div>

      <!-- 失败界面 -->
      <div v-if="battleState === 'defeat'" class="battle-panel card defeat-panel">
        <div class="defeat-content">
          <div class="defeat-icon">💔</div>
          <h2>失败了...</h2>
          <p class="defeat-text">别灰心，知识就是力量！</p>
          <p class="defeat-hint">多学习财商知识，再来挑战吧！</p>
          <div class="defeat-actions">
            <button class="btn btn-primary" @click="retry">
              🔄 再试一次
            </button>
            <button class="btn btn-secondary" @click="closeBattle">
              离开
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.battle-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.battle-container {
  width: 100%;
  max-width: 400px;
}

.battle-scene {
  position: relative;
  height: 200px;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  border: 3px solid var(--warm-brown);
  border-bottom: none;
}

.battle-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.stars {
  position: absolute;
  inset: 0;
}

.star {
  position: absolute;
  font-size: 8px;
  animation: twinkle 2s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.enemy-area {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.1s;
}

.enemy-area.shake {
  animation: shake 0.3s ease-in-out;
}

.enemy-avatar {
  font-size: 48px;
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.5));
}

.enemy-info {
  text-align: right;
}

.enemy-name {
  color: white;
  font-weight: 900;
  font-size: 14px;
  margin-bottom: 4px;
}

.player-area {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.1s;
}

.player-area.shake {
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.player-avatar {
  font-size: 48px;
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.5));
}

.player-info {
  text-align: left;
}

.player-name {
  color: white;
  font-weight: 900;
  font-size: 14px;
  margin-bottom: 4px;
}

.hp-bar {
  width: 100px;
  height: 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.hp-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.5s ease;
}

.player-hp {
  background: linear-gradient(90deg, #6BCB77, #4CAF50);
}

.enemy-hp {
  background: linear-gradient(90deg, #FF6B6B, #ee5a5a);
}

.hp-text {
  color: white;
  font-size: 10px;
  margin-top: 2px;
}

.vs-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  font-weight: 900;
  color: var(--sunny-yellow);
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
}

.battle-panel {
  border-radius: 0 0 20px 20px;
  margin: 0;
}

.intro-content {
  text-align: center;
}

.intro-icon {
  font-size: 56px;
  margin-bottom: 8px;
  animation: bounce 1s ease-in-out infinite;
}

.intro-content h3 {
  font-size: 22px;
  font-weight: 900;
  color: var(--warm-brown);
  margin-bottom: 4px;
}

.challenge-npc {
  font-weight: 700;
  color: var(--candy-red);
  margin-bottom: 8px;
}

.challenge-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
}

.challenge-rewards {
  background: var(--cream-bg);
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 12px;
}

.challenge-rewards p {
  font-size: 12px;
  font-weight: 700;
  color: var(--warm-brown);
  margin-bottom: 6px;
}

.reward-items {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 14px;
  font-weight: 700;
}

.start-btn {
  width: 100%;
  margin-bottom: 8px;
}

.question-section {
  margin-bottom: 12px;
}

.question-header {
  margin-bottom: 8px;
}

.question-number {
  font-size: 12px;
  font-weight: 700;
  color: var(--sky-blue);
  background: rgba(77, 150, 255, 0.1);
  padding: 2px 8px;
  border-radius: 8px;
}

.question-text {
  font-size: 14px;
  font-weight: 700;
  color: var(--charcoal);
  line-height: 1.6;
}

.choices-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.choice-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: white;
  border: 2px solid var(--warm-brown);
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: var(--charcoal);
  text-align: left;
  transition: all 0.2s;
}

.choice-btn:hover:not(.disabled) {
  background: var(--sunny-yellow);
  transform: translateY(-2px);
}

.choice-btn.selected {
  background: var(--sky-blue);
  color: white;
  border-color: var(--sky-blue);
}

.choice-btn.correct {
  background: var(--grass-green);
  color: white;
  border-color: var(--grass-green);
}

.choice-btn.wrong {
  background: var(--candy-red);
  color: white;
  border-color: var(--candy-red);
}

.choice-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.choice-letter {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--warm-brown);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  flex-shrink: 0;
}

.choice-btn.selected .choice-letter,
.choice-btn.correct .choice-letter,
.choice-btn.wrong .choice-letter {
  background: rgba(255, 255, 255, 0.3);
}

.choice-text {
  flex: 1;
}

.feedback-popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border: 3px solid var(--warm-brown);
  border-radius: 16px;
  padding: 16px 20px;
  text-align: center;
  z-index: 10;
  max-width: 80%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.feedback-popup.good {
  border-color: var(--grass-green);
  background: #F0FFF0;
}

.feedback-popup.bad {
  border-color: var(--candy-red);
  background: #FFF0F0;
}

.feedback-popup p {
  font-size: 13px;
  line-height: 1.6;
  font-weight: 700;
}

.battle-log {
  background: var(--charcoal);
  color: #ddd;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 11px;
  max-height: 80px;
  overflow-y: auto;
}

.log-item {
  line-height: 1.8;
}

.victory-panel {
  background: linear-gradient(135deg, #FFF8E7, #FFE5A3);
}

.victory-content {
  text-align: center;
}

.victory-icon {
  font-size: 64px;
  margin-bottom: 8px;
  animation: bounce 1s ease-in-out infinite;
}

.victory-content h2 {
  font-size: 28px;
  font-weight: 900;
  color: var(--warm-brown);
  margin-bottom: 8px;
}

.victory-text {
  font-size: 15px;
  color: #666;
  margin-bottom: 16px;
}

.rewards-list {
  background: white;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  border: 2px solid var(--warm-brown);
}

.reward-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
}

.reward-row:not(:last-child) {
  border-bottom: 1px dashed var(--light-gray);
}

.reward-icon { font-size: 20px; }
.reward-label { flex: 1; text-align: left; font-weight: 700; font-size: 14px; }
.reward-amount.gain {
  color: var(--grass-green);
  font-weight: 900;
  font-size: 16px;
}

.knowledge-point {
  background: var(--cream-bg);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  text-align: left;
}

.knowledge-point > p {
  font-size: 12px;
  font-weight: 700;
  color: var(--warm-brown);
  margin-bottom: 4px;
}

.kp-text {
  font-size: 13px;
  color: var(--charcoal);
  line-height: 1.6;
}

.defeat-panel {
  background: linear-gradient(135deg, #FFF0F0, #FFE5E5);
}

.defeat-content {
  text-align: center;
}

.defeat-icon {
  font-size: 64px;
  margin-bottom: 8px;
}

.defeat-content h2 {
  font-size: 24px;
  font-weight: 900;
  color: var(--candy-red);
  margin-bottom: 8px;
}

.defeat-text {
  font-size: 15px;
  color: #666;
  margin-bottom: 4px;
}

.defeat-hint {
  font-size: 13px;
  color: #888;
  margin-bottom: 16px;
}

.defeat-actions {
  display: flex;
  gap: 8px;
}

.defeat-actions .btn {
  flex: 1;
}

.btn-secondary {
  background: var(--light-gray);
  color: var(--charcoal);
}

.pop-enter-active, .pop-leave-active {
  transition: all 0.3s ease;
}

.pop-enter-from, .pop-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}
</style>
