// Server-only: decides whether the portfolio guide exists on this deployment.
// Used by the home page (to render the launcher or not) and by POST /api/chat
// (to answer or 404). Never import this from a client component: it reads
// secret environment variables. It only ever returns booleans.
//
// The guide is active only when BOTH are true:
//   1. GUIDE_ENABLED is "true" or "1".
//   2. An AI Gateway credential is configured:
//      - AI_GATEWAY_API_KEY is set (any environment), or
//      - a Vercel OIDC token is available.
//
// How the installed AI SDK gets the OIDC token (checked in node_modules):
// @ai-sdk/gateway uses AI_GATEWAY_API_KEY when it is non-empty, otherwise it
// calls getVercelOidcToken() from @vercel/oidc. That reads
//   globalThis[Symbol.for('@vercel/request-context')].get().headers['x-vercel-oidc-token']
// and falls back to process.env.VERCEL_OIDC_TOKEN. Vercel's docs match this:
// during a build the token is the VERCEL_OIDC_TOKEN environment variable; in a
// deployed function it is the x-vercel-oidc-token header of the current request
// (exposed through that request context, not process.env); locally it is
// VERCEL_OIDC_TOKEN written to .env.local by `vercel env pull`.
//
// So the two callers see the token in different places:
//   - The home page is statically prerendered at build time, where only the
//     VERCEL_OIDC_TOKEN environment variable exists.
//   - The API route runs per request, where on Vercel the token is in the
//     request context instead.
// Checking both places (env var, then the same request context the SDK reads)
// gives the same answer for the page and the route on one deployment. The raw
// request header is deliberately not trusted: outside Vercel any client could
// send it, while the request context only exists on Vercel's runtime.
//
// A token only proves OIDC is on for the project; if AI Gateway is not enabled
// for the team the model call fails and the guide falls back to the local
// responder, as it does for any runtime gateway failure.

const TRUTHY = new Set(['true', '1']);

const nonEmpty = (value) => typeof value === 'string' && value.trim() !== '';

export function isGuideEnabledFlag(env = process.env) {
    return TRUTHY.has(String(env.GUIDE_ENABLED ?? '').trim().toLowerCase());
}

function oidcTokenFromRequestContext() {
    try {
        const context = globalThis[Symbol.for('@vercel/request-context')]?.get?.();
        return context?.headers?.['x-vercel-oidc-token'];
    } catch {
        return undefined;
    }
}

export function hasGatewayCredential(env = process.env) {
    return nonEmpty(env.AI_GATEWAY_API_KEY) || nonEmpty(env.VERCEL_OIDC_TOKEN) || nonEmpty(oidcTokenFromRequestContext());
}

/** True when the guide should be shown and /api/chat should answer. */
export function isGuideActive(env = process.env) {
    return isGuideEnabledFlag(env) && hasGatewayCredential(env);
}

/** True when an active guide should try the live model (not GUIDE_LOCAL_ONLY). */
export function shouldCallModel(env = process.env) {
    return isGuideActive(env) && env.GUIDE_LOCAL_ONLY !== '1';
}
