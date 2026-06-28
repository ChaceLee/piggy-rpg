import * as PIXI from 'pixi.js'

export type NPCType = 'bear' | 'rabbit' | 'fox' | 'turtle'

export class NPCSprite {
  public container: PIXI.Container
  private body: PIXI.Graphics
  private animating = false

  constructor(type: NPCType, scale = 1) {
    this.container = new PIXI.Container()
    this.body = new PIXI.Graphics()

    switch (type) {
      case 'bear': this.drawBear(scale); break
      case 'rabbit': this.drawRabbit(scale); break
      case 'fox': this.drawFox(scale); break
      case 'turtle': this.drawTurtle(scale); break
    }

    this.container.eventMode = 'static'
    this.container.cursor = 'pointer'
  }

  private drawBear(s: number) {
    // 熊老板 - 棕色大熊
    const body = this.body

    // 身体
    body.beginFill(0x8B6914, 1)
    body.drawEllipse(0, 20 * s, 35 * s, 30 * s)
    body.endFill()

    // 肚子浅色
    body.beginFill(0xD2B48C, 0.5)
    body.drawEllipse(0, 25 * s, 20 * s, 18 * s)
    body.endFill()

    // 头
    body.beginFill(0x8B6914, 1)
    body.drawCircle(0, -15 * s, 25 * s)
    body.endFill()

    // 耳朵
    body.beginFill(0x5C3A1E, 1)
    body.drawCircle(-18 * s, -35 * s, 8 * s)
    body.drawCircle(18 * s, -35 * s, 8 * s)
    body.endFill()

    // 眼睛
    body.beginFill(0x1a1a1a, 1)
    body.drawCircle(-8 * s, -18 * s, 3 * s)
    body.drawCircle(8 * s, -18 * s, 3 * s)
    body.endFill()

    // 鼻子
    body.beginFill(0x5C3A1E, 1)
    body.drawEllipse(0, -10 * s, 5 * s, 3 * s)
    body.endFill()

    // 围裙
    body.lineStyle(2, 0xFFFFFF, 0.8)
    body.beginFill(0xFFFFFF, 0.4)
    body.drawRect(-18 * s, 10 * s, 36 * s, 28 * s)
    body.endFill()

    // 围裙口袋
    body.lineStyle(2, 0xFFFFFF, 0.6)
    body.drawRect(-10 * s, 18 * s, 20 * s, 12 * s)
    body.endFill()
  }

  private drawRabbit(s: number) {
    // 兔博士 - 戴眼镜的白兔
    const body = this.body

    // 身体
    body.beginFill(0xFFFFFF, 1)
    body.drawEllipse(0, 25 * s, 28 * s, 25 * s)
    body.endFill()

    // 头
    body.beginFill(0xFFFFFF, 1)
    body.drawCircle(0, -10 * s, 22 * s)
    body.endFill()

    // 长耳朵
    body.beginFill(0xFFFFFF, 1)
    body.drawEllipse(-12 * s, -38 * s, 8 * s, 16 * s)
    body.drawEllipse(12 * s, -38 * s, 8 * s, 16 * s)
    body.endFill()
    // 耳朵内粉色
    body.beginFill(0xFFB5C2, 0.5)
    body.drawEllipse(-12 * s, -38 * s, 4 * s, 10 * s)
    body.drawEllipse(12 * s, -38 * s, 4 * s, 10 * s)
    body.endFill()

    // 眼睛
    body.beginFill(0x1a1a1a, 1)
    body.drawCircle(-8 * s, -12 * s, 3 * s)
    body.drawCircle(8 * s, -12 * s, 3 * s)
    body.endFill()

    // 眼镜
    body.lineStyle(2, 0x4D96FF, 0.7)
    body.drawCircle(-8 * s, -12 * s, 6 * s)
    body.drawCircle(8 * s, -12 * s, 6 * s)
    body.moveTo(-2 * s, -12 * s)
    body.lineTo(2 * s, -12 * s)

    // 三瓣嘴
    body.lineStyle(1.5, 0x333333, 0.6)
    body.arc(0, -4 * s, 4 * s, 0.3, Math.PI - 0.3)

    // 白大褂
    body.lineStyle(2, 0x4D96FF, 0.8)
    body.beginFill(0xF0F8FF, 0.5)
    body.drawRect(-18 * s, 12 * s, 36 * s, 30 * s)
    body.endFill()
  }

  private drawFox(s: number) {
    // 狐小骗 - 橙色狐狸，狡黠表情
    const body = this.body

    // 身体
    body.beginFill(0xFF8C00, 1)
    body.drawEllipse(0, 22 * s, 30 * s, 28 * s)
    body.endFill()

    // 白色肚子
    body.beginFill(0xFFFFFF, 0.5)
    body.drawEllipse(0, 28 * s, 18 * s, 16 * s)
    body.endFill()

    // 头
    body.beginFill(0xFF8C00, 1)
    body.drawCircle(0, -12 * s, 20 * s)
    body.endFill()

    // 尖耳朵
    body.beginFill(0x333333, 1)
    body.drawPolygon([-16 * s, -28 * s, -8 * s, -40 * s, 0, -28 * s])
    body.drawPolygon([0, -28 * s, 8 * s, -40 * s, 16 * s, -28 * s])
    body.endFill()
    // 耳朵内
    body.beginFill(0xFFB5C2, 0.5)
    body.drawPolygon([-13 * s, -29 * s, -8 * s, -37 * s, -3 * s, -29 * s])
    body.drawPolygon([3 * s, -29 * s, 8 * s, -37 * s, 13 * s, -29 * s])
    body.endFill()

    // 眯眼（狡猾表情）
    body.lineStyle(3, 0x333333, 1)
    body.arc(-9 * s, -14 * s, 6 * s, 0.1, Math.PI - 0.1) // 左眯眼
    body.arc(9 * s, -14 * s, 6 * s, 0.1, Math.PI - 0.1)  // 右眯眼

    // 尖鼻子
    body.beginFill(0x333333, 1)
    body.drawEllipse(0, -7 * s, 4 * s, 3 * s)
    body.endFill()

    // 奸笑嘴巴
    body.lineStyle(2, 0x333333, 0.8)
    body.arc(0, -4 * s, 6 * s, 0, Math.PI)

    // 尾巴（用曲线）
    body.lineStyle(6 * s, 0xFF8C00, 1)
    body.moveTo(30 * s, 20 * s)
    body.quadraticCurveTo(45 * s, -10 * s, 35 * s, -25 * s)
    body.lineStyle(3 * s, 0xFFFFFF, 0.8)
    body.moveTo(33 * s, -20 * s)
    body.quadraticCurveTo(30 * s, -25 * s, 35 * s, -25 * s)
  }

  private drawTurtle(s: number) {
    // 龟爷爷 - 绿色老龟
    const body = this.body

    // 龟壳
    body.beginFill(0x2E8B57, 1)
    body.drawEllipse(0, 20 * s, 35 * s, 28 * s)
    body.endFill()

    // 壳纹
    body.lineStyle(2, 0x1A5C32, 0.5)
    body.drawEllipse(0, 20 * s, 20 * s, 16 * s)

    // 头
    body.beginFill(0x90EE90, 1)
    body.drawEllipse(0, -15 * s, 18 * s, 15 * s)
    body.endFill()

    // 眼睛
    body.beginFill(0x1a1a1a, 1)
    body.drawCircle(-6 * s, -18 * s, 2.5 * s)
    body.drawCircle(6 * s, -18 * s, 2.5 * s)
    body.endFill()

    // 眼镜
    body.lineStyle(1.5, 0x8B4513, 0.7)
    body.drawCircle(-6 * s, -18 * s, 5 * s)
    body.drawCircle(6 * s, -18 * s, 5 * s)
    body.moveTo(-1 * s, -18 * s)
    body.lineTo(1 * s, -18 * s)

    // 胡子
    body.lineStyle(1, 0xFFFFFF, 0.6)
    body.moveTo(-3 * s, -10 * s)
    body.lineTo(-10 * s, -8 * s)
    body.moveTo(3 * s, -10 * s)
    body.lineTo(10 * s, -8 * s)

    // 微笑
    body.lineStyle(1.5, 0x333333, 0.6)
    body.arc(0, -10 * s, 5 * s, 0.2, Math.PI - 0.2)
  }

  async wave(duration = 800): Promise<void> {
    if (this.animating) return
    this.animating = true

    const originalX = this.container.x
    await this.animateTo({ x: originalX + 10 }, duration * 0.15)
    await this.animateTo({ x: originalX - 10 }, duration * 0.15)
    await this.animateTo({ x: originalX + 5 }, duration * 0.15)
    await this.animateTo({ x: originalX }, duration * 0.55)

    this.animating = false
  }

  async nod(duration = 500): Promise<void> {
    if (this.animating) return
    this.animating = true

    const originalY = this.container.y
    await this.animateTo({ y: originalY + 8 }, duration * 0.3)
    await this.animateTo({ y: originalY }, duration * 0.4)
    await this.animateTo({ y: originalY + 5 }, duration * 0.15)
    await this.animateTo({ y: originalY }, duration * 0.15)

    this.animating = false
  }

  private async animateTo(target: Partial<{ x: number; y: number }>, duration: number): Promise<void> {
    return new Promise(resolve => {
      const start = { x: this.container.x, y: this.container.y }
      const startTime = performance.now()
      const tick = () => {
        const t = Math.min((performance.now() - startTime) / duration, 1)
        const ease = 1 - Math.pow(1 - t, 3)
        if (target.x !== undefined) this.container.x = start.x + (target.x - start.x) * ease
        if (target.y !== undefined) this.container.y = start.y + (target.y - start.y) * ease
        if (t >= 1) resolve()
        else requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
  }

  destroy() {
    this.container.destroy({ children: true })
  }
}
