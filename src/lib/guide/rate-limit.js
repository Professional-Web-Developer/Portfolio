// Best-effort rate limiting, held in memory.
//
// This is deliberately simple: on serverless hosting each warm instance has
// its own copy of these maps and they are lost on a cold start, so a
// determined client can exceed the numbers below. It still stops casual abuse
// and runaway loops. For a hard guarantee, add a rate-limit rule in the Vercel
// Firewall and a spend budget on the AI Gateway (see .env.example).

const WINDOWS = [
    { ms: 60_000, max: 10 },
    { ms: 60 * 60_000, max: 60 },
];
const LONGEST_WINDOW = Math.max(...WINDOWS.map((w) => w.ms));
const MAX_TRACKED_CLIENTS = 5000;

const hits = new Map(); // client key -> timestamps (ms), oldest first

export function clientKey(request) {
    // On Vercel the platform sets these headers itself, so the visitor cannot
    // spoof them. Elsewhere they are only as trustworthy as the proxy in front.
    const forwarded = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for');
    const ip = (forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip')) || 'unknown';
    return ip.trim().slice(0, 64);
}

/** Returns { ok: true } or { ok: false, retryAfter } (seconds). */
export function checkRateLimit(key, now = Date.now()) {
    const recent = (hits.get(key) || []).filter((t) => now - t < LONGEST_WINDOW);

    for (const { ms, max } of WINDOWS) {
        const inWindow = recent.filter((t) => now - t < ms);
        if (inWindow.length >= max) {
            hits.set(key, recent);
            return { ok: false, retryAfter: Math.max(1, Math.ceil((inWindow[0] + ms - now) / 1000)) };
        }
    }

    recent.push(now);
    hits.delete(key); // re-insert so the map stays ordered by last activity
    hits.set(key, recent);
    if (hits.size > MAX_TRACKED_CLIENTS) {
        hits.delete(hits.keys().next().value);
    }
    return { ok: true };
}

// A ceiling on model calls per server instance per hour, across all visitors.
// When it is reached the guide quietly answers from the local responder.
const GLOBAL_MODEL_CALLS_PER_HOUR = 300;
let globalCalls = [];

export function takeModelBudget(now = Date.now()) {
    globalCalls = globalCalls.filter((t) => now - t < 60 * 60_000);
    if (globalCalls.length >= GLOBAL_MODEL_CALLS_PER_HOUR) return false;
    globalCalls.push(now);
    return true;
}
