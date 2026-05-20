import { useCallback, useRef, useState } from 'react'

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
  evaluarRespuesta: (feedback: string, score: number) => Promise<void>
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
    async (feedback: string, score: number) => {
      setIsEvaluating(true)
      setError(null)
      optionsRef.current.onAnimacion('pensar')
      try {
        // La evaluación ya fue realizada por el backend al enviar la respuesta.
        // Aquí solo se sintetiza el feedback de IA y se decide la animación.
        const correcto = score >= 70
        const animacion: AnimacionEstado = correcto ? 'celebrar' : 'corregir'
        const result: EvalResponse = { correcto, puntaje: score, feedback, animacion }
        setEvalResult(result)
        optionsRef.current.onAnimacion(animacion)
        buildAndSpeak(feedback, () => {
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
