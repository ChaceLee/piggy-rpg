<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { usePiggyStore } from '../stores/piggyStore'
import { useTaskStore } from '../stores/taskStore'

const game = useGameStore()
const piggy = usePiggyStore()
const tasks = useTaskStore()

const activeTab = ref<'overview' | 'tasks' | 'settings'>('overview')

// 设置
const localSettings = ref({ ...game.settings })
const newTaskTitle = ref('')
const newTaskReward = ref(2)
const newTaskType = ref<'study' | 'chore' | 'challenge' | 'social'>('chore')

function saveSettings() {
  game.settings = { ...localSettings.value }
  game.saveToLocal()
}

function resetGame() {
  if (confirm('确定要重置所有游戏进度吗？此操作不可撤销！')) {
    game.resetGame()
    piggy.loadFromLocal()
    piggy.banks.forEach(b => { b.balance = 0; b.target = 0 })
    piggy.saveToLocal()
  }
}

function addCustomTask() {
  if (!newTaskTitle.value.trim()) return
  tasks.addTask({
    title: newTaskTitle.value,
    description: '自定义任务',
    type: newTaskType.value,
    reward: newTaskReward.value,
    icon: newTaskType.value === 'study' ? '📖' : newTaskType.value === 'chore' ? '🏠' : newTaskType.value === 'challenge' ? '🏆' : '🤝',
    repeatable: true,
  })
  newTaskTitle.value = ''
}
</script>

<template>
  <div class="parent-page">
    <h2 class="page-title">⚙️ 家长后台</h2>

    <div class="tab-bar">
      <button class="tab-btn" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">📊 概览</button>
      <button class="tab-btn" :class="{ active: activeTab === 'tasks' }" @click="activeTab = 'tasks'">📋 任务</button>
      <button class="tab-btn" :class="{ active: activeTab === 'settings' }" @click="activeTab = 'settings'">⚙️ 设置</button>
    </div>

    <!-- 概览 -->
    <div v-if="activeTab === 'overview'" class="overview-section">
      <div class="card">
        <h3>📊 周报</h3>
        <div class="stat-grid">
          <div class="stat-item">
            <span class="stat-icon">💰</span>
            <span class="stat-label">总资产</span>
            <span class="stat-value">{{ game.totalMoney }} 元</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">🐷</span>
            <span class="stat-label">已储蓄</span>
            <span class="stat-value">{{ game.totalSaved }} 元</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">📖</span>
            <span class="stat-label">知识事件</span>
            <span class="stat-value">{{ game.knowledgeEventsCompleted.length }} 个</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">📅</span>
            <span class="stat-label">当前周</span>
            <span class="stat-value">第{{ game.currentWeek }}周</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>🏦 存钱罐详情</h3>
        <div v-for="bank in piggy.banks" :key="bank.id" class="bank-summary">
          <div class="bank-label">
            <span>{{ bank.emoji }}</span>
            <span>{{ bank.name }}·{{ bank.nickname }}</span>
          </div>
          <div class="bank-meta">
            <span>{{ bank.balance }} 元</span>
            <span v-if="bank.target > 0">目标：{{ bank.target }} 元</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>✅ 已完成任务</h3>
        <p class="completed-count">{{ tasks.tasks.filter(t => t.completed).length }} / {{ tasks.tasks.length }}</p>
      </div>

      <button class="btn btn-danger reset-btn" @click="resetGame">
        🗑️ 重置游戏
      </button>
    </div>

    <!-- 任务管理 -->
    <div v-if="activeTab === 'tasks'" class="tasks-section">
      <div class="card">
        <h3>➕ 添加自定义任务</h3>
        <div class="form-group">
          <label>任务名称</label>
          <input v-model="newTaskTitle" placeholder="如：整理书桌" class="form-input" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>类型</label>
            <select v-model="newTaskType" class="form-input">
              <option value="study">学习</option>
              <option value="chore">家务</option>
              <option value="challenge">挑战</option>
              <option value="social">社交</option>
            </select>
          </div>
          <div class="form-group">
            <label>报酬（元）</label>
            <input v-model.number="newTaskReward" type="number" min="1" max="10" class="form-input" />
          </div>
        </div>
        <button class="btn btn-success" @click="addCustomTask">添加任务</button>
      </div>

      <div class="card">
        <h3>📋 当前任务列表</h3>
        <div v-for="task in tasks.tasks" :key="task.id" class="task-row">
          <span class="task-icon">{{ task.icon }}</span>
          <div class="task-row-info">
            <div class="task-row-title">{{ task.title }}</div>
            <div class="task-row-meta">{{ task.type }} · +{{ task.reward }}元</div>
          </div>
          <span class="task-status" :class="{ done: task.completed }">
            {{ task.completed ? '✅' : '📌' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 设置 -->
    <div v-if="activeTab === 'settings'" class="settings-section">
      <div class="card">
        <h3>🎮 游戏设置</h3>

        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">家长审批模式</div>
            <div class="setting-desc">孩子完成任务后需要家长确认</div>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="localSettings.parentApprovalRequired" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">难度等级</div>
            <div class="setting-desc">1-5，影响换算题目难度</div>
          </div>
          <div class="difficulty-select">
            <button
              v-for="n in 5"
              :key="n"
              class="diff-btn"
              :class="{ active: localSettings.difficultyLevel === n }"
              @click="localSettings.difficultyLevel = n"
            >{{ n }}</button>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">现实兑换比例</div>
            <div class="setting-desc">游戏多少元 = 现实1元零花钱</div>
          </div>
          <input
            v-model.number="localSettings.realWorldRate"
            type="number"
            min="10"
            max="500"
            class="rate-input"
          />
        </div>

        <button class="btn btn-primary" @click="saveSettings">保存设置</button>
      </div>

      <div class="card">
        <h3>🎯 建议</h3>
        <ul class="tips-list">
          <li>每周带孩子去一次超市，实践价格比较和找零</li>
          <li>为孩子开一个真实的储蓄罐，对应游戏中的"存存"</li>
          <li>用真实货币配合游戏使用，增强体验</li>
          <li>不要强迫孩子存钱，让游戏机制自然引导</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.parent-page {
  padding: 16px;
  padding-bottom: 100px;
}

.tab-bar {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
}

.tab-btn {
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

.tab-btn.active {
  background: var(--sky-blue);
  color: white;
  border-color: var(--sky-blue);
}

/* 统计网格 */
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: #F8F8F8;
  border-radius: 14px;
}

.stat-icon { display: block; font-size: 24px; margin-bottom: 4px; }
.stat-label { display: block; font-size: 11px; color: #888; }
.stat-value { display: block; font-size: 20px; font-weight: 900; color: var(--warm-brown); }

/* 银行摘要 */
.bank-summary {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed var(--light-gray);
}

.bank-summary:last-child { border: none; }

.bank-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
}

.bank-meta {
  display: flex;
  gap: 12px;
  font-size: 14px;
  color: #888;
}

.completed-count {
  font-size: 36px;
  font-weight: 900;
  text-align: center;
  color: var(--grass-green);
}

.reset-btn {
  width: 100%;
  margin-top: 16px;
}

/* 表单 */
.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--warm-brown);
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 3px solid var(--light-gray);
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--sky-blue);
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

/* 任务行 */
.task-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px dashed var(--light-gray);
}

.task-row:last-child { border: none; }
.task-icon { font-size: 20px; }
.task-row-info { flex: 1; }
.task-row-title { font-weight: 700; font-size: 14px; }
.task-row-meta { font-size: 11px; color: #888; }

/* 设置 */
.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed var(--light-gray);
}

.setting-label { font-weight: 700; font-size: 14px; }
.setting-desc { font-size: 12px; color: #888; }

.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
}

.toggle input { opacity: 0; width: 0; height: 0; }

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #ccc;
  border-radius: 26px;
  transition: 0.3s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
}

.toggle input:checked + .toggle-slider {
  background: var(--grass-green);
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(22px);
}

.difficulty-select {
  display: flex;
  gap: 4px;
}

.diff-btn {
  width: 36px;
  height: 36px;
  border: 2px solid var(--light-gray);
  border-radius: 50%;
  background: white;
  font-weight: 700;
  cursor: pointer;
}

.diff-btn.active {
  background: var(--sunny-yellow);
  border-color: var(--warm-brown);
}

.rate-input {
  width: 80px;
  padding: 6px 10px;
  border: 3px solid var(--light-gray);
  border-radius: 10px;
  font-size: 16px;
  text-align: center;
  font-weight: 700;
}

.tips-list {
  padding-left: 20px;
  line-height: 2;
  font-size: 14px;
}

.tips-list li { padding: 2px 0; }
</style>
