import { useEffect, useRef } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getProfile } from '../services/profileService'

/**
 * Component that synchronizes the user's language preference from their profile
 * with the global language context.
 */
export function LanguageSync() {
  const { setLanguage } = useLanguage()
  const hasSync = useRef(false)

  useEffect(() => {
    // Only sync once per app lifecycle
    if (hasSync.current) return

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

    hasSync.current = true
    void syncLanguageFromProfile()
  }, [setLanguage])

  return null
}
