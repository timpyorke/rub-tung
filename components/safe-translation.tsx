"use client"

import { useIsClient } from '@/hooks/useIsClient'
import { useTranslation } from 'react-i18next'

interface SafeTranslationProps {
  i18nKey: string
  fallback?: string
  values?: Record<string, string | number>
}

export function SafeTranslation({ i18nKey, fallback, values }: SafeTranslationProps) {
  const isClient = useIsClient()
  const { t, ready } = useTranslation()

  // Return fallback during SSR or before i18n is ready
  if (!isClient || !ready) {
    return <>{fallback || i18nKey}</>
  }

  return <>{t(i18nKey, values)}</>
}

// Hook version for inline usage
export function useSafeTranslation() {
  const isClient = useIsClient()
  const { t, ready } = useTranslation()

  const safeT = (key: string, options?: any): string => {
    if (!isClient || !ready) {
      return key
    }
    const result = t(key, options)
    return typeof result === 'string' ? result : key
  }

  return { t: safeT, ready: isClient && ready }
}