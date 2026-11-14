'use client';
import dynamic from 'next/dynamic';

// The page only renders this when the guide is active (see src/app/page.js).
// Importing Guide statically, or via next/dynamic from the server component,
// would bundle its JS and CSS into the home page even when it is switched off;
// a dynamic import from a client component gives it its own chunk, which is
// only referenced when this is rendered. It still server-renders, so the
// launcher is in the HTML when the guide is on.
const Guide = dynamic(() => import('./Guide'));

export default function LazyGuide() {
    return <Guide />;
}
