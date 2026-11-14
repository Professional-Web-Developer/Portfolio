import { ToolLoopAgent, isStepCount, tool } from 'ai';
import { z } from 'zod';
import { destinations, DESTINATION_IDS } from '../../data/profile.js';
import { DEFAULT_MODEL_ID, LIMITS } from './config.js';
import { buildSystemPrompt } from './prompt.js';

export function resolveModelId() {
    return process.env.GUIDE_MODEL?.trim() || DEFAULT_MODEL_ID;
}

// What the navigate tool reports back. The browser reads the tool call from
// the response stream and performs the actual scroll / page change; the server
// only confirms the destination and reminds the model what is there.
export function navigationResult(destination) {
    const place = destinations[destination];
    return { ok: true, destination, label: place.label, whatIsThere: place.summary };
}

export const guideTools = {
    navigate: tool({
        description:
            "Take the visitor to a place on Kavin's portfolio site: scroll to a home page section, open the résumé PDF, or open the Career City 3D driving game. Use only when the visitor asks to see, open or go somewhere.",
        inputSchema: z.object({
            destination: z.enum(DESTINATION_IDS).describe('Where to take the visitor.'),
        }),
        execute: async ({ destination }) => navigationResult(destination),
    }),
};

/**
 * The portfolio guide as a small tool-calling agent.
 *
 * `model` is normally a "provider/model" string, which the AI SDK routes
 * through the Vercel AI Gateway. Tests pass a mock model object instead.
 */
export function createGuideAgent({ model = resolveModelId() } = {}) {
    return new ToolLoopAgent({
        model,
        instructions: buildSystemPrompt(),
        tools: guideTools,
        stopWhen: isStepCount(LIMITS.maxSteps),
        maxOutputTokens: LIMITS.maxOutputTokens,
        // Answers are short look-ups from a fixed fact sheet; extended
        // thinking would only add latency and cost.
        reasoning: 'none',
        maxRetries: 1,
        // The fact sheet in the system prompt is identical on every request;
        // let the gateway add prompt-cache markers so repeat calls are cheaper.
        providerOptions: { gateway: { caching: 'auto' } },
    });
}
