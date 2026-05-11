import * as THREE from 'three'
import type { GLTF } from 'three-stdlib'

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export type AnimacionEstado =
  | 'idle'
  | 'hablar'
  | 'celebrar'
  | 'corregir'
  | 'animar'
  | 'pensar'

export type BoneMap = {
  jaw: THREE.Bone | null
  head: THREE.Bone | null
  leftArm: THREE.Bone | null
  rightArm: THREE.Bone | null
  spine: THREE.Bone | null
}

export type MorphMap = {
  mouthOpen: number
  mouthSmile: number
  browDown: number
  eyeClose: number
}

export type AvatarControllerOptions = {
  model: GLTF
  /** Raíz de la escena (THREE.Scene o THREE.Group clonado) */
  scene?: THREE.Object3D
}

// ─── Implementación ──────────────────────────────────────────────────────────

const JAW_NAMES   = ['jaw', 'Jaw', 'mixamorigJaw', 'Head_Jaw', 'jawbone']
const HEAD_NAMES  = ['head', 'Head', 'mixamorigHead', 'head_jnt']
const LARM_NAMES  = ['leftArm', 'LeftArm', 'mixamorigLeftArm', 'left_arm']
const RARM_NAMES  = ['rightArm', 'RightArm', 'mixamorigRightArm', 'right_arm']
const SPINE_NAMES = ['spine', 'Spine', 'mixamorigSpine', 'spine_01']

const MOUTH_OPEN_VARIANTS  = ['mouthOpen', 'jawOpen', 'mouth_open', 'jaw_open']
const MOUTH_SMILE_VARIANTS = ['mouthSmile', 'smile', 'mouth_smile', 'viseme_PP']
const BROW_DOWN_VARIANTS   = ['browDown', 'brow_down', 'browLowerer', 'browDown_L']
const EYE_CLOSE_VARIANTS   = ['eyeClose', 'eyeBlink', 'eye_close', 'eyesClosed']

export class AvatarController {
  private mixer: THREE.AnimationMixer | null = null
  private clips: Map<AnimacionEstado, THREE.AnimationAction> = new Map()
  private bones: BoneMap
  private morphMesh: THREE.SkinnedMesh | null = null
  private morphMap: Partial<MorphMap> = {}
  private estado: AnimacionEstado = 'idle'
  private clock: THREE.Clock
  private mouthOpenValue = 0
  private isSpeaking = false
  private disposables: THREE.Object3D[] = []

  // Temporizador de parpadeo
  private nextBlinkAt = 0
  private isBlinking = false
  private blinkProgress = 0

  // Acción activa para crossfade
  private currentAction: THREE.AnimationAction | null = null

  constructor(options: AvatarControllerOptions) {
    const { model } = options
    this.clock = new THREE.Clock()

    this.mixer = new THREE.AnimationMixer(model.scene)
    this.bones = this.findBones(model.scene)
    this.morphMesh = this.findMorphMesh(model.scene)
    this.morphMap = this.mapMorphTargets()

    this.registerClips(model)
    this.scheduleNextBlink()
  }

  // ─── Pública ───────────────────────────────────────────────────────────────

  play(estado: AnimacionEstado): void {
    this.estado = estado

    const nextAction = this.clips.get(estado) ?? this.clips.get('idle')
    if (!nextAction) return

    if (nextAction === this.currentAction) return

    nextAction.enabled = true
    nextAction.setLoop(THREE.LoopRepeat, Infinity)
    nextAction.reset()

    if (this.currentAction && this.currentAction !== nextAction) {
      nextAction.crossFadeFrom(this.currentAction, 0.3, true).play()
    } else {
      nextAction.fadeIn(0.3).play()
    }

    this.currentAction = nextAction

    if (estado === 'hablar') {
      this.startSpeaking()
    } else if (this.isSpeaking) {
      this.stopSpeaking()
    }
  }

  startSpeaking(): void {
    this.isSpeaking = true
  }

  stopSpeaking(): void {
    this.isSpeaking = false
    // La boca se cierra por lerp en update()
  }

  triggerMouthPulse(): void {
    // Acepta el pulso siempre; la boca se cerrará sola cuando isSpeaking sea false
    this.mouthOpenValue = 0.5 + Math.random() * 0.4 // 0.5–0.9
  }

  /** Llamado en cada useFrame de React Three Fiber */
  update(delta: number): void {
    const dt = Math.min(delta, 0.05)
    const t = this.clock.getElapsedTime()

    this.mixer?.update(dt)
    this.updateMouth(dt, t)
    this.updateHead(dt, t)
    this.updateSpine(dt, t)
    this.updateArms(dt, t)
    this.updateBlink(dt, t)
  }

  dispose(): void {
    this.mixer?.stopAllAction()
    this.clips.clear()
    this.mixer = null
    this.currentAction = null

    this.disposables.forEach((obj) => {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose()
          const mats = Array.isArray(child.material) ? child.material : [child.material]
          mats.forEach((m) => m?.dispose())
        }
      })
    })
    this.disposables = []
  }

  getEstado(): AnimacionEstado {
    return this.estado
  }

  // ─── Privadas ──────────────────────────────────────────────────────────────

  private findBones(scene: THREE.Object3D): BoneMap {
    const result: BoneMap = {
      jaw: null,
      head: null,
      leftArm: null,
      rightArm: null,
      spine: null,
    }

    scene.traverse((obj) => {
      if (!(obj instanceof THREE.Bone)) return
      const name = obj.name

      if (!result.jaw && JAW_NAMES.some((n) => name === n || name.toLowerCase().includes(n.toLowerCase()))) {
        result.jaw = obj
      }
      if (!result.head && HEAD_NAMES.some((n) => name === n || name.toLowerCase().includes(n.toLowerCase()))) {
        result.head = obj
      }
      if (!result.leftArm && LARM_NAMES.some((n) => name === n || name.toLowerCase().includes(n.toLowerCase()))) {
        result.leftArm = obj
      }
      if (!result.rightArm && RARM_NAMES.some((n) => name === n || name.toLowerCase().includes(n.toLowerCase()))) {
        result.rightArm = obj
      }
      if (!result.spine && SPINE_NAMES.some((n) => name === n || name.toLowerCase().includes(n.toLowerCase()))) {
        result.spine = obj
      }
    })

    return result
  }

  private findMorphMesh(scene: THREE.Object3D): THREE.SkinnedMesh | null {
    let found: THREE.SkinnedMesh | null = null
    scene.traverse((obj) => {
      if (found) return
      if (obj instanceof THREE.SkinnedMesh && obj.morphTargetDictionary) {
        found = obj
      }
    })
    return found
  }

  private mapMorphTargets(): Partial<MorphMap> {
    const dict = this.morphMesh?.morphTargetDictionary
    if (!dict) return {}

    const resolve = (names: string[]) => {
      for (const n of names) {
        if (n in dict) return dict[n]
      }
      return undefined
    }

    const result: Partial<MorphMap> = {}
    const mo = resolve(MOUTH_OPEN_VARIANTS)
    const ms = resolve(MOUTH_SMILE_VARIANTS)
    const bd = resolve(BROW_DOWN_VARIANTS)
    const ec = resolve(EYE_CLOSE_VARIANTS)

    if (mo !== undefined) result.mouthOpen = mo
    if (ms !== undefined) result.mouthSmile = ms
    if (bd !== undefined) result.browDown = bd
    if (ec !== undefined) result.eyeClose = ec

    return result
  }

  private applyMorph(key: keyof MorphMap, value: number): void {
    const mesh = this.morphMesh
    if (!mesh?.morphTargetInfluences) return
    const index = this.morphMap[key]
    if (index === undefined) return
    if (index >= mesh.morphTargetInfluences.length) return
    mesh.morphTargetInfluences[index] = value
  }

  private registerClips(model: GLTF): void {
    const { animations } = model

    const byPattern = (patterns: RegExp[]) =>
      animations.find((clip) => patterns.some((p) => p.test(clip.name)))

    const idleClip     = byPattern([/idle/i, /breath/i, /stand/i])
    const hablarClip   = byPattern([/talk/i, /speak/i, /gesture/i, /conversation/i])
    const celebrarClip = byPattern([/celebrat/i, /cheer/i, /victory/i, /happy/i])
    const corregirClip = byPattern([/correct/i, /corregir/i, /disappoint/i, /sad/i, /shake/i])
    const animarClip   = byPattern([/encour/i, /animar/i, /wave/i, /nod/i])
    const pensarClip   = byPattern([/think/i, /ponder/i, /scratch/i])

    const fallback = idleClip

    const register = (estado: AnimacionEstado, clip: typeof idleClip) => {
      if (!this.mixer) return
      const c = clip ?? fallback
      if (!c) return
      const action = this.mixer.clipAction(c)
      this.clips.set(estado, action)
    }

    register('idle',     idleClip)
    register('hablar',   hablarClip)
    register('celebrar', celebrarClip)
    register('corregir', corregirClip)
    register('animar',   animarClip)
    register('pensar',   pensarClip)

    // Inicia idle automáticamente
    const idleAction = this.clips.get('idle')
    if (idleAction) {
      idleAction.setLoop(THREE.LoopRepeat, Infinity).play()
      this.currentAction = idleAction
    }
  }

  private updateMouth(dt: number, _t: number): void {
    // Cierra la boca lerp cuando no está hablando
    if (!this.isSpeaking) {
      this.mouthOpenValue = THREE.MathUtils.lerp(this.mouthOpenValue, 0, dt * 7)
    }

    const clamped = Math.max(0, Math.min(1, this.mouthOpenValue))
    this.applyMorph('mouthOpen', clamped)

    // Jaw bone: amplitud física sincronizada con morph
    if (this.bones.jaw) {
      this.bones.jaw.rotation.x = THREE.MathUtils.lerp(
        this.bones.jaw.rotation.x,
        clamped * 0.28,
        dt * 14,
      )
    }
  }

  private updateHead(dt: number, t: number): void {
    const head = this.bones.head
    if (!head) return

    switch (this.estado) {
      case 'idle': {
        head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, Math.sin(t * 1.2) * 0.03, dt * 3)
        head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, Math.sin(t * 0.8) * 0.02, dt * 3)
        head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, 0, dt * 3)
        break
      }
      case 'hablar': {
        head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, Math.sin(t * 2.5) * 0.04, dt * 5)
        head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, Math.sin(t * 1.8) * 0.03, dt * 5)
        head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, 0, dt * 5)
        break
      }
      case 'celebrar': {
        head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, -0.1 + Math.sin(t * 5) * 0.05, dt * 6)
        head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, 0, dt * 6)
        this.applyMorph('mouthSmile', THREE.MathUtils.lerp(
          this.morphMesh?.morphTargetInfluences?.[this.morphMap.mouthSmile ?? -1] ?? 0,
          0.8,
          dt * 4,
        ))
        break
      }
      case 'corregir': {
        head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, 0.2, dt * 4)
        head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, Math.sin(t * 1.5) * 0.06, dt * 4)
        head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, 0, dt * 4)
        this.applyMorph('browDown', 0.4)
        this.applyMorph('mouthOpen', 0.1)
        break
      }
      case 'animar': {
        head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, Math.sin(t * 3) * 0.05, dt * 5)
        head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, Math.sin(t * 2) * 0.04, dt * 5)
        head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, 0, dt * 5)
        this.applyMorph('mouthSmile', 0.5)
        break
      }
      case 'pensar': {
        head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, 0.05, dt * 3)
        head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, 0, dt * 3)
        head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, 0.15, dt * 3)
        this.applyMorph('browDown', 0.2)
        break
      }
    }
  }

  private updateSpine(dt: number, t: number): void {
    const spine = this.bones.spine
    if (!spine) return

    // Ciclo de respiración fisiológico: inhalar 40% → pausa 20% → exhalar 40%
    // Período de 4 segundos
    const phase = (t % 4) / 4
    const breathValue = phase < 0.4
      ? phase / 0.4                        // inhalar
      : phase < 0.6
        ? 1                                  // pausa en el top
        : 1 - (phase - 0.6) / 0.4           // exhalar

    const amplitude = this.estado === 'animar' ? 0.028 : 0.018
    spine.rotation.x = THREE.MathUtils.lerp(
      spine.rotation.x,
      breathValue * amplitude,
      dt * 3,
    )
  }

  private updateArms(dt: number, t: number): void {
    const { leftArm, rightArm } = this.bones

    switch (this.estado) {
      case 'celebrar': {
        if (leftArm) {
          leftArm.rotation.z = THREE.MathUtils.lerp(leftArm.rotation.z, -1.8 + Math.sin(t * 5) * 0.1, dt * 6)
        }
        if (rightArm) {
          rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, 1.8 - Math.sin(t * 5) * 0.1, dt * 6)
        }
        break
      }
      case 'pensar': {
        if (rightArm) {
          rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, 0.5, dt * 3)
        }
        break
      }
      case 'animar': {
        if (leftArm) {
          leftArm.rotation.z = THREE.MathUtils.lerp(leftArm.rotation.z, Math.sin(t * 2) * 0.3, dt * 5)
        }
        if (rightArm) {
          rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, Math.sin(t * 2 + 1) * 0.3, dt * 5)
        }
        break
      }
      default: {
        // Brazos neutros con pequeña oscilación
        if (leftArm) {
          leftArm.rotation.z = THREE.MathUtils.lerp(leftArm.rotation.z, Math.sin(t * 0.6) * 0.04, dt * 2)
        }
        if (rightArm) {
          rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, -Math.sin(t * 0.6) * 0.04, dt * 2)
        }
      }
    }
  }

  private scheduleNextBlink(): void {
    // Parpadeo cada 3-5 segundos
    this.nextBlinkAt = this.clock.getElapsedTime() + 3 + Math.random() * 2
  }

  private updateBlink(dt: number, t: number): void {
    if (!this.isBlinking && t >= this.nextBlinkAt) {
      this.isBlinking = true
      this.blinkProgress = 0
    }

    if (!this.isBlinking) return

    this.blinkProgress += dt * 10 // ~0.1s en cerrar y abrir
    const blink = Math.sin(this.blinkProgress * Math.PI)
    this.applyMorph('eyeClose', Math.max(0, blink))

    if (this.blinkProgress >= 1) {
      this.isBlinking = false
      this.applyMorph('eyeClose', 0)
      this.scheduleNextBlink()
    }
  }
}
