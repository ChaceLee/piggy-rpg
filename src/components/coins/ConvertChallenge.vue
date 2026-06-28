<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{ level: number }>()
const emit = defineEmits<{ complete: [] }>()

const userAnswer = ref('')
const showResult = ref(false)
const isCorrect = ref(false)
const attempts = ref(0)

const challenges = [
  {
    title: 'Level 1：元角转换',
    question: '1元 等于多少角？',
    options: ['5角', '10角', '100角'],
    answer: '10角',
    hint: '想一想：1元硬币可以换几个1角硬币？',
    knowledge: '✅ 1元 = 10角 🎉',
  },
  {
    title: 'Level 2：角分转换',
    question: '1角 等于多少分？',
    options: ['5分', '10分', '50分'],
    answer: '10分',
    hint: '想一想：1角硬币和1分硬币的关系？',
    knowledge: '✅ 1角 = 10分 🎉',
  },
  {
    title: 'Level 3：组合支付',
    question: '小明付10元买了一个6元8角的玩具，应该找回多少钱？',
    options: ['3元2角', '4元2角', '2元2角'],
    answer: '3元2角',
    hint: '10元 = 9元10角，减去6元8角...',
    knowledge: '✅ 10元 − 6元8角 = 3元2角 🎉',
  },
  {
    title: 'Level 4：最优支付',
    question: '要用最少的张数/硬币支付8元6角，应该怎么付？',
    options: ['5元+1元+1元+1元+5角+1角', '5元+2元+1元+5角+1角', '5元+1元+2元+5角'],
    answer: '5元+2元+1元+5角+1角',
    hint: '尽量用大面额！先考虑5元，再凑剩下的...',
    knowledge: '✅ 最优支付：5元+2元+1元+5角+1角（共5张/枚）🎉',
  },
]

const currentChallenge = computed(() => {
  const idx = Math.min(props.level - 1, challenges.length - 1)
  return challenges[idx]
})

function checkAnswer(option: string) {
  userAnswer.value = option
  attempts.value++
  isCorrect.value = option === currentChallenge.value.answer
  showResult.value = true
}

function nextChallenge() {
  showResult.value = false
  isCorrect.value = false
  userAnswer.value = ''
  emit('complete')
}

watch(() => props.level, () => {
  showResult.value = false
  isCorrect.value = false
  userAnswer.value = ''
  attempts.value = 0
})
</script>

<template>
  <div class="challenge-card card">
    <h3 class="challenge-title">{{ currentChallenge.title }}</h3>

    <div class="challenge-question" v-if="!showResult">
      <p class="question-text">{{ currentChallenge.question }}</p>

      <div class="options">
        <button
          v-for="(option, i) in currentChallenge.options"
          :key="i"
          class="option-btn"
          @click="checkAnswer(option)"
        >
          <span class="option-letter">{{ ['A', 'B', 'C'][i] }}</span>
          <span class="option-text">{{ option }}</span>
        </button>
      </div>

      <div class="hint-box" v-if="attempts > 0">
        <p>💡 {{ currentChallenge.hint }}</p>
      </div>
    </div>

    <!-- 结果 -->
    <div v-else class="challenge-result">
      <div class="result-icon" :class="{ correct: isCorrect }">
        {{ isCorrect ? '🎉' : '😅' }}
      </div>
      <p class="result-text" :class="{ correct: isCorrect }">
        {{ isCorrect ? '回答正确！' : '再想想哦～' }}
      </p>
      <p class="knowledge-text">{{ currentChallenge.knowledge }}</p>

      <button
        v-if="isCorrect"
        class="btn btn-success"
        @click="nextChallenge"
      >
        {{ level < 4 ? '进入下一关 →' : '🏆 全部通关！' }}
      </button>
      <button
        v-else
        class="btn btn-info"
        @click="showResult = false; attempts++"
      >
        再试一次
      </button>
    </div>
  </div>
</template>

<style scoped>
.challenge-card {
  text-align: center;
}

.challenge-title {
  font-size: 16px;
  color: var(--ocean-blue);
  margin-bottom: 16px;
}

.question-text {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.6;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 3px solid var(--warm-brown);
  border-radius: 16px;
  background: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.option-btn:active {
  background: var(--sunny-yellow);
  transform: scale(0.98);
}

.option-letter {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--sunny-yellow);
  border-radius: 50%;
  font-weight: 900;
  font-size: 14px;
}

.hint-box {
  background: #FFF3CD;
  border: 2px dashed #FFA94D;
  border-radius: 12px;
  padding: 10px;
  font-size: 14px;
  text-align: left;
}

/* 结果 */
.result-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.result-text {
  font-size: 24px;
  font-weight: 900;
  margin-bottom: 12px;
}

.result-text.correct { color: var(--grass-green); }

.knowledge-text {
  font-size: 16px;
  color: var(--ocean-blue);
  margin-bottom: 20px;
  line-height: 1.6;
}
</style>
