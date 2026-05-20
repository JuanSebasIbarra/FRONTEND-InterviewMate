import { useCallback, useEffect, useRef, useState } from 'react'
import { getQuestionTTS } from '../services/questionService'

type UseQuestionTTSOptions = {
  /** Se llama cuando el audio empieza a reproducirse */
  onStart: () => void
  /** Se llama cuando el audio termina o falla */
  onEnd: () => void
}

type UseQuestionTTSResult = {
  /** questionId: ID del backend · fallbackText: texto a leer si el audio falla */
  playQuestionTTS: (questionId: string, fallbackText: string) => Promise<void>
  stopTTS: () => void
  isPlayingTTS: boolean
}

/** Lee texto con Web Speech API. No llama onStart (ya fue llamado por el caller). */
function speakTextFallback(text: string, onEnd: () => void) {
  if (!('speechSynthesis' in window)) { onEnd(); return }
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'es-ES'
  utterance.rate = 0.88
  utterance.pitch = 1.0
  const voices = window.speechSynthesis.getVoices()
  const spanishVoice = voices.find((v) => v.lang.startsWith('es'))
  if (spanishVoice) utterance.voice = spanishVoice
  utterance.onend = onEnd
  utterance.onerror = onEnd
  window.speechSynthesis.speak(utterance)
}

export function useQuestionTTS({ onStart, onEnd }: UseQuestionTTSOptions): UseQuestionTTSResult {
  const [isPlayingTTS, setIsPlayingTTS] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  // Ref pattern: siempre apunta a las callbacks más recientes sin causar recreación del hook
  const callbacksRef = useRef({ onStart, onEnd })
  useEffect(() => { callbacksRef.current = { onStart, onEnd } })

  const stopTTS = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    setIsPlayingTTS(false)
  }, [])

  const playQuestionTTS = useCallback(async (questionId: string, fallbackText: string) => {
    stopTTS()
    setIsPlayingTTS(true)
    callbacksRef.current.onStart()

    const handleEnd = () => {
      setIsPlayingTTS(false)
      callbacksRef.current.onEnd()
    }

    try {
      const blob = await getQuestionTTS(questionId)
      const objectUrl = URL.createObjectURL(blob)
      objectUrlRef.current = objectUrl

      const audio = new Audio(objectUrl)
      audioRef.current = audio

      audio.onended = () => {
        URL.revokeObjectURL(objectUrl)
        objectUrlRef.current = null
        audioRef.current = null
        handleEnd()
      }

      // Autoplay bloqueado o error de red → leer el texto con Web Speech API
      audio.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        objectUrlRef.current = null
        audioRef.current = null
        speakTextFallback(fallbackText, handleEnd)
      }

      await audio.play()
    } catch {
      // Backend no disponible o autoplay bloqueado → fallback Web Speech API
      speakTextFallback(fallbackText, handleEnd)
    }
  }, [stopTTS])

  return { playQuestionTTS, stopTTS, isPlayingTTS }
}

