<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import { usePiggyStore } from '../stores/piggyStore'
import { useEventStore } from '../stores/eventStore'

const router = useRouter()
const game = useGameStore()
const piggy = usePiggyStore()
const events = useEventStore()

const shopItems = [
  { id: 'candy', name: '棒棒糖', price: 2, emoji: '🍭', desc: '甜甜的草莓味' },
  { id: 'car', name: '玩具车', price: 15, emoji: '🚗', desc: '可以跑的小汽车' },
  { id: 'book', name: '故事书', price: 8, emoji: '📖', desc: '三只小猪的故事' },
  { id: 'ball', name: '小皮球', price: 5, emoji: '⚽', desc: '可以拍着玩' },
  { id: 'puzzle', name: '拼图', price: 12, emoji: '🧩', desc: '100片拼图' },
  { id: 'icecream', name: '冰淇淋', price: 3, emoji: '🍦', desc: '香草味，3元5角' },
]

const selectedItem = ref('')
const showPayment = ref(false)
const feedback = ref('')

// 触发熊老板知识事件
function handleItemClick(itemId: string) {
  selectedItem.value = itemId
  if (itemId === 'icecream') {
    // 触发冰淇淋知识事件
    router.push('/events/shop-icecream')
  } else {
    showPayment.value = true
  }
}

const currentItem = computed(() =>
  shopItems.find(i => i.id === selectedItem.value)
)

function buyItem() {
  if (!currentItem.value) return
  const spendBank = piggy.getBank('spend')
  if (spendBank && spendBank.balance >= currentItem.value.price) {
    piggy.withdraw('spend', currentItem.value.price)
    game.spendMoney(currentItem.value.price)
    feedback.value = `🎉 买到了${currentItem.value.emoji}！`
    setTimeout(() => {
      feedback.value = ''
      showPayment.value = false
    }, 2000)
  } else {
    feedback.value = '❌ 花花罐里的钱不够哦！先去完成任务赚钱吧！'
  }
}
</script>

<template>
  <div class="shop-page">
    <div class="shop-header">
      <div class="shop-npc">🐻 熊老板的杂货店</div>
      <div class="shop-balance">
        花花罐：{{ piggy.getBank('spend')?.balance ?? 0 }}元
      </div>
    </div>

    <!-- 商店货物架 -->
    <div class="items-grid">
      <div
        v-for="item in shopItems"
        :key="item.id"
        class="shop-item"
        @click="handleItemClick(item.id)"
      >
        <span class="item-emoji">{{ item.emoji }}</span>
        <div class="item-name">{{ item.name }}</div>
        <div class="item-price">¥{{ item.price }}</div>
      </div>
    </div>

    <!-- 付钱弹窗 -->
    <Transition name="pop">
      <div v-if="showPayment && currentItem" class="payment-overlay" @click.self="showPayment = false">
        <div class="payment-card card">
          <div class="payment-item">
            <span class="payment-emoji">{{ currentItem.emoji }}</span>
            <div class="payment-detail">
              <div class="payment-name">{{ currentItem.name }}</div>
              <div class="payment-price">价格：{{ currentItem.price }}元</div>
            </div>
          </div>

          <div class="payment-check">
            <p>花花罐余额：{{ piggy.getBank('spend')?.balance ?? 0 }}元</p>
            <p class="check-label">
              {{ (piggy.getBank('spend')?.balance ?? 0) >= currentItem.price ? '✅ 钱够！' : '❌ 钱不够' }}
            </p>
          </div>

          <div class="payment-actions">
            <button
              class="btn btn-success"
              :disabled="(piggy.getBank('spend')?.balance ?? 0) < currentItem.price"
              @click="buyItem"
            >
              付钱购买
            </button>
            <button class="btn btn-danger" @click="showPayment = false">
              不买了
            </button>
          </div>

          <div v-if="feedback" class="feedback-text">{{ feedback }}</div>
        </div>
      </div>
    </Transition>

    <!-- 熊老板说话气泡 -->
    <div class="npc-bubble card">
      <div class="npc-avatar">🐻</div>
      <div class="bubble-text">
        "欢迎光临！看看有什么想买的吗？
        记住：<strong>想要</strong> 和 <strong>需要</strong> 是不同的哦！"
      </div>
    </div>
  </div>
</template>

<style scoped>
.shop-page {
  padding: 16px;
  padding-bottom: 100px;
}

.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.shop-npc {
  font-size: 18px;
  font-weight: 900;
  color: var(--warm-brown);
}

.shop-balance {
  font-size: 14px;
  font-weight: 700;
  color: var(--pig-hua);
}

.items-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}

.shop-item {
  background: white;
  border: 3px solid var(--warm-brown);
  border-radius: 16px;
  padding: 14px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.shop-item:active {
  transform: scale(0.95);
  background: var(--sunny-yellow);
}

.item-emoji { display: block; font-size: 28px; margin-bottom: 4px; }
.item-name { font-weight: 700; font-size: 13px; }
.item-price { font-size: 14px; font-weight: 900; color: var(--candy-red); margin-top: 2px; }

/* 支付弹窗 */
.payment-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.payment-card {
  width: 100%;
  max-width: 340px;
}

.payment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.payment-emoji { font-size: 40px; }
.payment-name { font-weight: 700; font-size: 18px; }
.payment-price { color: var(--candy-red); font-weight: 700; }

.payment-check {
  background: #F8F8F8;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
}

.check-label {
  font-weight: 700;
  margin-top: 4px;
}

.payment-actions {
  display: flex;
  gap: 8px;
}

.payment-actions .btn {
  flex: 1;
}

.feedback-text {
  text-align: center;
  margin-top: 12px;
  font-size: 18px;
  font-weight: 700;
}

/* NPC 气泡 */
.npc-bubble {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #F0F8FF;
}

.npc-avatar { font-size: 36px; }
.bubble-text { font-size: 14px; line-height: 1.8; }
</style>
