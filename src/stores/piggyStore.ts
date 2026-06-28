import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface PiggyBank {
  id: 'spend' | 'save' | 'invest'
  name: string
  nickname: string
  color: string
  emoji: string
  personality: string
  balance: number
  target: number
  minPerAllocation: number
  locked: boolean
  description: string
}

export const usePiggyStore = defineStore('piggy', () => {
  const banks = ref<PiggyBank[]>([
    {
      id: 'spend',
      name: '花花',
      nickname: '消费罐',
      color: '#FF6B6B',
      emoji: '🐷❤️',
      personality: '活泼好动，总是想吃糖果',
      balance: 0,
      target: 0,
      minPerAllocation: 1,
      locked: false,
      description: '随时可取，买想要的东西',
    },
    {
      id: 'save',
      name: '存存',
      nickname: '储蓄罐',
      color: '#4D96FF',
      emoji: '🐷📚',
      personality: '稳重可靠，戴着眼镜',
      balance: 0,
      target: 0,
      minPerAllocation: 1,
      locked: false,
      description: '短期目标，锁定直到达成',
    },
    {
      id: 'invest',
      name: '投投',
      nickname: '投资罐',
      color: '#6BCB77',
      emoji: '🐷✨',
      personality: '神秘聪明，会魔法长大',
      balance: 0,
      target: 0,
      minPerAllocation: 0,
      locked: true,
      description: '长期增值，目前先封印',
    },
  ])

  const totalInBanks = computed(() =>
    banks.value.reduce((sum, b) => sum + b.balance, 0)
  )

  function getBank(id: string) {
    return banks.value.find(b => b.id === id)
  }

  function deposit(bankId: 'spend' | 'save' | 'invest', amount: number) {
    const bank = banks.value.find(b => b.id === bankId)
    if (bank && !bank.locked) {
      bank.balance += amount
      return true
    }
    return false
  }

  function withdraw(bankId: 'spend' | 'save' | 'invest', amount: number): boolean {
    const bank = banks.value.find(b => b.id === bankId)
    if (bank && bank.balance >= amount && !bank.locked) {
      bank.balance -= amount
      return true
    }
    return false
  }

  function setTarget(bankId: string, target: number) {
    const bank = banks.value.find(b => b.id === bankId)
    if (bank) bank.target = target
  }

  function allocateIncome(income: number): { spend: number; save: number; invest: number } | null {
    // 必须每份至少1元（花花、存存），投投可0
    if (income < 2) return null // 至少2元才能分

    const spend = Math.max(1, Math.floor(income * 0.4))
    const save = Math.max(1, Math.floor(income * 0.4))
    const invest = income - spend - save

    // 确保花花和存存至少有1元
    if (spend < 1 || save < 1) return null

    return { spend, save, invest: Math.max(0, invest) }
  }

  function unlockInvest() {
    const bank = banks.value.find(b => b.id === 'invest')
    if (bank) bank.locked = false
  }

  function saveToLocal() {
    localStorage.setItem('piggy-banks', JSON.stringify(banks.value.map(b => ({
      id: b.id, balance: b.balance, target: b.target, locked: b.locked
    }))))
  }

  function loadFromLocal() {
    const raw = localStorage.getItem('piggy-banks')
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      for (const saved of data) {
        const bank = banks.value.find(b => b.id === saved.id)
        if (bank) {
          bank.balance = saved.balance ?? 0
          bank.target = saved.target ?? 0
          bank.locked = saved.locked ?? bank.locked
        }
      }
    } catch {}
  }

  return {
    banks, totalInBanks,
    getBank, deposit, withdraw,
    setTarget, allocateIncome,
    unlockInvest,
    saveToLocal, loadFromLocal,
  }
})
