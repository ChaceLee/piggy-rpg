<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventStore } from '../stores/eventStore'
import { useGameStore } from '../stores/gameStore'
import KnowledgeBattle from '../components/battle/KnowledgeBattle.vue'
import { speak } from '../composables/useSound'

const route = useRoute()
const router = useRouter()
const events = useEventStore()
const game = useGameStore()

const showBattle = ref(false)

const eventId = computed(() => route.params.id as string)
const currentEvent = computed(() =>
  events.availableEvents.find(e => e.id === eventId.value)
)

const isCompleted = computed(() =>
  game.knowledgeEventsCompleted.includes(eventId.value)
)

onMounted(() => {
  if (currentEvent.value) {
    events.triggerEvent(eventId.value)
  }
})

function startBattle() {
  showBattle.value = true
}

function onBattleComplete(completedEventId: string) {
  showBattle.value = false
}

const bgClass = computed(() => {
  if (!currentEvent.value) return ''
  return `bg-${currentEvent.value.background}`
})
</script>

<template>
  <div class="event-page" :class="bgClass">
    <div v-if="!currentEvent" class="event-error">
      <p>😅 没有找到这个事件</p>
      <button class="btn btn-primary" @click="router.push('/')">返回地图</button>
    </div>

    <template v-else>
      <div class="event-header card">
        <div class="event-npc-display">
          <span class="big-emoji">{{ currentEvent.npcEmoji }}</span>
          <div class="npc-details">
            <div class="npc-name">{{ currentEvent.npc }}</div>
            <div class="event-title">{{ currentEvent.title }}</div>
          </div>
        </div>

        <div class="event-desc">
          {{ currentEvent.description }}
        </div>

        <div class="event-rewards">
          <span class="reward-tag">🪙 {{ currentEvent.reward }}元</span>
          <span class="reward-tag">⭐ {{ currentEvent.reward * 3 }}经验</span>
        </div>

        <div v-if="isCompleted" class="completed-badge">
          ✅ 已完成
        </div>

        <button
          v-else
          class="btn btn-primary start-battle-btn"
          @click="startBattle"
        >
          ⚔️ 开始挑战！
        </button>
      </div>

      <div class="event-info card">
        <h3>📚 知识要点</h3>
        <p class="kp-text">{{ currentEvent.knowledgePoint }}</p>
      </div>

      <div class="event-hint card">
        <h3>💡 小提示</h3>
        <p>触发条件：{{ currentEvent.triggerCondition }}</p>
      </div>
    </template>

    <KnowledgeBattle
      v-if="showBattle"
      :event-id="eventId"
      @close="showBattle = false"
      @complete="onBattleComplete"
    />
  </div>
</template>

<style scoped>
.event-page {
  min-height: calc(100vh - 120px);
  padding: 16px;
  padding-bottom: 100px;
}

.event-error {
  text-align: center;
  padding: 60px 20px;
}

.event-error p { font-size: 18px; margin-bottom: 20px; }

.event-header {
  text-align: center;
  margin-bottom: 16px;
}

.event-npc-display {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  text-align: left;
}

.big-emoji {
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

.npc-details { flex: 1; }

.npc-name {
  font-size: 20px;
  font-weight: 900;
  color: var(--warm-brown);
}

.event-title {
  font-size: 14px;
  color: var(--ocean-blue);
  font-weight: 700;
  margin-top: 2px;
}

.event-desc {
  background: var(--cream-bg);
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--charcoal);
  margin-bottom: 12px;
  text-align: left;
}

.event-rewards {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 12px;
}

.reward-tag {
  background: white;
  border: 2px solid var(--warm-brown);
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
}

.completed-badge {
  background: var(--grass-green);
  color: white;
  padding: 10px;
  border-radius: 12px;
  font-weight: 900;
  font-size: 16px;
}

.start-battle-btn {
  width: 100%;
  font-size: 18px;
  padding: 14px;
}

.event-info, .event-hint {
  margin-bottom: 12px;
}

.event-info h3, .event-hint h3 {
  font-size: 15px;
  font-weight: 900;
  color: var(--warm-brown);
  margin-bottom: 8px;
}

.kp-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--charcoal);
  background: var(--cream-bg);
  padding: 10px;
  border-radius: 8px;
}

.event-hint p {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}
</style>
