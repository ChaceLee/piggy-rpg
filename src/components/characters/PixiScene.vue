<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as PIXI from 'pixi.js'
import { PiggySprite, createBackground } from './PiggySprite'
import { NPCSprite } from './NPCSprite'

const props = defineProps<{
  width?: number
  height?: number
  piggies?: Array<{ type: 'spend' | 'save' | 'invest'; scale?: number }>
  npc?: 'bear' | 'rabbit' | 'fox' | 'turtle' | null
  showBackground?: boolean
}>()

const emit = defineEmits<{
  piggyClick: [type: string]
}>()

const canvasRef = ref<HTMLDivElement>()
let app: PIXI.Application | null = null
const piggySprites = new Map<string, PiggySprite>()
let npcSprite: NPCSprite | null = null

onMounted(() => {
  if (!canvasRef.value) return

  const w = props.width || canvasRef.value.clientWidth || 300
  const h = props.height || 180

  app = new PIXI.Application({
    width: w,
    height: h,
    backgroundColor: 0xFFF8E7,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  })

  canvasRef.value.appendChild(app.view as HTMLCanvasElement)

  // 背景
  if (props.showBackground) {
    const bg = createBackground(w, h)
    app.stage.addChild(bg)
  }

  // 小猪
  if (props.piggies) {
    const total = props.piggies.length
    props.piggies.forEach((piggy, i) => {
      const sprite = new PiggySprite(piggy.type, piggy.scale || 1)
      const spacing = w / (total + 1)
      sprite.container.x = spacing * (i + 1)
      sprite.container.y = h * 0.65

      // 点击事件
      sprite.container.on('pointertap', () => {
        emit('piggyClick', piggy.type)
      })

      app!.stage.addChild(sprite.container)
      piggySprites.set(piggy.type, sprite)

      // 开始 idle bounce
      sprite.idleBounce()
    })
  }

  // NPC
  if (props.npc) {
    npcSprite = new NPCSprite(props.npc, 1)
    npcSprite.container.x = w * 0.85
    npcSprite.container.y = h * 0.65
    app.stage.addChild(npcSprite.container)

    // 挥手动画
    setTimeout(() => npcSprite?.wave(), 1000)
  }
})

onUnmounted(() => {
  piggySprites.forEach(s => s.destroy())
  piggySprites.clear()
  npcSprite?.destroy()
  npcSprite = null
  app?.destroy(true)
  app = null
})

// 暴露方法给父组件
function playAnimation(type: string, anim: 'jump' | 'wiggle' | 'coinDrop') {
  const sprite = piggySprites.get(type)
  if (!sprite) return

  switch (anim) {
    case 'jump': sprite.jump(); break
    case 'wiggle': sprite.wiggle(); break
    case 'coinDrop': sprite.coinDropAnimation(); break
  }
}

function setEmotion(type: string, emotion: 'idle' | 'happy' | 'sad' | 'hungry' | 'excited') {
  piggySprites.get(type)?.setEmotion(emotion)
}

function npcWave() { npcSprite?.wave() }
function npcNod() { npcSprite?.nod() }

defineExpose({ playAnimation, setEmotion, npcWave, npcNod })
</script>

<template>
  <div ref="canvasRef" class="pixi-canvas"></div>
</template>

<style scoped>
.pixi-canvas {
  width: 100%;
  min-height: 160px;
  border: 3px solid var(--warm-brown);
  border-radius: 20px;
  overflow: hidden;
}

.pixi-canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: auto !important;
}
</style>
