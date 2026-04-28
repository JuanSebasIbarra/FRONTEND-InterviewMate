import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { Group } from 'three'
import { SkeletonUtils } from 'three-stdlib'

export type AvatarState = 'idle' | 'talking' | 'thinking' | 'listening'

type AvatarGLBProps = {
  url: string
  scale?: number
  position?: [number, number, number]
  avatarState?: AvatarState
}

/**
 * Carga y renderiza un modelo GLB del avatar del entrevistador.
 * Aplica animaciones por estado con cross-fade y micro-gestos faciales.
 */
export function AvatarGLB({
  url,
  scale = 1,
  position = [0, 0, 0],
  avatarState = 'idle',
}: AvatarGLBProps) {
  const groupRef = useRef<Group>(null)
  const activeActionRef = useRef<THREE.AnimationAction | null>(null)
  const headBoneRef = useRef<THREE.Bone | null>(null)
  const jawBone = useRef<THREE.Bone | null>(null)
  const facialMorphTargets = useRef<Array<{ mesh: THREE.Mesh; index: number }>>([])

  const gltfData = useGLTF(url)
  const scene = gltfData.scene
  const animations = gltfData.animations

  const clonedScene = useMemo(() => SkeletonUtils.clone(scene) as THREE.Group, [scene])
  const { actions } = useAnimations(animations, groupRef)

  const clipByState = useMemo(() => {
    const byName = (patterns: RegExp[]) =>
      animations.find((clip) => patterns.some((pattern) => pattern.test(clip.name)))?.name

    const idle = byName([/idle/i, /breath/i, /stand/i])
    const talking = byName([/talk/i, /speak/i, /gesture/i, /conversation/i])
    const thinking = byName([/think/i, /ponder/i, /scratch/i, /look/i])
    const listening = byName([/listen/i, /attentive/i, /attention/i])

    return {
      idle,
      talking: talking ?? idle,
      thinking: thinking ?? idle,
      listening: listening ?? idle,
    }
  }, [animations])

  // Buscar huesos y morph targets relevantes para gestos de habla/cabeza.
  useEffect(() => {
    headBoneRef.current = null
    jawBone.current = null
    facialMorphTargets.current = []

    clonedScene.traverse((obj) => {
      if (
        obj instanceof THREE.Bone &&
        (obj.name.toLowerCase().includes('jaw') ||
          obj.name.toLowerCase().includes('lowerjaw'))
      ) {
        jawBone.current = obj
      }

      if (
        obj instanceof THREE.Bone &&
        (obj.name.toLowerCase().includes('head') ||
          obj.name.toLowerCase().includes('neck'))
      ) {
        headBoneRef.current = obj
      }

      if (!(obj instanceof THREE.Mesh)) return
      obj.castShadow = true
      obj.receiveShadow = true

      const dictionary = obj.morphTargetDictionary
      if (!dictionary) return

      Object.entries(dictionary).forEach(([name, index]) => {
        if (/mouth|lip|viseme|jaw|open/i.test(name)) {
          facialMorphTargets.current.push({ mesh: obj, index })
        }
      })
    })
  }, [clonedScene])

  // Transiciones suaves entre animaciones por estado usando crossFade.
  useEffect(() => {
    const actionName = clipByState[avatarState] ?? clipByState.idle
    if (!actionName) return

    const nextAction = actions[actionName]
    if (!nextAction) return

    nextAction.enabled = true
    nextAction.setLoop(THREE.LoopRepeat, Infinity)
    nextAction.reset()

    const currentAction = activeActionRef.current
    if (currentAction && currentAction !== nextAction) {
      nextAction.crossFadeFrom(currentAction, 0.3, true).play()
    } else {
      nextAction.fadeIn(0.3).play()
    }

    activeActionRef.current = nextAction
  }, [actions, avatarState, clipByState])

  // Fallback procedural para estados cuando no hay clips específicos.
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = performance.now() * 0.001

    const root = groupRef.current
    if (root) {
      const breath = Math.sin(t * 1.6) * 0.01
      root.position.y = position[1] + breath
    }

    let targetMouth = 0
    if (avatarState === 'talking') {
      targetMouth = 0.35 + Math.sin(t * 10) * 0.15
    }

    if (avatarState === 'thinking' && headBoneRef.current) {
      headBoneRef.current.rotation.y = THREE.MathUtils.lerp(
        headBoneRef.current.rotation.y,
        0.18 + Math.sin(t * 1.5) * 0.06,
        dt * 5,
      )
      headBoneRef.current.rotation.z = THREE.MathUtils.lerp(
        headBoneRef.current.rotation.z,
        0.08,
        dt * 4,
      )
    }

    if (avatarState === 'listening' && headBoneRef.current) {
      headBoneRef.current.rotation.x = THREE.MathUtils.lerp(
        headBoneRef.current.rotation.x,
        0.08,
        dt * 5,
      )
      headBoneRef.current.rotation.y = THREE.MathUtils.lerp(
        headBoneRef.current.rotation.y,
        0,
        dt * 5,
      )
      headBoneRef.current.rotation.z = THREE.MathUtils.lerp(
        headBoneRef.current.rotation.z,
        0,
        dt * 5,
      )
    }

    if (avatarState === 'idle' && headBoneRef.current) {
      headBoneRef.current.rotation.x = THREE.MathUtils.lerp(
        headBoneRef.current.rotation.x,
        Math.sin(t * 1.2) * 0.03,
        dt * 3,
      )
      headBoneRef.current.rotation.y = THREE.MathUtils.lerp(
        headBoneRef.current.rotation.y,
        Math.sin(t * 0.8) * 0.02,
        dt * 3,
      )
      headBoneRef.current.rotation.z = THREE.MathUtils.lerp(
        headBoneRef.current.rotation.z,
        0,
        dt * 3,
      )
    }

    if (jawBone.current) {
      jawBone.current.rotation.x = THREE.MathUtils.lerp(
        jawBone.current.rotation.x,
        targetMouth * 0.25,
        dt * 10,
      )
    }

    facialMorphTargets.current.forEach(({ mesh, index }) => {
      if (!mesh.morphTargetInfluences) return
      const current = mesh.morphTargetInfluences[index] ?? 0
      mesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(current, targetMouth, dt * 9)
    })

    if (avatarState !== 'talking' && headBoneRef.current) {
      headBoneRef.current.rotation.x = THREE.MathUtils.lerp(headBoneRef.current.rotation.x, 0, dt * 4)
      headBoneRef.current.rotation.y = THREE.MathUtils.lerp(headBoneRef.current.rotation.y, 0, dt * 4)
      headBoneRef.current.rotation.z = THREE.MathUtils.lerp(headBoneRef.current.rotation.z, 0, dt * 4)
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  )
}

AvatarGLB.preload = (url: string) => useGLTF.preload(url)

export default AvatarGLB
