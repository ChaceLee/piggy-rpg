<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuestStore } from '../../stores/questStore'
import type { Quest } from '../../stores/questStore'

const props = defineProps<{
  npcId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'quest', questId: string): void
}>()

const quest = useQuestStore()
const dialogueIndex = ref(0)
const showChoices = ref(false)

const npc = computed(() => quest.getNPC(props.npcId))

const currentDialogue = computed(() => {
  if (!npc.value) return ''
  const dialogues = npc.value.dialogues.greeting
  return dialogues[Math.min(dialogueIndex.value, dialogues.length - 1)]
})

const isLastDialogue = computed(() => {
  if (!npc.value) return true
  return dialogueIndex.value >= npc.value.dialogues.greeting.length - 1
})

const availableQuests = computed(() => {
  if (!npc.value) return [] as Quest[]
  return quest.quests.filter((q: Quest) =>
    q.npcId === props.npcId &&
    (q.status === 'available' || q.status === 'in-progress')
  )
})

function nextDialogue() {
  if (!npc.value) return
  if (dialogueIndex.value < npc.value.dialogues.greeting.length - 1) {
    dialogueIndex.value++
  } else {
    showChoices.value = true
  }
}

function startQuest(questId: string) {
  quest.startQuest(questId)
  emit('quest', questId)
  emit('close')
}

onMounted(() => {
  if (npc.value) {
    quest.meetNPC(props.npcId)
  }
})
</script>

<template>
  <div class="npc-dialog-overlay" @click.self="emit('close')">
    <div class="npc-dialog-box card slide-up">
      <div class="npc-header">
        <div class="npc-avatar">{{ npc?.emoji }}</div>
        <div class="npc-info">
          <div class="npc-name">{{ npc?.name }}</div>
          <div class="npc-title">{{ npc?.title }}</div>
        </div>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="dialogue-content" @click="nextDialogue">
        <p>{{ currentDialogue }}</p>
      </div>

      <div class="dialogue-footer" v-if="!showChoices">
        <span class="tap-hint">点击继续 →</span>
      </div>

      <div class="choices-list" v-else>
        <button
          v-for="q in availableQuests"
          :key="q.id"
          class="choice-btn quest-choice"
          :class="{ 'in-progress': q.status === 'in-progress' }"
          @click="startQuest(q.id)"
        >
          <span class="quest-icon">{{ q.icon }}</span>
          <div class="quest-info">
            <div class="quest-name">
              {{ q.title }}
              <span class="quest-type" :class="q.type">
                {{ q.type === 'main' ? '主线' : '支线' }}
              </span>
            </div>
            <div class="quest-desc">{{ q.description }}</div>
          </div>
          <span class="quest-arrow">{{ q.status === 'in-progress' ? '⏳' : '▶️' }}</span>
        </button>

        <button v-if="npc?.dialogues.knowledge" class="choice-btn" @click="showChoices = false; dialogueIndex = 0">
          <span class="choice-icon">💡</span>
          <span>再聊聊天</span>
        </button>

        <button class="choice-btn" @click="emit('close')">
          <span class="choice-icon">👋</span>
          <span>再见</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.npc-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 300;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
}

.npc-dialog-box {
  width: 100%;
  max-width: 480px;
  margin: 0;
  border-radius: 24px 24px 0 0;
  animation: slideUp 0.3s ease-out;
}

.npc-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px dashed var(--light-gray);
}

.npc-avatar {
  font-size: 48px;
  background: var(--sunny-yellow);
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--warm-brown);
}

.npc-info { flex: 1; }

.npc-name {
  font-size: 18px;
  font-weight: 900;
  color: var(--warm-brown);
}

.npc-title {
  font-size: 12px;
  color: #888;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #888;
}

.dialogue-content {
  min-height: 80px;
  background: var(--cream-bg);
  border: 2px solid var(--warm-brown);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
}

.dialogue-content p {
  font-size: 15px;
  line-height: 1.8;
  color: var(--charcoal);
}

.dialogue-footer {
  text-align: right;
}

.tap-hint {
  font-size: 12px;
  color: #888;
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.choices-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.choice-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: white;
  border: 2px solid var(--warm-brown);
  border-radius: 14px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  color: var(--charcoal);
  text-align: left;
  transition: all 0.2s;
}

.choice-btn:active {
  transform: scale(0.98);
  background: var(--sunny-yellow);
}

.choice-icon { font-size: 20px; }

.quest-choice {
  background: linear-gradient(135deg, #FFF8E7, #FFE5A3);
}

.quest-choice.in-progress {
  background: linear-gradient(135deg, #E8F4FD, #D0E8FF);
}

.quest-info { flex: 1; }

.quest-name {
  font-weight: 900;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.quest-type {
  font-size: 10px;
  font-weight: 900;
  padding: 1px 6px;
  border-radius: 8px;
  color: white;
}

.quest-type.main { background: var(--candy-red); }
.quest-type.side { background: var(--grass-green); }

.quest-desc {
  font-size: 11px;
  color: #888;
  margin-top: 2px;
  font-weight: 400;
}

.quest-arrow { font-size: 16px; }

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
