export const es = {
  // Common
  common: {
    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    continue: 'Continuar',
    close: 'Cerrar',
    confirm: 'Confirmar',
    back: 'Volver',
    next: 'Siguiente',
    error: 'Error',
    success: 'Éxito',
  },

  // Navigation
  nav: {
    dashboard: 'Panel principal',
    history: 'Historial',
    settings: 'Configuración',
    logout: 'Cerrar sesión',
  },

  // Auth
  auth: {
    login: 'Iniciar sesión',
    register: 'Registrarse',
    username: 'Usuario',
    email: 'Correo electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    dontHaveAccount: '¿No tienes cuenta?',
    alreadyHaveAccount: '¿Ya tienes cuenta?',
    loginWithGoogle: 'Iniciar sesión con Google',
    or: 'o',
  },

  // Dashboard
  dashboard: {
    title: 'Panel principal',
    welcome: 'Bienvenido',
    recentTemplates: 'Plantillas recientes',
    recentTemplatesSubtitle: 'Mostrando las tres plantillas con actividad mas reciente.',
    statistics: 'Estadísticas',
    statisticsUppercase: 'ESTADISTICAS',
    personalPerformance: 'Rendimiento personal',
    summary: 'Resumen',
    summaryDescription: 'Aqui tienes una explicacion simple de cada estadistica para entender tu avance rapido.',
    newTemplate: 'Nueva plantilla',
    newTemplateButton: 'Nueva plantilla',
    viewAll: 'Ver todo',
    noTemplates: 'Aun no tienes plantillas registradas en tu historial.',
    noTemplatesCreated: 'Aun no tienes plantillas creadas.',
    loadingTemplates: 'Cargando plantillas...',
    studyCompleted: 'Estudio completado',
    studySessionsCompleted: 'Sesiones de estudio completadas',
    studySessionsCompletedDescription: 'Aqui ves cuantas sesiones de estudio terminaste de principio a fin.',
    interviewsDone: 'Entrevistas realizadas',
    interviewsDoneDescription: 'Este numero te muestra cuantas entrevistas ya completaste en la plataforma.',
    signInAndPractice: 'Días de práctica',
    signInAndPracticeLabel: 'Inicios de sesion y practica',
    signInAndPracticeDescription: 'Este dato refleja los dias en los que entraste a tu cuenta para practicar.',
    defaultStatsDescription: 'Este valor resume tu actividad reciente en esta seccion.',
    barChart: 'Barras',
    pieChart: 'Pastel',
    historyUppercase: 'HISTORY',
    additionalTemplatesPlural: 'plantillas adicionales',
    additionalTemplatesSingular: 'plantilla adicional',
    viewHistory: 'Ver historial',
    lastActivity: 'Ultima actividad',
    open: 'Abrir',
    new: 'Nuevo',
    currentTotal: 'Total actual',
    beforeThisMetric: 'Antes de esta metrica',
    afterThisMetric: 'Despues de esta metrica',
    notApplicable: 'No aplica',
  },

  // Templates
  templates: {
    title: 'Historial de plantillas',
    subtitle: 'Todas tus plantillas ordenadas por actividad reciente para que retomes cualquiera sin perder contexto.',
    position: 'Puesto',
    enterprise: 'Empresa',
    lastActivity: 'Última actividad',
    createNew: 'Crear nueva plantilla',
    deleteConfirm: '¿Eliminar plantilla?',
    deleteMessage: 'Esta acción eliminará {name} de tu listado. Esta acción no se puede deshacer.',
    deleting: 'Eliminando...',
  },

  // Sessions
  sessions: {
    title: 'Panel de sesiones',
    studySession: 'Sesión de estudio',
    studySessionFull: 'Sesión de Estudio',
    interview: 'Entrevista',
    startStudy: 'Estudiar',
    startInterview: 'Entrevista',
    newSession: 'Nueva sesión',
    practiceAtYourPace: 'Practica a tu ritmo',
    simulateRealInterview: 'Simula una entrevista real',
    status: {
      pending: 'PENDIENTE',
      completed: 'COMPLETADO',
      abandoned: 'ABANDONADO',
    },
    noStudySessions: 'No hay sesiones de estudio registradas para esta plantilla.',
    noInterviewSessions: 'No hay sesiones registradas para esta plantilla.',
    continueSession: 'Continuar sesión',
    deleteSession: 'Eliminar sesión',
    sessionCreatedOn: 'Creada el',
    whatToDo: '¿Qué deseas hacer con esta sesión?',
  },

  // Study
  study: {
    selectTopic: 'Selecciona un tema de estudio',
    topicPlaceholder: 'Ej. Algoritmos de búsqueda',
    generating: 'La IA está generando tus preguntas',
    analyzingTopic: 'Analizando el tema y preparando una sesión personalizada...',
    difficultyAdapted: 'Dificultad adaptada',
    uniqueQuestions: 'Preguntas únicas',
    personalizedForYou: 'Personalizadas para ti',
  },

  // Interview
  interview: {
    generating: 'La IA está generando tus preguntas de entrevista',
    analyzingTemplate: 'Analizando la plantilla y preparando preguntas personalizadas...',
    contextualQuestions: 'Preguntas contextuales',
    aiEvaluation: 'Evaluación por IA',
  },

  // Settings
  settings: {
    title: 'Configuración',
    subtitle: 'Administra tu información personal y seguridad desde un único panel',
    personalInfo: 'Información personal',
    personalInfoSubtitle: 'Administra tu foto, nombres y descripción profesional.',
    security: 'Seguridad',
    securitySubtitle: 'Actualiza tu usuario, correo vinculado y contraseña.',
    profilePicture: 'Foto de perfil',
    firstName: 'Nombres',
    firstNamePlaceholder: 'Ej. Sebastián',
    lastName: 'Apellidos',
    lastNamePlaceholder: 'Ej. Ibarra',
    professionalProfile: 'Perfil profesional',
    professionalProfilePlaceholder: 'Describe tu experiencia, stack y objetivos profesionales',
    interviewLanguage: 'Idioma de las entrevistas',
    spanish: 'Español',
    english: 'English',
    savePersonalInfo: 'Guardar información personal',
    saving: 'Guardando...',
    personalInfoUpdated: 'Información personal actualizada.',
    linkedEmail: 'Correo vinculado',
    emailPlaceholder: 'correo@ejemplo.com',
    newPassword: 'Nueva contraseña',
    newPasswordPlaceholder: 'Dejar vacío para no cambiar',
    confirmNewPassword: 'Confirmar contraseña',
    confirmPasswordPlaceholder: 'Repetir nueva contraseña',
    saveChanges: 'Guardar cambios',
    securityUpdated: 'Datos de seguridad actualizados correctamente.',
  },

  // History
  history: {
    title: 'Historial de plantillas',
    subtitle: 'Todas tus plantillas ordenadas por actividad reciente para que retomes cualquiera sin perder contexto.',
  },

  // Errors
  errors: {
    loadingProfile: 'No se pudo cargar el perfil.',
    loadingTemplates: 'No se pudieron cargar las plantillas.',
    loadingSessions: 'No se pudo cargar la información de la plantilla.',
    deletingTemplate: 'No se pudo eliminar la plantilla.',
    deletingSession: 'No se pudo eliminar la sesión.',
    aiGenerationFailed: 'La generación de preguntas con IA falló. Por favor, inténtalo de nuevo más tarde.',
    generic: 'No se pudo completar la operación. Intenta nuevamente.',
  },
}

export type TranslationKeys = typeof es
