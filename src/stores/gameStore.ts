import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export interface GrowthNode {
  id: string
  name: string
  icon: string
  description: string
  unlocked: boolean
  requires: string[]
  condition: () => boolean
}

export const useGameStore = defineStore('game', () => {
  // === 核心状态 ===
  const totalMoney = ref(0)
  const totalSaved = ref(0)
  const totalInvested = ref(0)
  const totalSpent = ref(0)
  const knowledgeEventsCompleted = ref<string[]>([])
  const currentWeek = ref(1)
  const currentChapter = ref('chapter1')

  // === 解锁状态 ===
  const unlocks = ref<Record<string, boolean>>({
    moneyBasic: true,
    moneyConvert: false,
    piggyBasic: false,
    piggyAllocate: false,
    shopScene: false,
    bankScene: false,
    npcRabbit: false,
    npcFox: false,
    npcTurtle: false,
    parentPanel: true,
  })

  // === 成长树 ===
  const growthTree = ref<GrowthNode[]>([
    {
      id: 'san-zhi-xiao-zhu',
      name: '三只小猪',
      icon: '🐷',
      description: '认识三只小猪和它们的分工',
      unlocked: true,
      requires: [],
      condition: () => true,
    },
    {
      id: 'ren-shi-ren-min-bi',
      name: '认识人民币',
      icon: '💰',
      description: '认识所有面额和元角分换算',
      unlocked: true,
      requires: ['san-zhi-xiao-zhu'],
      condition: () => true,
    },
    {
      id: 'yin-hang-chu-xu',
      name: '银行储蓄',
      icon: '🏦',
      description: '认识银行，学习储蓄概念',
      unlocked: false,
      requires: ['ren-shi-ren-min-bi'],
      condition: () => totalSaved.value >= 50 && knowledgeEventsCompleted.value.includes('bank-intro'),
    },
    {
      id: 'tou-zi-li-cai',
      name: '投资理财',
      icon: '📈',
      description: '学习投资让钱生钱',
      unlocked: false,
      requires: ['yin-hang-chu-xu'],
      condition: () => totalSaved.value >= 100,
    },
    {
      id: 'cai-wu-zi-you',
      name: '财务自由',
      icon: '👑',
      description: '掌握所有财商知识',
      unlocked: false,
      requires: ['tou-zi-li-cai'],
      condition: () => false,
    },
  ])

  // === 第二章解锁 ===
  const chapter2Unlocked = computed(() =>
    totalSaved.value >= 50 && knowledgeEventsCompleted.value.includes('bank-intro')
  )

  const chapter2Available = computed(() => {
    // 检测存存罐是否能到达50元（从 piggy store 读取）
    return totalSaved.value >= 50
  })

  function initiateChapter2() {
    if (chapter2Available.value) {
      currentChapter.value = 'chapter2'
      unlocks.value.bankScene = true
      unlocks.value.npcRabbit = true
      growthTree.value.find(n => n.id === 'yin-hang-chu-xu')!.unlocked = true
      saveToLocal()
    }
  }

  // === 游戏设置（家长可配置） ===
  const settings = ref({
    taskEnabled: true,
    difficultyLevel: 1, // 1-5
    realWorldRate: 100, // 游戏100元 = 现实1元
    parentApprovalRequired: true,
  })

  // === 动作 ===
  function addMoney(amount: number) {
    totalMoney.value += amount
  }

  function spendMoney(amount: number) {
    if (totalMoney.value >= amount) {
      totalMoney.value -= amount
      totalSpent.value += amount
      return true
    }
    return false
  }

  function saveToPiggy(type: 'spend' | 'save' | 'invest', amount: number) {
    if (totalMoney.value >= amount) {
      totalMoney.value -= amount
      if (type === 'save') totalSaved.value += amount
      else if (type === 'invest') totalInvested.value += amount
      else totalSpent.value += amount
      return true
    }
    return false
  }

  function completeEvent(eventId: string) {
    if (!knowledgeEventsCompleted.value.includes(eventId)) {
      knowledgeEventsCompleted.value.push(eventId)
    }
    checkUnlocks()
  }

  function checkUnlocks() {
    // Check knowledge event conditions
    if (totalSaved.value >= 10 && !unlocks.value.npcRabbit) {
      unlocks.value.npcRabbit = true
    }
    if (totalSaved.value >= 50 && !unlocks.value.npcTurtle) {
      unlocks.value.npcTurtle = true
    }
    if (knowledgeEventsCompleted.value.length >= 3 && !unlocks.value.npcFox) {
      unlocks.value.npcFox = true
    }
    if (knowledgeEventsCompleted.value.length >= 5 && !unlocks.value.bankScene) {
      unlocks.value.bankScene = true
    }

    // Update growth tree
    for (const node of growthTree.value) {
      if (!node.unlocked && node.condition()) {
        node.unlocked = true
      }
    }
  }

  function nextWeek() {
    currentWeek.value++
  }

  // === 持久化 ===
  function saveToLocal() {
    const data = {
      totalMoney: totalMoney.value,
      totalSaved: totalSaved.value,
      totalInvested: totalInvested.value,
      totalSpent: totalSpent.value,
      knowledgeEventsCompleted: knowledgeEventsCompleted.value,
      currentWeek: currentWeek.value,
      unlocks: unlocks.value,
      growthTree: growthTree.value.map(n => ({ id: n.id, unlocked: n.unlocked })),
      settings: settings.value,
    }
    localStorage.setItem('piggy-game-save', JSON.stringify(data))
  }

  function loadFromLocal() {
    const raw = localStorage.getItem('piggy-game-save')
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      totalMoney.value = data.totalMoney ?? 0
      totalSaved.value = data.totalSaved ?? 0
      totalInvested.value = data.totalInvested ?? 0
      totalSpent.value = data.totalSpent ?? 0
      knowledgeEventsCompleted.value = data.knowledgeEventsCompleted ?? []
      currentWeek.value = data.currentWeek ?? 1
      if (data.unlocks) Object.assign(unlocks.value, data.unlocks)
      if (data.settings) Object.assign(settings.value, data.settings)
      if (data.growthTree) {
        for (const saved of data.growthTree) {
          const node = growthTree.value.find(n => n.id === saved.id)
          if (node) node.unlocked = saved.unlocked
        }
      }
    } catch {}
  }

  function resetGame() {
    localStorage.removeItem('piggy-game-save')
    totalMoney.value = 0
    totalSaved.value = 0
    totalInvested.value = 0
    totalSpent.value = 0
    knowledgeEventsCompleted.value = []
    currentWeek.value = 1
    Object.keys(unlocks.value).forEach(k => {
      if (k === 'moneyBasic' || k === 'parentPanel') unlocks.value[k] = true
      else unlocks.value[k] = false
    })
    growthTree.value.forEach((n, i) => {
      n.unlocked = i < 2
    })
  }

  // 自动保存
  watch([totalMoney, totalSaved, totalInvested, totalSpent, knowledgeEventsCompleted], () => {
    saveToLocal()
  }, { deep: true })

  return {
    totalMoney, totalSaved, totalInvested, totalSpent,
    knowledgeEventsCompleted, currentWeek, currentChapter,
    unlocks, growthTree, settings,
    chapter2Unlocked, chapter2Available, initiateChapter2,
    addMoney, spendMoney, saveToPiggy,
    completeEvent, checkUnlocks, nextWeek,
    saveToLocal, loadFromLocal, resetGame,
  }
})
