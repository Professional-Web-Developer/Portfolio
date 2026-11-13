import './Footer.css';

const links = [
    { name: 'GitHub', href: 'https://github.com/Professional-Web-Developer' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/kavin-pasupathy-839010289/' },
    { name: 'Resume', href: '/assets/KAVIN_PASUPATHY_RESUME.pdf' },
];

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="site-footer__content">
                <p>© {new Date().getFullYear()} Kavin Pasupathy. Built with Next.js and React.</p>
                <nav className="site-footer__links" aria-label="Footer">
                    {links.map((link) => (
                        <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer">
                            {link.name}
                        </a>
                    ))}
                </nav>
            </div>
        </footer>
    );
}
