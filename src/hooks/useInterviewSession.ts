import { useCallback, useRef, useState } from 'react'
import { httpRequest } from '../services/httpClient'
import type { AnimacionEstado } from '../components/avatar/AvatarController'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type EvalResponse = {
  correcto: boolean
  puntaje: number
  feedback: string
  animacion: AnimacionEstado
}

type UseInterviewSessionOptions = {
  onAnimacion: (animacion: AnimacionEstado) => void
  onSpeakStart: () => void
  onMouthPulse: () => void
  onSpeakEnd: () => void
}

type UseInterviewSessionResult = {
  evaluarRespuesta: (pregunta: string, respuesta: string) => Promise<void>
  speak: (text: string) => void
  cancelSpeak: () => void
  isEvaluating: boolean
  evalResult: EvalResponse | null
  error: string | null
}

// ─── Selección de voz española ────────────────────────────────────────────────

/**
 * Devuelve la mejor voz española disponible priorizando voces en la nube
 * (Google/Microsoft). Funciona en Chrome, Edge y Safari.
 */
function getBestSpanishVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  const LANG_PRIORITY = ['es-ES', 'es-US', 'es-MX', 'es-419', 'es']

  for (const lang of LANG_PRIORITY) {
    // Preferir voces remotas (mayor calidad) sobre las locales
    const remote = voices.find((v) => v.lang.startsWith(lang) && !v.localService)
    if (remote) return remote
    const local = voices.find((v) => v.lang.startsWith(lang))
    if (local) return local
  }
  return null
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useInterviewSession(options: UseInterviewSessionOptions): UseInterviewSessionResult {
  const { onAnimacion, onSpeakStart, onMouthPulse, onSpeakEnd } = options

  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evalResult, setEvalResult] = useState<EvalResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  /** Crea y lanza un utterance con lip-sync conectado */
  const buildAndSpeak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!('speechSynthesis' in window)) {
        onSpeakEnd()
        return
      }

      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'es-ES'
      utterance.rate = 0.92
      utterance.pitch = 1.05

      // Asigna la mejor voz disponible; en Chrome las voces pueden no estar
      // cargadas aún, así que re-intentamos después de voiceschanged.
      const applyVoice = () => {
        const voice = getBestSpanishVoice()
        if (voice) utterance.voice = voice
      }
      applyVoice()
      if (!utterance.voice) {
        window.speechSynthesis.onvoiceschanged = () => {
          applyVoice()
          window.speechSynthesis.onvoiceschanged = null
        }
      }

      utteranceRef.current = utterance

      utterance.onstart = () => { onSpeakStart() }
      utterance.onboundary = (event) => {
        if (event.name === 'word') onMouthPulse()
      }
      utterance.onend = () => {
        onSpeakEnd()
        onEnd?.()
      }
      utterance.onerror = () => { onSpeakEnd() }

      window.speechSynthesis.speak(utterance)
    },
    [onMouthPulse, onSpeakEnd, onSpeakStart],
  )

  /** Habla texto libremente (ej: enunciar una pregunta) */
  const speak = useCallback(
    (text: string) => { buildAndSpeak(text) },
    [buildAndSpeak],
  )

  /** Cancela cualquier síntesis en curso */
  const cancelSpeak = useCallback(() => {
    window.speechSynthesis.cancel()
    onSpeakEnd()
  }, [onSpeakEnd])

  const evaluarRespuesta = useCallback(
    async (pregunta: string, respuesta: string) => {
      setIsEvaluating(true)
      setError(null)
      onAnimacion('pensar')

      try {
        const result = await httpRequest<EvalResponse>('/api/v1/eval/evaluar', {
          method: 'POST',
          body: JSON.stringify({ pregunta, respuesta }),
        })

        const VALID_STATES: AnimacionEstado[] = [
          'idle', 'hablar', 'celebrar', 'corregir', 'animar', 'pensar',
        ]
        const animacion: AnimacionEstado = VALID_STATES.includes(result.animacion)
          ? result.animacion
          : 'hablar'

        setEvalResult({ ...result, animacion })
        onAnimacion(animacion)

        buildAndSpeak(result.feedback, () => {
          if (['celebrar', 'corregir', 'animar'].includes(animacion)) {
            onAnimacion('idle')
          }
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al evaluar la respuesta.'
        setError(message)
        onAnimacion('idle')
        onSpeakEnd()
      } finally {
        setIsEvaluating(false)
      }
    },
    [buildAndSpeak, onAnimacion, onSpeakEnd],
  )

  return { evaluarRespuesta, speak, cancelSpeak, isEvaluating, evalResult, error }
}
