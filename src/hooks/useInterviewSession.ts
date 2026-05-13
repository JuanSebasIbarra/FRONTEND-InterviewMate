import { useCallback, useRef, useState } from 'react'
import { httpRequest } from '../services/httpClient'

export type AnimacionEstado = 'idle' | 'hablar' | 'celebrar' | 'corregir' | 'animar' | 'pensar'

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

function getBestSpanishVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  const LANG_PRIORITY = ['es-ES', 'es-US', 'es-MX', 'es-419', 'es']
  for (const lang of LANG_PRIORITY) {
    const remote = voices.find((v) => v.lang.startsWith(lang) && !v.localService)
    if (remote) return remote
    const local = voices.find((v) => v.lang.startsWith(lang))
    if (local) return local
  }
  return null
}

export function useInterviewSession(options: UseInterviewSessionOptions): UseInterviewSessionResult {
  // Ref pattern: keeps callbacks always current without triggering re-renders
  const optionsRef = useRef(options)
  optionsRef.current = options

  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evalResult, setEvalResult] = useState<EvalResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Stable reference — reads latest callbacks from ref, never goes stale
  const buildAndSpeak = useCallback((text: string, onEnd?: () => void) => {
    const { onSpeakStart, onMouthPulse, onSpeakEnd } = optionsRef.current
    if (!('speechSynthesis' in window)) { onSpeakEnd(); return }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'es-ES'
    utterance.rate = 0.92
    utterance.pitch = 1.05
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
    utterance.onboundary = (event) => { if (event.name === 'word') onMouthPulse() }
    utterance.onend = () => { onSpeakEnd(); onEnd?.() }
    utterance.onerror = () => { onSpeakEnd() }
    window.speechSynthesis.speak(utterance)
  }, []) // intentionally empty — stability via optionsRef

  const speak = useCallback((text: string) => { buildAndSpeak(text) }, [buildAndSpeak])

  const cancelSpeak = useCallback(() => {
    window.speechSynthesis.cancel()
    optionsRef.current.onSpeakEnd()
  }, [])

  const evaluarRespuesta = useCallback(
    async (pregunta: string, respuesta: string) => {
      setIsEvaluating(true)
      setError(null)
      optionsRef.current.onAnimacion('pensar')
      try {
        const result = await httpRequest<EvalResponse>('/api/v1/eval/evaluar', {
          method: 'POST',
          body: JSON.stringify({ pregunta, respuesta }),
        })
        // Decidir animacion según resultado: celebrar si correcto y puntaje alto, corregir si no
        const animacion: AnimacionEstado = (result.correcto && result.puntaje >= 70)
          ? 'celebrar' : 'corregir'
        setEvalResult({ ...result, animacion })
        optionsRef.current.onAnimacion(animacion)
        buildAndSpeak(result.feedback, () => {
          if (['celebrar', 'corregir', 'animar'].includes(animacion))
            optionsRef.current.onAnimacion('idle')
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al evaluar la respuesta.'
        setError(message)
        optionsRef.current.onAnimacion('idle')
        optionsRef.current.onSpeakEnd()
      } finally {
        setIsEvaluating(false)
      }
    },
    [buildAndSpeak],
  )

  return { evaluarRespuesta, speak, cancelSpeak, isEvaluating, evalResult, error }
}
