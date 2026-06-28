import * as PIXI from 'pixi.js'

export type PiggyEmotion = 'idle' | 'happy' | 'sad' | 'hungry' | 'excited'
export type PiggyType = 'spend' | 'save' | 'invest'

const PIGGY_COLORS: Record<PiggyType, { body: number; ear: number; blush: number }> = {
  spend: { body: 0xFF6B6B, ear: 0xFF4757, blush: 0xFFA8A8 },
  save: { body: 0x4D96FF, ear: 0x2E7FFF, blush: 0xA8CFFF },
  invest: { body: 0x6BCB77, ear: 0x4CAF50, blush: 0xA8E6A8 },
}

export class PiggySprite {
  public container: PIXI.Container
  private body: PIXI.Graphics
  private leftEye: PIXI.Graphics
  private rightEye: PIXI.Graphics
  private nose: PIXI.Graphics
  private leftEar: PIXI.Graphics
  private rightEar: PIXI.Graphics
  private blushLeft: PIXI.Graphics
  private blushRight: PIXI.Graphics
  private mouth: PIXI.Graphics
  private coinSlot: PIXI.Text
  private accessory: PIXI.Container

  private type: PiggyType
  private scale: number
  private emotion: PiggyEmotion = 'idle'
  private animating = false

  constructor(type: PiggyType, scale = 1) {
    this.type = type
    this.scale = scale
    this.container = new PIXI.Container()

    const colors = PIGGY_COLORS[type]

    // 身体
    this.body = new PIXI.Graphics()
    this.body.beginFill(colors.body, 1)
    this.body.drawEllipse(0, 0, 40 * scale, 35 * scale)
    this.body.endFill()
    this.body.beginFill(colors.body, 0.3)
    this.body.drawEllipse(-15 * scale, -10 * scale, 20 * scale, 15 * scale)
    this.body.endFill()

    // 耳朵
    this.leftEar = new PIXI.Graphics()
    this.leftEar.beginFill(colors.ear, 1)
    this.leftEar.drawEllipse(-22 * scale, -32 * scale, 10 * scale, 10 * scale)
    this.leftEar.endFill()

    this.rightEar = new PIXI.Graphics()
    this.rightEar.beginFill(colors.ear, 1)
    this.rightEar.drawEllipse(22 * scale, -32 * scale, 10 * scale, 10 * scale)
    this.rightEar.endFill()

    // 左耳内圈
    this.leftEar.beginFill(colors.blush, 0.5)
    this.leftEar.drawEllipse(-22 * scale, -32 * scale, 6 * scale, 6 * scale)
    this.leftEar.endFill()
    this.rightEar.beginFill(colors.blush, 0.5)
    this.rightEar.drawEllipse(22 * scale, -32 * scale, 6 * scale, 6 * scale)
    this.rightEar.endFill()

    // 眼睛
    this.leftEye = new PIXI.Graphics()
    this.leftEye.beginFill(0x333333, 1)
    this.leftEye.drawCircle(-15 * scale, -8 * scale, 5 * scale)
    this.leftEye.endFill()
    // 高光
    this.leftEye.beginFill(0xFFFFFF, 1)
    this.leftEye.drawCircle(-13 * scale, -10 * scale, 2 * scale)
    this.leftEye.endFill()

    this.rightEye = new PIXI.Graphics()
    this.rightEye.beginFill(0x333333, 1)
    this.rightEye.drawCircle(15 * scale, -8 * scale, 5 * scale)
    this.rightEye.endFill()
    this.rightEye.beginFill(0xFFFFFF, 1)
    this.rightEye.drawCircle(17 * scale, -10 * scale, 2 * scale)
    this.rightEye.endFill()

    // 腮红
    this.blushLeft = new PIXI.Graphics()
    this.blushLeft.beginFill(colors.blush, 0.6)
    this.blushLeft.drawEllipse(-25 * scale, 2 * scale, 8 * scale, 5 * scale)
    this.blushLeft.endFill()

    this.blushRight = new PIXI.Graphics()
    this.blushRight.beginFill(colors.blush, 0.6)
    this.blushRight.drawEllipse(25 * scale, 2 * scale, 8 * scale, 5 * scale)
    this.blushRight.endFill()

    // 鼻子
    this.nose = new PIXI.Graphics()
    this.nose.beginFill(0xFF8FA3, 1)
    this.nose.drawEllipse(0, 4 * scale, 10 * scale, 7 * scale)
    this.nose.endFill()
    // 鼻孔
    this.nose.beginFill(0xE06B7A, 1)
    this.nose.drawCircle(-3 * scale, 4 * scale, 2 * scale)
    this.nose.drawCircle(3 * scale, 4 * scale, 2 * scale)
    this.nose.endFill()

    // 嘴巴
    this.mouth = new PIXI.Graphics()
    this.drawMouth('smile')

    // 投币口
    this.coinSlot = new PIXI.Text('🪙', { fontSize: 16 * scale })
    this.coinSlot.anchor.set(0.5)
    this.coinSlot.position.set(30 * scale, -30 * scale)
    this.coinSlot.rotation = 0.2

    // 配件（存存戴眼镜、投投戴星星）
    this.accessory = new PIXI.Container()
    this.buildAccessory()

    // 组装
    this.container.addChild(
      this.body, this.blushLeft, this.blushRight,
      this.leftEar, this.rightEar,
      this.leftEye, this.rightEye,
      this.nose, this.mouth,
      this.coinSlot, this.accessory,
    )

    // 设置交互区域
    this.container.eventMode = 'static'
    this.container.cursor = 'pointer'
  }

  private drawMouth(shape: 'smile' | 'happy' | 'sad' | 'open') {
    this.mouth.clear()
    this.mouth.lineStyle(2.5 * this.scale, 0x333333, 1)

    switch (shape) {
      case 'smile':
        this.mouth.arc(0, 8 * this.scale, 8 * this.scale, 0.2, Math.PI - 0.2)
        break
      case 'happy':
        this.mouth.arc(0, 10 * this.scale, 10 * this.scale, 0, Math.PI)
        break
      case 'sad':
        this.mouth.arc(0, 14 * this.scale, 8 * this.scale, Math.PI + 0.2, -0.2)
        break
      case 'open':
        this.mouth.beginFill(0x333333, 1)
        this.mouth.drawEllipse(0, 10 * this.scale, 6 * this.scale, 4 * this.scale)
        this.mouth.endFill()
        break
    }
  }

  private buildAccessory() {
    if (this.type === 'save') {
      // 眼镜
      const leftLens = new PIXI.Graphics()
      leftLens.lineStyle(2, 0x333333, 0.8)
      leftLens.drawCircle(-16 * this.scale, -8 * this.scale, 7 * this.scale)
      const rightLens = new PIXI.Graphics()
      rightLens.lineStyle(2, 0x333333, 0.8)
      rightLens.drawCircle(16 * this.scale, -8 * this.scale, 7 * this.scale)
      const bridge = new PIXI.Graphics()
      bridge.lineStyle(2, 0x333333, 0.8)
      bridge.moveTo(-9 * this.scale, -8 * this.scale)
      bridge.lineTo(9 * this.scale, -8 * this.scale)
      this.accessory.addChild(leftLens, rightLens, bridge)
    } else if (this.type === 'invest') {
      // 星星魔法
      const star = new PIXI.Text('✨', { fontSize: 20 * this.scale })
      star.anchor.set(0.5)
      star.position.set(-25 * this.scale, -30 * this.scale)
      this.accessory.addChild(star)
    }
  }

  setEmotion(emotion: PiggyEmotion) {
    this.emotion = emotion
    switch (emotion) {
      case 'idle': this.drawMouth('smile'); break
      case 'happy': this.drawMouth('happy'); break
      case 'sad': this.drawMouth('sad'); break
      case 'hungry': this.drawMouth('open'); break
      case 'excited': this.drawMouth('open'); break
    }
  }

  // === 动画 ===

  async jump(height = 20, duration = 400): Promise<void> {
    if (this.animating) return
    this.animating = true

    const startY = this.container.y
    const midY = startY - height * this.scale

    await this.animateTo({ y: midY }, duration * 0.4)
    await this.animateTo({ y: startY }, duration * 0.6)

    this.animating = false
  }

  async wiggle(duration = 300): Promise<void> {
    if (this.animating) return
    this.animating = true

    const original = this.container.rotation
    await this.animateTo({ rotation: original - 0.15 }, duration * 0.25)
    await this.animateTo({ rotation: original + 0.15 }, duration * 0.25)
    await this.animateTo({ rotation: original - 0.1 }, duration * 0.25)
    await this.animateTo({ rotation: original }, duration * 0.25)

    this.animating = false
  }

  async coinDropAnimation(): Promise<void> {
    if (this.animating) return
    this.animating = true

    this.setEmotion('excited')
    await this.jump(30, 500)
    this.setEmotion('happy')
    await this.jump(15, 300)
    this.setEmotion('idle')

    this.animating = false
  }

  idleBounce() {
    if (this.animating) return
    const loop = () => {
      if (this.animating) return
      this.jump(8, 1200).then(() => {
        setTimeout(loop, 2000 + Math.random() * 2000)
      })
    }
    loop()
  }

  private animateTo(target: Partial<{ x: number; y: number; rotation: number }>, duration: number): Promise<void> {
    return new Promise(resolve => {
      const start = {
        x: this.container.x,
        y: this.container.y,
        rotation: this.container.rotation,
      }
      const startTime = performance.now()

      const tick = () => {
        const elapsed = performance.now() - startTime
        const t = Math.min(elapsed / duration, 1)
        // easeOutBounce
        const ease = t < 0.5
          ? (4 * t * t * t)
          : 1 - Math.pow(-2 * t + 2, 3) / 2

        if (target.x !== undefined) this.container.x = start.x + (target.x - start.x) * ease
        if (target.y !== undefined) this.container.y = start.y + (target.y - start.y) * ease
        if (target.rotation !== undefined) this.container.rotation = start.rotation + (target.rotation - start.rotation) * ease

        if (t >= 1) {
          resolve()
        } else {
          requestAnimationFrame(tick)
        }
      }
      requestAnimationFrame(tick)
    })
  }

  destroy() {
    this.container.destroy({ children: true })
  }
}

/** 创建背景装饰——草地和云朵 */
export function createBackground(width: number, height: number): PIXI.Container {
  const bg = new PIXI.Container()

  // 天空渐变
  const sky = new PIXI.Graphics()
  sky.beginFill(0xE8F4FD, 0.6)
  sky.drawRect(0, 0, width, height * 0.7)
  sky.endFill()
  bg.addChild(sky)

  // 草地
  const grass = new PIXI.Graphics()
  grass.beginFill(0xA8E6A8, 0.4)
  grass.drawRect(0, height * 0.7, width, height * 0.3)
  grass.endFill()
  // 草叶片
  for (let i = 0; i < 20; i++) {
    const gx = Math.random() * width
    const gy = height * 0.7 + Math.random() * height * 0.3
    grass.beginFill(0x6BCB77, 0.5)
    grass.drawEllipse(gx, gy, 4, 8)
    grass.endFill()
  }
  bg.addChild(grass)

  // 云朵
  for (let i = 0; i < 3; i++) {
    const cloud = new PIXI.Graphics()
    cloud.beginFill(0xFFFFFF, 0.7)
    const cx = 50 + Math.random() * (width - 100)
    const cy = 30 + Math.random() * 100
    cloud.drawEllipse(cx, cy, 30, 15)
    cloud.drawEllipse(cx + 20, cy - 5, 25, 12)
    cloud.drawEllipse(cx - 20, cy + 2, 20, 10)
    cloud.endFill()
    bg.addChild(cloud)
  }

  return bg
}
