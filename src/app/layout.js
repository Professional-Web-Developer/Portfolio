import './globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--inter' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--mono' })

export const metadata = {
  title: 'Kavin Pasupathy | Software Engineer at Belsterns Technologies',
  description: 'Portfolio of Kavin Pasupathy, a Software Engineer based in India.',
}

// Runs before first paint so the saved / system theme applies with no flash.
const themeScript = `try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','dark')}`

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body style={{ fontFamily: 'var(--inter), sans-serif' }}>{children}</body>
    </html>
  )
}
