import { useEffect, useRef, useState } from 'react'

type MicrophoneButtonProps = {
  onTranscript: (text: string) => void
}

function MicrophoneButton({ onTranscript }: MicrophoneButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported')
      return
    }

    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'es-ES'

    recognitionRef.current.onstart = () => setIsListening(true)
    recognitionRef.current.onend = () => setIsListening(false)

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          onTranscript(transcript)
        } else {
          interimTranscript += transcript
        }
      }
    }

    return () => {
      recognitionRef.current?.abort()
    }
  }, [onTranscript])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
    }
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`rounded-full p-6 transition ${
        isListening
          ? 'bg-red-500 text-white shadow-lg animate-pulse'
          : 'bg-[#638ea3] text-white hover:opacity-90'
      }`}
      aria-label="Micrófono"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
        <path d="M17 16.91c-1.48 1.46-3.5 2.36-5.7 2.36-2.2 0-4.22-.9-5.7-2.36L3.6 18.7c1.89 1.9 4.5 3.08 7.4 3.08s5.51-1.18 7.4-3.08l-2.3-2.31zM12 20c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1s-1 .45-1 1v3c0 .55.45 1 1 1z" />
      </svg>
    </button>
  )
}

export default MicrophoneButton
