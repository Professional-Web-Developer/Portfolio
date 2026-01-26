import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Kavin Pasupathy | Software Engineer at Belsterns Technologies',
  description: 'Portfolio of Kavin Pasupathy, a Software Engineer based in India.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
