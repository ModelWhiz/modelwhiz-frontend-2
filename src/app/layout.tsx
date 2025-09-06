// src/app/layout.tsx

import ChakraWrapper from '@/contexts/ChakraProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import type { Metadata } from 'next' // Import Metadata type explicitly
import dynamic from 'next/dynamic'

// Lazy load performance monitor for development
const PerformanceMonitor = dynamic(() => import('@/components/PerformanceMonitor'), {
  ssr: false
})

// Dynamically import the performance optimizer to avoid SSR issues
const PerformanceOptimizer = dynamic(() => import('@/components/PerformanceOptimizer'), {
  ssr: false
});

// --- IMPROVED METADATA CONFIGURATION ---
export const metadata: Metadata = {
  // Replace with your actual production domain when deploying
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'), 
  title: {
    default: 'ModelWhiz - ML Model Dashboard',
    template: '%s | ModelWhiz',
  },
  description: 'Track, compare, and optimize your machine learning models with ModelWhiz. Get insights, manage evaluations, and improve your AI solutions.',
  applicationName: 'ModelWhiz',
  keywords: ['ML', 'Machine Learning', 'AI', 'Model Dashboard', 'Model Evaluation', 'Data Science', 'Performance Metrics'],
  authors: [{ name: 'ModelWhiz Team' }],
  creator: 'ModelWhiz Team',
  publisher: 'ModelWhiz Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'ModelWhiz - ML Model Dashboard',
    description: 'Track, compare, and optimize your machine learning models with ModelWhiz.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: 'ModelWhiz',
    images: [
      {
        url: '/next.svg', // Using existing Next.js logo as fallback
        width: 1200,
        height: 630,
        alt: 'ModelWhiz ML Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ModelWhiz - ML Model Dashboard',
    description: 'Track, compare, and optimize your machine learning models with ModelWhiz.',
    creator: '@modelwhiz', // Update with actual handle
    images: ['/next.svg'], // Using existing Next.js logo as fallback
  },
  // Add PWA manifest link
  manifest: '/manifest.json', 
  // Add favicon and other icons (ensure these files are in your public/ directory)
  icons: {
    icon: '/favicon.ico',
    // Additional icons can be added when available
  },
};
// --- END IMPROVED METADATA CONFIGURATION ---

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <ChakraWrapper>
            <AuthProvider>
              {children}
              <PerformanceOptimizer />
              <PerformanceMonitor />
            </AuthProvider>
          </ChakraWrapper>
        </ErrorBoundary>
      </body>
    </html>
  )
}