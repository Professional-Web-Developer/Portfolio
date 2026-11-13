'use client';
import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Header.css';

// Order matches the section order in src/app/page.js.
const navLinks = [
    { name: 'About', to: 'about' },
    { name: 'Experience', to: 'experience' },
    { name: 'Projects', to: 'projects' },
    { name: 'Skills', to: 'skills' },
    { name: 'Education', to: 'education' },
    { name: 'Contact', to: 'contact' },
];

function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [theme, setTheme] = useState('dark');
    const [active, setActive] = useState('about');

    // Header state plus scroll spy: the active section is the last one whose top has
    // passed a line a quarter of the way down the viewport (the last section at page end).
    useEffect(() => {
        let frame = 0;
        const update = () => {
            frame = 0;
            setScrolled(window.scrollY > 24);
            const line = window.innerHeight * 0.25;
            const doc = document.documentElement;
            let current = navLinks[0].to;
            if (window.scrollY > 0 && window.innerHeight + window.scrollY >= doc.scrollHeight - 2) {
                current = navLinks[navLinks.length - 1].to;
            } else {
                navLinks.forEach((link) => {
                    const el = document.getElementById(link.to);
                    if (el && el.getBoundingClientRect().top <= line) current = link.to;
                });
            }
            setActive(current);
        };
        const handleScroll = () => {
            if (!frame) frame = window.requestAnimationFrame(update);
        };
        update();
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
            if (frame) window.cancelAnimationFrame(frame);
        };
    }, []);

    // The inline script in layout.js has already set data-theme; sync React to it.
    useEffect(() => {
        setTheme(document.documentElement.getAttribute('data-theme') || 'dark');
    }, []);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        try {
            localStorage.setItem('theme', next);
        } catch (e) {
            /* storage unavailable: theme still applies for this visit */
        }
    };

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <div className="header__content">
                <a href="#about" className="header__logo" aria-label="Kavin Pasupathy, back to top">
                    <span className="header__monogram" aria-hidden="true">KP</span>
                    <span className="header__name">Kavin Pasupathy</span>
                </a>

                <nav className="header__nav" aria-label="Primary">
                    {navLinks.map((link) => (
                        <a
                            key={link.to}
                            href={`#${link.to}`}
                            className={`nav-link ${active === link.to ? 'active' : ''}`}
                            aria-current={active === link.to ? 'location' : undefined}
                        >
                            {link.name}
                        </a>
                    ))}
                </nav>

                <div className="header__actions">
                    <button
                        type="button"
                        className="icon-btn"
                        onClick={toggleTheme}
                        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <a
                        href="/assets/KAVIN_PASUPATHY_RESUME.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-resume"
                    >
                        Resume
                    </a>
                    <button
                        type="button"
                        className="icon-btn header__mobile-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="mobile-menu"
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.nav
                        id="mobile-menu"
                        className="mobile-menu"
                        aria-label="Primary mobile"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {navLinks.map((link) => (
                            <a
                                key={link.to}
                                href={`#${link.to}`}
                                className={`mobile-nav-link ${active === link.to ? 'active' : ''}`}
                                aria-current={active === link.to ? 'location' : undefined}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}

export default Header;
