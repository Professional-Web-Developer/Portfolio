'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { MessageCircle } from 'lucide-react';
import './Guide.css';

// The chat panel (and the AI SDK client it uses) is its own chunk. Nothing of
// it is downloaded until the visitor shows interest in the launcher.
const loadPanel = () => import('./ChatPanel');
const ChatPanel = dynamic(loadPanel, {
    ssr: false,
    loading: () => (
        <div className="guide-panel guide-panel--loading" role="status">
            Opening the guide…
        </div>
    ),
});

/**
 * Floating "Ask about Kavin" button, bottom-right. It must be rendered after
 * <BackToTop /> in the page: when that button is showing, Guide.css moves the
 * launcher to its left so the two never overlap.
 */
export default function Guide() {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const launcherRef = useRef(null);
    const wasOpen = useRef(false);

    const show = useCallback(() => {
        setMounted(true);
        setOpen(true);
    }, []);
    const hide = useCallback(() => setOpen(false), []);

    // Give focus back to the launcher whenever the panel closes.
    useEffect(() => {
        if (wasOpen.current && !open) launcherRef.current?.focus();
        wasOpen.current = open;
    }, [open]);

    return (
        <>
            <button
                ref={launcherRef}
                type="button"
                className={`guide-launcher${open ? ' is-open' : ''}`}
                aria-expanded={open}
                aria-controls={mounted ? 'guide-panel' : undefined}
                onClick={() => (open ? hide() : show())}
                onPointerEnter={loadPanel}
                onFocus={loadPanel}
            >
                <MessageCircle size={18} aria-hidden="true" />
                <span>{open ? 'Close guide' : 'Ask about Kavin'}</span>
            </button>
            {mounted && <ChatPanel open={open} onClose={hide} />}
        </>
    );
}
