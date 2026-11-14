'use client';
import React from 'react';
import { Car, LayoutList } from 'lucide-react';
import { rememberViewChoice } from '../lib/viewChoice';
import './ViewSwitch.css';

const OPTIONS = [
    { id: 'classic', label: 'Classic', href: '/', title: 'The normal, scrolling portfolio', Icon: LayoutList },
    { id: 'city', label: 'City', href: '/city', title: 'Career City: drive through the resume in 3D', Icon: Car },
];

/**
 * Two-option switch between the classic site and Career City. The current
 * view is marked with aria-current and is not a link. Plain <a> on purpose:
 * next/link would prefetch /city (and its three.js chunk) from the home page.
 */
export default function ViewSwitch({ current, className = '', onNavigate }) {
    return (
        <div className={`view-switch ${className}`} role="group" aria-label="Switch view">
            {OPTIONS.map(({ id, label, href, title, Icon }) =>
                id === current ? (
                    <span key={id} className="view-switch__opt is-current" aria-current="page" title={title}>
                        <Icon size={15} aria-hidden="true" />
                        {label}
                    </span>
                ) : (
                    <a
                        key={id}
                        href={href}
                        className="view-switch__opt"
                        title={title}
                        onClick={() => {
                            rememberViewChoice(id);
                            onNavigate?.();
                        }}
                    >
                        <Icon size={15} aria-hidden="true" />
                        {label}
                    </a>
                ),
            )}
        </div>
    );
}
