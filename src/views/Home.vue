<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import { usePiggyStore } from '../stores/piggyStore'

const router = useRouter()
const game = useGameStore()
const piggy = usePiggyStore()
const showIntro = ref(true)

onMounted(() => {
  game.loadFromLocal()
  piggy.loadFromLocal()

  // 首次访问：显示开场介绍
  const visited = localStorage.getItem('piggy-intro-seen')
  if (visited) {
    showIntro.value = false
  }
})

function startGame() {
  localStorage.setItem('piggy-intro-seen', 'true')
  showIntro.value = false
}
</script>

<template>
  <div class="home-page">
    <!-- 开场动画 -->
    <Transition name="fade">
      <div v-if="showIntro" class="intro-overlay">
        <div class="intro-content slide-up">
          <div class="intro-piggies">
            <span class="piggy-icon float" style="animation-delay: 0s">🐷❤️</span>
            <span class="piggy-icon float" style="animation-delay: 0.3s">🐷📚</span>
            <span class="piggy-icon float" style="animation-delay: 0.6s">🐷✨</span>
          </div>
          <h1 class="intro-title">三只小猪</h1>
          <p class="intro-subtitle">儿童财商冒险</p>
          <p class="intro-desc">和花花、存存、投投一起<br>学习认识钱、管理钱、让钱长大！</p>
          <div class="intro-info">
            <span>👶 适合 7岁+</span>
            <span>🏆 第一章：认识人民币</span>
          </div>
          <button class="btn btn-primary start-btn" @click="startGame">
            开始冒险！
          </button>
        </div>
      </div>
    </Transition>

    <!-- 主页内容 -->
    <div v-if="!showIntro" class="home-content">
      <!-- 顶部欢迎 -->
      <div class="welcome-section">
        <div class="welcome-text">
          <h1>🐷 三只小猪</h1>
          <p class="subtitle">今天也要加油赚钱哦！</p>
        </div>
        <div class="week-badge">
          第{{ game.currentWeek }}周
        </div>
      </div>

      <!-- 总资产卡片 -->
      <div class="wealth-card card">
        <div class="wealth-header">
          <span class="wealth-icon">🪙</span>
          <span class="wealth-label">总资产</span>
        </div>
        <div class="wealth-amount">
          <span class="amount-number">{{ game.totalMoney }}</span>
          <span class="amount-unit">元</span>
        </div>
        <div class="wealth-detail">
          <div class="detail-item">
            <span class="dot" style="background: var(--pig-hua)"></span>
            <span>花花: {{ piggy.getBank('spend')?.balance ?? 0 }}元</span>
          </div>
          <div class="detail-item">
            <span class="dot" style="background: var(--pig-cun)"></span>
            <span>存存: {{ piggy.getBank('save')?.balance ?? 0 }}元</span>
          </div>
          <div class="detail-item">
            <span class="dot" style="background: var(--pig-tou)"></span>
            <span>投投: {{ piggy.getBank('invest')?.balance ?? 0 }}元</span>
          </div>
        </div>
      </div>

      <!-- 待分配气泡 -->
      <Transition name="slide">
        <div v-if="game.totalMoney > 0" class="pending-alloc card" @click="router.push('/piggies')">
          <span class="pending-icon">🪙</span>
          <div class="pending-content">
            <div class="pending-title">有 {{ game.totalMoney }} 元还没分！</div>
            <div class="pending-desc">点击去分给三只小猪 →</div>
          </div>
          <span class="pending-badge bounce">{{ game.totalMoney }}</span>
        </div>
      </Transition>

      <!-- 快捷入口 -->
      <div class="quick-actions">
        <button class="action-card" @click="router.push('/money')">
          <span class="action-icon">💰</span>
          <span class="action-title">认识人民币</span>
          <span class="action-desc">学习元角分</span>
        </button>
        <button class="action-card" @click="router.push('/tasks')">
          <span class="action-icon">📋</span>
          <span class="action-title">每日任务</span>
          <span class="action-desc">赚钱零花钱</span>
        </button>
        <button class="action-card" @click="router.push('/piggies')">
          <span class="action-icon">🐷</span>
          <span class="action-title">三只小猪</span>
          <span class="action-desc">分配存钱</span>
        </button>
        <button class="action-card" @click="router.push('/growth')">
          <span class="action-icon">🌳</span>
          <span class="action-title">成长树</span>
          <span class="action-desc">查看进度</span>
        </button>
      </div>

      <!-- 成长进度 -->
      <div class="progress-section card">
        <h3>🌳 第一章进度</h3>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: Math.min(100, game.knowledgeEventsCompleted.length * 20) + '%' }"></div>
        </div>
        <p class="progress-text">
          知识事件 {{ game.knowledgeEventsCompleted.length }}/5
        </p>
      </div>

      <!-- 第二章解锁横幅 -->
      <Transition name="slide">
        <div v-if="game.chapter2Available" class="chapter2-banner card" @click="router.push('/bank')">
          <div class="banner-left">
            <span class="banner-icon">🏦</span>
          </div>
          <div class="banner-content">
            <div class="banner-title">第二章：银行与利息</div>
            <div class="banner-desc">存存罐已存满50元！兔博士在银行等你→</div>
            <span class="banner-tag" :class="{ locked: game.currentChapter !== 'chapter2' }">
              {{ game.currentChapter === 'chapter2' ? '🔥 进行中' : '🔒 点击解锁' }}
            </span>
          </div>
          <div class="banner-arrow">→</div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 20px 16px;
}

/* 开场 */
.intro-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: linear-gradient(135deg, #FFE5E5 0%, #FFF8E7 50%, #E5F4FF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.intro-content {
  text-align: center;
  max-width: 360px;
}

.intro-piggies {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.piggy-icon {
  font-size: 48px;
  filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.1));
}

.intro-title {
  font-size: 42px;
  font-weight: 900;
  color: var(--warm-brown);
  margin-bottom: 4px;
}

.intro-subtitle {
  font-size: 18px;
  color: var(--ocean-blue);
  margin-bottom: 16px;
  font-weight: 700;
}

.intro-desc {
  font-size: 16px;
  color: var(--charcoal);
  line-height: 1.8;
  margin-bottom: 20px;
}

.intro-info {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
  font-size: 14px;
  color: var(--warm-brown);
}

.start-btn {
  font-size: 22px;
  padding: 16px 48px;
}

/* 主页 */
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.welcome-text h1 {
  font-size: 28px;
  font-weight: 900;
  color: var(--warm-brown);
}

.subtitle {
  font-size: 14px;
  color: #888;
  margin-top: 2px;
}

.week-badge {
  background: var(--soft-purple);
  color: white;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
}

/* 资产卡片 */
.wealth-card {
  background: linear-gradient(135deg, var(--sunny-yellow), #FFE5A3);
}

.wealth-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.wealth-icon { font-size: 24px; }
.wealth-label { font-weight: 700; font-size: 14px; color: var(--warm-brown); }

.wealth-amount {
  font-size: 36px;
  font-weight: 900;
  margin-bottom: 12px;
}

.amount-number { color: var(--charcoal); }
.amount-unit { font-size: 18px; color: var(--warm-brown); margin-left: 4px; }

.wealth-detail {
  display: flex;
  gap: 16px;
  font-size: 14px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

/* 待分配气泡 */
.pending-alloc {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  background: linear-gradient(135deg, #FFF0F0, #FFE5E5);
  border-color: var(--candy-red);
  padding: 12px 16px;
  animation: glow 2s ease-in-out infinite;
  margin-bottom: 8px;
}

.pending-alloc:active {
  transform: scale(0.98);
}

.pending-icon { font-size: 28px; }
.pending-content { flex: 1; }
.pending-title { font-weight: 900; font-size: 15px; color: var(--candy-red); }
.pending-desc { font-size: 12px; color: #888; }
.pending-badge {
  background: var(--candy-red);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 14px;
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.3); }
  50% { box-shadow: 0 0 12px 4px rgba(255, 107, 107, 0.2); }
}

/* 快捷入口 */
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 16px 0;
}

.action-card {
  background: white;
  border: 3px solid var(--warm-brown);
  border-radius: 20px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  box-shadow: 3px 3px 0 var(--warm-brown);
}

.action-card:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 var(--warm-brown);
}

.action-icon { display: block; font-size: 36px; margin-bottom: 6px; }
.action-title { display: block; font-weight: 900; font-size: 16px; color: var(--charcoal); }
.action-desc { display: block; font-size: 12px; color: #888; margin-top: 2px; }

/* 进度区 */
.progress-section h3 {
  font-size: 16px;
  margin-bottom: 10px;
}

.progress-bar {
  height: 12px;
  background: var(--light-gray);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--grass-green), var(--sky-blue));
  border-radius: 10px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 13px;
  color: #888;
}

/* 第二章横幅 */
.chapter2-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  background: linear-gradient(135deg, #E8F4FD, #D0E8FF);
  border-color: var(--sky-blue);
  padding: 14px 16px;
  transition: all 0.2s;
}

.chapter2-banner:active {
  transform: scale(0.98);
}

.banner-left { flex-shrink: 0; }
.banner-icon { font-size: 32px; }
.banner-content { flex: 1; }
.banner-title { font-weight: 900; font-size: 15px; color: var(--ocean-blue); }
.banner-desc { font-size: 12px; color: #888; margin-top: 2px; }

.banner-tag {
  display: inline-block;
  margin-top: 4px;
  font-size: 11px;
  font-weight: 700;
  color: var(--grass-green);
}

.banner-tag.locked {
  color: var(--sky-blue);
}

.banner-arrow {
  font-size: 20px;
  color: var(--ocean-blue);
  animation: slideRight 1s ease-in-out infinite;
}

@keyframes slideRight {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(5px); }
}

/* 过渡 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.5s ease;
}
.slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
</style>
