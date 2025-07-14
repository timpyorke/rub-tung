import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rub Tung',
  description: 'Generate QR codes for Thai PromptPay payments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
