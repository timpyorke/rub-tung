"use client"

import { useSafeTranslation } from '@/components/safe-translation'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  const { t } = useSafeTranslation()

  return (
    <footer className="mt-auto bg-background">
      <div className="container mx-auto px-4 py-6">
        <Separator className="mb-4" />
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('footer.madeWith')}
          </p>
        </div>
      </div>
    </footer>
  )
}