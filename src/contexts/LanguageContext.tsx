import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { es } from '../locales/es'
import { en } from '../locales/en'
import type { TranslationKeys } from '../locales/es'

type Language = 'ES' | 'EN'

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: TranslationKeys
}

const translations: Record<Language, TranslationKeys> = {
  ES: es,
  EN: en,
}

const LanguageContext = createContext<LanguageContextType | null>(null)

const LANGUAGE_STORAGE_KEY = 'interviewmate.language'

function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (stored === 'ES' || stored === 'EN') {
      return stored
    }
  } catch {
    // Ignore storage errors
  }
  return 'ES'
}

function storeLanguage(lang: Language) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
  } catch {
    // Ignore storage errors
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage)

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    storeLanguage(lang)
  }

  const t = translations[language]

  useEffect(() => {
    // Update HTML lang attribute
    document.documentElement.lang = language.toLowerCase()
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Utility hook to get only translations
export function useTranslation() {
  const { t } = useLanguage()
  return t
}
