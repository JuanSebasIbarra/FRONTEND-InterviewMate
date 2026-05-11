import { Suspense, useEffect, useMemo } from 'react'
import { Environment, Html, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import { useAvatarController } from './useAvatarController'
import type { AnimacionEstado } from './AvatarController'

const MODEL_URL = '/models/avatar_1776746364480.glb'

// Precarga el GLB para que esté en caché cuando el Canvas monte
useGLTF.preload(MODEL_URL)

// ─── Mesh del avatar (dentro del Canvas) ─────────────────────────────────────

type AvatarMeshProps = {
  animacion: AnimacionEstado
  isSpeaking: boolean
  onReady?: () => void
  /** Recibe la función triggerMouthPulse para llamarla desde fuera del Canvas */
  onControllerReady?: (triggerMouthPulse: () => void) => void
}

function AvatarMesh({ animacion, isSpeaking, onReady, onControllerReady }: AvatarMeshProps) {
  const gltf = useGLTF(MODEL_URL)

  // Memoizar el clon: se crea UNA vez y solo se recrea si cambia el GLB fuente
  const clonedScene = useMemo(() => SkeletonUtils.clone(gltf.scene) as THREE.Group, [gltf.scene])
  const clonedGltf = useMemo(() => ({ ...gltf, scene: clonedScene }), [gltf, clonedScene])

  const { play, startSpeaking, stopSpeaking, triggerMouthPulse, isReady } = useAvatarController(clonedGltf)

  // Reacciona a cambios de animación desde la IA
  useEffect(() => {
    if (!isReady) return
    play(animacion)
  }, [animacion, isReady, play])

  // Sincroniza estado de voz con SpeechSynthesis
  useEffect(() => {
    if (!isReady) return
    if (isSpeaking) {
      startSpeaking()
    } else {
      stopSpeaking()
    }
  }, [isSpeaking, isReady, startSpeaking, stopSpeaking])

  // Notifica al padre cuando el controlador esté listo + entrega triggerMouthPulse
  useEffect(() => {
    if (!isReady) return
    onReady?.()
    onControllerReady?.(triggerMouthPulse)
  }, [isReady, onReady, onControllerReady, triggerMouthPulse])

  return (
    <primitive
      object={clonedScene}
      scale={1}
      position={[0, -1.1, 0]}
    />
  )
}

// ─── Escena (dentro del Canvas, sin Canvas propio) ───────────────────────────

export type AvatarSceneProps = {
  animacion?: AnimacionEstado
  isSpeaking?: boolean
  onReady?: () => void
  onError?: (error: Error) => void
  onControllerReady?: (triggerMouthPulse: () => void) => void
}

export function AvatarScene({
  animacion = 'idle',
  isSpeaking = false,
  onReady,
  onError: _onError,
  onControllerReady,
}: AvatarSceneProps) {
  return (
    <Suspense
      fallback={(
        <Html center>
          <div className="rounded-full border border-white/25 bg-[#0a101fb8] px-3 py-2 text-[0.82rem] text-[#d9dff2]">
            Cargando avatar...
          </div>
        </Html>
      )}
    >
      <Environment preset="studio" />
      <AvatarMesh
        animacion={animacion}
        isSpeaking={isSpeaking}
        onReady={onReady}
        onControllerReady={onControllerReady}
      />
    </Suspense>
  )
}

export default AvatarScene
