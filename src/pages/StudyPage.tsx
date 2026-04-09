import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ExitConfirmModal from '../components/ExitConfirmModal'
import MicrophoneButton from '../components/MicrophoneButton'
import { getStudySessionAnswers, saveStudySessionAnswers } from '../lib/studySessionAnswers'
import { getStudyById } from '../services/studyService'

type StudyAnswer = {
  questionId: string
  answer: string
}

type StudyQuestion = {
  id: string
  text: string
}

function StudyPage() {
  const navigate = useNavigate()
  const { sessionId } = useParams<{ sessionId: string }>()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<StudyAnswer[]>([])
  const [currentResponse, setCurrentResponse] = useState('')
  const [showExitModal, setShowExitModal] = useState(false)
  const [sessionTitle, setSessionTitle] = useState('Sesion de estudio')
  const [questions, setQuestions] = useState<StudyQuestion[]>([])
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [validationMessage, setValidationMessage] = useState('')

  useEffect(() => {
    if (!sessionId) {
      setErrorMessage('No se encontro la sesion de estudio.')
      setIsLoading(false)
      return
    }

    let mounted = true

    const loadStudySession = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const studySession = await getStudyById(sessionId)
        if (!mounted) return

        const sortedQuestions = [...(studySession.questions ?? [])]
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((question) => ({
            id: question.id,
            text: question.questionText,
          }))

        setSessionTitle(studySession.topic || 'Sesion de estudio')
        setTemplateId(studySession.templateId)
        setQuestions(sortedQuestions)

        const storedAnswers = getStudySessionAnswers(studySession.id)
        if (storedAnswers?.answers?.length) {
          setAnswers(storedAnswers.answers)
        }
      } catch (error) {
        if (!mounted) return
        const message =
          error instanceof Error ? error.message : 'No se pudo cargar la sesion de estudio.'
        setErrorMessage(message)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    void loadStudySession()

    return () => {
      mounted = false
    }
  }, [sessionId])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href)
    }

    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    if (!sessionId || !templateId) return

    saveStudySessionAnswers({
      sessionId,
      templateId,
      topic: sessionTitle,
      answers,
      savedAt: new Date().toISOString(),
    })
  }, [answers, sessionId, sessionTitle, templateId])

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = useMemo(
    () => answers.find((answer) => answer.questionId === currentQuestion?.id),
    [answers, currentQuestion?.id],
  )

  const getNextAnswers = () => {
    if (!currentQuestion) return answers

    const normalizedAnswer = currentResponse.trim()
    if (!normalizedAnswer) return answers

    const nextAnswers = [
      ...answers.filter((answer) => answer.questionId !== currentQuestion.id),
      {
        questionId: currentQuestion.id,
        answer: normalizedAnswer,
      },
    ]

    setAnswers(nextAnswers)
    return nextAnswers
  }

  const handleMicrophoneTranscript = (text: string) => {
    setCurrentResponse(text)
    setValidationMessage('')
  }

  const handleSaveAnswer = () => {
    if (!currentQuestion) return

    if (!currentResponse.trim()) {
      setValidationMessage('Debes escribir o dictar una respuesta antes de guardar.')
      return
    }

    getNextAnswers()
    setValidationMessage('')
  }

  const goToQuestion = (index: number, snapshot: StudyAnswer[] = answers) => {
    const targetQuestion = questions[index]
    if (!targetQuestion) return

    setCurrentQuestionIndex(index)
    const existingAnswer = snapshot.find((answer) => answer.questionId === targetQuestion.id)
    setCurrentResponse(existingAnswer?.answer ?? '')
  }

  const handleFinishStudy = () => {
    const nextAnswers = getNextAnswers()
    const hasAtLeastOneAnswer = nextAnswers.some((answer) => answer.answer.trim().length > 0)

    if (!hasAtLeastOneAnswer) {
      setValidationMessage('Debes responder al menos 1 pregunta antes de finalizar la sesion.')
      return
    }

    if (!sessionId) return

    if (templateId) {
      saveStudySessionAnswers({
        sessionId,
        templateId,
        topic: sessionTitle,
        answers: nextAnswers,
        savedAt: new Date().toISOString(),
      })
    }

    navigate(`/sessions/${sessionId}/results`, { replace: true })
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const snapshot = getNextAnswers()
      setValidationMessage('')
      goToQuestion(currentQuestionIndex + 1, snapshot)
      return
    }

    handleFinishStudy()
  }

  const handlePrevQuestion = () => {
    const snapshot = getNextAnswers()

    if (currentQuestionIndex > 0) {
      setValidationMessage('')
      goToQuestion(currentQuestionIndex - 1, snapshot)
    }
  }

  const handleSelectQuestion = (index: number) => {
    const snapshot = getNextAnswers()
    setValidationMessage('')
    goToQuestion(index, snapshot)
  }

  const handleExit = () => {
    const snapshot = getNextAnswers()

    if (sessionId && templateId) {
      saveStudySessionAnswers({
        sessionId,
        templateId,
        topic: sessionTitle,
        answers: snapshot,
        savedAt: new Date().toISOString(),
      })
    }

    if (templateId) {
      navigate(`/sessions/${templateId}`, { replace: true })
      return
    }

    navigate('/dashboard', { replace: true })
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-stone-100">
        <p className="text-sm text-zinc-600">Cargando sesion de estudio...</p>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-stone-100 px-4">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-stone-100 px-4">
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700">
          Esta sesion no tiene preguntas disponibles.
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-stone-100">
      <ExitConfirmModal
        isOpen={showExitModal}
        onConfirm={handleExit}
        onCancel={() => setShowExitModal(false)}
      />

      <header className="border-b border-zinc-300 bg-stone-50 px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500">Sesión en curso</p>
            <h1 className="mt-1 font-serif text-2xl font-normal tracking-[-0.02em] text-zinc-900">
              {sessionTitle}
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

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-64 flex-col overflow-hidden border-r border-zinc-300 bg-zinc-50">
          <div className="border-b border-zinc-200 px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-zinc-400">Preguntas</p>
            <p className="mt-1 text-xs text-zinc-500">
              {currentQuestionIndex + 1} / {questions.length}
            </p>
          </div>

          <ul className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {questions.map((question, index) => {
              const isAnswered = answers.some((answer) => answer.questionId === question.id)
              const isActive = index === currentQuestionIndex
              return (
                <li key={question.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectQuestion(index)}
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-xs transition ${
                      isActive
                        ? 'border border-interviewmate-blue bg-interviewmate-blue/10'
                        : 'border border-zinc-200 bg-white hover:bg-zinc-100'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 font-medium text-zinc-500">{index + 1}.</span>
                      <div className="flex-1">
                        <p className="line-clamp-2 text-xs leading-tight text-zinc-700">
                          {question.text}
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

        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-2xl">
              <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="mb-2 text-xs uppercase tracking-widest text-zinc-400">
                  Pregunta {currentQuestionIndex + 1} de {questions.length}
                </p>
                <h2 className="font-serif text-2xl font-normal tracking-[-0.02em] text-zinc-900">
                  {currentQuestion.text}
                </h2>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-zinc-600">Responde con voz o escribiendo en el campo</p>
                  <MicrophoneButton onTranscript={handleMicrophoneTranscript} />
                </div>

                <div className="rounded-xl border border-zinc-200 bg-stone-50 p-5">
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-400">
                    Respuesta por texto
                  </p>
                  <textarea
                    value={currentResponse}
                    onChange={(event) => {
                      setCurrentResponse(event.target.value)
                      setValidationMessage('')
                    }}
                    rows={5}
                    placeholder="Escribe tu respuesta aqui..."
                    className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm text-zinc-800 outline-none transition focus:border-zinc-500"
                  />
                </div>

                <div className="rounded-xl border border-zinc-200 bg-stone-50 p-5">
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-400">
                    {currentResponse ? 'Respuesta (transcripción)' : 'Tu respuesta'}
                  </p>
                  <div className="min-h-24 rounded-lg bg-white p-4 text-sm text-zinc-800">
                    {currentResponse ? (
                      <p>{currentResponse}</p>
                    ) : currentAnswer ? (
                      <p className="font-medium text-emerald-700">{currentAnswer.answer}</p>
                    ) : (
                      <p className="text-zinc-400">Tu respuesta aparecerá aquí...</p>
                    )}
                  </div>
                </div>

                {currentResponse && (
                  <button
                    type="button"
                    onClick={handleSaveAnswer}
                    className="w-full rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-80"
                  >
                    Guardar respuesta
                  </button>
                )}

                {validationMessage && (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {validationMessage}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-300 bg-stone-50 px-6 py-4">
            <div className="mx-auto flex max-w-2xl gap-3">
              <button
                type="button"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50"
              >
                ← Anterior
              </button>
              <button
                type="button"
                onClick={handleNextQuestion}
                className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finalizar →' : 'Siguiente →'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default StudyPage
