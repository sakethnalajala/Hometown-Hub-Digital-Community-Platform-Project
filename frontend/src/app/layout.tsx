import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: 'Hometown Hub – Digital Community Platform',
    template: '%s | Hometown Hub',
  },
  description:
    'Connect with your hometown community. Share updates, organize events, and stay connected with people from your city or village.',
  keywords: ['community', 'hometown', 'local', 'social', 'events', 'announcements'],
  authors: [{ name: 'Hometown Hub' }],
  creator: 'Hometown Hub',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://hometown-hub-virid.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Hometown Hub',
    title: 'Hometown Hub – Digital Community Platform',
    description: 'Connect with your hometown community.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hometown Hub',
    description: 'Connect with your hometown community.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#6366F1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable)} data-scroll-behavior="smooth">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
