import './globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--inter' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--mono' })

export const metadata = {
  title: 'Kavin Pasupathy | Software Engineer at Belsterns Technologies',
  description: 'Portfolio of Kavin Pasupathy, a Software Engineer based in India.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable}`} style={{ fontFamily: 'var(--inter), sans-serif' }}>{children}</body>
    </html>
  )
}
