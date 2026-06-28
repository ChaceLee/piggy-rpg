<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuestStore } from '../stores/questStore'
import { usePlayerStore } from '../stores/playerStore'

const quest = useQuestStore()
const player = usePlayerStore()

const activeTab = ref<'main' | 'side' | 'completed'>('main')

const displayedQuests = computed(() => {
  switch (activeTab.value) {
    case 'main':
      return quest.mainQuests.filter(q => q.status !== 'locked')
    case 'side':
      return quest.sideQuests.filter(q => q.status !== 'locked')
    case 'completed':
      return quest.completedQuests
    default:
      return []
  }
})

function getStatusText(status: string) {
  const map: Record<string, string> = {
    'available': '可接取',
    'in-progress': '进行中',
    'completed': '已完成',
    'claimed': '已领取',
  }
  return map[status] || status
}

function getStatusClass(status: string) {
  return status.replace('-', '')
}

function startQuest(questId: string) {
  quest.startQuest(questId)
  quest.saveToLocal()
}

function claimReward(questId: string) {
  const reward = quest.claimQuestReward(questId)
  if (reward) {
    player.addGold(reward.gold)
    player.addXp(reward.xp)
    if (reward.skillXp) {
      for (const sk of reward.skillXp) {
        player.addSkillXp(sk.skillId, sk.amount)
      }
    }
    player.saveToLocal()
    quest.saveToLocal()
  }
}

onMounted(() => {
  quest.loadFromLocal()
  player.loadFromLocal()
})
</script>

<template>
  <div class="quest-list-page">
    <h2 class="page-title">📜 任务列表</h2>

    <div class="quest-tabs">
      <button class="quest-tab" :class="{ active: activeTab === 'main' }" @click="activeTab = 'main'">
        ⚔️ 主线
      </button>
      <button class="quest-tab" :class="{ active: activeTab === 'side' }" @click="activeTab = 'side'">
        🎯 支线
      </button>
      <button class="quest-tab" :class="{ active: activeTab === 'completed' }" @click="activeTab = 'completed'">
        🏆 已完成
      </button>
    </div>

    <div class="quest-list">
      <div v-if="displayedQuests.length === 0" class="empty-state">
        <p>这里还没有任务～</p>
        <p>继续冒险解锁更多吧！</p>
      </div>

      <div
        v-for="q in displayedQuests"
        :key="q.id"
        class="quest-card card"
        :class="getStatusClass(q.status)"
      >
        <div class="quest-header">
          <span class="quest-card-icon">{{ q.icon }}</span>
          <div class="quest-card-info">
            <div class="quest-card-title">
              {{ q.title }}
              <span class="quest-type-badge" :class="q.type">
                {{ q.type === 'main' ? '主线' : '支线' }}
              </span>
            </div>
            <div class="quest-card-chapter">第{{ q.chapter }}章</div>
          </div>
          <div class="quest-status-tag" :class="getStatusClass(q.status)">
            {{ getStatusText(q.status) }}
          </div>
        </div>

        <div class="quest-card-desc">{{ q.description }}</div>

        <div v-if="q.status === 'in-progress'" class="quest-progress-section">
          <div class="progress-info">
            <span>进度</span>
            <span>{{ q.progress }}/{{ q.target }}</span>
          </div>
          <div class="quest-progress-bar">
            <div
              class="quest-progress-fill"
              :style="{ width: (q.progress / q.target * 100) + '%' }"
            ></div>
          </div>
        </div>

        <div class="quest-rewards">
          <span class="reward-label">奖励：</span>
          <span class="reward-item">🪙 {{ q.rewards.gold }}元</span>
          <span class="reward-item">⭐ {{ q.rewards.xp }}经验</span>
        </div>

        <div class="quest-hint" v-if="q.hint && q.status !== 'claimed'">
          💡 {{ q.hint }}
        </div>

        <div class="quest-actions">
          <button
            v-if="q.status === 'available'"
            class="btn btn-primary"
            @click="startQuest(q.id)"
          >
            接取任务
          </button>
          <button
            v-else-if="q.status === 'completed'"
            class="btn btn-success"
            @click="claimReward(q.id)"
          >
            🎁 领取奖励
          </button>
          <button
            v-else-if="q.status === 'claimed'"
            class="btn btn-secondary"
            disabled
          >
            ✅ 已完成
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quest-list-page {
  padding: 16px;
  padding-bottom: 100px;
}

.quest-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.quest-tab {
  flex: 1;
  padding: 10px;
  border: 3px solid var(--warm-brown);
  border-radius: 14px;
  background: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.quest-tab.active {
  background: var(--sunny-yellow);
  transform: translateY(-2px);
  box-shadow: 2px 4px 0 var(--warm-brown);
}

.quest-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quest-card {
  position: relative;
  overflow: hidden;
}

.quest-card.inprogress {
  border-color: var(--sky-blue);
  background: linear-gradient(135deg, white, #E8F4FD);
}

.quest-card.available {
  border-color: var(--grass-green);
  background: linear-gradient(135deg, white, #F0FFF0);
}

.quest-card.completed,
.quest-card.claimed {
  opacity: 0.8;
}

.quest-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.quest-card-icon {
  font-size: 32px;
}

.quest-card-info {
  flex: 1;
}

.quest-card-title {
  font-weight: 900;
  font-size: 16px;
  color: var(--charcoal);
  display: flex;
  align-items: center;
  gap: 8px;
}

.quest-type-badge {
  font-size: 10px;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: 10px;
  color: white;
}

.quest-type-badge.main { background: var(--candy-red); }
.quest-type-badge.side { background: var(--grass-green); }

.quest-card-chapter {
  font-size: 11px;
  color: #888;
  margin-top: 2px;
}

.quest-status-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
}

.quest-status-tag.available {
  background: var(--grass-green);
  color: white;
}

.quest-status-tag.inprogress {
  background: var(--sky-blue);
  color: white;
}

.quest-status-tag.completed {
  background: var(--sunny-yellow);
  color: var(--warm-brown);
}

.quest-status-tag.claimed {
  background: var(--light-gray);
  color: #888;
}

.quest-card-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
  line-height: 1.6;
}

.quest-progress-section {
  margin-bottom: 10px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 700;
  color: var(--ocean-blue);
  margin-bottom: 4px;
}

.quest-progress-bar {
  height: 10px;
  background: rgba(77, 150, 255, 0.2);
  border-radius: 5px;
  overflow: hidden;
}

.quest-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--sky-blue), var(--grass-green));
  border-radius: 5px;
  transition: width 0.5s ease;
}

.quest-rewards {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.reward-label {
  font-size: 12px;
  color: #888;
  font-weight: 700;
}

.reward-item {
  font-size: 12px;
  font-weight: 700;
  background: var(--cream-bg);
  padding: 3px 8px;
  border-radius: 10px;
  border: 1.5px solid var(--warm-brown);
}

.quest-hint {
  font-size: 12px;
  color: var(--warm-brown);
  background: var(--sunny-yellow);
  padding: 6px 10px;
  border-radius: 10px;
  margin-bottom: 10px;
}

.quest-actions .btn {
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #888;
  font-size: 15px;
  line-height: 2;
}

.btn-secondary {
  background: var(--light-gray);
  color: #888;
  cursor: not-allowed;
}
</style>
