import './globals.css'
import { Inter, Orbitron } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--inter' })
const orbitron = Orbitron({ subsets: ['latin'], variable: '--orbitron', weight: ['400', '700', '900'] })

export const metadata = {
  title: 'Kavin Pasupathy | Software Engineer at Belsterns Technologies',
  description: 'Portfolio of Kavin Pasupathy, a Software Engineer based in India.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${orbitron.variable}`} style={{ fontFamily: 'var(--inter), sans-serif' }}>{children}</body>
    </html>
  )
}
