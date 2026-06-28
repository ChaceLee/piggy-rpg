<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGameStore } from './stores/gameStore'
import { usePlayerStore } from './stores/playerStore'

const router = useRouter()
const route = useRoute()
const game = useGameStore()
const player = usePlayerStore()

const showNav = computed(() => route.name !== 'home')

const navItems = [
  { name: 'home', icon: '🗺️', label: '地图' },
  { name: 'quests', icon: '📜', label: '任务' },
  { name: 'tasks', icon: '📋', label: '打工' },
  { name: 'piggies', icon: '🐷', label: '存钱罐' },
  { name: 'growth', icon: '🌳', label: '成长' },
]

onMounted(() => {
  player.loadFromLocal()
})
</script>

<template>
  <div class="app-container" :class="{ 'has-nav': showNav }">
    <!-- 顶部状态栏 -->
    <header class="top-bar" v-if="showNav">
      <button class="back-btn" @click="router.back()">← 返回</button>
      <div class="balance">
        <span class="level-badge">Lv.{{ player.level }}</span>
        <span class="coin-icon">🪙</span>
        <span class="coin-amount">{{ player.gold }}元</span>
      </div>
      <button class="menu-btn" @click="router.push('/parent')">⚙️</button>
    </header>

    <!-- 主内容 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 底部导航 -->
    <nav class="bottom-nav" v-if="showNav">
      <button
        v-for="item in navItems"
        :key="item.name"
        class="nav-btn"
        :class="{ active: route.name === item.name }"
        @click="router.push({ name: item.name })"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  padding-bottom: 80px;
}

.has-nav {
  padding-top: 56px;
}

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: rgba(255, 248, 231, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 3px solid var(--warm-brown);
}

.back-btn, .menu-btn {
  background: none;
  border: 2px solid var(--warm-brown);
  border-radius: 12px;
  padding: 6px 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  color: var(--warm-brown);
}

.balance {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 20px;
  font-weight: 900;
  color: var(--warm-brown);
  background: var(--sunny-yellow);
  padding: 4px 16px;
  border-radius: 20px;
  border: 2px solid var(--warm-brown);
}

.coin-icon { font-size: 22px; }

.level-badge {
  background: var(--sky-blue);
  color: white;
  font-size: 12px;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: 12px;
  margin-right: 4px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  background: white;
  border-top: 3px solid var(--warm-brown);
  padding: 4px 0;
  padding-bottom: max(4px, env(safe-area-inset-bottom));
}

.nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 0;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  border-radius: 12px;
  transition: all 0.2s;
}

.nav-btn.active {
  background: var(--sunny-yellow);
}

.nav-icon { font-size: 24px; }
.nav-label { font-size: 11px; font-weight: 700; color: var(--charcoal); }

/* 页面过渡 */
.page-enter-active, .page-leave-active {
  transition: all 0.25s ease;
}
.page-enter-from { opacity: 0; transform: translateX(30px); }
.page-leave-to { opacity: 0; transform: translateX(-30px); }
</style>
