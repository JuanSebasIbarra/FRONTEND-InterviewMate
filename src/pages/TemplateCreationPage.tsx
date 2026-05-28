import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTemplate } from '../services/templateService'
import type { CreateInterviewTemplateRequest, InterviewType } from '../models/interview'
import { useLanguage, useTranslation } from '../contexts/LanguageContext'

type FieldKey =
	| 'enterprise'
	| 'type'
	| 'position'
	| 'workingArea'
	| 'description'
	| 'requirements'
	| 'goals'
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

const DEFAULT_FORM = {
	enterprise: '',
	type: 'TECHNICAL' as InterviewType,
	position: '',
	workingArea: '',
	description: '',
	requirements: '',
	goals: '',
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
	const t = useTranslation()
	const { language } = useLanguage()

	// Map application language to speech recognition locale
	const speechLang = language === 'EN' ? 'en-US' : 'es-ES'

	const getFieldLabel = (field: FieldKey): string => {
		const labels: Record<FieldKey, string> = {
			enterprise: t.templateCreation.fieldEnterprise,
			type: t.templateCreation.fieldType,
			position: t.templateCreation.fieldPosition,
			workingArea: t.templateCreation.fieldWorkingArea,
			description: t.templateCreation.fieldDescription,
			requirements: t.templateCreation.fieldRequirements,
			goals: t.templateCreation.fieldGoals,
			businessContext: t.templateCreation.fieldBusinessContext,
		}
		return labels[field]
	}

	const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
	const activeFieldRef = useRef<FieldKey>('enterprise')
	const [activeField, setActiveField] = useState<FieldKey>('enterprise')
	const [isListening, setIsListening] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [statusMessage, setStatusMessage] = useState('')
	const [errorMessage, setErrorMessage] = useState('')
	const [formData, setFormData] = useState(DEFAULT_FORM)

	useEffect(() => {
		setStatusMessage(t.templateCreation.selectFieldPrompt)
	}, [t])

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
		recognition.lang = speechLang
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

			setStatusMessage(`${t.templateCreation.dictationApplied} ${getFieldLabel(currentField)}.`)
		}

		recognition.onerror = () => {
			setIsListening(false)
			setErrorMessage(t.templateCreation.speechError)
			setStatusMessage(t.templateCreation.speechStopped)
		}

		recognition.onend = () => {
			setIsListening(false)
			setStatusMessage(t.templateCreation.speechStopped)
		}

		recognitionRef.current = recognition

		return () => {
			recognition.stop()
			recognitionRef.current = null
		}
	}, [t, speechLang])

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
			setErrorMessage(t.templateCreation.browserSpeechNotSupported)
			return
		}

		try {
			recognitionRef.current.start()
			setIsListening(true)
			setStatusMessage(`${t.templateCreation.listening} ${getFieldLabel(activeFieldRef.current)}...`)
		} catch {
			setErrorMessage(t.templateCreation.startError)
		}
	}

	const stopListening = () => {
		recognitionRef.current?.stop()
		setIsListening(false)
		setStatusMessage(t.templateCreation.speechPaused)
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
				goals: formData.goals.trim() || undefined,
				businessContext: formData.businessContext.trim() || undefined,
			}

			const createdTemplate = await createTemplate(payload)

			if (!createdTemplate?.id) {
				throw new Error(t.templateCreation.templateCreatedNoId)
			}

			navigate(`/sessions/${createdTemplate.id}`)
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : t.templateCreation.createError)
		} finally {
			setIsSubmitting(false)
		}
	}

	const selectedFieldLabel = getFieldLabel(activeField)

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
						{t.templateCreation.backButton}
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
								{t.templateCreation.dictation}
							</h2>
							<p className="mt-1 text-sm text-zinc-600">
								{speechSupported
								? `${t.templateCreation.dictationHelp} ${selectedFieldLabel.toLowerCase()}.`
									: t.templateCreation.browserNotSupported}
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
									{t.templateCreation.startButton}
								</button>
								<button
									type="button"
									onClick={stopListening}
									disabled={!isListening}
									className="rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{t.templateCreation.stopButton}
								</button>
							</div>
						</div>

						<div className="mt-4 rounded-md border border-zinc-200 bg-white px-4 py-4">
							<p className="text-xs uppercase tracking-widest text-zinc-500">{t.templateCreation.activeField}</p>
							<p className="mt-2 text-base font-semibold text-zinc-900">{selectedFieldLabel}</p>
							<p className="mt-2 text-xs text-zinc-500">
								{t.templateCreation.activeFieldHelp}
							</p>
						</div>
					</div>
				</aside>

				<main className="flex min-w-0 flex-1">
					<section className="w-full overflow-y-auto p-5 sm:p-8 lg:p-10">
						<header className="mb-8 border-b border-zinc-200 pb-5">
							<p className="text-xs uppercase tracking-[0.28em] text-zinc-500">{t.templateCreation.formLabel}</p>
							<h1 className="mt-2 font-serif text-4xl font-normal tracking-[-0.03em] text-zinc-900 sm:text-5xl">
								{t.templateCreation.title}
							</h1>
							<p className="mt-3 max-w-2xl text-sm text-zinc-600">
								{t.templateCreation.subtitle}
							</p>
						</header>

						<form className="space-y-5" onSubmit={handleSubmit}>
							<div className="grid gap-4 md:grid-cols-2">
								<label className="block">
								<span className="mb-2 block text-sm font-medium text-zinc-700">{getFieldLabel('enterprise')}</span>
								<input
									type="text"
									value={formData.enterprise}
									onFocus={() => handleFieldFocus('enterprise')}
									onChange={(event) => updateField('enterprise', event.target.value)}
									className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-interviewmate-blue focus:ring-2 focus:ring-interviewmate-blue/20"
									placeholder={t.templateCreation.placeholderEnterprise}
									/>
								</label>

								<label className="block">
							<span className="mb-2 block text-sm font-medium text-zinc-700">{getFieldLabel('type')}</span>
									<select
										value={formData.type}
										onFocus={() => handleFieldFocus('type')}
										onChange={(event) => updateField('type', event.target.value as InterviewType)}
										className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-interviewmate-blue focus:ring-2 focus:ring-interviewmate-blue/20"
									>
									<option value="TECHNICAL">{t.templateCreation.interviewTypeTechnical}</option>
									<option value="HR">{t.templateCreation.interviewTypeHR}</option>
									<option value="PSYCHOLOGICAL">{t.templateCreation.interviewTypePsychological}</option>
									</select>
								</label>
							</div>

							<label className="block">
					<span className="mb-2 block text-sm font-medium text-zinc-700">{getFieldLabel('position')}</span>
					<input
						type="text"
						value={formData.position}
						onFocus={() => handleFieldFocus('position')}
						onChange={(event) => updateField('position', event.target.value)}
						className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-interviewmate-blue focus:ring-2 focus:ring-interviewmate-blue/20"
						placeholder={t.templateCreation.placeholderPosition}
				/>
			</label>

			<label className="block">
				<span className="mb-2 block text-sm font-medium text-zinc-700">{t.templateCreation.fieldWorkingArea}</span>
				<input
					type="text"
					value={formData.workingArea}
					onFocus={() => handleFieldFocus('workingArea')}
					onChange={(event) => updateField('workingArea', event.target.value)}
					className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-interviewmate-blue focus:ring-2 focus:ring-interviewmate-blue/20"
					placeholder={t.templateCreation.placeholderWorkingArea}
				/>
			</label>

		<label className="block">
			<span className="mb-2 block text-sm font-medium text-zinc-700">{t.templateCreation.fieldDescription}</span>
			<textarea
				rows={6}
				value={formData.description}
				onFocus={() => handleFieldFocus('description')}
				onChange={(event) => updateField('description', event.target.value)}
				className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-interviewmate-blue focus:ring-2 focus:ring-interviewmate-blue/20"
				placeholder={t.templateCreation.placeholderDescription}
			/>
		</label>

		<label className="block">
				<span className="mb-2 block text-sm font-medium text-zinc-700">{t.templateCreation.fieldRequirements}</span>
				<textarea
					rows={4}
					value={formData.requirements}
					onFocus={() => handleFieldFocus('requirements')}
					onChange={(event) => updateField('requirements', event.target.value)}
					className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-interviewmate-blue focus:ring-2 focus:ring-interviewmate-blue/20"
					placeholder={t.templateCreation.placeholderRequirements}
				/>
			</label>
							<label className="block">
				<span className="mb-2 block text-sm font-medium text-zinc-700">{t.templateCreation.fieldGoals}</span>
				<textarea
					rows={4}
					value={formData.goals}
					onFocus={() => handleFieldFocus('goals')}
					onChange={(event) => updateField('goals', event.target.value)}
					className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-interviewmate-blue focus:ring-2 focus:ring-interviewmate-blue/20"
					placeholder={t.templateCreation.placeholderGoals}
				/>
			</label>
			<label className="block">
				<span className="mb-2 block text-sm font-medium text-zinc-700">{t.templateCreation.fieldBusinessContext}</span>
				<textarea
					rows={4}
					value={formData.businessContext}
					onFocus={() => handleFieldFocus('businessContext')}
					onChange={(event) => updateField('businessContext', event.target.value)}
					className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-interviewmate-blue focus:ring-2 focus:ring-interviewmate-blue/20"
					placeholder={t.templateCreation.placeholderBusinessContext}
				/>
			</label>

			<div className="flex flex-wrap items-center justify-end gap-3 pt-2">
				<button
					type="button"
					onClick={() => navigate('/dashboard')}
					className="rounded-md border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900"
				>
					{t.templateCreation.cancelButton}
				</button>
								<button
									type="submit"
									disabled={isSubmitting}
									className="rounded-md bg-zinc-900 px-7 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{isSubmitting ? t.templateCreation.creating : t.templateCreation.createButton}
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
