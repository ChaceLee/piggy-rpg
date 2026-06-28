/**
 * 利息计算系统
 * 
 * 面向7岁儿童的"母鸡下蛋"比喻映射：
 *   本金(元) → 母鸡(只)
 *   利息(元) → 蛋(个)
 *   利率 → 每只母鸡每天下的蛋数
 */

export interface AccountRule {
  name: string
  type: 'current' | 'fixed7' | 'fixed30'
  ratePerDay: number      // 每日利率（元/天/元）
  minDays: number         // 最少锁定天数
  penaltyDays: number     // 不足天数/提前取款的罚息规则
  description: string     // 儿童友好描述
  henMetaphor: string     // 母鸡比喻描述
}

export const ACCOUNT_RULES: Record<string, AccountRule> = {
  current: {
    name: '活期储蓄',
    type: 'current',
    ratePerDay: 0.002,        // 0.002元/天/元 = 年化约0.73%
    minDays: 0,
    penaltyDays: 0,
    description: '随时可以存取，利息少',
    henMetaphor: '散养母鸡，随时能抓来吃，下蛋少',
  },
  fixed7: {
    name: '7天定期',
    type: 'fixed7',
    ratePerDay: 0.00143,      // 0.5元/50元/7天 ≈ 0.00143
    minDays: 7,
    penaltyDays: 7,
    description: '存7天不能动，到期利息多',
    henMetaphor: '母鸡关在笼里7天，不能动，但下更多的蛋',
  },
  fixed30: {
    name: '30天定期',
    type: 'fixed30',
    ratePerDay: 0.00133,      // 2元/50元/30天 ≈ 0.00133
    minDays: 30,
    penaltyDays: 30,
    description: '存30天不能动，利息最多',
    henMetaphor: '母鸡关在笼里30天，下最多的蛋！',
  },
}

export interface FixedDepositAccount {
  id: string
  ruleType: 'fixed7' | 'fixed30'
  principal: number
  startDay: number          // 游戏内的"天数"计数
  matured: boolean
  earlyWithdrawn: boolean
}

export interface TransactionRecord {
  id: string
  date: number
  type: 'deposit' | 'withdraw' | 'interest' | 'fixed-open' | 'fixed-close' | 'penalty'
  amount: number
  balance: number
  description: string
  depositId?: string
}

/**
 * 计算特定时间段的利息
 */
export function calculateInterest(
  principal: number,
  ratePerDay: number,
  days: number
): number {
  if (days <= 0 || principal <= 0) return 0
  // 保留两位小数
  return Math.round(principal * ratePerDay * days * 100) / 100
}

/**
 * 获取当天的"母鸡下蛋"可视化数据
 */
export function getHenVisualization(principal: number): {
  hens: number           // 母鸡数 = 本金(元)
  eggsToday: number      // 今日蛋数
  eggsTotal: number      // 累计蛋数
  eggRate: number        // 每只母鸡每日下蛋数
} {
  const hens = Math.floor(principal)
  // 简化：每1元本金产生0.002个蛋/天（与活期利率对应）
  const eggRate = 0.002
  const eggsToday = Math.round(principal * eggRate * 100) / 100

  return {
    hens,
    eggsToday,
    eggsTotal: eggsToday,
    eggRate,
  }
}

/**
 * 获取利率的儿童友好描述
 */
export function getInterestDescription(
  ruleType: string,
  principal: number,
  days: number
): {
  totalInterest: number
  perDayInterest: number
  henEggsPerDay: string
  totalEggs: string
} {
  const rule = ACCOUNT_RULES[ruleType]
  if (!rule) return { totalInterest: 0, perDayInterest: 0, henEggsPerDay: '0', totalEggs: '0' }

  const totalInterest = calculateInterest(principal, rule.ratePerDay, days)
  const perDayInterest = calculateInterest(principal, rule.ratePerDay, 1)

  // 母鸡比喻：1元=1只母鸡，每日下蛋=利息/100（把1元虚拟拆分为100分）
  const henEggsPerDay = perDayInterest > 0
    ? `${Math.floor(perDayInterest * 100)}个蛋`
    : '0个蛋'
  const totalEggs = totalInterest > 0
    ? `${Math.floor(totalInterest * 100)}个蛋`
    : '0个蛋'

  return { totalInterest, perDayInterest, henEggsPerDay, totalEggs }
}
