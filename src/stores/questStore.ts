import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type QuestType = 'main' | 'side' | 'daily' | 'tutorial'
export type QuestStatus = 'locked' | 'available' | 'in-progress' | 'completed' | 'claimed'

export interface QuestReward {
  gold: number
  xp: number
  skillXp?: { skillId: string; amount: number }[]
  badgeId?: string
  unlocks?: string[]
}

export interface Quest {
  id: string
  title: string
  description: string
  type: QuestType
  icon: string
  chapter: number
  status: QuestStatus
  progress: number
  target: number
  rewards: QuestReward
  requires: string[]
  narrative: string[]
  npcId?: string
  location?: string
  hint: string
}

export interface GameLocation {
  id: string
  name: string
  icon: string
  description: string
  unlocked: boolean
  x: number
  y: number
  color: string
  sceneRoute?: string
  npcs: string[]
}

export interface NPC {
  id: string
  name: string
  emoji: string
  title: string
  description: string
  location: string
  met: boolean
  dialogues: {
    greeting: string[]
    questHint?: string
    knowledge?: string
  }
}

const MAIN_QUESTS: Quest[] = [
  {
    id: 'mq-001',
    title: '初到财富小镇',
    description: '欢迎来到财富小镇！先去小镇广场逛逛，认识一下这里的居民吧。',
    type: 'main',
    icon: '🌟',
    chapter: 1,
    status: 'available',
    progress: 0,
    target: 1,
    rewards: { gold: 5, xp: 10, skillXp: [{ skillId: 'quest-skill', amount: 5 }] },
    requires: [],
    narrative: [
      '欢迎来到财富小镇！这里的居民都很会管理钱财。',
      '你是新来的小猪勇士，准备好学习财商知识了吗？',
      '先去小镇广场认识一下兔博士吧，她会指引你的冒险！',
    ],
    npcId: 'npc-rabbit',
    location: 'village-square',
    hint: '点击兔博士和她对话',
  },
  {
    id: 'mq-002',
    title: '认识人民币',
    description: '去钱币学堂学习认识人民币的各种面额。',
    type: 'main',
    icon: '💰',
    chapter: 1,
    status: 'locked',
    progress: 0,
    target: 1,
    rewards: { gold: 10, xp: 20, skillXp: [{ skillId: 'money-knowledge', amount: 15 }] },
    requires: ['mq-001'],
    narrative: [
      '兔博士："要学会管理钱，首先得认识钱！"',
      '去钱币学堂找猫头鹰老师，她会教你认识人民币。',
    ],
    npcId: 'npc-owl',
    location: 'money-school',
    hint: '进入钱币学堂完成学习',
  },
  {
    id: 'mq-003',
    title: '三只小猪存钱罐',
    description: '认识花花、存存、投投三只小猪，学会分配零花钱。',
    type: 'main',
    icon: '🐷',
    chapter: 1,
    status: 'locked',
    progress: 0,
    target: 1,
    rewards: { gold: 15, xp: 25, skillXp: [{ skillId: 'saving-skill', amount: 15 }], unlocks: ['piggies'] },
    requires: ['mq-002'],
    narrative: [
      '猫头鹰老师："认识了钱，接下来要学会管好钱！"',
      '小镇上有三只神奇的小猪存钱罐，去找找它们吧！',
      '花花管消费、存存管储蓄、投投管投资。',
    ],
    npcId: 'npc-piggy',
    location: 'piggy-house',
    hint: '去小猪之家把钱分配给三只小猪',
  },
  {
    id: 'mq-004',
    title: '第一份工作',
    description: '完成3个任务，赚取你的第一笔收入！',
    type: 'main',
    icon: '📋',
    chapter: 1,
    status: 'locked',
    progress: 0,
    target: 3,
    rewards: { gold: 10, xp: 20, skillXp: [{ skillId: 'quest-skill', amount: 10 }] },
    requires: ['mq-003'],
    narrative: [
      '想要有钱花，就得靠自己努力赚！',
      '去任务公告板看看有什么可以做的事吧。',
    ],
    npcId: 'npc-bear',
    location: 'task-board',
    hint: '完成3个任务并获得奖励',
  },
  {
    id: 'mq-005',
    title: '商店初体验',
    description: '去熊老板的商店，学习怎么聪明地花钱。',
    type: 'main',
    icon: '🛒',
    chapter: 1,
    status: 'locked',
    progress: 0,
    target: 1,
    rewards: { gold: 5, xp: 15, skillXp: [{ skillId: 'shopping-skill', amount: 10 }], unlocks: ['shop'] },
    requires: ['mq-004'],
    narrative: [
      '赚了钱，当然要买点喜欢的东西啦！',
      '但是花钱也是有学问的哦，去熊老板的商店看看吧。',
    ],
    npcId: 'npc-bear-shop',
    location: 'shop',
    hint: '进入商店完成一次购物体验',
  },
  {
    id: 'mq-006',
    title: '存够50元',
    description: '把存存罐存到50元，证明你是个储蓄小能手！',
    type: 'main',
    icon: '💎',
    chapter: 1,
    status: 'locked',
    progress: 0,
    target: 50,
    rewards: { gold: 20, xp: 30, skillXp: [{ skillId: 'saving-skill', amount: 20 }], badgeId: 'saving-50' },
    requires: ['mq-005'],
    narrative: [
      '真棒！你已经学会了赚钱和花钱。',
      '现在来挑战一下：把存存罐存到50元！',
      '存到50元后，兔博士会告诉你一个让钱长大的秘密...',
    ],
    npcId: 'npc-rabbit',
    location: 'bank',
    hint: '往存存罐里存钱，直到达到50元',
  },
  {
    id: 'mq-007',
    title: '认识银行',
    description: '去银行找兔博士，学习储蓄和利息的知识。',
    type: 'main',
    icon: '🏦',
    chapter: 2,
    status: 'locked',
    progress: 0,
    target: 1,
    rewards: { gold: 25, xp: 35, skillXp: [{ skillId: 'invest-skill', amount: 20 }], unlocks: ['bank'], badgeId: 'bank-visitor' },
    requires: ['mq-006'],
    narrative: [
      '恭喜你存够了50元！你是个很棒的储蓄小能手！',
      '现在兔博士要带你去一个神奇的地方——银行！',
      '在银行里，你的钱会自己生下小钱，叫做"利息"。',
    ],
    npcId: 'npc-rabbit',
    location: 'bank',
    hint: '进入银行并开设一个活期账户',
  },
  {
    id: 'mq-008',
    title: '利息魔法师',
    description: '在银行存一笔定期，体验复利的威力。',
    type: 'main',
    icon: '✨',
    chapter: 2,
    status: 'locked',
    progress: 0,
    target: 1,
    rewards: { gold: 30, xp: 40, skillXp: [{ skillId: 'invest-skill', amount: 25 }], badgeId: 'compound-master' },
    requires: ['mq-007'],
    narrative: [
      '兔博士："活期有利息，但定期的利息更高哦！"',
      '就像种下一颗种子，定期越长，收获越大。',
      '去存一笔定期存款，看看利息是怎么长大的吧！',
    ],
    npcId: 'npc-turtle',
    location: 'bank',
    hint: '开立一笔7天定期存款',
  },
]

const SIDE_QUESTS: Quest[] = [
  {
    id: 'sq-001',
    title: '整理小能手',
    description: '帮家里整理房间，获得额外奖励。',
    type: 'side',
    icon: '🧹',
    chapter: 1,
    status: 'available',
    progress: 0,
    target: 1,
    rewards: { gold: 3, xp: 8, skillXp: [{ skillId: 'quest-skill', amount: 3 }] },
    requires: ['mq-001'],
    narrative: ['妈妈说："爱干净的孩子运气不会差！"', '把房间整理整齐吧～'],
    location: 'home',
    hint: '完成一个家务类任务',
  },
  {
    id: 'sq-002',
    title: '防骗小侦探',
    description: '识破狐小骗的诡计，保护好你的钱财。',
    type: 'side',
    icon: '🛡️',
    chapter: 1,
    status: 'locked',
    progress: 0,
    target: 1,
    rewards: { gold: 8, xp: 15, skillXp: [{ skillId: 'shopping-skill', amount: 10 }], badgeId: 'anti-fraud' },
    requires: ['mq-004'],
    narrative: ['小镇上来了一只狡猾的狐狸...', '不要贪小便宜，记住天下没有免费的午餐！'],
    npcId: 'npc-fox',
    location: 'street',
    hint: '遇到狐小骗时做出正确选择',
  },
  {
    id: 'sq-003',
    title: '知识就是力量',
    description: '完成5个知识事件，成为知识小达人！',
    type: 'side',
    icon: '📚',
    chapter: 1,
    status: 'locked',
    progress: 0,
    target: 5,
    rewards: { gold: 15, xp: 25, skillXp: [{ skillId: 'money-knowledge', amount: 15 }], badgeId: 'knowledge-seeker' },
    requires: ['mq-002'],
    narrative: ['遇到不懂的就多问多学！', '知识越多，你就越强大！'],
    hint: '完成5个知识问答事件',
  },
]

const LOCATIONS: GameLocation[] = [
  {
    id: 'village-square',
    name: '小镇广场',
    icon: '🏛️',
    description: '财富小镇的中心，大家都爱在这里聊天。',
    unlocked: true,
    x: 50,
    y: 45,
    color: '#FFD93D',
    npcs: ['npc-rabbit', 'npc-mayor'],
  },
  {
    id: 'money-school',
    name: '钱币学堂',
    icon: '🏫',
    description: '猫头鹰老师的课堂，学习钱币知识的地方。',
    unlocked: true,
    x: 25,
    y: 25,
    color: '#4D96FF',
    sceneRoute: 'money',
    npcs: ['npc-owl'],
  },
  {
    id: 'piggy-house',
    name: '小猪之家',
    icon: '🏠',
    description: '花花、存存、投投三只小猪的家。',
    unlocked: true,
    x: 75,
    y: 25,
    color: '#FF6B6B',
    sceneRoute: 'piggies',
    npcs: ['npc-piggy'],
  },
  {
    id: 'task-board',
    name: '任务公告板',
    icon: '📋',
    description: '小镇的任务墙，完成任务赚零花钱！',
    unlocked: true,
    x: 20,
    y: 70,
    color: '#6BCB77',
    sceneRoute: 'tasks',
    npcs: ['npc-bear'],
  },
  {
    id: 'shop',
    name: '熊老板商店',
    icon: '🛒',
    description: '什么都卖的杂货店，熊老板是个精明的商人。',
    unlocked: true,
    x: 80,
    y: 65,
    color: '#FFA94D',
    sceneRoute: 'shop',
    npcs: ['npc-bear-shop'],
  },
  {
    id: 'bank',
    name: '财富银行',
    icon: '🏦',
    description: '兔博士工作的地方，让钱生钱的魔法屋。',
    unlocked: false,
    x: 50,
    y: 80,
    color: '#9B59B6',
    sceneRoute: 'bank',
    npcs: ['npc-rabbit', 'npc-turtle'],
  },
  {
    id: 'growth-tree',
    name: '成长之树',
    icon: '🌳',
    description: '记录你所有成长的神奇大树。',
    unlocked: true,
    x: 15,
    y: 45,
    color: '#6BCB77',
    sceneRoute: 'growth',
    npcs: [],
  },
  {
    id: 'home',
    name: '我的家',
    icon: '🏡',
    description: '你温暖的小家，可以休息和整理。',
    unlocked: true,
    x: 85,
    y: 45,
    color: '#FF6B6B',
    npcs: [],
  },
]

const NPCS: NPC[] = [
  {
    id: 'npc-rabbit',
    name: '兔博士',
    emoji: '🐰',
    title: '银行行长 / 财商导师',
    description: '聪明的兔子博士，精通各种理财知识，是你的导师。',
    location: 'village-square',
    met: false,
    dialogues: {
      greeting: [
        '你好呀，小猪勇士！欢迎来到财富小镇！',
        '我是兔博士，在这里教大家管理钱财的知识。',
        '想要成为财商大师吗？跟着我一起学习吧！',
      ],
      questHint: '多完成任务、多存钱，你就能学到更多知识哦！',
      knowledge: '记住三句话：赚得多不如存得多，存得多不如会花钱，会花钱不如会让钱生钱。',
    },
  },
  {
    id: 'npc-owl',
    name: '猫头鹰老师',
    emoji: '🦉',
    title: '钱币学堂老师',
    description: '知识渊博的猫头鹰，专门教小朋友认识钱币。',
    location: 'money-school',
    met: false,
    dialogues: {
      greeting: [
        '呼呼～欢迎来到钱币学堂！',
        '我是猫头鹰老师，我会教你认识所有的人民币。',
        '从1分到100元，每张钱都有自己的故事哦！',
      ],
      questHint: '认真学习钱币知识，以后就不会被坏人骗啦！',
      knowledge: '人民币有纸币和硬币，面额有1分、2分、5分、1角、5角、1元、5元、10元、20元、50元、100元。',
    },
  },
  {
    id: 'npc-piggy',
    name: '三只小猪',
    emoji: '🐷',
    title: '存钱罐精灵',
    description: '花花、存存、投投三兄弟，帮你管理零花钱。',
    location: 'piggy-house',
    met: false,
    dialogues: {
      greeting: [
        '你好呀！我们是三只小猪存钱罐！',
        '我是花花，负责买好玩的好吃的！',
        '我是存存，负责帮你存大钱！',
        '我是投投，负责让钱变更多钱～',
      ],
      questHint: '每次拿到零花钱，都要分给我们三个哦！这样花钱、存钱、投资都不耽误～',
      knowledge: '理财三分法：40%用来花，40%存起来，20%用来投资。这样最合理！',
    },
  },
  {
    id: 'npc-bear',
    name: '熊大壮',
    emoji: '🐻',
    title: '任务管理员',
    description: '强壮的熊大叔，负责管理小镇的任务公告板。',
    location: 'task-board',
    met: false,
    dialogues: {
      greeting: [
        '嘿！小朋友，想赚零花钱吗？',
        '这里有好多任务可以做，完成了就有奖励！',
        '要做一个勤劳的好孩子哦！',
      ],
      questHint: '每天的任务记得完成，日积月累你就会变成小富翁啦！',
      knowledge: '自己动手，丰衣足食。靠劳动赚来的钱花起来最开心！',
    },
  },
  {
    id: 'npc-bear-shop',
    name: '熊老板',
    emoji: '🐼',
    title: '杂货店老板',
    description: '精明的熊猫老板，卖的东西又好又便宜。',
    location: 'shop',
    met: false,
    dialogues: {
      greeting: [
        '欢迎光临！想买点什么呀？',
        '我这里有零食、玩具、文具，什么都有！',
        '不过要记住哦，只买需要的，不买想要的～',
      ],
      questHint: '买东西前先想一想：是"我需要"还是"我想要"？',
      knowledge: '聪明消费三问：1.我真的需要吗？2.有没有更便宜的？3.买了会常用吗？',
    },
  },
  {
    id: 'npc-fox',
    name: '狐小骗',
    emoji: '🦊',
    title: '神秘小贩',
    description: '狡猾的狐狸，总想骗小朋友的钱。要小心！',
    location: 'street',
    met: false,
    dialogues: {
      greeting: [
        '嘿嘿嘿，小朋友，想不想发财呀？',
        '我有一个好买卖，保证让你赚大钱！',
        '只要把你的10元给我，我给你换20张1元的，怎么样？',
      ],
      questHint: '小心！狐小骗是骗子！不要贪小便宜，有问题找大人！',
      knowledge: '防骗口诀：不贪便宜不害怕，不懂就问大人呀。陌生人给的东西不能要，陌生人的话别当真！',
    },
  },
  {
    id: 'npc-turtle',
    name: '龟爷爷',
    emoji: '🐢',
    title: '银行老客户',
    description: '最有耐心的老爷爷，在银行存了一辈子钱。',
    location: 'bank',
    met: false,
    dialogues: {
      greeting: [
        '慢慢慢～不急不急～',
        '我是龟爷爷，我在这家银行存了好多年钱啦。',
        '小朋友，你知道什么是复利吗？就是利滚利，钱生钱，越滚越大！',
      ],
      questHint: '存钱要耐心，就像种小树，时间越长，长得越大～',
      knowledge: '复利就是利息也会生利息。今年的利息，明年也能赚利息！时间越长，威力越大！',
    },
  },
  {
    id: 'npc-mayor',
    name: '山猫镇长',
    emoji: '🐱',
    title: '财富小镇镇长',
    description: '公正的山猫镇长，把小镇管理得井井有条。',
    location: 'village-square',
    met: false,
    dialogues: {
      greeting: [
        '你好，新来的小勇士！',
        '我是财富小镇的镇长，欢迎你来到这里！',
        '希望你在这里学到有用的财商知识，将来做一个会管理钱的人！',
      ],
      questHint: '完成主线任务，你就能解锁更多有趣的地方！',
      knowledge: '一个人的财富不是看他赚了多少，而是看他留下了多少，以及那些钱能为他工作多久。',
    },
  },
]

export const useQuestStore = defineStore('quests', () => {
  const quests = ref<Quest[]>([...MAIN_QUESTS, ...SIDE_QUESTS])
  const locations = ref<GameLocation[]>([...LOCATIONS])
  const npcs = ref<NPC[]>([...NPCS])
  const currentQuestId = ref<string | null>(null)
  const showQuestPopup = ref(false)
  const newBadges = ref<string[]>([])

  const mainQuests = computed(() => quests.value.filter(q => q.type === 'main'))
  const sideQuests = computed(() => quests.value.filter(q => q.type === 'side'))
  const dailyQuests = computed(() => quests.value.filter(q => q.type === 'daily'))
  const tutorialQuests = computed(() => quests.value.filter(q => q.type === 'tutorial'))

  const availableQuests = computed(() => quests.value.filter(q => q.status === 'available'))
  const inProgressQuests = computed(() => quests.value.filter(q => q.status === 'in-progress'))
  const completedQuests = computed(() => quests.value.filter(q => q.status === 'completed' || q.status === 'claimed'))

  const currentChapter = computed(() => {
    const activeMain = mainQuests.value.find(q => q.status === 'in-progress' || q.status === 'available')
    return activeMain?.chapter ?? 1
  })

  const metNpcs = computed(() => npcs.value.filter(n => n.met))

  function getQuest(id: string) {
    return quests.value.find(q => q.id === id)
  }

  function getLocation(id: string) {
    return locations.value.find(l => l.id === id)
  }

  function getNPC(id: string) {
    return npcs.value.find(n => n.id === id)
  }

  function meetNPC(npcId: string): NPC | null {
    const npc = npcs.value.find(n => n.id === npcId)
    if (npc && !npc.met) {
      npc.met = true
      return npc
    }
    return npc ?? null
  }

  function startQuest(questId: string): boolean {
    const quest = quests.value.find(q => q.id === questId)
    if (!quest || quest.status !== 'available') return false

    quest.status = 'in-progress'
    currentQuestId.value = questId
    return true
  }

  function updateQuestProgress(questId: string, progress: number = 1): { completed: boolean; quest: Quest | null } {
    const quest = quests.value.find(q => q.id === questId)
    if (!quest || quest.status !== 'in-progress') return { completed: false, quest: null }

    quest.progress = Math.min(quest.target, quest.progress + progress)

    if (quest.progress >= quest.target) {
      quest.status = 'completed'
      return { completed: true, quest }
    }
    return { completed: false, quest }
  }

  function claimQuestReward(questId: string): QuestReward | null {
    const quest = quests.value.find(q => q.id === questId)
    if (!quest || quest.status !== 'completed') return null

    quest.status = 'claimed'
    if (currentQuestId.value === questId) {
      currentQuestId.value = null
    }

    unlockQuests(questId)
    unlockLocations(quest.rewards.unlocks)

    return quest.rewards
  }

  function unlockQuests(completedQuestId: string) {
    for (const quest of quests.value) {
      if (quest.status === 'locked' && quest.requires.includes(completedQuestId)) {
        const allRequirementsMet = quest.requires.every(reqId => {
          const req = quests.value.find(q => q.id === reqId)
          return req && (req.status === 'completed' || req.status === 'claimed')
        })
        if (allRequirementsMet) {
          quest.status = 'available'
        }
      }
    }
  }

  function unlockLocations(unlockList?: string[]) {
    if (!unlockList) return
    for (const locId of unlockList) {
      const loc = locations.value.find(l => l.id === locId)
      if (loc) loc.unlocked = true
    }
  }

  function unlockLocation(locationId: string) {
    const loc = locations.value.find(l => l.id === locationId)
    if (loc) loc.unlocked = true
  }

  function addSideQuest(quest: Omit<Quest, 'id' | 'status' | 'progress'> & { id?: string }) {
    quests.value.push({
      ...quest,
      id: quest.id || `sq-${Date.now()}`,
      status: 'available',
      progress: 0,
    })
  }

  function getNpcsAtLocation(locationId: string) {
    return npcs.value.filter(n => n.location === locationId)
  }

  function saveToLocal() {
    const data = {
      quests: quests.value.map(q => ({ id: q.id, status: q.status, progress: q.progress })),
      locations: locations.value.map(l => ({ id: l.id, unlocked: l.unlocked })),
      npcs: npcs.value.map(n => ({ id: n.id, met: n.met })),
      currentQuestId: currentQuestId.value,
    }
    localStorage.setItem('piggy-quests', JSON.stringify(data))
  }

  function loadFromLocal() {
    const raw = localStorage.getItem('piggy-quests')
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      if (data.quests) {
        for (const saved of data.quests) {
          const quest = quests.value.find(q => q.id === saved.id)
          if (quest) {
            quest.status = saved.status ?? 'available'
            quest.progress = saved.progress ?? 0
          }
        }
      }
      if (data.locations) {
        for (const saved of data.locations) {
          const loc = locations.value.find(l => l.id === saved.id)
          if (loc) loc.unlocked = saved.unlocked ?? true
        }
      }
      if (data.npcs) {
        for (const saved of data.npcs) {
          const npc = npcs.value.find(n => n.id === saved.id)
          if (npc) npc.met = saved.met ?? false
        }
      }
      currentQuestId.value = data.currentQuestId ?? null
    } catch {}
  }

  function resetQuests() {
    quests.value.forEach(q => {
      q.status = q.requires.length === 0 ? 'available' : 'locked'
      q.progress = 0
    })
    locations.value.forEach(l => {
      l.unlocked = ['village-square', 'money-school', 'piggy-house', 'task-board', 'shop', 'growth-tree', 'home'].includes(l.id)
    })
    npcs.value.forEach(n => { n.met = false })
    currentQuestId.value = null
  }

  return {
    quests, locations, npcs,
    currentQuestId, showQuestPopup, newBadges,
    mainQuests, sideQuests, dailyQuests, tutorialQuests,
    availableQuests, inProgressQuests, completedQuests,
    currentChapter, metNpcs,
    getQuest, getLocation, getNPC,
    meetNPC, startQuest, updateQuestProgress, claimQuestReward,
    unlockQuests, unlockLocations, unlockLocation,
    addSideQuest, getNpcsAtLocation,
    saveToLocal, loadFromLocal, resetQuests,
  }
})
