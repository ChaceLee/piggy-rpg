import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export interface PlayerStats {
  wisdom: number
  savings: number
  courage: number
  luck: number
}

export interface Badge {
  id: string
  name: string
  icon: string
  description: string
  unlocked: boolean
  unlockedAt?: number
  category: 'money' | 'saving' | 'invest' | 'social' | 'challenge'
}

export interface Skill {
  id: string
  name: string
  icon: string
  description: string
  level: number
  maxLevel: number
  xp: number
  xpToNext: number
}

const LEVEL_XP_TABLE = [0, 10, 25, 45, 70, 100, 140, 190, 250, 320, 400, 500, 620, 760, 920, 1100, 1300, 1520, 1760, 2020, 2300]

function getLevelForXp(xp: number): { level: number; currentXp: number; nextXp: number; progress: number } {
  let level = 1
  for (let i = 1; i < LEVEL_XP_TABLE.length; i++) {
    if (xp >= LEVEL_XP_TABLE[i]) {
      level = i + 1
    } else {
      break
    }
  }
  const currentLevelXp = LEVEL_XP_TABLE[level - 1] || 0
  const nextLevelXp = LEVEL_XP_TABLE[level] || LEVEL_XP_TABLE[LEVEL_XP_TABLE.length - 1]
  const progress = nextLevelXp === currentLevelXp ? 100 : ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
  return {
    level,
    currentXp: xp - currentLevelXp,
    nextXp: nextLevelXp - currentLevelXp,
    progress: Math.min(100, Math.max(0, progress)),
  }
}

export const usePlayerStore = defineStore('player', () => {
  const playerName = ref('小猪勇士')
  const totalXp = ref(0)
  const gold = ref(0)

  const stats = ref<PlayerStats>({
    wisdom: 1,
    savings: 1,
    courage: 1,
    luck: 1,
  })

  const skills = ref<Skill[]>([
    { id: 'money-knowledge', name: '钱币识别', icon: '💰', description: '认识人民币面额和换算', level: 1, maxLevel: 5, xp: 0, xpToNext: 20 },
    { id: 'saving-skill', name: '储蓄达人', icon: '🐷', description: '管理存钱罐的能力', level: 1, maxLevel: 5, xp: 0, xpToNext: 20 },
    { id: 'invest-skill', name: '投资小能手', icon: '📈', description: '让钱生钱的魔法', level: 1, maxLevel: 5, xp: 0, xpToNext: 20 },
    { id: 'shopping-skill', name: '聪明消费', icon: '🛒', description: '合理花钱不浪费', level: 1, maxLevel: 5, xp: 0, xpToNext: 20 },
    { id: 'quest-skill', name: '任务专家', icon: '⚔️', description: '完成任务获得奖励', level: 1, maxLevel: 5, xp: 0, xpToNext: 20 },
  ])

  const badges = ref<Badge[]>([
    { id: 'first-coin', name: '第一枚金币', icon: '🪙', description: '赚到第一笔零花钱', unlocked: false, category: 'money' },
    { id: 'money-master', name: '钱币大师', icon: '💰', description: '认识所有人民币面额', unlocked: false, category: 'money' },
    { id: 'first-save', name: '初次储蓄', icon: '🐷', description: '第一次把钱存入存钱罐', unlocked: false, category: 'saving' },
    { id: 'saving-50', name: '小小富翁', icon: '💎', description: '存钱罐累计存满50元', unlocked: false, category: 'saving' },
    { id: 'saving-100', name: '百元户', icon: '👑', description: '存钱罐累计存满100元', unlocked: false, category: 'saving' },
    { id: 'bank-visitor', name: '银行新客', icon: '🏦', description: '第一次去银行存钱', unlocked: false, category: 'invest' },
    { id: 'interest-earned', name: '利息初体验', icon: '🥚', description: '获得第一笔利息收入', unlocked: false, category: 'invest' },
    { id: 'compound-master', name: '复利魔法师', icon: '✨', description: '理解复利的威力', unlocked: false, category: 'invest' },
    { id: 'smart-shopper', name: '聪明买家', icon: '🛒', description: '学会比较价格再购物', unlocked: false, category: 'challenge' },
    { id: 'anti-fraud', name: '防骗小卫士', icon: '🛡️', description: '识破骗子的诡计', unlocked: false, category: 'challenge' },
    { id: 'quest-hero', name: '任务英雄', icon: '🏆', description: '完成10个任务', unlocked: false, category: 'challenge' },
    { id: 'knowledge-seeker', name: '求知若渴', icon: '📚', description: '完成5个知识事件', unlocked: false, category: 'challenge' },
    { id: 'good-friend', name: '好朋友', icon: '🤝', description: '认识所有小镇居民', unlocked: false, category: 'social' },
    { id: 'chapter1-complete', name: '第一章通关', icon: '⭐', description: '完成第一章所有内容', unlocked: false, category: 'challenge' },
    { id: 'chapter2-complete', name: '第二章通关', icon: '🌟', description: '完成第二章所有内容', unlocked: false, category: 'challenge' },
  ])

  const levelInfo = computed(() => getLevelForXp(totalXp.value))
  const level = computed(() => levelInfo.value.level)
  const levelProgress = computed(() => levelInfo.value.progress)

  const unlockedBadges = computed(() => badges.value.filter(b => b.unlocked))
  const lockedBadges = computed(() => badges.value.filter(b => !b.unlocked))

  function addXp(amount: number, reason = '') {
    const oldLevel = level.value
    totalXp.value += amount
    const newLevel = level.value
    if (newLevel > oldLevel) {
      return { leveledUp: true, newLevel, oldLevel }
    }
    return { leveledUp: false, newLevel, oldLevel }
  }

  function addGold(amount: number) {
    gold.value += amount
  }

  function spendGold(amount: number): boolean {
    if (gold.value >= amount) {
      gold.value -= amount
      return true
    }
    return false
  }

  function addSkillXp(skillId: string, amount: number): { leveledUp: boolean; newLevel: number } {
    const skill = skills.value.find(s => s.id === skillId)
    if (!skill) return { leveledUp: false, newLevel: 0 }

    const oldLevel = skill.level
    skill.xp += amount

    while (skill.xp >= skill.xpToNext && skill.level < skill.maxLevel) {
      skill.xp -= skill.xpToNext
      skill.level++
      skill.xpToNext = Math.floor(skill.xpToNext * 1.5)
      stats.value.wisdom += 1
    }

    return { leveledUp: skill.level > oldLevel, newLevel: skill.level }
  }

  function unlockBadge(badgeId: string): Badge | null {
    const badge = badges.value.find(b => b.id === badgeId)
    if (badge && !badge.unlocked) {
      badge.unlocked = true
      badge.unlockedAt = Date.now()
      addXp(15, `获得徽章：${badge.name}`)
      return badge
    }
    return null
  }

  function checkBadges(gameState: {
    totalEarned: number
    totalSaved: number
    tasksCompleted: number
    knowledgeEvents: number
    bankUsed: boolean
    interestEarned: boolean
    npcsMet: string[]
    moneyLearned: boolean
  }) {
    const newlyUnlocked: Badge[] = []

    if (gameState.totalEarned > 0) {
      const b = unlockBadge('first-coin')
      if (b) newlyUnlocked.push(b)
    }
    if (gameState.moneyLearned) {
      const b = unlockBadge('money-master')
      if (b) newlyUnlocked.push(b)
    }
    if (gameState.totalSaved > 0) {
      const b = unlockBadge('first-save')
      if (b) newlyUnlocked.push(b)
    }
    if (gameState.totalSaved >= 50) {
      const b = unlockBadge('saving-50')
      if (b) newlyUnlocked.push(b)
    }
    if (gameState.totalSaved >= 100) {
      const b = unlockBadge('saving-100')
      if (b) newlyUnlocked.push(b)
    }
    if (gameState.bankUsed) {
      const b = unlockBadge('bank-visitor')
      if (b) newlyUnlocked.push(b)
    }
    if (gameState.interestEarned) {
      const b = unlockBadge('interest-earned')
      if (b) newlyUnlocked.push(b)
    }
    if (gameState.tasksCompleted >= 10) {
      const b = unlockBadge('quest-hero')
      if (b) newlyUnlocked.push(b)
    }
    if (gameState.knowledgeEvents >= 5) {
      const b = unlockBadge('knowledge-seeker')
      if (b) newlyUnlocked.push(b)
    }
    if (gameState.npcsMet.length >= 5) {
      const b = unlockBadge('good-friend')
      if (b) newlyUnlocked.push(b)
    }

    return newlyUnlocked
  }

  function setName(name: string) {
    playerName.value = name
  }

  function saveToLocal() {
    const data = {
      playerName: playerName.value,
      totalXp: totalXp.value,
      gold: gold.value,
      stats: stats.value,
      skills: skills.value.map(s => ({ id: s.id, level: s.level, xp: s.xp, xpToNext: s.xpToNext })),
      badges: badges.value.map(b => ({ id: b.id, unlocked: b.unlocked, unlockedAt: b.unlockedAt })),
    }
    localStorage.setItem('piggy-player', JSON.stringify(data))
  }

  function loadFromLocal() {
    const raw = localStorage.getItem('piggy-player')
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      playerName.value = data.playerName ?? '小猪勇士'
      totalXp.value = data.totalXp ?? 0
      gold.value = data.gold ?? 0
      if (data.stats) Object.assign(stats.value, data.stats)
      if (data.skills) {
        for (const saved of data.skills) {
          const skill = skills.value.find(s => s.id === saved.id)
          if (skill) {
            skill.level = saved.level ?? 1
            skill.xp = saved.xp ?? 0
            skill.xpToNext = saved.xpToNext ?? 20
          }
        }
      }
      if (data.badges) {
        for (const saved of data.badges) {
          const badge = badges.value.find(b => b.id === saved.id)
          if (badge) {
            badge.unlocked = saved.unlocked ?? false
            badge.unlockedAt = saved.unlockedAt
          }
        }
      }
    } catch {}
  }

  function resetPlayer() {
    playerName.value = '小猪勇士'
    totalXp.value = 0
    gold.value = 0
    stats.value = { wisdom: 1, savings: 1, courage: 1, luck: 1 }
    skills.value.forEach(s => { s.level = 1; s.xp = 0; s.xpToNext = 20 })
    badges.value.forEach(b => { b.unlocked = false; b.unlockedAt = undefined })
  }

  watch([totalXp, gold, stats], () => {
    saveToLocal()
  }, { deep: true })

  return {
    playerName, totalXp, gold, stats, skills, badges,
    level, levelProgress, levelInfo,
    unlockedBadges, lockedBadges,
    addXp, addGold, spendGold,
    addSkillXp, unlockBadge, checkBadges,
    setName,
    saveToLocal, loadFromLocal, resetPlayer,
  }
})
