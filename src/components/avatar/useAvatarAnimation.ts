import { useCallback, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

// Velocidad de apertura y cierre de la boca (radianes por frame)
const MOUTH_OPEN_SPEED = 0.08
const MOUTH_CLOSE_SPEED = 0.06

// Límite máximo de apertura de mandíbula en radianes
const MAX_JAW_ANGLE = 0.28

export type AvatarAnimationState = {
  /** Ángulo actual de apertura de mandíbula (0 = cerrado, MAX_JAW_ANGLE = abierto) */
  jawAngle: number
}

/**
 * Hook que gestiona el estado de animación del avatar del entrevistador.
 * Devuelve funciones para iniciar/detener el habla y un ref que
 * InterviewerAvatar lee en cada frame para animar la mandíbula.
 */
export function useAvatarAnimation() {
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Se usa ref para que useFrame lea el valor más reciente sin re-renders
  const isSpeakingRef = useRef(false)
  const jawAngleRef = useRef(0)

  // Dirección actual de movimiento de la mandíbula: true = abriéndose
  const jawOpeningRef = useRef(true)

  const startSpeaking = useCallback(() => {
    isSpeakingRef.current = true
    setIsSpeaking(true)
  }, [])

  const stopSpeaking = useCallback(() => {
    isSpeakingRef.current = false
    setIsSpeaking(false)
  }, [])

  /**
   * Callback para pasar a <InterviewerAvatar> que se ejecuta en cada frame
   * con useFrame. Anima la mandíbula en loop mientras habla,
   * y la cierra suavemente cuando para.
   */
  const animateJaw = useCallback((setJawAngle: (angle: number) => void) => {
    if (isSpeakingRef.current) {
      // Alterna entre abrir y cerrar la boca en bucle
      if (jawOpeningRef.current) {
        jawAngleRef.current = Math.min(jawAngleRef.current + MOUTH_OPEN_SPEED, MAX_JAW_ANGLE)
        if (jawAngleRef.current >= MAX_JAW_ANGLE) {
          jawOpeningRef.current = false
        }
      } else {
        jawAngleRef.current = Math.max(jawAngleRef.current - MOUTH_CLOSE_SPEED, 0)
        if (jawAngleRef.current <= 0) {
          jawOpeningRef.current = true
        }
      }
    } else {
      // Cierra la boca suavemente si deja de hablar
      if (jawAngleRef.current > 0) {
        jawAngleRef.current = Math.max(jawAngleRef.current - MOUTH_CLOSE_SPEED, 0)
      }
    }

    setJawAngle(jawAngleRef.current)
  }, [])

  return { isSpeaking, startSpeaking, stopSpeaking, animateJaw }
}

/**
 * Hook auxiliar para usar directamente dentro de un componente
 * que está montado dentro de un <Canvas>.
 * Ejecuta la animación de mandíbula en cada frame de Three.js.
 */
export function useJawFrame(
  animateJaw: (setJawAngle: (angle: number) => void) => void,
  setJawAngle: (angle: number) => void,
) {
  useFrame(() => {
    animateJaw(setJawAngle)
  })
}
