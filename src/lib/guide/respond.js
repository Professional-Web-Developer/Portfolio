import { createAgentUIStream, createUIMessageStream, generateId } from 'ai';
import { createGuideAgent, navigationResult } from './agent.js';
import { LIMITS } from './config.js';
import { respondLocally } from './local-responder.js';

// One line per failure in the server logs, not the whole error object.
const describe = (error) => (error instanceof Error ? `${error.name}: ${error.message}` : String(error));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Chunks that mean the model has really started answering. Until one of these
// arrives nothing has been shown to the visitor, so a failure can still be
// replaced by a local answer without the visitor noticing.
const CONTENT_CHUNKS = new Set(['text-delta', 'tool-input-start', 'tool-input-available']);

function toUIMessages(turns) {
    return turns.map((turn, index) => ({
        id: `turn-${index}`,
        role: turn.role,
        parts: [{ type: 'text', text: turn.text }],
    }));
}

/**
 * Runs the agent and forwards its stream to `writer`.
 * Resolves to true if an answer was (at least partly) delivered, or false if
 * the model failed before producing anything.
 */
async function streamFromModel({ writer, turns, model, signal }) {
    const held = [];
    let delivered = false;

    try {
        const stream = await createAgentUIStream({
            agent: createGuideAgent({ model }),
            uiMessages: toUIMessages(turns),
            abortSignal: signal,
            // Give up early if the model has not started answering, so the local
            // fallback still replies quickly.
            timeout: { totalMs: LIMITS.timeoutMs, firstChunkMs: LIMITS.firstChunkMs },
            sendStart: false,
            sendReasoning: false,
            onError: (error) => {
                console.error('[guide] model stream error:', describe(error));
                return 'The guide ran into a problem.';
            },
        });

        for await (const chunk of stream) {
            if (chunk.type === 'error' && !delivered) return false;
            if (!delivered && !CONTENT_CHUNKS.has(chunk.type)) {
                held.push(chunk);
                continue;
            }
            if (!delivered) {
                delivered = true;
                writer.write({ type: 'start', messageMetadata: { source: 'model' } });
                held.forEach((c) => writer.write(c));
            }
            writer.write(chunk);
        }
    } catch (error) {
        if (signal?.aborted) return true; // visitor pressed stop or left
        console.error('[guide] model call failed:', describe(error));
        if (!delivered) return false;
        writer.write({ type: 'error', errorText: 'The guide ran into a problem.' });
        return true;
    }

    if (!delivered) {
        // The stream ended without text or a tool call (should not happen).
        return false;
    }
    return true;
}

/** Streams a deterministic answer in the same wire format the model uses. */
async function streamLocally({ writer, turns, signal }) {
    const { text, navigate } = respondLocally(turns);

    writer.write({ type: 'start', messageMetadata: { source: 'local' } });
    writer.write({ type: 'start-step' });

    if (navigate) {
        const toolCallId = `local-${generateId()}`;
        writer.write({ type: 'tool-input-available', toolCallId, toolName: 'navigate', input: { destination: navigate } });
        writer.write({ type: 'tool-output-available', toolCallId, output: navigationResult(navigate) });
    }

    // Send the text a few words at a time so it reads like a typed reply.
    const id = generateId();
    writer.write({ type: 'text-start', id });
    const pieces = text.match(/\S+\s*/g) || [];
    for (let i = 0; i < pieces.length; i += 3) {
        if (signal?.aborted) break;
        writer.write({ type: 'text-delta', id, delta: pieces.slice(i, i + 3).join('') });
        await sleep(18);
    }
    writer.write({ type: 'text-end', id });
    writer.write({ type: 'finish-step' });
    writer.write({ type: 'finish', finishReason: 'stop' });
}

/**
 * Builds the response stream for one chat request.
 *
 * @param {object} options
 * @param {{ role: string, text: string }[]} options.turns validated conversation
 * @param {boolean} options.useModel try the AI model first
 * @param {import('ai').LanguageModel} [options.model] override (tests)
 * @param {AbortSignal} [options.signal]
 */
export function createGuideStream({ turns, useModel, model, signal }) {
    return createUIMessageStream({
        async execute({ writer }) {
            if (useModel && (await streamFromModel({ writer, turns, model, signal }))) return;
            await streamLocally({ writer, turns, signal });
        },
        onError: (error) => {
            console.error('[guide] stream error:', describe(error));
            return 'The guide ran into a problem.';
        },
    });
}
