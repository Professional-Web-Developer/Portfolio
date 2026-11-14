'use client';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Car, LayoutList, X } from 'lucide-react';
import { readViewChoice, rememberViewChoice } from '../lib/viewChoice';
import './ExploreChooser.css';

/**
 * First-visit "How would you like to explore?" card, bottom-right. It is a
 * floating card, not a modal: the page stays usable and it never redirects.
 * Rendered only after mount and only when no choice is stored, so the server
 * HTML (what search engines index) does not contain it, there is no hydration
 * mismatch, and being position: fixed it causes no layout shift.
 */
export default function ExploreChooser() {
    const [open, setOpen] = useState(false);
    const cardRef = useRef(null);

    useEffect(() => {
        if (!readViewChoice()) setOpen(true);
    }, []);

    if (!open) return null;

    const close = (choice) => {
        rememberViewChoice(choice);
        // If focus was inside the card, keep it on the page rather than losing it.
        if (cardRef.current?.contains(document.activeElement)) {
            document.getElementById('main')?.focus({ preventScroll: true });
        }
        setOpen(false);
    };

    return (
        <aside
            ref={cardRef}
            className="explore-chooser"
            aria-labelledby="explore-chooser-title"
            onKeyDown={(event) => {
                if (event.key === 'Escape') close('dismissed');
            }}
        >
            <button type="button" className="explore-chooser__close" onClick={() => close('dismissed')} aria-label="Close">
                <X size={16} aria-hidden="true" />
            </button>
            <h2 id="explore-chooser-title" className="explore-chooser__title">
                How would you like to explore?
            </h2>
            <p className="explore-chooser__hint">You can switch any time from the menu.</p>
            <div className="explore-chooser__options">
                <button type="button" className="explore-chooser__opt" onClick={() => close('classic')}>
                    <span className="explore-chooser__icon" aria-hidden="true">
                        <LayoutList size={18} />
                    </span>
                    <span className="explore-chooser__text">
                        <strong>Classic site</strong>
                        <span>Scroll the normal portfolio</span>
                    </span>
                </button>
                <a href="/city" className="explore-chooser__opt explore-chooser__opt--city" onClick={() => rememberViewChoice('city')}>
                    <span className="explore-chooser__icon" aria-hidden="true">
                        <Car size={18} />
                    </span>
                    <span className="explore-chooser__text">
                        <strong>Career City</strong>
                        <span>Drive a little car through a 3D city of my resume</span>
                    </span>
                    <ArrowRight className="explore-chooser__go" size={16} aria-hidden="true" />
                </a>
            </div>
        </aside>
    );
}
