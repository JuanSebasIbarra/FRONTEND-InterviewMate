import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTemplate } from '../services/templateService'
import type { CreateInterviewTemplateRequest, InterviewType } from '../models/interview'

type FieldKey =
	| 'enterprise'
	| 'type'
	| 'position'
	| 'workingArea'
	| 'description'
	| 'requirements'
	| 'businessContext'

type SpeechRecognitionLike = {
	lang: string
	continuous: boolean
	interimResults: boolean
	onresult: ((event: any) => void) | null
	onerror: ((event: any) => void) | null
	onend: (() => void) | null
	start: () => void
	stop: () => void
	abort?: () => void
}

const FIELD_LABELS: Record<FieldKey, string> = {
	enterprise: 'Empresa',
	type: 'Type',
	position: 'Position',
	workingArea: 'Working Area',
	description: 'Description',
	requirements: 'Requirements',
	businessContext: 'Business Context',
}

const DEFAULT_FORM = {
	enterprise: '',
	type: 'TECHNICAL' as InterviewType,
	position: '',
	workingArea: '',
	description: '',
	requirements: '',
	businessContext: '',
}

function normalizeInterviewType(transcript: string): InterviewType | '' {
	const value = transcript.trim().toLowerCase()

	if (!value) return ''
	if (value.includes('technical') || value.includes('tecnica') || value.includes('técnica')) {
		return 'TECHNICAL'
	}
	if (value.includes('hr') || value.includes('recursos humanos') || value.includes('humana')) {
		return 'HR'
	}
	if (value.includes('psychological') || value.includes('psicologica') || value.includes('psicológica')) {
		return 'PSYCHOLOGICAL'
	}

	return ''
}

function TemplateCreationPage() {
	const navigate = useNavigate()
	const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
	const activeFieldRef = useRef<FieldKey>('enterprise')
	const [activeField, setActiveField] = useState<FieldKey>('enterprise')
	const [isListening, setIsListening] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [statusMessage, setStatusMessage] = useState('Selecciona un campo y presiona Empezar para dictar.')
	const [errorMessage, setErrorMessage] = useState('')
	const [formData, setFormData] = useState(DEFAULT_FORM)

	useEffect(() => {
		activeFieldRef.current = activeField
	}, [activeField])

	const speechSupported = useMemo(() => {
		if (typeof window === 'undefined') return false
		const browserWindow = window as Window & {
			SpeechRecognition?: new () => SpeechRecognitionLike
			webkitSpeechRecognition?: new () => SpeechRecognitionLike
		}
		return Boolean(browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition)
	}, [])

	useEffect(() => {
		if (typeof window === 'undefined') return

		const browserWindow = window as Window & {
			SpeechRecognition?: new () => SpeechRecognitionLike
			webkitSpeechRecognition?: new () => SpeechRecognitionLike
		}
		const SpeechRecognition = browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition

		if (!SpeechRecognition) return

		const recognition = new SpeechRecognition()
		recognition.lang = 'es-ES'
		recognition.continuous = true
		recognition.interimResults = true

		recognition.onresult = (event) => {
			let transcript = ''

			for (let index = event.resultIndex; index < event.results.length; index += 1) {
				const result = event.results[index]
				if (result.isFinal) {
					transcript += `${result[0].transcript} `
				}
			}

			const cleanTranscript = transcript.trim()
			if (!cleanTranscript) return
			const currentField = activeFieldRef.current

			setFormData((current) => {
				if (currentField === 'type') {
					const normalizedType = normalizeInterviewType(cleanTranscript)
					if (!normalizedType) {
						return current
					}
					return { ...current, type: normalizedType }
				}

				return {
					...current,
					[currentField]: current[currentField]
						? `${current[currentField].trimEnd()} ${cleanTranscript}`.trim()
						: cleanTranscript,
				}
			})

			setStatusMessage(`Dictado aplicado en ${FIELD_LABELS[currentField] ?? 'campo'}.`)
		}

		recognition.onerror = (event) => {
			setIsListening(false)
			setErrorMessage(event.error === 'not-allowed'
				? 'Necesitas permitir el acceso al microfono para dictar.'
				: 'No se pudo procesar el dictado de voz.')
			setStatusMessage('El reconocimiento de voz se detuvo.')
		}

		recognition.onend = () => {
			setIsListening(false)
			setStatusMessage('Reconocimiento de voz detenido.')
		}

		recognitionRef.current = recognition

		return () => {
			recognition.abort?.()
			recognitionRef.current = null
		}
	}, [])

	const updateField = (field: FieldKey, value: string) => {
		setActiveField(field)
		setFormData((current) => ({ ...current, [field]: value }))
	}

	const handleFieldFocus = (field: FieldKey) => {
		setActiveField(field)
	}

	const startListening = () => {
		setErrorMessage('')

		if (!speechSupported || !recognitionRef.current) {
			setErrorMessage('Tu navegador no soporta speech to text.')
			return
		}

		try {
			recognitionRef.current.start()
			setIsListening(true)
			setStatusMessage(`Escuchando en ${FIELD_LABELS[activeFieldRef.current] ?? 'campo'}...`)
		} catch {
			setErrorMessage('No se pudo iniciar el reconocimiento de voz.')
		}
	}

	const stopListening = () => {
		recognitionRef.current?.stop()
		setIsListening(false)
		setStatusMessage('Reconocimiento de voz pausado.')
	}

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setIsSubmitting(true)
		setErrorMessage('')

		try {
			const payload: CreateInterviewTemplateRequest = {
				enterprise: formData.enterprise.trim(),
				type: formData.type,
				position: formData.position.trim(),
				workingArea: formData.workingArea.trim() || undefined,
				description: formData.description.trim() || undefined,
				requirements: formData.requirements.trim() || undefined,
				businessContext: formData.businessContext.trim() || undefined,
			}

			const createdTemplate = await createTemplate(payload)

			if (!createdTemplate?.id) {
				throw new Error('La plantilla se creo, pero no se recibio el identificador.')
			}

			navigate(`/sessions/${createdTemplate.id}`)
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : 'No se pudo crear la plantilla.')
		} finally {
			setIsSubmitting(false)
		}
	}

	const selectedFieldLabel = FIELD_LABELS[activeField] ?? 'campo'

	return (
		<div className="min-h-screen w-full bg-stone-100 px-4 py-4 sm:px-6 lg:px-8">
			<div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl overflow-hidden rounded-md border border-zinc-300 bg-stone-50 shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
				<aside className="flex w-[320px] shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 px-5 py-6 sm:px-6">
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="mb-6 inline-flex w-fit items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:-translate-y-0.5 hover:border-zinc-400 hover:text-zinc-900"
					>
						<span aria-hidden="true">←</span>
						Regresar
					</button>

					<div className="flex flex-1 flex-col">
						<div className="flex flex-col items-center border-b border-zinc-200 pb-6 text-center">
							<div className={`flex h-24 w-24 items-center justify-center rounded-full border-4 ${isListening ? 'border-interviewmate-blue bg-interviewmate-blue/10' : 'border-zinc-900/20 bg-white'}`}>
								<svg viewBox="0 0 24 24" className={`h-10 w-10 ${isListening ? 'text-interviewmate-blue' : 'text-zinc-800'}`} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
									<path d="M12 14.5a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4.5a3 3 0 0 0 3 3Z" />
									<path d="M19 11.5a7 7 0 0 1-14 0" />
									<path d="M12 18v3" />
									<path d="M8 21h8" />
								</svg>
							</div>
							<h2 className="mt-4 font-serif text-3xl font-normal tracking-[-0.02em] text-zinc-900">
								Dictado
							</h2>
							<p className="mt-1 text-sm text-zinc-600">
								{speechSupported
									? `Selecciona un campo y dicta para llenar ${selectedFieldLabel.toLowerCase()}.`
									: 'Tu navegador no soporta dictado por voz.'}
							</p>
						</div>

						<div className="mt-4">
							{errorMessage && (
								<p className="mb-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
									{errorMessage}
								</p>
							)}
							<p className="mb-4 text-sm text-zinc-600">{statusMessage}</p>
							<div className="grid grid-cols-2 gap-3">
								<button
									type="button"
									onClick={startListening}
									disabled={!speechSupported || isListening}
									className="rounded-md bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-zinc-400"
								>
									Empezar
								</button>
								<button
									type="button"
									onClick={stopListening}
									disabled={!isListening}
									className="rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
								>
									Detener
								</button>
							</div>
						</div>

						<div className="mt-4 rounded-md border border-zinc-200 bg-white px-4 py-4">
							<p className="text-xs uppercase tracking-widest text-zinc-500">Campo activo</p>
							<p className="mt-2 text-base font-semibold text-zinc-900">{selectedFieldLabel}</p>
							<p className="mt-2 text-xs text-zinc-500">
								Haz click en cualquier input del formulario o empieza a escribir para cambiar el destino del dictado.
							</p>
						</div>
					</div>
				</aside>

				<main className="flex min-w-0 flex-1">
					<section className="w-full overflow-y-auto p-5 sm:p-8 lg:p-10">
						<header className="mb-8 border-b border-zinc-200 pb-5">
							<p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Formulario Entrevista</p>
							<h1 className="mt-2 font-serif text-4xl font-normal tracking-[-0.03em] text-zinc-900 sm:text-5xl">
								Crear plantilla
							</h1>
							<p className="mt-3 max-w-2xl text-sm text-zinc-600">
								Completa el formulario manualmente o usa la sidebar para dictar cada campo con voz.
							</p>
						</header>

						<form className="space-y-5" onSubmit={handleSubmit}>
							<div className="grid gap-4 md:grid-cols-2">
								<label className="block">
									<span className="mb-2 block text-sm font-medium text-zinc-700">Empresa</span>
									<input
										type="text"
										value={formData.enterprise}
										onFocus={() => handleFieldFocus('enterprise')}
										onChange={(event) => updateField('enterprise', event.target.value)}
										className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-interviewmate-blue focus:ring-2 focus:ring-interviewmate-blue/20"
										placeholder="Nombre de la empresa"
									/>
								</label>

								<label className="block">
									<span className="mb-2 block text-sm font-medium text-zinc-700">Type</span>
									<select
										value={formData.type}
										onFocus={() => handleFieldFocus('type')}
										onChange={(event) => updateField('type', event.target.value as InterviewType)}
										className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-interviewmate-blue focus:ring-2 focus:ring-interviewmate-blue/20"
									>
										<option value="TECHNICAL">Technical</option>
										<option value="HR">HR</option>
										<option value="PSYCHOLOGICAL">Psychological</option>
									</select>
								</label>
							</div>

							<label className="block">
								<span className="mb-2 block text-sm font-medium text-zinc-700">Position</span>
								<input
									type="text"
									value={formData.position}
									onFocus={() => handleFieldFocus('position')}
									onChange={(event) => updateField('position', event.target.value)}
									className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-interviewmate-blue focus:ring-2 focus:ring-interviewmate-blue/20"
									placeholder="Puesto o cargo"
								/>
							</label>

							<label className="block">
								<span className="mb-2 block text-sm font-medium text-zinc-700">Working Area</span>
								<input
									type="text"
									value={formData.workingArea}
									onFocus={() => handleFieldFocus('workingArea')}
									onChange={(event) => updateField('workingArea', event.target.value)}
									className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-interviewmate-blue focus:ring-2 focus:ring-interviewmate-blue/20"
									placeholder="Area de trabajo"
								/>
							</label>

							<label className="block">
								<span className="mb-2 block text-sm font-medium text-zinc-700">Description</span>
								<textarea
									rows={6}
									value={formData.description}
									onFocus={() => handleFieldFocus('description')}
									onChange={(event) => updateField('description', event.target.value)}
									className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-interviewmate-blue focus:ring-2 focus:ring-interviewmate-blue/20"
									placeholder="Descripcion de la vacante"
								/>
							</label>

							<label className="block">
								<span className="mb-2 block text-sm font-medium text-zinc-700">Requirements</span>
								<textarea
									rows={4}
									value={formData.requirements}
									onFocus={() => handleFieldFocus('requirements')}
									onChange={(event) => updateField('requirements', event.target.value)}
									className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-interviewmate-blue focus:ring-2 focus:ring-interviewmate-blue/20"
									placeholder="Requisitos del perfil"
								/>
							</label>

							<label className="block">
								<span className="mb-2 block text-sm font-medium text-zinc-700">Business Context</span>
								<textarea
									rows={4}
									value={formData.businessContext}
									onFocus={() => handleFieldFocus('businessContext')}
									onChange={(event) => updateField('businessContext', event.target.value)}
									className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-interviewmate-blue focus:ring-2 focus:ring-interviewmate-blue/20"
									placeholder="Contexto del negocio"
								/>
							</label>

							<div className="flex flex-wrap items-center justify-end gap-3 pt-2">
								<button
									type="button"
									onClick={() => navigate('/dashboard')}
									className="rounded-md border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900"
								>
									Cancelar
								</button>
								<button
									type="submit"
									disabled={isSubmitting}
									className="rounded-md bg-zinc-900 px-7 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{isSubmitting ? 'Creando...' : 'Crear'}
								</button>
							</div>
						</form>
					</section>
				</main>
			</div>
		</div>
	)
}

export default TemplateCreationPage
