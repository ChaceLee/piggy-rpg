import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/WorldMap.vue') },
  { path: '/money', name: 'money', component: () => import('../views/MoneyLearning.vue') },
  { path: '/piggies', name: 'piggies', component: () => import('../views/ThreePiggies.vue') },
  { path: '/tasks', name: 'tasks', component: () => import('../views/TaskBoard.vue') },
  { path: '/shop', name: 'shop', component: () => import('../views/ShopScene.vue') },
  { path: '/events/:id', name: 'event', component: () => import('../views/KnowledgeEvent.vue') },
  { path: '/bank', name: 'bank', component: () => import('../views/BankView.vue') },
  { path: '/growth', name: 'growth', component: () => import('../views/GrowthTree.vue') },
  { path: '/parent', name: 'parent', component: () => import('../views/ParentPanel.vue') },
  { path: '/quests', name: 'quests', component: () => import('../views/QuestList.vue') },
]

export default createRouter({
  history: createWebHistory(),
  routes
})
