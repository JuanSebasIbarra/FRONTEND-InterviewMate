import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { GLTF } from 'three-stdlib'
import { AvatarController, type AnimacionEstado } from './AvatarController'

type UseAvatarControllerResult = {
  play: (estado: AnimacionEstado) => void
  startSpeaking: () => void
  stopSpeaking: () => void
  triggerMouthPulse: () => void
  estado: AnimacionEstado
  isReady: boolean
}

export function useAvatarController(gltf: GLTF | null): UseAvatarControllerResult {
  const controllerRef = useRef<AvatarController | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [estado, setEstado] = useState<AnimacionEstado>('idle')

  useEffect(() => {
    if (!gltf) return

    const controller = new AvatarController({ model: gltf, scene: gltf.scene })
    controllerRef.current = controller
    setIsReady(true)

    return () => {
      controller.dispose()
      controllerRef.current = null
      setIsReady(false)
    }
  }, [gltf])

  // Ejecutado en cada frame dentro del Canvas de R3F
  useFrame((_, delta) => {
    controllerRef.current?.update(delta)
  })

  const play = (nextEstado: AnimacionEstado) => {
    controllerRef.current?.play(nextEstado)
    setEstado(nextEstado)
  }

  const startSpeaking = () => {
    controllerRef.current?.startSpeaking()
  }

  const stopSpeaking = () => {
    controllerRef.current?.stopSpeaking()
  }

  const triggerMouthPulse = () => {
    controllerRef.current?.triggerMouthPulse()
  }

  return { play, startSpeaking, stopSpeaking, triggerMouthPulse, estado, isReady }
}
