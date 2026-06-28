import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  type FixedDepositAccount,
  type TransactionRecord,
  type AccountRule,
  ACCOUNT_RULES,
  calculateInterest,
  getInterestDescription,
} from '../composables/useInterest'

export const useBankStore = defineStore('bank', () => {
  // === 活期账户 ===
  const currentBalance = ref(0)

  // === 定期账户列表 ===
  const fixedDeposits = ref<FixedDepositAccount[]>([])

  // === 交易记录 ===
  const transactions = ref<TransactionRecord[]>([])

  // === 游戏天数计数器 ===
  const gameDay = ref(1)

  // === 已赚取的累计利息 ===
  const totalInterestEarned = ref(0)

  // === 计算属性 ===

  const totalBankBalance = computed(() => {
    const fixedTotal = fixedDeposits.value
      .filter(d => !d.earlyWithdrawn)
      .reduce((sum, d) => sum + d.principal, 0)
    return currentBalance.value + fixedTotal
  })

  const activeFixedDeposits = computed(() =>
    fixedDeposits.value.filter(d => !d.matured && !d.earlyWithdrawn)
  )

  const maturedDeposits = computed(() =>
    fixedDeposits.value.filter(d => d.matured && !d.earlyWithdrawn)
  )

  const recentTransactions = computed(() =>
    [...transactions.value].reverse().slice(0, 20)
  )

  // === 开户操作 ===

  /** 活期存款 */
  function depositCurrent(amount: number, fromPiggy = true): boolean {
    if (amount <= 0) return false
    currentBalance.value += amount

    addTransaction({
      type: 'deposit',
      amount,
      balance: currentBalance.value,
      description: `活期存款 ${amount}元`,
    })
    return true
  }

  /** 活期取款 */
  function withdrawCurrent(amount: number): number {
    const actual = Math.min(amount, currentBalance.value)
    if (actual <= 0) return 0
    currentBalance.value -= actual

    addTransaction({
      type: 'withdraw',
      amount: actual,
      balance: currentBalance.value,
      description: `活期取款 ${actual}元`,
    })
    return actual
  }

  /** 开立定期账户 */
  function openFixedDeposit(ruleType: 'fixed7' | 'fixed30', principal: number): boolean {
    if (principal <= 0) return false
    if (currentBalance.value < principal) return false

    currentBalance.value -= principal
    const deposit: FixedDepositAccount = {
      id: `fixed-${Date.now()}`,
      ruleType,
      principal,
      startDay: gameDay.value,
      matured: false,
      earlyWithdrawn: false,
    }
    fixedDeposits.value.push(deposit)

    addTransaction({
      type: 'fixed-open',
      amount: principal,
      balance: totalBankBalance.value,
      description: `开立${ACCOUNT_RULES[ruleType].name} ${principal}元，${ACCOUNT_RULES[ruleType].minDays}天后到期`,
      depositId: deposit.id,
    })
    return true
  }

  /** 定期到期处理 */
  function matureFixedDeposit(depositId: string): { principal: number; interest: number } | null {
    const deposit = fixedDeposits.value.find(d => d.id === depositId)
    if (!deposit || deposit.matured) return null

    const rule = ACCOUNT_RULES[deposit.ruleType]
    const daysElapsed = gameDay.value - deposit.startDay
    const applyDays = Math.min(daysElapsed, rule.minDays)
    const interest = calculateInterest(deposit.principal, rule.ratePerDay, applyDays)

    deposit.matured = true
    const total = deposit.principal + interest
    currentBalance.value += total
    totalInterestEarned.value += interest

    addTransaction({
      type: 'fixed-close',
      amount: total,
      balance: currentBalance.value,
      description: `${ACCOUNT_RULES[deposit.ruleType].name}到期：本金${deposit.principal}元 + 利息${interest}元`,
      depositId: deposit.id,
    })
    return { principal: deposit.principal, interest }
  }

  /** 提前取款（惩罚：利息归零） */
  function earlyWithdrawFixed(depositId: string): number | null {
    const deposit = fixedDeposits.value.find(d => d.id === depositId)
    if (!deposit || deposit.matured || deposit.earlyWithdrawn) return null

    deposit.earlyWithdrawn = true
    currentBalance.value += deposit.principal

    addTransaction({
      type: 'penalty',
      amount: deposit.principal,
      balance: currentBalance.value,
      description: `⚠️ 提前取出${ACCOUNT_RULES[deposit.ruleType].name} ${deposit.principal}元，利息归零`,
      depositId: deposit.id,
    })
    return deposit.principal
  }

  /** 每日结算（模拟"过一天"） */
  function nextDay(): {
    currentInterest: number
    maturedDeposits: string[]
  } {
    gameDay.value++
    const maturedIds: string[] = []

    // 检查定期到期
    for (const deposit of fixedDeposits.value) {
      if (deposit.matured || deposit.earlyWithdrawn) continue
      const daysElapsed = gameDay.value - deposit.startDay
      if (daysElapsed >= ACCOUNT_RULES[deposit.ruleType].minDays) {
        maturedIds.push(deposit.id)
        matureFixedDeposit(deposit.id)
      }
    }

    // 活期利息（日终结算）
    const dailyInterest = calculateInterest(currentBalance.value, ACCOUNT_RULES.current.ratePerDay, 1)
    if (dailyInterest > 0) {
      currentBalance.value = Math.round((currentBalance.value + dailyInterest) * 100) / 100
      totalInterestEarned.value += dailyInterest
      addTransaction({
        type: 'interest',
        amount: dailyInterest,
        balance: currentBalance.value,
        description: `活期日利息 +${dailyInterest}元`,
      })
    }

    return {
      currentInterest: dailyInterest,
      maturedDeposits: maturedIds,
    }
  }

  /** 获取某笔定期的当前利息（未到期） */
  function getPendingInterest(depositId: string): number {
    const deposit = fixedDeposits.value.find(d => d.id === depositId)
    if (!deposit || deposit.matured || deposit.earlyWithdrawn) return 0
    const rule = ACCOUNT_RULES[deposit.ruleType]
    const daysElapsed = gameDay.value - deposit.startDay
    return calculateInterest(deposit.principal, rule.ratePerDay, daysElapsed)
  }

  /** 获取所有未到期的累计待收利息 */
  const totalPendingInterest = computed(() => {
    return fixedDeposits.value
      .filter(d => !d.matured && !d.earlyWithdrawn)
      .reduce((sum, d) => sum + getPendingInterest(d.id), 0)
  })

  /** 获取"母鸡下蛋"可视化数据 */
  function getHenData() {
    const totalPrincipal = currentBalance.value +
      fixedDeposits.value
        .filter(d => !d.earlyWithdrawn)
        .reduce((sum, d) => sum + d.principal, 0)
    return getInterestDescription('current', totalPrincipal, 1)
  }

  // === 辅助 ===

  function addTransaction(t: Omit<TransactionRecord, 'id' | 'date'>) {
    transactions.value.push({
      ...t,
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: gameDay.value,
    })
  }

  function saveToLocal() {
    const data = {
      currentBalance: currentBalance.value,
      fixedDeposits: fixedDeposits.value,
      transactions: transactions.value.slice(-100), // 只保留最近100条
      gameDay: gameDay.value,
      totalInterestEarned: totalInterestEarned.value,
    }
    localStorage.setItem('piggy-bank', JSON.stringify(data))
  }

  function loadFromLocal() {
    const raw = localStorage.getItem('piggy-bank')
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      currentBalance.value = data.currentBalance ?? 0
      fixedDeposits.value = data.fixedDeposits ?? []
      transactions.value = data.transactions ?? []
      gameDay.value = data.gameDay ?? 1
      totalInterestEarned.value = data.totalInterestEarned ?? 0
    } catch {}
  }

  return {
    currentBalance, fixedDeposits, transactions,
    gameDay, totalInterestEarned,
    totalBankBalance, activeFixedDeposits,
    maturedDeposits, recentTransactions,
    totalPendingInterest,
    depositCurrent, withdrawCurrent,
    openFixedDeposit, matureFixedDeposit,
    earlyWithdrawFixed, nextDay,
    getPendingInterest, getHenData,
    saveToLocal, loadFromLocal,
  }
})
