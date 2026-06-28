<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestStore } from '../stores/questStore'
import { usePlayerStore } from '../stores/playerStore'
import NPCDialog from '../components/npc/NPCDialog.vue'

const router = useRouter()
const quest = useQuestStore()
const player = usePlayerStore()

const selectedLocation = ref<string | null>(null)
const showNPCDialog = ref(false)
const selectedNPCId = ref<string | null>(null)
const showPlayerInfo = ref(false)

const sortedLocations = computed(() =>
  [...quest.locations].sort((a, b) => a.y - b.y)
)

function selectLocation(locId: string) {
  const loc = quest.getLocation(locId)
  if (!loc || !loc.unlocked) return
  selectedLocation.value = locId
}

function enterLocation(locId: string) {
  const loc = quest.getLocation(locId)
  if (!loc || !loc.unlocked) return
  if (loc.sceneRoute) {
    router.push({ name: loc.sceneRoute })
  }
}

function talkToNPC(npcId: string) {
  quest.meetNPC(npcId)
  selectedNPCId.value = npcId
  showNPCDialog.value = true
}

function closeNPCDialog() {
  showNPCDialog.value = false
  selectedNPCId.value = null
}

const currentQuest = computed(() => {
  if (quest.currentQuestId) {
    return quest.getQuest(quest.currentQuestId)
  }
  return quest.inProgressQuests[0] || quest.availableQuests[0]
})

const locationNPCs = computed(() => {
  if (!selectedLocation.value) return []
  return quest.getNpcsAtLocation(selectedLocation.value)
})

const selectedLocationInfo = computed(() => {
  if (!selectedLocation.value) return null
  return quest.getLocation(selectedLocation.value)
})

function getLevelColor(level: number) {
  if (level < 5) return '#4D96FF'
  if (level < 10) return '#6BCB77'
  if (level < 15) return '#FFD93D'
  if (level < 20) return '#FF6B6B'
  return '#9B59B6'
}

onMounted(() => {
  quest.loadFromLocal()
  player.loadFromLocal()
})
</script>

<template>
  <div class="map-page">
    <div class="map-header">
      <button class="player-btn" @click="showPlayerInfo = true">
        <span class="player-avatar">🐷</span>
        <div class="player-info">
          <div class="player-name">{{ player.playerName }}</div>
          <div class="player-level" :style="{ background: getLevelColor(player.level) }">
            Lv.{{ player.level }}
          </div>
        </div>
      </button>
      <div class="header-gold">
        <span class="gold-icon">🪙</span>
        <span class="gold-amount">{{ player.gold }}</span>
      </div>
    </div>

    <div class="current-quest-bar" v-if="currentQuest" @click="selectedLocation = null">
      <span class="quest-icon">{{ currentQuest.icon }}</span>
      <div class="quest-info">
        <div class="quest-title">{{ currentQuest.title }}</div>
        <div class="quest-progress">
          <div class="progress-bar-mini">
            <div class="progress-fill-mini" :style="{ width: (currentQuest.progress / currentQuest.target * 100) + '%' }"></div>
          </div>
          <span class="progress-text">{{ currentQuest.progress }}/{{ currentQuest.target }}</span>
        </div>
      </div>
      <span class="quest-type-tag" :class="currentQuest.type">
        {{ currentQuest.type === 'main' ? '主线' : '支线' }}
      </span>
    </div>

    <div class="map-container">
      <div class="map-sky"></div>
      <div class="map-ground">
        <div class="clouds">
          <span class="cloud c1">☁️</span>
          <span class="cloud c2">☁️</span>
          <span class="cloud c3">☁️</span>
        </div>
        <div class="trees">
          <span class="tree t1" style="left: 5%; bottom: 5%">🌳</span>
          <span class="tree t2" style="left: 90%; bottom: 10%">🌲</span>
          <span class="tree t3" style="left: 40%; bottom: 3%">🌳</span>
        </div>
        <div class="paths"></div>

        <div
          v-for="loc in sortedLocations"
          :key="loc.id"
          class="location-marker"
          :class="{
            unlocked: loc.unlocked,
            locked: !loc.unlocked,
            selected: selectedLocation === loc.id,
            'has-quest': quest.inProgressQuests.some(q => q.location === loc.id) ||
                         quest.availableQuests.some(q => q.location === loc.id)
          }"
          :style="{ left: loc.x + '%', top: loc.y + '%' }"
          @click="selectLocation(loc.id)"
        >
          <div class="location-icon" :style="{ background: loc.color + '33', borderColor: loc.color }">
            <span>{{ loc.unlocked ? loc.icon : '🔒' }}</span>
          </div>
          <div class="location-name">{{ loc.name }}</div>
          <div class="quest-bounce" v-if="loc.unlocked && (quest.inProgressQuests.some(q => q.location === loc.id) || quest.availableQuests.some(q => q.location === loc.id))">
            <span>❗</span>
          </div>
        </div>
      </div>
    </div>

    <Transition name="slide-up">
      <div v-if="selectedLocationInfo" class="location-panel card">
        <div class="panel-header">
          <div class="panel-icon" :style="{ background: selectedLocationInfo.color + '33' }">
            {{ selectedLocationInfo.icon }}
          </div>
          <div class="panel-info">
            <h3>{{ selectedLocationInfo.name }}</h3>
            <p>{{ selectedLocationInfo.description }}</p>
          </div>
        </div>

        <div class="panel-npcs" v-if="locationNPCs.length > 0">
          <div class="npc-section-title">👋 这里的居民</div>
          <div class="npc-list">
            <button
              v-for="npc in locationNPCs"
              :key="npc.id"
              class="npc-item"
              @click="talkToNPC(npc.id)"
            >
              <span class="npc-emoji">{{ npc.emoji }}</span>
              <div class="npc-info">
                <div class="npc-name">{{ npc.name }}</div>
                <div class="npc-title">{{ npc.title }}</div>
              </div>
              <span class="npc-arrow">💬</span>
            </button>
          </div>
        </div>

        <div class="panel-actions">
          <button
            v-if="selectedLocationInfo.sceneRoute"
            class="btn btn-primary enter-btn"
            @click="enterLocation(selectedLocation!)"
          >
            进入 →
          </button>
          <button class="btn btn-secondary close-btn" @click="selectedLocation = null">
            关闭
          </button>
        </div>
      </div>
    </Transition>

    <NPCDialog
      v-if="showNPCDialog && selectedNPCId"
      :npc-id="selectedNPCId"
      @close="closeNPCDialog"
    />

    <Transition name="fade">
      <div v-if="showPlayerInfo" class="player-modal-overlay" @click.self="showPlayerInfo = false">
        <div class="player-modal card slide-up">
          <div class="modal-header">
            <h2>👤 角色信息</h2>
            <button class="close-x" @click="showPlayerInfo = false">✕</button>
          </div>

          <div class="player-hero">
            <div class="big-avatar">🐷</div>
            <div class="hero-info">
              <h3>{{ player.playerName }}</h3>
              <div class="level-badge" :style="{ background: getLevelColor(player.level) }">
                Lv.{{ player.level }}
              </div>
              <div class="xp-bar">
                <div class="xp-fill" :style="{ width: player.levelProgress + '%', background: getLevelColor(player.level) }"></div>
              </div>
              <div class="xp-text">经验值 {{ player.levelInfo.currentXp }}/{{ player.levelInfo.nextXp }}</div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-icon">🧠</span>
              <span class="stat-label">智慧</span>
              <span class="stat-value">{{ player.stats.wisdom }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">💰</span>
              <span class="stat-label">储蓄</span>
              <span class="stat-value">{{ player.stats.savings }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⚔️</span>
              <span class="stat-label">勇气</span>
              <span class="stat-value">{{ player.stats.courage }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🍀</span>
              <span class="stat-label">幸运</span>
              <span class="stat-value">{{ player.stats.luck }}</span>
            </div>
          </div>

          <div class="skills-section">
            <h4>📚 技能</h4>
            <div class="skills-list">
              <div v-for="skill in player.skills" :key="skill.id" class="skill-item">
                <span class="skill-icon">{{ skill.icon }}</span>
                <div class="skill-info">
                  <div class="skill-name">
                    {{ skill.name }}
                    <span class="skill-level">Lv.{{ skill.level }}</span>
                  </div>
                  <div class="skill-bar">
                    <div class="skill-fill" :style="{ width: (skill.xp / skill.xpToNext * 100) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="badges-section">
            <h4>🏅 徽章 ({{ player.unlockedBadges.length }}/{{ player.badges.length }})</h4>
            <div class="badges-grid">
              <div
                v-for="badge in player.badges"
                :key="badge.id"
                class="badge-item"
                :class="{ unlocked: badge.unlocked, locked: !badge.unlocked }"
                :title="badge.unlocked ? badge.description : '???'"
              >
                <span class="badge-icon">{{ badge.unlocked ? badge.icon : '❓' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.map-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #FFF8E7, #FFE5A3);
  border-bottom: 3px solid var(--warm-brown);
}

.player-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 2px solid var(--warm-brown);
  border-radius: 25px;
  padding: 4px 12px 4px 4px;
  cursor: pointer;
  font-family: inherit;
}

.player-avatar {
  font-size: 28px;
  background: var(--sunny-yellow);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-info {
  text-align: left;
}

.player-name {
  font-weight: 900;
  font-size: 13px;
  color: var(--warm-brown);
}

.player-level {
  display: inline-block;
  color: white;
  font-size: 10px;
  font-weight: 900;
  padding: 1px 6px;
  border-radius: 10px;
}

.header-gold {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--sunny-yellow);
  border: 2px solid var(--warm-brown);
  border-radius: 20px;
  padding: 6px 14px;
  font-weight: 900;
  font-size: 18px;
  color: var(--warm-brown);
}

.gold-icon { font-size: 20px; }

.current-quest-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: linear-gradient(90deg, #E8F4FD, #D0E8FF);
  border-bottom: 2px solid var(--sky-blue);
  cursor: pointer;
}

.quest-icon { font-size: 24px; }

.quest-info { flex: 1; }

.quest-title {
  font-weight: 900;
  font-size: 14px;
  color: var(--ocean-blue);
}

.quest-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.progress-bar-mini {
  flex: 1;
  height: 6px;
  background: rgba(77, 150, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  max-width: 120px;
}

.progress-fill-mini {
  height: 100%;
  background: var(--sky-blue);
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 11px;
  color: var(--ocean-blue);
  font-weight: 700;
}

.quest-type-tag {
  font-size: 10px;
  font-weight: 900;
  padding: 3px 8px;
  border-radius: 10px;
}

.quest-type-tag.main {
  background: var(--candy-red);
  color: white;
}

.quest-type-tag.side {
  background: var(--grass-green);
  color: white;
}

.map-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.map-sky {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(180deg, #87CEEB 0%, #B0E0E6 50%, #E0F6FF 100%);
}

.map-ground {
  position: absolute;
  top: 30%;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(ellipse at 50% 0%, #90EE90 0%, #7CCD7C 40%, #6B8E23 100%);
}

.clouds {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  pointer-events: none;
}

.cloud {
  position: absolute;
  font-size: 40px;
  opacity: 0.8;
}

.c1 { left: 10%; top: 20%; animation: float 6s ease-in-out infinite; }
.c2 { left: 60%; top: 10%; animation: float 8s ease-in-out infinite 1s; font-size: 50px; }
.c3 { left: 35%; top: 30%; animation: float 7s ease-in-out infinite 0.5s; font-size: 30px; }

.trees {
  position: absolute;
  pointer-events: none;
}

.tree {
  position: absolute;
  font-size: 36px;
}

.location-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
}

.location-marker.locked {
  cursor: not-allowed;
  opacity: 0.5;
  filter: grayscale(0.7);
}

.location-marker.selected .location-icon {
  transform: scale(1.2);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.location-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 3px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  transition: all 0.3s;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
}

.location-marker:hover .location-icon {
  transform: scale(1.1);
}

.location-name {
  margin-top: 4px;
  font-size: 11px;
  font-weight: 900;
  color: var(--warm-brown);
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 8px;
  border-radius: 10px;
  border: 1.5px solid var(--warm-brown);
  white-space: nowrap;
}

.quest-bounce {
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 18px;
  animation: bounce 1s ease-in-out infinite;
}

.location-panel {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  margin: 0;
  border-radius: 24px 24px 0 0;
  z-index: 50;
}

.panel-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.panel-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.panel-info h3 {
  font-size: 18px;
  font-weight: 900;
  color: var(--warm-brown);
}

.panel-info p {
  font-size: 13px;
  color: #888;
  margin-top: 2px;
}

.npc-section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--warm-brown);
  margin: 8px 0;
}

.npc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.npc-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: var(--cream-bg);
  border: 2px solid var(--warm-brown);
  border-radius: 14px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.npc-item:active {
  transform: scale(0.98);
}

.npc-emoji { font-size: 28px; }

.npc-info { flex: 1; text-align: left; }

.npc-name {
  font-weight: 900;
  font-size: 14px;
  color: var(--charcoal);
}

.npc-title {
  font-size: 11px;
  color: #888;
}

.npc-arrow { font-size: 18px; }

.panel-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.enter-btn { flex: 1; }

.close-btn {
  background: var(--light-gray);
  color: var(--charcoal);
  border-color: var(--warm-brown);
}

.player-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.player-modal {
  width: 100%;
  max-width: 400px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 900;
  color: var(--warm-brown);
}

.close-x {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #888;
}

.player-hero {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 2px dashed var(--light-gray);
}

.big-avatar {
  font-size: 56px;
  background: var(--sunny-yellow);
  border-radius: 50%;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--warm-brown);
}

.hero-info { flex: 1; }

.hero-info h3 {
  font-size: 20px;
  font-weight: 900;
  color: var(--warm-brown);
  margin-bottom: 4px;
}

.level-badge {
  display: inline-block;
  color: white;
  font-weight: 900;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 12px;
  margin-bottom: 6px;
}

.xp-bar {
  height: 8px;
  background: var(--light-gray);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 2px;
}

.xp-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s;
}

.xp-text {
  font-size: 11px;
  color: #888;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: var(--cream-bg);
  border-radius: 12px;
  border: 2px solid var(--warm-brown);
}

.stat-icon { font-size: 18px; }
.stat-label { flex: 1; font-size: 12px; font-weight: 700; color: var(--warm-brown); }
.stat-value { font-size: 16px; font-weight: 900; color: var(--charcoal); }

.skills-section, .badges-section {
  margin-bottom: 12px;
}

.skills-section h4, .badges-section h4 {
  font-size: 14px;
  font-weight: 900;
  color: var(--warm-brown);
  margin-bottom: 8px;
}

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skill-icon { font-size: 20px; }

.skill-info { flex: 1; }

.skill-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--charcoal);
  margin-bottom: 2px;
}

.skill-level {
  color: var(--sky-blue);
  font-size: 11px;
}

.skill-bar {
  height: 5px;
  background: var(--light-gray);
  border-radius: 3px;
  overflow: hidden;
}

.skill-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--sky-blue), var(--grass-green));
  border-radius: 3px;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.badge-item {
  aspect-ratio: 1;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 2px solid var(--warm-brown);
}

.badge-item.unlocked {
  background: var(--sunny-yellow);
}

.badge-item.locked {
  background: var(--light-gray);
  filter: grayscale(1);
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from, .slide-up-leave-to {
  transform: translate(-50%, 100%);
  opacity: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
