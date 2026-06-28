<script setup lang="ts">
import { ref, computed } from 'vue'
import Coin3D from '../components/coins/Coin3D.vue'
import BillViewer from '../components/coins/BillViewer.vue'
import ConvertChallenge from '../components/coins/ConvertChallenge.vue'

const tab = ref<'coins' | 'bills' | 'convert'>('coins')

const coins = [
  { value: 1, name: '1元硬币', emoji: '🪙', sound: '叮～', weight: '6.1克', color: '#FFD700' },
  { value: 0.5, name: '5角硬币', emoji: '🟡', sound: '铛～', weight: '3.8克', color: '#C0C0C0' },
  { value: 0.1, name: '1角硬币', emoji: '🔶', sound: '叮～', weight: '2.2克', color: '#CD7F32' },
]

const bills = [
  { value: 5, name: '5元', emoji: '🟢', features: ['紫色', '毛主席像', '水印5', '盲文点'] },
  { value: 10, name: '10元', emoji: '🔵', features: ['蓝色', '毛主席像', '水印10', '光变数字'] },
  { value: 20, name: '20元', emoji: '🟤', features: ['棕色', '毛主席像', '水印20', '凹印手感'] },
  { value: 50, name: '50元', emoji: '🟣', features: ['绿色', '毛主席像', '水印50', '安全线'] },
  { value: 100, name: '100元', emoji: '🔴', features: ['红色', '毛主席像', '水印100', '光彩光变'] },
]

const convertLevel = ref(1)
</script>

<template>
  <div class="money-page">
    <h2 class="page-title">💰 认识人民币</h2>

    <!-- Tab 切换 -->
    <div class="tab-bar">
      <button class="tab-btn" :class="{ active: tab === 'coins' }" @click="tab = 'coins'">
        🪙 硬币
      </button>
      <button class="tab-btn" :class="{ active: tab === 'bills' }" @click="tab = 'bills'">
        💵 纸币
      </button>
      <button class="tab-btn" :class="{ active: tab === 'convert' }" @click="tab = 'convert'">
        🔢 换算
      </button>
    </div>

    <!-- 硬币区 -->
    <div v-if="tab === 'coins'" class="coins-section">
      <p class="tab-intro">点击硬币，听听它们的声音！</p>
      <div class="coins-grid">
        <div v-for="coin in coins" :key="coin.value" class="coin-card card">
          <Coin3D :color="coin.color" :label="coin.name" />
          <div class="coin-info">
            <div class="coin-value">
              <span v-if="coin.value >= 1">{{ coin.value }}元</span>
              <span v-else>{{ coin.value * 10 }}角</span>
            </div>
            <div class="coin-detail">
              <span>重量：{{ coin.weight }}</span>
              <span>声音：{{ coin.sound }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card tip-box">
        <p>💡 1元 = 10角，1角 = 10分</p>
        <p>🔊 试试大声读出它们的面额！</p>
      </div>
    </div>

    <!-- 纸币区 -->
    <div v-if="tab === 'bills'" class="bills-section">
      <p class="tab-intro">左右滑动查看纸币，找出防伪特征！</p>
      <div class="bills-scroll">
        <BillViewer
          v-for="bill in bills"
          :key="bill.value"
          :value="bill.value"
          :name="bill.name"
          :emoji="bill.emoji"
          :features="bill.features"
        />
      </div>
      <div class="card find-difference">
        <h3>🔍 找不同小游戏</h3>
        <p>真币特征：有水印 ✅ 有凹凸感 ✅ 听声音清脆 ✅</p>
      </div>
    </div>

    <!-- 换算关卡区 -->
    <div v-if="tab === 'convert'" class="convert-section">
      <p class="tab-intro">完成换算挑战，成为元角分小达人！</p>

      <div class="level-select">
        <button
          v-for="level in 4"
          :key="level"
          class="level-btn"
          :class="{ active: convertLevel === level, completed: level < convertLevel }"
          @click="convertLevel = level"
        >
          Level {{ level }}
        </button>
      </div>

      <ConvertChallenge :level="convertLevel" @complete="convertLevel < 4 && convertLevel++" />
    </div>
  </div>
</template>

<style scoped>
.money-page {
  padding: 16px;
  padding-bottom: 100px;
}

.tab-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: 3px solid var(--warm-brown);
  border-radius: 14px;
  background: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.tab-btn.active {
  background: var(--sunny-yellow);
  box-shadow: 2px 2px 0 var(--warm-brown);
  transform: translate(-1px, -1px);
}

.tab-intro {
  text-align: center;
  color: #888;
  font-size: 14px;
  margin-bottom: 16px;
}

/* 硬币 */
.coins-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.coin-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.coin-info {
  flex: 1;
}

.coin-value {
  font-size: 22px;
  font-weight: 900;
  color: var(--warm-brown);
}

.coin-detail {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.tip-box {
  margin-top: 12px;
  font-size: 14px;
  line-height: 2;
}

.tip-box p { padding: 2px 0; }

/* 纸币 */
.bills-scroll {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.find-difference {
  margin-top: 12px;
}

.find-difference h3 { font-size: 15px; margin-bottom: 8px; }
.find-difference p { font-size: 14px; line-height: 1.8; }

/* 换算关卡 */
.level-select {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  justify-content: center;
}

.level-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid var(--warm-brown);
  background: white;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.level-btn.active {
  background: var(--grass-green);
  color: white;
  transform: scale(1.1);
}

.level-btn.completed {
  background: var(--light-gray);
  opacity: 0.7;
}
</style>
