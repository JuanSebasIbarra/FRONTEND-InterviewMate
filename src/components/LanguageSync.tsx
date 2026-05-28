import { useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getProfile } from '../services/profileService'

/**
 * Component that synchronizes the user's language preference from their profile
 * with the global language context.
 */
export function LanguageSync() {
  const { setLanguage } = useLanguage()

  useEffect(() => {
    const syncLanguageFromProfile = async () => {
      try {
        const profile = await getProfile()
        if (profile.language && (profile.language === 'ES' || profile.language === 'EN')) {
          setLanguage(profile.language)
        }
      } catch {
        // Ignore errors - user might not be authenticated yet
        // The language will default to localStorage or 'ES'
      }
    }

    void syncLanguageFromProfile()
  }, [setLanguage])

  return null
}
