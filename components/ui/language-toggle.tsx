"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import { useSafeTranslation } from "@/components/safe-translation"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"

export function LanguageToggle() {
  const { t } = useSafeTranslation()
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'th' : 'en'
    i18n.changeLanguage(newLanguage)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="h-10 w-10"
      title={t('actions.toggleLanguage')}
    >
      <Languages className="h-4 w-4" />
      <span className="sr-only">{t('actions.toggleLanguage')}</span>
    </Button>
  )
}