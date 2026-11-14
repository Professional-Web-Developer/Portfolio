// POST /api/chat - the portfolio guide.
//
// Runs on the default Node.js runtime and streams the reply. Everything that
// keeps the guide on topic and cheap is enforced here in code, not left to the
// model: the request shape, message and conversation size, allowed roles, the
// output-token and step caps (see src/lib/guide/agent.js) and rate limiting.

import { createUIMessageStreamResponse } from 'ai';
import { LIMITS } from '../../../lib/guide/config.js';
import { checkRateLimit, clientKey, takeModelBudget } from '../../../lib/guide/rate-limit.js';
import { createGuideStream } from '../../../lib/guide/respond.js';
import { parseChatRequest, RequestError } from '../../../lib/guide/validate.js';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function errorResponse(status, code, message, headers) {
    return Response.json({ error: { code, message } }, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

// The AI SDK sends "provider/model" ids through the Vercel AI Gateway. It
// authenticates with AI_GATEWAY_API_KEY when set, otherwise with the OIDC
// token Vercel issues to the deployment. With neither (or GUIDE_LOCAL_ONLY=1),
// skip the model and answer from the local responder.
function hasModelCredentials() {
    if (process.env.GUIDE_LOCAL_ONLY === '1') return false;
    return Boolean(process.env.AI_GATEWAY_API_KEY?.trim() || process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL === '1');
}

// Browsers send Origin on POST. If it is present it must be this site, which
// stops other websites from using the endpoint from their own pages.
function isCrossOrigin(request) {
    const origin = request.headers.get('origin');
    if (!origin) return false;
    try {
        const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
        return new URL(origin).host !== host;
    } catch {
        return true;
    }
}

export async function POST(request) {
    if (isCrossOrigin(request)) {
        return errorResponse(403, 'forbidden', 'This endpoint can only be used from the portfolio site.');
    }
    if (!(request.headers.get('content-type') || '').includes('application/json')) {
        return errorResponse(415, 'unsupported_media_type', 'Send the request as application/json.');
    }

    const limit = checkRateLimit(clientKey(request));
    if (!limit.ok) {
        return errorResponse(429, 'rate_limited', 'You are sending messages very quickly. Please wait a moment and try again.', {
            'Retry-After': String(limit.retryAfter),
        });
    }

    let turns;
    try {
        if (Number(request.headers.get('content-length')) > LIMITS.maxBodyBytes) {
            throw new RequestError(413, 'body_too_large', 'That request is too large.');
        }
        const raw = await request.text();
        if (Buffer.byteLength(raw) > LIMITS.maxBodyBytes) {
            throw new RequestError(413, 'body_too_large', 'That request is too large.');
        }
        let body;
        try {
            body = JSON.parse(raw);
        } catch {
            throw new RequestError(400, 'invalid_json', 'The request body is not valid JSON.');
        }
        turns = parseChatRequest(body);
    } catch (error) {
        if (error instanceof RequestError) return errorResponse(error.status, error.code, error.message);
        console.error('[guide] could not read request:', error);
        return errorResponse(400, 'invalid_request', 'The request could not be read.');
    }

    const useModel = hasModelCredentials() && takeModelBudget();

    return createUIMessageStreamResponse({
        stream: createGuideStream({ turns, useModel, signal: request.signal }),
        headers: { 'Cache-Control': 'no-store' },
    });
}
