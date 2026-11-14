'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { ArrowUpRight, Maximize2, Minimize2, RotateCcw, Send, Square, X } from 'lucide-react';
import { destinations, DESTINATION_IDS } from '../../data/profile.js';
import { GREETING, LIMITS, SUGGESTIONS, TOUR_END, TOUR_NEXT } from '../../lib/guide/config.js';
import RichText from './RichText';

const TOUR_STOP = /Stop (\d+) of (\d+)/;
const COMPACT_QUERY = '(max-width: 560px)';

const textOf = (message) =>
    message.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join('');

// Only the visible conversation text goes to the server, and only the recent
// part of it. The server enforces the same limits again; this just keeps
// requests small.
const transport = new DefaultChatTransport({
    api: '/api/chat',
    prepareSendMessagesRequest: ({ messages }) => ({
        body: {
            messages: messages
                .map((m) => ({ role: m.role, parts: [{ type: 'text', text: textOf(m) }] }))
                .filter((m) => m.parts[0].text.trim())
                .slice(-LIMITS.maxTurns),
        },
    }),
});

function friendlyError(error) {
    if (!error) return null;
    try {
        const body = JSON.parse(error.responseBody ?? error.message);
        if (body?.error?.message) return body.error.message;
    } catch {
        /* not one of our JSON errors */
    }
    if (error.statusCode === 429) return 'You are sending messages very quickly. Please wait a moment and try again.';
    if (error.statusCode >= 500 || error.message?.toLowerCase().includes('problem')) {
        return 'The guide ran into a problem. Please try again.';
    }
    return 'The guide could not be reached. Check your connection and try again.';
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function openResume(href) {
    const tab = window.open(href, '_blank');
    if (tab) tab.opener = null;
}

/** Carries out a navigate tool call from the guide. */
function runNavigation(destination) {
    const place = destinations[destination];
    if (!place) return;
    if (place.kind === 'section') {
        document.getElementById(destination)?.scrollIntoView({
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            block: 'start',
        });
    } else if (place.kind === 'file') {
        // Not a direct click, so a popup blocker may stop this; the message
        // also shows a link to the file.
        openResume(place.href);
    } else if (place.kind === 'route') {
        // Leave a moment to read the reply before the page changes.
        window.setTimeout(() => window.location.assign(place.href), 1400);
    }
}

function NavigationChip({ destination }) {
    const place = destinations[destination];
    if (!place) return null;
    if (place.kind === 'section') {
        return (
            <button type="button" className="guide-chip guide-chip--nav" onClick={() => runNavigation(destination)}>
                Go to {place.label} again
            </button>
        );
    }
    const isFile = place.kind === 'file';
    return (
        <a
            className="guide-chip guide-chip--nav"
            href={place.href}
            {...(isFile ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
            {isFile ? 'Open the résumé (PDF)' : 'Go to Career City'} <ArrowUpRight size={14} aria-hidden="true" />
        </a>
    );
}

function Message({ message }) {
    const isUser = message.role === 'user';
    return (
        <li className={`guide-msg guide-msg--${isUser ? 'user' : 'guide'}`}>
            <span className="guide-sr">{isUser ? 'You said:' : 'Guide:'}</span>
            {message.parts.map((part, index) => {
                if (part.type === 'text') {
                    return (
                        <p key={index} className="guide-bubble">
                            <RichText text={part.text} />
                        </p>
                    );
                }
                if (part.type === 'tool-navigate' && DESTINATION_IDS.includes(part.input?.destination)) {
                    return <NavigationChip key={index} destination={part.input.destination} />;
                }
                return null;
            })}
        </li>
    );
}

export default function ChatPanel({ open, onClose }) {
    const { messages, sendMessage, status, stop, error, regenerate, setMessages, clearError } = useChat({
        transport,
        throttle: 40,
    });
    const [input, setInput] = useState('');
    const [compact, setCompact] = useState(false);
    const [announcement, setAnnouncement] = useState('');
    const inputRef = useRef(null);
    const logRef = useRef(null);
    const handled = useRef(new Set());

    const busy = status === 'submitted' || status === 'streaming';
    const last = messages[messages.length - 1];
    const waiting = status === 'submitted' || (status === 'streaming' && last?.role === 'assistant' && !textOf(last));

    // Focus the message box when the panel opens.
    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    // Keep the newest exchange in view: scroll to the bottom, but never past
    // the visitor's latest question, so a long reply is read from its start.
    useEffect(() => {
        const log = logRef.current;
        if (!log) return;
        const questions = log.querySelectorAll('.guide-msg--user');
        const question = questions[questions.length - 1];
        const bottom = log.scrollHeight - log.clientHeight;
        log.scrollTop = question ? Math.min(bottom, question.offsetTop - 12) : bottom;
    }, [messages, status, error]);

    // Run each navigate tool call once, as soon as its input has arrived.
    useEffect(() => {
        for (const message of messages) {
            if (message.role !== 'assistant') continue;
            for (const part of message.parts) {
                if (part.type !== 'tool-navigate' || handled.current.has(part.toolCallId)) continue;
                if (part.state !== 'input-available' && part.state !== 'output-available') continue;
                handled.current.add(part.toolCallId);
                const destination = part.input?.destination;
                if (!DESTINATION_IDS.includes(destination)) continue;
                runNavigation(destination);
                // On a phone the panel covers the page; shrink it so the
                // section the guide scrolled to is visible above it.
                if (destinations[destination].kind === 'section' && window.matchMedia(COMPACT_QUERY).matches) {
                    setCompact(true);
                }
            }
        }
    }, [messages]);

    // Announce each finished reply (not every streamed word) to screen readers.
    useEffect(() => {
        if (status === 'ready' && last?.role === 'assistant') setAnnouncement(textOf(last));
    }, [status, last]);

    const errorText = friendlyError(error);
    useEffect(() => {
        if (errorText) setAnnouncement(errorText);
    }, [errorText]);

    const send = useCallback(
        (text) => {
            const value = text.trim().slice(0, LIMITS.maxMessageChars);
            if (!value || busy) return;
            if (error) clearError();
            sendMessage({ text: value });
            setInput('');
        },
        [busy, error, clearError, sendMessage],
    );

    const clear = () => {
        stop();
        setMessages([]);
        clearError();
        handled.current.clear();
        setInput('');
        setCompact(false);
        setAnnouncement('Conversation cleared.');
        inputRef.current?.focus();
    };

    const onKeyDown = (event) => {
        if (event.key === 'Escape') {
            event.stopPropagation();
            onClose();
        }
    };

    // Quick replies: suggestions at the start, tour controls during a tour.
    const quickReplies = useMemo(() => {
        if (busy || error) return [];
        if (!messages.length) return SUGGESTIONS;
        if (last?.role !== 'assistant') return [];
        const tour = textOf(last).match(TOUR_STOP);
        if (!tour) return [];
        const [, n, total] = tour.map(Number);
        return n < total ? [TOUR_NEXT, TOUR_END] : ['Open the résumé', 'What is the Career City game?'];
    }, [busy, error, messages.length, last]);

    const remaining = LIMITS.maxMessageChars - input.length;

    return (
        <div
            id="guide-panel"
            className={`guide-panel${compact ? ' is-compact' : ''}`}
            role="dialog"
            aria-modal="false"
            aria-labelledby="guide-title"
            aria-describedby="guide-desc"
            hidden={!open}
            onKeyDown={onKeyDown}
        >
            <div className="guide-head">
                <div className="guide-head__text">
                    <h2 id="guide-title">Kavin&apos;s portfolio guide</h2>
                    <p id="guide-desc">Answers come only from this site.</p>
                </div>
                <div className="guide-head__actions">
                    <button
                        type="button"
                        className="guide-icon-btn guide-only-compact"
                        onClick={() => setCompact((value) => !value)}
                        aria-label={compact ? 'Expand the guide' : 'Shrink the guide'}
                        title={compact ? 'Expand' : 'Shrink'}
                    >
                        {compact ? <Maximize2 size={18} aria-hidden="true" /> : <Minimize2 size={18} aria-hidden="true" />}
                    </button>
                    <button
                        type="button"
                        className="guide-icon-btn"
                        onClick={clear}
                        disabled={!messages.length && !error}
                        aria-label="Start a new conversation"
                        title="New conversation"
                    >
                        <RotateCcw size={18} aria-hidden="true" />
                    </button>
                    <button type="button" className="guide-icon-btn" onClick={onClose} aria-label="Close the guide" title="Close (Esc)">
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>
            </div>

            <div className="guide-log" ref={logRef} role="region" aria-label="Messages" tabIndex={0}>
                <p className="guide-greeting">{GREETING}</p>
                <ol className="guide-list" aria-label="Conversation">
                    {messages.map((message) => (
                        <Message key={message.id} message={message} />
                    ))}
                </ol>

                {waiting && (
                    <p className="guide-thinking">
                        <span className="guide-dots" aria-hidden="true">
                            <span />
                            <span />
                            <span />
                        </span>
                        Thinking…
                    </p>
                )}

                {errorText && (
                    <div className="guide-error" role="alert">
                        <p>{errorText}</p>
                        <button type="button" className="guide-chip" onClick={() => regenerate()}>
                            Try again
                        </button>
                    </div>
                )}

                {quickReplies.length > 0 && (
                    <div className="guide-chips" role="group" aria-label={messages.length ? 'Quick replies' : 'Suggested questions'}>
                        {quickReplies.map((text) => (
                            <button key={text} type="button" className="guide-chip" onClick={() => send(text)}>
                                {text}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <form
                className="guide-form"
                onSubmit={(event) => {
                    event.preventDefault();
                    send(input);
                }}
            >
                <label htmlFor="guide-input" className="guide-sr">
                    Ask a question about Kavin or this site
                </label>
                <input
                    id="guide-input"
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    maxLength={LIMITS.maxMessageChars}
                    placeholder="Ask about Kavin or this site…"
                    autoComplete="off"
                    aria-describedby={remaining <= 50 ? 'guide-count' : undefined}
                />
                {remaining <= 50 && (
                    <span id="guide-count" className="guide-count">
                        {remaining} characters left
                    </span>
                )}
                {busy ? (
                    <button type="button" className="guide-send" onClick={() => stop()} aria-label="Stop the answer" title="Stop">
                        <Square size={16} aria-hidden="true" />
                    </button>
                ) : (
                    <button type="submit" className="guide-send" disabled={!input.trim()} aria-label="Send" title="Send">
                        <Send size={16} aria-hidden="true" />
                    </button>
                )}
            </form>

            <div className="guide-sr" aria-live="polite" aria-atomic="true">
                {announcement}
            </div>
        </div>
    );
}
