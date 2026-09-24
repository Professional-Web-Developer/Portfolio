import Link from 'next/link'

export const metadata = {
  title: 'Page not found | Kavin Pasupathy',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', margin: 0 }}>404</p>
      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.03em' }}>This page doesn&apos;t exist</h1>
      <p style={{ color: 'var(--muted)', margin: 0, maxWidth: 420 }}>
        The link may be broken or the page may have moved. The portfolio is one page, so everything is on the home screen.
      </p>
      <Link
        href="/"
        style={{
          marginTop: 8,
          padding: '12px 24px',
          borderRadius: 999,
          fontWeight: 600,
          background: 'var(--primary)',
          color: 'var(--on-primary)',
        }}
      >
        Back to home
      </Link>
    </main>
  )
}
