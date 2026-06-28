import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Task {
  id: string
  title: string
  description: string
  type: 'study' | 'chore' | 'challenge' | 'social'
  reward: number
  icon: string
  completed: boolean
  pendingApproval: boolean
  date: string
  repeatable: boolean
}

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([
    {
      id: 'task-001',
      title: '背古诗',
      description: '背诵一首新的唐诗',
      type: 'study',
      reward: 2,
      icon: '📖',
      completed: false,
      pendingApproval: false,
      date: new Date().toISOString().split('T')[0],
      repeatable: true,
    },
    {
      id: 'task-002',
      title: '整理书包',
      description: '把书包整理整齐',
      type: 'chore',
      reward: 1,
      icon: '🎒',
      completed: false,
      pendingApproval: false,
      date: new Date().toISOString().split('T')[0],
      repeatable: true,
    },
    {
      id: 'task-003',
      title: '浇花',
      description: '给家里的植物浇水',
      type: 'chore',
      reward: 1,
      icon: '🌻',
      completed: false,
      pendingApproval: false,
      date: new Date().toISOString().split('T')[0],
      repeatable: true,
    },
    {
      id: 'task-004',
      title: '读英语',
      description: '读15分钟英语绘本',
      type: 'study',
      reward: 2,
      icon: '📚',
      completed: false,
      pendingApproval: false,
      date: new Date().toISOString().split('T')[0],
      repeatable: true,
    },
    {
      id: 'task-005',
      title: '学会跳绳',
      description: '连续跳10个不中断',
      type: 'challenge',
      reward: 5,
      icon: '🏃',
      completed: false,
      pendingApproval: false,
      date: new Date().toISOString().split('T')[0],
      repeatable: false,
    },
    {
      id: 'task-006',
      title: '摆碗筷',
      description: '帮家人摆好餐具',
      type: 'chore',
      reward: 1,
      icon: '🍽️',
      completed: false,
      pendingApproval: false,
      date: new Date().toISOString().split('T')[0],
      repeatable: true,
    },
  ])

  const pendingTasks = computed(() =>
    tasks.value.filter(t => !t.completed && !t.pendingApproval)
  )

  const pendingApprovalTasks = computed(() =>
    tasks.value.filter(t => t.pendingApproval)
  )

  const todayEarnings = computed(() =>
    tasks.value
      .filter(t => t.completed && t.date === new Date().toISOString().split('T')[0])
      .reduce((sum, t) => sum + t.reward, 0)
  )

  function completeTask(taskId: string) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task && !task.completed) {
      task.pendingApproval = true
      task.date = new Date().toISOString().split('T')[0]
    }
  }

  function approveTask(taskId: string): number {
    const task = tasks.value.find(t => t.id === taskId)
    if (task && task.pendingApproval) {
      task.pendingApproval = false
      task.completed = true
      task.date = new Date().toISOString().split('T')[0]
      return task.reward
    }
    return 0
  }

  function rejectTask(taskId: string) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.pendingApproval = false
      task.completed = false
    }
  }

  function resetDailyTasks() {
    const today = new Date().toISOString().split('T')[0]
    tasks.value.forEach(t => {
      if (t.repeatable && t.date !== today) {
        t.completed = false
        t.pendingApproval = false
        t.date = today
      }
    })
  }

  function addTask(task: Omit<Task, 'id' | 'date' | 'completed' | 'pendingApproval'>) {
    tasks.value.push({
      ...task,
      id: `task-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      completed: false,
      pendingApproval: false,
    })
  }

  return {
    tasks, pendingTasks, pendingApprovalTasks, todayEarnings,
    completeTask, approveTask, rejectTask,
    resetDailyTasks, addTask,
  }
})
