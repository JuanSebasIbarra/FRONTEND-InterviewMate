import type { TranslationKeys } from './es'

export const en: TranslationKeys = {
  // Common
  common: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    continue: 'Continue',
    close: 'Close',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    error: 'Error',
    success: 'Success',
  },

  // Navigation
  nav: {
    dashboard: 'Dashboard',
    history: 'History',
    settings: 'Settings',
    logout: 'Logout',
  },

  // Auth
  auth: {
    login: 'Log in',
    register: 'Sign up',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
    forgotPassword: 'Forgot password?',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    loginWithGoogle: 'Sign in with Google',
    or: 'or',
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome',
    recentTemplates: 'Recent templates',
    statistics: 'Statistics',
    newTemplate: 'New template',
    viewAll: 'View all',
    noTemplates: 'You have no templates registered in your history yet.',
    studyCompleted: 'Study completed',
    interviewsDone: 'Interviews done',
    signInAndPractice: 'Practice days',
  },

  // Templates
  templates: {
    title: 'Template history',
    subtitle: 'All your templates sorted by recent activity so you can resume any without losing context.',
    position: 'Position',
    enterprise: 'Company',
    lastActivity: 'Last activity',
    createNew: 'Create new template',
    deleteConfirm: 'Delete template?',
    deleteMessage: 'This action will delete {name} from your list. This action cannot be undone.',
    deleting: 'Deleting...',
  },

  // Sessions
  sessions: {
    title: 'Session panel',
    studySession: 'Study session',
    interview: 'Interview',
    startStudy: 'Study',
    startInterview: 'Interview',
    status: {
      pending: 'PENDING',
      completed: 'COMPLETED',
      abandoned: 'ABANDONED',
    },
    noStudySessions: 'No study sessions registered for this template.',
    noInterviewSessions: 'No sessions registered for this template.',
    continueSession: 'Continue session',
    deleteSession: 'Delete session',
    sessionCreatedOn: 'Created on',
    whatToDo: 'What would you like to do with this session?',
  },

  // Study
  study: {
    selectTopic: 'Select a study topic',
    topicPlaceholder: 'E.g. Search algorithms',
    generating: 'AI is generating your questions',
    analyzingTopic: 'Analyzing the topic and preparing a personalized session...',
    difficultyAdapted: 'Adapted difficulty',
    uniqueQuestions: 'Unique questions',
    personalizedForYou: 'Personalized for you',
  },

  // Interview
  interview: {
    generating: 'AI is generating your interview questions',
    analyzingTemplate: 'Analyzing the template and preparing personalized questions...',
    contextualQuestions: 'Contextual questions',
    aiEvaluation: 'AI evaluation',
  },

  // Settings
  settings: {
    title: 'Settings',
    subtitle: 'Manage your personal information and security from a single panel',
    personalInfo: 'Personal information',
    personalInfoSubtitle: 'Manage your photo, names and professional description.',
    security: 'Security',
    securitySubtitle: 'Update your username, linked email and password.',
    profilePicture: 'Profile picture',
    firstName: 'First name',
    firstNamePlaceholder: 'E.g. Sebastian',
    lastName: 'Last name',
    lastNamePlaceholder: 'E.g. Ibarra',
    professionalProfile: 'Professional profile',
    professionalProfilePlaceholder: 'Describe your experience, stack and professional goals',
    interviewLanguage: 'Interview language',
    spanish: 'Español',
    english: 'English',
    savePersonalInfo: 'Save personal information',
    saving: 'Saving...',
    personalInfoUpdated: 'Personal information updated.',
    linkedEmail: 'Linked email',
    emailPlaceholder: 'email@example.com',
    newPassword: 'New password',
    newPasswordPlaceholder: 'Leave empty to not change',
    confirmNewPassword: 'Confirm password',
    confirmPasswordPlaceholder: 'Repeat new password',
    saveChanges: 'Save changes',
    securityUpdated: 'Security data updated successfully.',
  },

  // History
  history: {
    title: 'Template history',
    subtitle: 'All your templates sorted by recent activity so you can resume any without losing context.',
  },

  // Errors
  errors: {
    loadingProfile: 'Could not load profile.',
    loadingTemplates: 'Could not load templates.',
    loadingSessions: 'Could not load template information.',
    deletingTemplate: 'Could not delete template.',
    deletingSession: 'Could not delete session.',
    aiGenerationFailed: 'AI question generation failed. Please try again later.',
    generic: 'Could not complete the operation. Please try again.',
  },
}
