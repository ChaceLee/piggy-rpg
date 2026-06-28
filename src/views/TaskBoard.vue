<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import { useGameStore } from '../stores/gameStore'
import { usePiggyStore } from '../stores/piggyStore'
import { usePlayerStore } from '../stores/playerStore'
import { useQuestStore } from '../stores/questStore'

const tasks = useTaskStore()
const game = useGameStore()
const piggy = usePiggyStore()
const player = usePlayerStore()
const quest = useQuestStore()

const showReward = ref(false)
const rewardAmount = ref(0)
const xpEarned = ref(0)
const leveledUp = ref(false)
const newLevel = ref(0)
const activeTab = ref<'all' | 'pending'>('pending')

const completedTaskCount = computed(() => tasks.tasks.filter(t => t.completed).length)

onMounted(() => {
  tasks.resetDailyTasks()
  player.loadFromLocal()
  quest.loadFromLocal()
})

function doTask(taskId: string) {
  tasks.completeTask(taskId)
}

function approveTask(taskId: string) {
  const reward = tasks.approveTask(taskId)
  if (reward > 0) {
    rewardAmount.value = reward
    game.addMoney(reward)
    player.addGold(reward)

    const xpGain = reward * 2 + 3
    xpEarned.value = xpGain
    const result = player.addXp(xpGain)
    if (result.leveledUp) {
      leveledUp.value = true
      newLevel.value = result.newLevel
    }

    player.addSkillXp('quest-skill', reward)

    const questResult = quest.updateQuestProgress('mq-004', 1)
    if (questResult.completed) {
      quest.claimQuestReward('mq-004')
    }

    player.checkBadges({
      totalEarned: player.gold,
      totalSaved: game.totalSaved,
      tasksCompleted: completedTaskCount.value,
      knowledgeEvents: game.knowledgeEventsCompleted.length,
      bankUsed: game.unlocks.bankScene,
      interestEarned: false,
      npcsMet: quest.metNpcs.map(n => n.id),
      moneyLearned: false,
    })

    game.saveToLocal()
    piggy.saveToLocal()
    player.saveToLocal()
    quest.saveToLocal()
    showReward.value = true
  }
}

function rejectTask(taskId: string) {
  tasks.rejectTask(taskId)
}

const taskTypeEmoji: Record<string, string> = {
  study: '📖', chore: '🏠', challenge: '🏆', social: '🤝',
}

const taskTypeLabel: Record<string, string> = {
  study: '学习', chore: '家务', challenge: '挑战', social: '社交',
}
</script>

<template>
  <div class="tasks-page">
    <h2 class="page-title">📋 每日任务</h2>

    <!-- 今日收入统计 -->
    <div class="earnings-card card">
      <div class="earnings-left">
        <span class="earnings-icon">🪙</span>
        <div>
          <div class="earnings-label">今日收入</div>
          <div class="earnings-amount">{{ tasks.todayEarnings }} 元</div>
        </div>
      </div>
      <div class="earnings-right">
        <div class="coin-drop" v-for="i in Math.min(tasks.todayEarnings, 5)" :key="i"
          :style="{ animationDelay: i * 0.1 + 's' }">
          🪙
        </div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="task-tabs">
      <button class="task-tab" :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'">
        📌 待完成 ({{ tasks.pendingTasks.length }})
      </button>
      <button class="task-tab" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
        📋 全部
      </button>
    </div>

    <!-- 待完成清单 -->
    <div v-if="activeTab === 'pending'" class="task-list">
      <div v-if="tasks.pendingTasks.length === 0" class="empty-state">
        <p>🎉 所有任务都完成了！</p>
        <p>今天真棒，休息一下吧～</p>
      </div>

      <div v-for="task in tasks.pendingTasks" :key="task.id" class="task-card card">
        <div class="task-header">
          <div class="task-type-badge" :class="task.type">
            {{ taskTypeLabel[task.type] }}
          </div>
          <div class="task-reward">
            +{{ task.reward }}元
          </div>
        </div>
        <div class="task-body">
          <span class="task-icon">{{ task.icon }}</span>
          <div class="task-info">
            <div class="task-title">{{ task.title }}</div>
            <div class="task-desc">{{ task.description }}</div>
          </div>
        </div>
        <button class="btn btn-primary task-btn" @click="doTask(task.id)">
          ✋ 我完成了！
        </button>
      </div>
    </div>

    <!-- 全部清单（含审批） -->
    <div v-if="activeTab === 'all'" class="task-list">
      <!-- 待审批 -->
      <div v-if="tasks.pendingApprovalTasks.length > 0" class="approval-section">
        <h3 class="section-title">⏳ 等待家长确认</h3>
        <div v-for="task in tasks.pendingApprovalTasks" :key="task.id" class="task-card card pending">
          <div class="task-header">
            <div class="task-type-badge" :class="task.type">
              {{ taskTypeLabel[task.type] }}
            </div>
            <div class="task-reward">
              +{{ task.reward }}元
            </div>
          </div>
          <div class="task-body">
            <span class="task-icon">{{ task.icon }}</span>
            <div class="task-info">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-desc">{{ task.description }}</div>
            </div>
          </div>
          <div class="approval-actions">
            <button class="btn btn-success" @click="approveTask(task.id)">✅ 确认</button>
            <button class="btn btn-danger" @click="rejectTask(task.id)">❌ 未完成</button>
          </div>
        </div>
      </div>

      <!-- 已完成 -->
      <h3 class="section-title">✅ 今日已完成</h3>
      <div v-for="task in tasks.tasks.filter(t => t.completed)" :key="task.id" class="task-card card completed-card">
        <div class="task-body">
          <span class="task-icon">{{ task.icon }}</span>
          <div class="task-info">
            <div class="task-title">{{ task.title }}</div>
            <div class="task-desc">✅ 已完成 +{{ task.reward }}元</div>
          </div>
        </div>
      </div>

      <div v-if="!tasks.tasks.some(t => t.completed)" class="empty-state">
        <p>今天还没有完成的任务～</p>
      </div>
    </div>

    <!-- 审批庆祝全屏弹窗 -->
    <Transition name="pop">
      <div v-if="showReward" class="celebrate-overlay" @click.self="showReward = false">
        <div class="celebrate-card card">
          <div class="celebrate-icon">🎉</div>
          <div class="celebrate-title">任务完成！</div>
          <div class="celebrate-amount">
            <span class="celebrate-coin">🪙</span>
            <span class="celebrate-number">+{{ rewardAmount }}</span>
            <span class="celebrate-unit">元</span>
          </div>
          <div class="xp-gain">
            <span class="xp-icon">⭐</span>
            <span>经验值 +{{ xpEarned }}</span>
          </div>
          <div v-if="leveledUp" class="level-up-notice">
            <span class="level-up-text">🎊 升级了！Lv.{{ newLevel }} 🎊</span>
          </div>
          <p class="celebrate-hint">钱要分给三只小猪才能用哦！</p>
          <div class="celebrate-actions">
            <button class="btn btn-primary" @click="$router.push('/piggies')">
              🐷 去分钱
            </button>
            <button class="btn btn-info" @click="showReward = false; leveledUp = false">
              👍 继续任务
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.tasks-page {
  padding: 16px;
  padding-bottom: 100px;
}

/* 收入统计 */
.earnings-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #FFF8E7, #FFE5CC);
  margin-bottom: 16px;
}

.earnings-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.earnings-icon { font-size: 28px; }
.earnings-label { font-size: 12px; color: #888; }
.earnings-amount { font-size: 24px; font-weight: 900; color: var(--warm-brown); }

.coin-drop {
  font-size: 20px;
  animation: coinDrop 0.6s ease-out;
}

/* Tab 切换 */
.task-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.task-tab {
  flex: 1;
  padding: 10px;
  border: 3px solid var(--warm-brown);
  border-radius: 14px;
  background: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}

.task-tab.active {
  background: var(--sky-blue);
  color: white;
  border-color: var(--sky-blue);
}

/* 任务卡片 */
.task-card {
  margin: 8px 0;
}

.task-card.pending {
  border-color: var(--sunny-yellow);
  background: #FFFDF5;
}

.completed-card {
  opacity: 0.7;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-type-badge {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 700;
}

.task-type-badge.study { background: #E8F4FD; color: #4D96FF; }
.task-type-badge.chore { background: #F0FFF0; color: #6BCB77; }
.task-type-badge.challenge { background: #FFF3CD; color: #FFA94D; }
.task-type-badge.social { background: #FCE4EC; color: #FF6B6B; }

.task-reward {
  font-size: 14px;
  font-weight: 900;
  color: var(--grass-green);
}

.task-body {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-icon { font-size: 32px; }
.task-title { font-weight: 700; font-size: 16px; }
.task-desc { font-size: 13px; color: #888; margin-top: 2px; }

.task-btn {
  width: 100%;
  margin-top: 10px;
}

/* 审批区 */
.approval-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.approval-actions .btn {
  flex: 1;
  padding: 8px;
  font-size: 14px;
}

.section-title {
  font-size: 15px;
  margin: 16px 0 8px;
  color: var(--warm-brown);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #888;
  font-size: 16px;
  line-height: 2;
}

/* 全屏庆祝弹窗 */
.celebrate-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.celebrate-card {
  text-align: center;
  max-width: 340px;
  width: 100%;
  background: linear-gradient(135deg, #FFF8E7, #FFE5CC);
}

.celebrate-icon { font-size: 48px; margin-bottom: 8px; }
.celebrate-title { font-size: 22px; font-weight: 900; color: var(--warm-brown); margin-bottom: 12px; }

.celebrate-amount {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 12px;
}

.celebrate-coin { font-size: 28px; }
.celebrate-number { font-size: 42px; font-weight: 900; color: var(--grass-green); }
.celebrate-unit { font-size: 18px; color: var(--warm-brown); font-weight: 700; }

.celebrate-hint { font-size: 14px; color: #888; margin-bottom: 16px; }

.xp-gain {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 700;
  color: var(--sky-blue);
  margin-bottom: 8px;
}

.xp-icon { font-size: 18px; }

.level-up-notice {
  background: linear-gradient(90deg, var(--sunny-yellow), var(--candy-red));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 18px;
  font-weight: 900;
  margin-bottom: 12px;
  animation: pulse 0.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  from { transform: scale(1); }
  to { transform: scale(1.05); }
}

.celebrate-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.celebrate-actions .btn {
  font-size: 15px;
  padding: 12px 20px;
}

.pop-enter-active, .pop-leave-active { transition: all 0.3s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: scale(0.8); }
</style>
