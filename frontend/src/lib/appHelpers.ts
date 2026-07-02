import { toast } from 'sonner'
import { useNotificationStore } from '@/store/notificationStore'
import type { Notification } from '@/types'

export type AppTheme = 'dark' | 'glass' | 'system'

const THEME_STORAGE_KEY = 'hometown-hub-theme'

export function getStoredTheme(): AppTheme {
  if (typeof window === 'undefined') return 'dark'
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return stored === 'glass' || stored === 'dark' || stored === 'system' ? stored : 'dark'
}

export function applyAppTheme(theme: AppTheme) {
  if (typeof window === 'undefined') return
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = theme === 'system'
    ? (prefersDark ? 'dark' : 'glass')
    : theme

  document.documentElement.classList.remove('dark', 'glass')
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  document.documentElement.classList.toggle('glass', resolved === 'glass')
  document.documentElement.style.colorScheme = 'dark'
  window.localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export function triggerAppNotification(title: string, body: string) {
  const notification: Notification = {
    id: crypto.randomUUID(),
    type: 'SYSTEM',
    title,
    body,
    isRead: false,
    receiverId: 'current-user',
    createdAt: new Date().toISOString(),
  }

  useNotificationStore.getState().addNotification(notification)
  toast.success(title, { description: body })
}

export function openExternalLink(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function downloadTextAsPdf(fileName: string, content: string) {
  const lines = content.split('\n')
  const escapePdfText = (value: string) => value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')

  const objects: string[] = []
  const streamLines = lines.map((line, index) => `BT /F1 12 Tf 50 ${760 - index * 14} Td (${escapePdfText(line)}) Tj ET`).join('\n')
  const stream = `<< /Length 0 >> stream\n${streamLines}\nendstream`

  const contentObjectId = 4
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`)
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`)
  objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentObjectId} 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj`)
  objects.push(`4 0 obj\n${stream}\nendobj`)
  objects.push(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`)

  const pdf = ['%PDF-1.4']
  const offsets: number[] = []
  let pdfBody = ''

  objects.forEach((obj) => {
    offsets.push(Buffer.byteLength(pdfBody))
    pdfBody += `${obj}\n`
  })

  const xrefOffset = Buffer.byteLength(pdf.join('\n'))
  pdf.push(`xref\n0 ${objects.length + 1}`)
  pdf.push('0000000000 65535 f ')
  offsets.forEach((offset) => pdf.push(`${String(offset).padStart(10, '0')} 00000 n `))
  pdf.push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`)

  const blob = new Blob([pdf.join('\n')], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
