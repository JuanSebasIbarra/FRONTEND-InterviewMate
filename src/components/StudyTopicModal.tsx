import { useCallback, useEffect, useRef, useState } from 'react'

type StudyTopicModalProps = {
  isOpen: boolean
  templatePosition: string
  isLoading: boolean
  onConfirm: (topic: string) => void
  onClose: () => void
}

function StudyTopicModal({
  isOpen,
  templatePosition,
  isLoading,
  onConfirm,
  onClose,
}: StudyTopicModalProps) {
  const [topic, setTopic] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTopic('')
      setIsListening(false)
      setTimeout(() => textareaRef.current?.focus(), 50)
    } else {
      recognitionRef.current?.abort()
      setIsListening(false)
    }
  }, [isOpen])

  // Setup Speech Recognition
  const handleTranscript = useCallback((text: string) => {
    setTopic((prev) => {
      const trimmed = prev.trim()
      return trimmed ? `${trimmed} ${text}` : text
    })
  }, [])

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) return

    setSpeechSupported(true)
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'es-ES'

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      if (transcript) handleTranscript(transcript)
    }

    recognitionRef.current = recognition

    return () => recognition.abort()
  }, [handleTranscript])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
    }
  }

  const handleSubmit = () => {
    const trimmed = topic.trim()
    if (!trimmed || isLoading) return
    onConfirm(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={!isLoading ? onClose : undefined}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-zinc-100 px-6 pt-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-zinc-400">✦ IA</span>
            <span className="text-xs uppercase tracking-widest text-zinc-400">Nueva sesión de estudio</span>
          </div>
          <h2 className="font-serif text-2xl font-normal tracking-[-0.02em] text-zinc-900">
            ¿Qué deseas estudiar?
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Describe el tema y la IA generará preguntas de entrevista personalizadas
            {templatePosition ? ` para el rol de ${templatePosition}` : ''}.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={4}
              placeholder="Ej: React hooks y manejo de estado, arquitectura de microservicios, algoritmos de ordenamiento..."
              className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 pr-12 text-sm text-zinc-800 placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:bg-white disabled:opacity-50"
            />
            {/* Mic button inside textarea */}
            {speechSupported && (
              <button
                type="button"
                onClick={toggleListening}
                disabled={isLoading}
                title={isListening ? 'Detener grabación' : 'Hablar'}
                className={`absolute right-3 top-3 rounded-full p-2 transition ${
                  isListening
                    ? 'bg-red-500 text-white shadow-md animate-pulse'
                    : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                } disabled:opacity-40`}
              >
                {isListening ? (
                  /* Stop icon */
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  /* Mic icon */
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                )}
              </button>
            )}
          </div>

          {/* Listening indicator */}
          {isListening && (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Escuchando... habla ahora
            </div>
          )}

          {/* Hint */}
          <p className="text-xs text-zinc-400">
            {speechSupported
              ? 'Escribe o usa el micrófono · Ctrl+Enter para confirmar'
              : 'Ctrl+Enter para confirmar'}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-sm text-zinc-500 transition hover:bg-zinc-50 disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!topic.trim() || isLoading}
            className="flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Generando...
              </>
            ) : (
              'Generar sesión →'
            )}
          </button>
        </div>

        {/* Close button */}
        {!isLoading && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default StudyTopicModal
