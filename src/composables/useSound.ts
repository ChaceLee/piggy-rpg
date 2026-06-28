import { ref } from 'vue'

// 音效合成（使用 Web Audio API，无需外部文件）
const audioCtx = ref<AudioContext | null>(null)

function getContext(): AudioContext {
  if (!audioCtx.value) {
    audioCtx.value = new AudioContext()
  }
  return audioCtx.value
}

/** 播放投币叮当声 */
export function playCoinDrop() {
  try {
    const ctx = getContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1)

    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.2)
  } catch {}
}

/** 播放成功欢呼音效 */
export function playSuccess() {
  try {
    const ctx = getContext()
    // 两个音符：上升音阶
    const notes = [523, 659] // C5, E5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15)
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.15)
      osc.stop(ctx.currentTime + i * 0.15 + 0.3)
    })
  } catch {}
}

/** 播放错误提示音 */
export function playError() {
  try {
    const ctx = getContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(200, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.2)

    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  } catch {}
}

/** 播放按钮点击音效 */
export function playClick() {
  try {
    const ctx = getContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, ctx.currentTime)

    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.05)
  } catch {}
}

/** 语音播报文字 */
export function speak(text: string, lang = 'zh-CN') {
  if ('speechSynthesis' in window) {
    // 取消之前的语音
    window.speechSynthesis.cancel()
    const msg = new SpeechSynthesisUtterance(text)
    msg.lang = lang
    msg.rate = 0.9
    msg.pitch = 1.1
    window.speechSynthesis.speak(msg)
  }
}

/** 播放金币哗啦声（多个硬币） */
export function playCoinRain(count = 5) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => playCoinDrop(), i * 80)
  }
}
