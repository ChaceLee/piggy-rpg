<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { usePiggyStore } from '../stores/piggyStore'
import { useEventStore } from '../stores/eventStore'
import { usePlayerStore } from '../stores/playerStore'
import { useQuestStore } from '../stores/questStore'

const game = useGameStore()
const piggy = usePiggyStore()
const events = useEventStore()
const player = usePlayerStore()
const quest = useQuestStore()

const showBadges = ref(false)
const activeBadgeTab = ref<'all' | 'unlocked'>('all')

onMounted(() => {
  player.loadFromLocal()
  quest.loadFromLocal()
})

const totalSaved = computed(() => piggy.getBank('save')?.balance ?? 0)

const treeNodes = computed(() =>
  game.growthTree.map((node, index) => ({
    ...node,
    progress: node.id === 'san-zhi-xiao-zhu'
      ? '已完成'
      : node.id === 'ren-shi-ren-min-bi'
        ? game.knowledgeEventsCompleted.length >= 2 ? '已完成' : '进行中'
        : node.id === 'yin-hang-chu-xu'
          ? totalSaved.value >= 50 ? '🎉 可解锁' : `储蓄 ${totalSaved.value}/50 元`
          : node.id === 'tou-zi-li-cai'
            ? totalSaved.value >= 100 ? '🎉 可解锁' : `储蓄 ${totalSaved.value}/100 元`
            : '🔒 未解锁',
  }))
)

const eligibleEvents = computed(() =>
  events.getEligibleEvents(totalSaved.value, game.knowledgeEventsCompleted.length)
)

const displayedBadges = computed(() => {
  if (activeBadgeTab.value === 'unlocked') {
    return player.unlockedBadges
  }
  return player.badges
})

const categoryNames: Record<string, string> = {
  money: '💰 钱币',
  saving: '🐷 储蓄',
  invest: '📈 投资',
  challenge: '🏆 挑战',
  social: '🤝 社交',
}

function getBadgesByCategory(category: string) {
  return displayedBadges.value.filter(b => b.category === category)
}

const categories = ['money', 'saving', 'invest', 'challenge', 'social']
</script>

<template>
  <div class="growth-page">
    <h2 class="page-title">🌳 成长树</h2>

    <!-- 成长树可视化 -->
    <div class="tree-visual card">
      <div class="tree-container">
        <div class="tree-trunk"></div>
        <div
          v-for="(node, index) in treeNodes"
          :key="node.id"
          class="tree-node"
          :style="{ '--node-index': index, '--node-y': (100 - index * 18) + '%' }"
          :class="{ unlocked: node.unlocked, locked: !node.unlocked }"
        >
          <div class="node-icon">{{ node.unlocked ? node.icon : '🔒' }}</div>
          <div class="node-name">{{ node.unlocked ? node.name : '???' }}</div>
          <div v-if="node.unlocked" class="node-progress">{{ node.progress }}</div>
          <div v-if="!node.unlocked" class="node-requirement">{{ node.progress }}</div>
        </div>
      </div>
    </div>

    <!-- 知识事件入口 -->
    <div class="events-section card" v-if="eligibleEvents.length > 0">
      <h3>💡 新的知识事件！</h3>
      <div
        v-for="event in eligibleEvents"
        :key="event.id"
        class="event-entry"
        @click="$router.push('/events/' + event.id)"
      >
        <span class="event-npc-icon">{{ event.npcEmoji }}</span>
        <div class="event-info">
          <div class="event-title">{{ event.title }}</div>
          <div class="event-npc-name">来自 {{ event.npc }}</div>
        </div>
        <span class="event-reward">+{{ event.reward }}元</span>
      </div>
    </div>

    <!-- 状态摘要 -->
    <div class="summary-section">
      <div class="summary-card card">
        <div class="summary-icon">💰</div>
        <div class="summary-info">
          <div class="summary-label">认识币种</div>
          <div class="summary-value">✅ {{ game.knowledgeEventsCompleted.length }}/5</div>
        </div>
      </div>
      <div class="summary-card card">
        <div class="summary-icon">🐷</div>
        <div class="summary-info">
          <div class="summary-label">累计储蓄</div>
          <div class="summary-value">{{ totalSaved }} 元</div>
        </div>
      </div>
      <div class="summary-card card">
        <div class="summary-icon">🏆</div>
        <div class="summary-info">
          <div class="summary-label">知识事件</div>
          <div class="summary-value">{{ game.knowledgeEventsCompleted.length }} 个</div>
        </div>
      </div>
    </div>

    <!-- 玩家等级卡片 -->
    <div class="player-level-card card">
      <div class="pl-header">
        <div class="pl-avatar">🐷</div>
        <div class="pl-info">
          <div class="pl-name">{{ player.playerName }}</div>
          <div class="pl-level">Lv.{{ player.level }}</div>
        </div>
        <div class="pl-badges">
          🏅 {{ player.unlockedBadges.length }}/{{ player.badges.length }}
        </div>
      </div>
      <div class="pl-xp-bar">
        <div class="pl-xp-fill" :style="{ width: player.levelProgress + '%' }"></div>
      </div>
      <div class="pl-xp-text">
        经验值 {{ player.levelInfo.currentXp }}/{{ player.levelInfo.nextXp }}
      </div>
    </div>

    <!-- 徽章收集 -->
    <div class="badges-section card">
      <div class="badges-header" @click="showBadges = !showBadges">
        <h3>🏅 徽章收集</h3>
        <span class="badge-count">{{ player.unlockedBadges.length }}/{{ player.badges.length }}</span>
        <span class="toggle-icon">{{ showBadges ? '▲' : '▼' }}</span>
      </div>

      <Transition name="slide">
        <div v-if="showBadges" class="badges-content">
          <div class="badge-tabs">
            <button
              class="badge-tab"
              :class="{ active: activeBadgeTab === 'all' }"
              @click="activeBadgeTab = 'all'"
            >
              全部
            </button>
            <button
              class="badge-tab"
              :class="{ active: activeBadgeTab === 'unlocked' }"
              @click="activeBadgeTab = 'unlocked'"
            >
              已获得
            </button>
          </div>

          <div v-for="cat in categories" :key="cat" class="badge-category">
            <div class="cat-title">{{ categoryNames[cat] }}</div>
            <div class="cat-badges">
              <div
                v-for="badge in getBadgesByCategory(cat)"
                :key="badge.id"
                class="badge-item"
                :class="{ unlocked: badge.unlocked, locked: !badge.unlocked }"
                :title="badge.unlocked ? badge.description : '???'"
              >
                <span class="badge-icon">{{ badge.unlocked ? badge.icon : '❓' }}</span>
                <span class="badge-name">{{ badge.unlocked ? badge.name : '???' }}</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- 第二章预告 -->
    <div class="preview-card card">
      <h3>🔮 第二章预告：银行与利息</h3>
      <p>储蓄达到 50 元即可解锁！</p>
      <div class="preview-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: Math.min(100, (totalSaved / 50) * 100) + '%' }"></div>
        </div>
        <span class="progress-text">{{ totalSaved }}/50 元</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.growth-page {
  padding: 16px;
  padding-bottom: 100px;
}

/* 成长树 */
.tree-visual {
  position: relative;
  overflow: hidden;
  min-height: 300px;
}

.tree-container {
  position: relative;
  height: 340px;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  padding: 20px 0;
}

.tree-trunk {
  position: absolute;
  bottom: 0;
  width: 20px;
  height: 60%;
  background: linear-gradient(to top, #8B5E3C, #A0522D);
  border-radius: 10px 10px 0 0;
  z-index: 0;
}

.tree-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
  position: relative;
  margin: 8px 0;
}

.node-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: white;
  border: 3px solid var(--grass-green);
  border-radius: 50%;
  margin-bottom: 4px;
  box-shadow: 2px 2px 0 rgba(0,0,0,0.1);
}

.tree-node.locked .node-icon {
  border-color: var(--light-gray);
  background: #F8F8F8;
  filter: grayscale(1);
}

.node-name {
  font-size: 13px;
  font-weight: 700;
  text-align: center;
}

.node-progress {
  font-size: 10px;
  color: var(--grass-green);
  font-weight: 700;
}

.node-requirement {
  font-size: 10px;
  color: var(--candy-red);
  font-weight: 700;
}

/* 知识事件入口 */
.events-section h3 {
  font-size: 15px;
  margin-bottom: 12px;
}

.event-entry {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 2px solid var(--sunny-yellow);
  border-radius: 14px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: #FFFDF5;
}

.event-entry:active {
  transform: scale(0.98);
}

.event-npc-icon { font-size: 28px; }
.event-info { flex: 1; }
.event-title { font-weight: 700; font-size: 14px; }
.event-npc-name { font-size: 12px; color: #888; }
.event-reward { font-size: 14px; font-weight: 900; color: var(--grass-green); }

/* 摘要 */
.summary-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin: 12px 0;
}

.summary-card {
  text-align: center;
  padding: 12px 8px;
}

.summary-icon { font-size: 24px; margin-bottom: 4px; }
.summary-label { font-size: 11px; color: #888; }
.summary-value { font-size: 16px; font-weight: 900; color: var(--warm-brown); }

/* 预告 */
.preview-card {
  background: linear-gradient(135deg, #F0F8FF, #E8F4FD);
}

.preview-card h3 {
  font-size: 15px;
  margin-bottom: 8px;
}

.preview-card p {
  font-size: 13px;
  color: #888;
  margin-bottom: 10px;
}

.preview-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-progress .progress-bar {
  flex: 1;
  height: 10px;
  background: var(--light-gray);
  border-radius: 6px;
  overflow: hidden;
}

.preview-progress .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--sky-blue), var(--soft-purple));
  border-radius: 6px;
  transition: width 0.5s ease;
}

.preview-progress .progress-text {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.player-level-card {
  background: linear-gradient(135deg, #FFF8E7, #FFE5A3);
}

.pl-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.pl-avatar {
  font-size: 36px;
  background: white;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--warm-brown);
}

.pl-info {
  flex: 1;
}

.pl-name {
  font-weight: 900;
  font-size: 16px;
  color: var(--warm-brown);
}

.pl-level {
  font-size: 12px;
  color: var(--sky-blue);
  font-weight: 700;
  margin-top: 2px;
}

.pl-badges {
  font-size: 12px;
  font-weight: 700;
  color: var(--warm-brown);
  background: white;
  padding: 4px 10px;
  border-radius: 12px;
  border: 2px solid var(--warm-brown);
}

.pl-xp-bar {
  height: 8px;
  background: rgba(139, 94, 60, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.pl-xp-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--sky-blue), var(--grass-green));
  border-radius: 4px;
  transition: width 0.5s ease;
}

.pl-xp-text {
  font-size: 11px;
  color: #888;
  text-align: right;
}

.badges-section {
  margin: 12px 0;
}

.badges-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.badges-header h3 {
  flex: 1;
  font-size: 15px;
  margin: 0;
}

.badge-count {
  font-size: 13px;
  font-weight: 700;
  color: var(--warm-brown);
  margin-right: 8px;
}

.toggle-icon {
  font-size: 12px;
  color: #888;
}

.badges-content {
  margin-top: 12px;
}

.badge-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.badge-tab {
  flex: 1;
  padding: 6px;
  border: 2px solid var(--warm-brown);
  border-radius: 10px;
  background: white;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}

.badge-tab.active {
  background: var(--sunny-yellow);
}

.badge-category {
  margin-bottom: 12px;
}

.cat-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--warm-brown);
  margin-bottom: 6px;
}

.cat-badges {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  background: white;
  border: 2px solid var(--warm-brown);
  border-radius: 10px;
  text-align: center;
}

.badge-item.unlocked {
  background: linear-gradient(135deg, #FFF8E7, #FFE5A3);
}

.badge-item.locked {
  opacity: 0.5;
  filter: grayscale(0.8);
}

.badge-icon {
  font-size: 24px;
  margin-bottom: 2px;
}

.badge-name {
  font-size: 10px;
  font-weight: 700;
  color: var(--warm-brown);
  line-height: 1.2;
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from, .slide-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}
</style>
