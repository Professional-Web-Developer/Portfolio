import './globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ subsets: ['latin'], variable: '--inter' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--mono' })

const siteUrl = 'https://kavin-pasupathy.vercel.app'
const title = 'Kavin Pasupathy | Full-Stack & AI Agent Engineer'
const description =
  'Software Engineer at Belsterns Technologies building full-stack products with Next.js and PostgreSQL, and AI-agent workflows with Claude. Claude Certified Architect – Foundations.'

export const metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: 'Kavin Pasupathy Portfolio',
  authors: [{ name: 'Kavin Pasupathy', url: siteUrl }],
  keywords: [
    'Kavin Pasupathy',
    'Software Engineer',
    'Full-Stack Developer',
    'AI Agents',
    'Agentic AI',
    'Next.js',
    'Claude',
    'PostgreSQL',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Kavin Pasupathy',
    title,
    description,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: { index: true, follow: true },
}

// Structured data so search engines understand who this page is about.
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Kavin Pasupathy',
  url: siteUrl,
  jobTitle: 'Software Engineer',
  description,
  worksFor: { '@type': 'Organization', name: 'Belsterns Technologies' },
  alumniOf: [
    { '@type': 'CollegeOrUniversity', name: 'Kongu Engineering College' },
    { '@type': 'CollegeOrUniversity', name: 'Government Arts and Science College, Thittamalai' },
  ],
  knowsAbout: ['Next.js', 'React', 'Node.js', 'PostgreSQL', 'MongoDB', 'AI Agents', 'Agentic Workflows', 'Claude API', 'Docker'],
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    name: 'Claude Certified Architect – Foundations',
    url: 'https://www.credly.com/badges/6cd276b2-03bc-44cf-98b6-950d17dbc8e3',
  },
  sameAs: [
    'https://github.com/Professional-Web-Developer',
    'https://www.linkedin.com/in/kavin-pasupathy-839010289/',
    'https://leetcode.com/KavinPasupathy',
    'https://www.producthunt.com/@kavin_pasupathy',
  ],
}

// Runs before first paint so the saved / system theme applies with no flash.
const themeScript = `try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','dark')}`

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body style={{ fontFamily: 'var(--inter), sans-serif' }}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
