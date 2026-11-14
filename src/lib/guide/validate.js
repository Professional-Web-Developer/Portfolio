import { LIMITS } from './config.js';

export class RequestError extends Error {
    constructor(status, code, message) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

const ALLOWED_ROLES = new Set(['user', 'assistant']);

// Strip control characters (keeping newlines and tabs) and trim.
function cleanText(value) {
    // eslint-disable-next-line no-control-regex
    return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
}

function textOf(message) {
    if (!Array.isArray(message.parts)) {
        throw new RequestError(400, 'invalid_request', 'Each message needs a "parts" array.');
    }
    let text = '';
    for (const part of message.parts) {
        // Only plain text is read. Tool calls, files, data parts and anything
        // else a client might send are ignored, never forwarded to the model.
        if (part && typeof part === 'object' && part.type === 'text' && typeof part.text === 'string') {
            text += (text ? '\n' : '') + part.text;
        }
    }
    return cleanText(text);
}

/**
 * Turns an untrusted request body into a short list of plain-text turns:
 * [{ role: 'user' | 'assistant', text }]. Throws RequestError on bad input.
 *
 * The only thing taken from the client is the conversation text. The system
 * prompt, model, tools and limits are all fixed on the server.
 */
export function parseChatRequest(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body) || !Array.isArray(body.messages)) {
        throw new RequestError(400, 'invalid_request', 'Expected a JSON object with a "messages" array.');
    }
    const { messages } = body;
    if (messages.length === 0) {
        throw new RequestError(400, 'invalid_request', 'At least one message is required.');
    }
    if (messages.length > LIMITS.maxMessagesHard) {
        throw new RequestError(400, 'too_many_messages', 'This conversation is too long. Please start a new chat.');
    }

    const turns = [];
    for (const message of messages) {
        if (!message || typeof message !== 'object' || !ALLOWED_ROLES.has(message.role)) {
            throw new RequestError(400, 'invalid_role', 'Messages must have the role "user" or "assistant".');
        }
        const text = textOf(message);
        if (message.role === 'user') {
            if (text.length > LIMITS.maxMessageChars) {
                throw new RequestError(
                    413,
                    'message_too_long',
                    `Please keep your message to ${LIMITS.maxMessageChars} characters or fewer.`,
                );
            }
            if (text) turns.push({ role: 'user', text });
        } else if (text) {
            turns.push({ role: 'assistant', text: text.slice(0, LIMITS.maxAssistantChars) });
        }
    }

    // Keep the most recent turns only, and make sure the kept history starts
    // with a visitor message.
    let recent = turns.slice(-LIMITS.maxTurns);
    while (recent.length && recent[0].role !== 'user') recent = recent.slice(1);

    const last = recent[recent.length - 1];
    if (!last || last.role !== 'user') {
        throw new RequestError(400, 'invalid_request', 'The last message must be a non-empty visitor message.');
    }
    return recent;
}
