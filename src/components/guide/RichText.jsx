import React from 'react';
import { contact, knownLinks, RESUME_PATH } from '../../data/profile.js';

// Guide replies are untrusted text (they come from a model). They are rendered
// as plain React text nodes, never as HTML. The only thing turned into a link
// is a URL or email address that is already one of Kavin's known links.

const TOKEN = /(https?:\/\/[^\s<>"')]+|[\w.+-]+@[\w-]+\.[\w.-]+)/g;
const TRAILING = /[.,;:!?]+$/;

const normalise = (url) => url.replace(/\/+$/, '').replace(/\.git$/, '').toLowerCase();
const allowed = new Set([...knownLinks, RESUME_PATH].map(normalise));

function linkFor(token) {
    if (token.includes('@') && !token.startsWith('http')) {
        return token.toLowerCase() === contact.email ? `mailto:${contact.email}` : null;
    }
    return allowed.has(normalise(token)) ? token : null;
}

export default function RichText({ text }) {
    const out = [];
    let last = 0;
    for (const match of text.matchAll(TOKEN)) {
        let token = match[0];
        const trailing = token.match(TRAILING)?.[0] || '';
        token = token.slice(0, token.length - trailing.length);
        const href = linkFor(token);
        if (!href) continue;
        if (match.index > last) out.push(text.slice(last, match.index));
        out.push(
            <a
                key={match.index}
                href={href}
                {...(href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            >
                {token}
            </a>,
        );
        last = match.index + token.length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
}
