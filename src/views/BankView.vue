<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBankStore } from '../stores/bankStore'
import { usePiggyStore } from '../stores/piggyStore'
import { useGameStore } from '../stores/gameStore'
import { ACCOUNT_RULES } from '../composables/useInterest'
import PixiScene from '../components/characters/PixiScene.vue'
import DepositPanel from '../components/bank/DepositPanel.vue'
import { speak, playCoinDrop, playSuccess } from '../composables/useSound'

const bank = useBankStore()
const piggy = usePiggyStore()
const game = useGameStore()

const pixiRef = ref<InstanceType<typeof PixiScene>>()
const activeTab = ref<'current' | 'fixed' | 'history'>('current')
const showDepositPanel = ref(false)
const depositMode = ref<'current' | 'fixed7' | 'fixed30'>('current')
const feedback = ref('')
const showHenEgg = ref(false)

onMounted(() => {
  bank.loadFromLocal()
  // 首次进入语音
  speak('欢迎来到森林银行！我是兔博士，我来教你钱怎么生钱')
})

// === 活期操作 ===

const spendBalance = computed(() => piggy.getBank('spend')?.balance ?? 0)

function depositFromSpend(amount: number) {
  if (piggy.withdraw('spend', amount)) {
    bank.depositCurrent(amount)
    playCoinDrop()
    feedback.value = `存入 ${amount}元 到活期账户！`
    bank.saveToLocal()
    piggy.saveToLocal()
    game.saveToLocal()
    setTimeout(() => { feedback.value = '' }, 2000)
  } else {
    feedback.value = '花花罐里余额不足！'
  }
}

function withdrawToSpend(amount: number) {
  const actual = bank.withdrawCurrent(amount)
  if (actual > 0) {
    piggy.deposit('spend', actual)
    playCoinDrop()
    feedback.value = `取出 ${actual}元 到花花罐！`
    bank.saveToLocal()
    piggy.saveToLocal()
    setTimeout(() => { feedback.value = '' }, 2000)
  } else {
    feedback.value = '活期账户余额不足！'
  }
}

// === 定期操作 ===

function openFixed(type: 'fixed7' | 'fixed30', amount: number) {
  if (bank.currentBalance < amount) {
    feedback.value = '活期余额不足！'
    return
  }
  const ok = bank.openFixedDeposit(type, amount)
  if (ok) {
    playSuccess()
    pixiRef.value?.npcNod()
    const rule = ACCOUNT_RULES[type]
    const interestDesc = bank.getPendingInterest(
      bank.fixedDeposits[bank.fixedDeposits.length - 1]?.id || ''
    )
    feedback.value = `✅ 开立${rule.name} ${amount}元成功！${rule.minDays}天后得利息约${interestDesc.toFixed(2)}元`
    bank.saveToLocal()
    game.saveToLocal()
    game.completeEvent('bank-intro')
    setTimeout(() => { feedback.value = '' }, 3000)
  }
}

function matureAll() {
  for (const dep of bank.activeFixedDeposits) {
    const result = bank.matureFixedDeposit(dep.id)
    if (result) {
      playSuccess()
      feedback.value = `🎉 定期到期！本金${result.principal}元 + 利息${result.interest}元，共${(result.principal + result.interest).toFixed(2)}元`
    }
  }
  bank.saveToLocal()
}

function earlyWithdraw(depositId: string) {
  const result = bank.earlyWithdrawFixed(depositId)
  if (result) {
    feedback.value = `⚠️ 提前取出${result}元，利息归零`
    bank.saveToLocal()
  }
}

// === 时间推进 ===

function advanceDay() {
  const result = bank.nextDay()
  if (result.maturedDeposits.length > 0) {
    playSuccess()
    feedback.value = `📅 过了一天！${result.maturedDeposits.length}笔定期到期！活期利息+${result.currentInterest.toFixed(2)}元`
  } else {
    feedback.value = `📅 过了一天！活期利息+${result.currentInterest.toFixed(2)}元`
  }
  bank.saveToLocal()
  setTimeout(() => { feedback.value = '' }, 2500)
}

// === 母鸡比喻展示 ===

const henData = computed(() => {
  const total = bank.currentBalance +
    bank.fixedDeposits
      .filter(d => !d.earlyWithdrawn)
      .reduce((s, d) => s + d.principal, 0)
  const rule = ACCOUNT_RULES.current
  return {
    hens: Math.floor(total),
    eggsPerDay: (total * rule.ratePerDay).toFixed(2),
  }
})

const dailyInterest = computed(() => {
  return (bank.currentBalance * ACCOUNT_RULES.current.ratePerDay).toFixed(2)
})
</script>

<template>
  <div class="bank-page">
    <h2 class="page-title">🏦 森林银行</h2>

    <!-- PixiJS 兔博士 -->
    <PixiScene
      ref="pixiRef"
      :npc="'rabbit'"
      :show-background="true"
      :height="160"
    />

    <!-- 反馈栏 -->
    <div class="feedback-bar" v-if="feedback">
      {{ feedback }}
    </div>

    <!-- 账户总览 -->
    <div class="account-summary card">
      <div class="summary-row">
        <span class="label">🌳 总资产</span>
        <span class="value">{{ bank.totalBankBalance.toFixed(1) }} 元</span>
      </div>
      <div class="summary-row">
        <span class="label">🥚 已赚利息</span>
        <span class="value interest">+{{ bank.totalInterestEarned.toFixed(2) }} 元</span>
      </div>
    </div>

    <!-- "母鸡下蛋" 实时可视化 -->
    <div class="hen-card card" @click="showHenEgg = !showHenEgg">
      <div class="hen-header">
        <span>🐔 钱宝宝生蛋啦</span>
        <span class="hen-sub">点击查看</span>
      </div>
      <div class="hen-visual">
        <div class="hen-count">
          <span class="hen-number">{{ henData.hens }}</span>
          <span class="hen-label">只母鸡</span>
        </div>
        <div class="hen-arrow">→</div>
        <div class="hen-count">
          <span class="hen-number egg">{{ henData.eggsPerDay }}</span>
          <span class="hen-label">个蛋/天</span>
        </div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="bank-tabs">
      <button class="tab-btn" :class="{ active: activeTab === 'current' }" @click="activeTab = 'current'">
        💧 活期
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'fixed' }" @click="activeTab = 'fixed'">
        🔒 定期
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">
        📜 明细
      </button>
    </div>

    <!-- 活期面板 -->
    <div v-if="activeTab === 'current'" class="panel card">
      <h3>💧 活期储蓄</h3>
      <div class="balance-big">{{ bank.currentBalance.toFixed(1) }} 元</div>
      <p class="rule-desc">{{ ACCOUNT_RULES.current.description }}</p>
      <p class="hen-meta">{{ ACCOUNT_RULES.current.henMetaphor }}</p>

      <div class="action-buttons">
        <button class="btn btn-primary" @click="depositMode = 'current'; showDepositPanel = true">
          💰 从花花罐存入
        </button>
        <button class="btn btn-info" @click="withdrawToSpend(Math.min(bank.currentBalance, 10))">
          🏠 取出到花花罐
        </button>
      </div>

      <div class="daily-interest">
        今日活期利息：<strong>+{{ dailyInterest }} 元</strong>
      </div>
    </div>

    <!-- 定期面板 -->
    <div v-if="activeTab === 'fixed'" class="panel card">
      <h3>🔒 定期储蓄</h3>

      <!-- 开立新定期 -->
      <div class="fixed-options">
        <div class="fixed-card" @click="depositMode = 'fixed7'; showDepositPanel = true">
          <div class="fixed-name">7天定期</div>
          <div class="fixed-rate">利率 0.5元/7天</div>
          <div class="fixed-hen">🐔 笼中母鸡下蛋多</div>
          <div class="fixed-btn">存入 →</div>
        </div>
        <div class="fixed-card" @click="depositMode = 'fixed30'; showDepositPanel = true">
          <div class="fixed-name">30天定期</div>
          <div class="fixed-rate">利率 2元/30天</div>
          <div class="fixed-hen">🐔🐔 母鸡下最多蛋</div>
          <div class="fixed-btn">存入 →</div>
        </div>
      </div>

      <!-- 当前定期列表 -->
      <div v-if="bank.activeFixedDeposits.length > 0" class="fixed-list">
        <h4>📋 进行中</h4>
        <div v-for="dep in bank.activeFixedDeposits" :key="dep.id" class="fixed-item">
          <div class="fixed-item-info">
            <span class="fixed-item-name">{{ ACCOUNT_RULES[dep.ruleType].name }}</span>
            <span class="fixed-item-amount">{{ dep.principal }}元</span>
            <span class="fixed-item-days">
              已{{ bank.gameDay - dep.startDay }}/{{ ACCOUNT_RULES[dep.ruleType].minDays }}天
            </span>
          </div>
          <div class="fixed-item-interest">
            待收利息：<strong>{{ bank.getPendingInterest(dep.id).toFixed(2) }}元</strong>
          </div>
          <div class="fixed-item-actions">
            <button class="btn btn-danger small" @click="earlyWithdraw(dep.id)">
              ⚠️ 提前取出
            </button>
          </div>
        </div>
      </div>

      <!-- 已到期 -->
      <div v-if="bank.maturedDeposits.length > 0" class="fixed-list">
        <h4>✅ 已到期</h4>
        <div v-for="dep in bank.maturedDeposits" :key="dep.id" class="fixed-item matured">
          <div class="fixed-item-info">
            <span>{{ ACCOUNT_RULES[dep.ruleType].name }}</span>
            <span>{{ dep.principal }}元 → 已转入活期</span>
          </div>
        </div>
      </div>

      <!-- 时间推进 -->
      <div class="time-control">
        <p class="time-label">当前：游戏第 {{ bank.gameDay }} 天</p>
        <button class="btn btn-info" @click="advanceDay">
          ⏩ 快进一天
        </button>
        <button v-if="bank.activeFixedDeposits.length > 0" class="btn btn-success" @click="matureAll">
          🔓 到期全部取出
        </button>
      </div>
    </div>

    <!-- 交易明细 -->
    <div v-if="activeTab === 'history'" class="panel card">
      <h3>📜 交易明细</h3>
      <div v-if="bank.recentTransactions.length === 0" class="empty-tx">
        还没有交易记录～
      </div>
      <div v-for="tx in bank.recentTransactions" :key="tx.id" class="tx-item" :class="tx.type">
        <div class="tx-icon">
          {{ tx.type === 'deposit' ? '💧' : tx.type === 'withdraw' ? '🏠' :
             tx.type === 'interest' ? '🥚' : tx.type === 'fixed-open' ? '🔒' :
             tx.type === 'fixed-close' ? '🔓' : '⚠️' }}
        </div>
        <div class="tx-info">
          <div class="tx-desc">{{ tx.description }}</div>
          <div class="tx-date">第{{ tx.date }}天</div>
        </div>
        <div class="tx-amount" :class="{ positive: tx.amount >= 0, negative: tx.amount < 0 }">
          {{ tx.amount >= 0 ? '+' : '' }}{{ tx.amount.toFixed(2) }}元
        </div>
      </div>
    </div>

    <!-- 存款面板弹窗 -->
    <DepositPanel
      v-if="showDepositPanel"
      :mode="depositMode"
      :available="depositMode === 'current' ? spendBalance : bank.currentBalance"
      @confirm="(amount) => {
        if (depositMode === 'current') depositFromSpend(amount)
        else openFixed(depositMode as 'fixed7' | 'fixed30', amount)
        showDepositPanel = false
      }"
      @close="showDepositPanel = false"
    />
  </div>
</template>

<style scoped>
.bank-page {
  padding: 16px;
  padding-bottom: 100px;
}

.feedback-bar {
  background: var(--sky-blue);
  color: white;
  border: 3px solid var(--ocean-blue);
  border-radius: 16px;
  padding: 12px 16px;
  margin: 8px 0 16px;
  font-weight: 700;
  font-size: 14px;
  animation: slideUp 0.3s ease;
}

/* 账户总览 */
.account-summary {
  background: linear-gradient(135deg, #E8F4FD, #D0E8FF);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.label { font-weight: 700; font-size: 14px; }
.value { font-size: 20px; font-weight: 900; }
.value.interest { color: var(--grass-green); }

/* 母鸡卡 */
.hen-card {
  cursor: pointer;
  background: linear-gradient(135deg, #FFF8E7, #FFE5CC);
}

.hen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  margin-bottom: 8px;
}

.hen-sub { font-size: 11px; color: #888; }

.hen-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.hen-count { text-align: center; }
.hen-number { display: block; font-size: 28px; font-weight: 900; color: var(--warm-brown); }
.hen-number.egg { color: var(--sunny-yellow); }
.hen-label { font-size: 12px; color: #888; }
.hen-arrow { font-size: 24px; color: var(--grass-green); }

/* Tab */
.bank-tabs {
  display: flex;
  gap: 6px;
  margin: 12px 0;
}

.bank-tabs .tab-btn {
  flex: 1;
  padding: 10px;
  border: 3px solid var(--warm-brown);
  border-radius: 14px;
  background: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}

.bank-tabs .tab-btn.active {
  background: var(--ocean-blue);
  color: white;
  border-color: var(--ocean-blue);
}

/* 面板 */
.panel h3 { font-size: 16px; margin-bottom: 8px; }

.balance-big {
  font-size: 32px;
  font-weight: 900;
  text-align: center;
  color: var(--ocean-blue);
  margin: 12px 0;
}

.rule-desc { font-size: 13px; color: #888; text-align: center; }
.hen-meta { font-size: 12px; color: var(--grass-green); text-align: center; margin-top: 4px; }

.action-buttons {
  display: flex;
  gap: 8px;
  margin: 16px 0;
}

.action-buttons .btn { flex: 1; font-size: 13px; padding: 10px; }

.daily-interest {
  text-align: center;
  font-size: 14px;
  color: #888;
}

.daily-interest strong { color: var(--grass-green); }

/* 定期选项 */
.fixed-options {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.fixed-card {
  flex: 1;
  padding: 14px 10px;
  border: 3px solid var(--ocean-blue);
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.fixed-card:active { transform: scale(0.95); background: #E8F4FD; }

.fixed-name { font-weight: 900; font-size: 15px; color: var(--ocean-blue); }
.fixed-rate { font-size: 12px; color: var(--grass-green); font-weight: 700; margin: 4px 0; }
.fixed-hen { font-size: 11px; color: #888; }
.fixed-btn { margin-top: 8px; font-size: 13px; font-weight: 700; color: var(--sky-blue); }

/* 定期列表 */
.fixed-list { margin-top: 12px; }
.fixed-list h4 { font-size: 14px; margin-bottom: 8px; }

.fixed-item {
  padding: 10px;
  border: 2px solid var(--light-gray);
  border-radius: 12px;
  margin-bottom: 6px;
}

.fixed-item.matured { opacity: 0.6; }

.fixed-item-info {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 14px;
}

.fixed-item-name { font-weight: 700; }
.fixed-item-amount { color: var(--ocean-blue); font-weight: 700; }
.fixed-item-days { font-size: 12px; color: #888; margin-left: auto; }

.fixed-item-interest {
  font-size: 13px;
  margin: 4px 0;
}

.fixed-item-interest strong { color: var(--grass-green); }

.fixed-item-actions { margin-top: 4px; }
.btn.small { font-size: 12px; padding: 4px 10px; }

/* 时间控制 */
.time-control {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 2px dashed var(--light-gray);
}

.time-label { font-size: 13px; color: #888; margin-bottom: 8px; }

.time-control .btn {
  margin-right: 8px;
  margin-bottom: 4px;
  font-size: 13px;
  padding: 8px 16px;
}

/* 交易明细 */
.empty-tx { text-align: center; color: #888; padding: 20px; }

.tx-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.tx-item:last-child { border: none; }
.tx-icon { font-size: 18px; }
.tx-info { flex: 1; }
.tx-desc { font-size: 13px; }
.tx-date { font-size: 10px; color: #aaa; }
.tx-amount { font-size: 14px; font-weight: 700; }
.tx-amount.positive { color: var(--grass-green); }
.tx-amount.negative { color: var(--candy-red); }

@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
