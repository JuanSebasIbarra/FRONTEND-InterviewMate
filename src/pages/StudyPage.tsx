import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ExitConfirmModal from '../components/ExitConfirmModal'
import MicrophoneButton from '../components/MicrophoneButton'

type StudyQuestion = {
  id: number
  text: string
}

type StudyAnswer = {
  questionId: number
  answer: string
}

// Mock data - en producción vendría de la API
const MOCK_TEMPLATE_NAME = 'Sesión de Estudio: React Fundamentals'
const MOCK_QUESTIONS: StudyQuestion[] = [
  { id: 1, text: '¿Cuál es la diferencia entre props y state en React?' },
  { id: 2, text: '¿Qué es el Virtual DOM y por qué es importante?' },
  { id: 3, text: '¿Cómo funcionan los hooks en React?' },
  { id: 4, text: '¿Qué es el context API y cuándo usarlo?' },
  { id: 5, text: '¿Cuál es el ciclo de vida de un componente de clase?' },
]

function StudyPage() {
  const navigate = useNavigate()
  const { sessionId: _sessionId } = useParams<{ sessionId: string }>()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<StudyAnswer[]>([])
  const [currentResponse, setCurrentResponse] = useState('')
  const [showExitModal, setShowExitModal] = useState(false)

  const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex]
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion.id)

  const handleMicrophoneTranscript = (text: string) => {
    setCurrentResponse(text)
  }

  const handleSaveAnswer = () => {
    if (!currentResponse.trim()) {
      alert('Por favor, proporciona una respuesta')
      return
    }

    const existingAnswerIndex = answers.findIndex((a) => a.questionId === currentQuestion.id)
    if (existingAnswerIndex >= 0) {
      const newAnswers = [...answers]
      newAnswers[existingAnswerIndex].answer = currentResponse
      setAnswers(newAnswers)
    } else {
      setAnswers([...answers, { questionId: currentQuestion.id, answer: currentResponse }])
    }

    setCurrentResponse('')
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < MOCK_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentResponse('')
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setCurrentResponse('')
    }
  }

  const handleSelectQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
    setCurrentResponse('')
  }

  const handleExit = () => {
    // Aquí se guardarían las respuestas en la BD y se marcaría como pendiente
    navigate('/dashboard')
  }

  return (
    <div className="h-screen w-screen bg-stone-100 flex flex-col">
      <ExitConfirmModal
        isOpen={showExitModal}
        onConfirm={handleExit}
        onCancel={() => setShowExitModal(false)}
      />

      {/* Header */}
      <header className="border-b border-zinc-300 bg-stone-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500">Sesión en curso</p>
            <h1 className="mt-1 font-serif text-2xl font-normal tracking-[-0.02em] text-zinc-900">
              {MOCK_TEMPLATE_NAME}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setShowExitModal(true)}
            className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
          >
            Salir de la sesión
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Questions list */}
        <aside className="flex w-64 flex-col border-r border-zinc-300 bg-zinc-50 overflow-hidden">
          <div className="border-b border-zinc-200 px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-zinc-400">Preguntas</p>
            <p className="mt-1 text-xs text-zinc-500">
              {currentQuestionIndex + 1} / {MOCK_QUESTIONS.length}
            </p>
          </div>

          <ul className="flex-1 overflow-y-auto space-y-2 px-3 py-3">
            {MOCK_QUESTIONS.map((q, idx) => {
              const isAnswered = answers.some((a) => a.questionId === q.id)
              const isActive = idx === currentQuestionIndex
              return (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectQuestion(idx)}
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-xs transition ${
                      isActive
                        ? 'border border-[#638ea3] bg-[#638ea3]/10'
                        : 'border border-zinc-200 bg-white hover:bg-zinc-100'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 font-medium text-zinc-500">{idx + 1}.</span>
                      <div className="flex-1">
                        <p className="line-clamp-2 text-xs leading-tight text-zinc-700">
                          {q.text}
                        </p>
                        {isAnswered && (
                          <span className="mt-1 inline-block rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                            Respondida
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        {/* Main area - Question and response */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-2xl">
              {/* Question */}
              <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="mb-2 text-xs uppercase tracking-widest text-zinc-400">
                  Pregunta {currentQuestionIndex + 1} de {MOCK_QUESTIONS.length}
                </p>
                <h2 className="font-serif text-2xl font-normal tracking-[-0.02em] text-zinc-900">
                  {currentQuestion.text}
                </h2>
              </div>

              {/* Microphone and response area */}
              <div className="space-y-6">
                {/* Microphone button */}
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-zinc-600">Presiona el micrófono para responder</p>
                  <MicrophoneButton onTranscript={handleMicrophoneTranscript} />
                </div>

                {/* Current response or saved answer */}
                <div className="rounded-xl border border-zinc-200 bg-stone-50 p-5">
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-400">
                    {currentResponse ? 'Respuesta (transcripción)' : 'Tu respuesta'}
                  </p>
                  <div className="min-h-24 rounded-lg bg-white p-4 text-sm text-zinc-800">
                    {currentResponse ? (
                      <p>{currentResponse}</p>
                    ) : currentAnswer ? (
                      <p className="text-emerald-700 font-medium">{currentAnswer.answer}</p>
                    ) : (
                      <p className="text-zinc-400">Tu respuesta aparecerá aquí...</p>
                    )}
                  </div>
                </div>

                {/* Save answer button */}
                {currentResponse && (
                  <button
                    type="button"
                    onClick={handleSaveAnswer}
                    className="w-full rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-80"
                  >
                    Guardar respuesta
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation controls */}
          <div className="border-t border-zinc-300 bg-stone-50 px-6 py-4">
            <div className="mx-auto flex max-w-2xl gap-3">
              <button
                type="button"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition disabled:opacity-50 hover:bg-zinc-100"
              >
                ← Anterior
              </button>
              <button
                type="button"
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === MOCK_QUESTIONS.length - 1}
                className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition disabled:opacity-50 hover:bg-zinc-100"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default StudyPage
