// Shared limits and copy for the portfolio guide. Imported by both the API
// route and the chat panel, so keep it free of server-only code. Whether the
// guide is switched on at all is decided in availability.js (server only).

// Model id on the Vercel AI Gateway ("provider/model"). Override with the
// GUIDE_MODEL environment variable.
export const DEFAULT_MODEL_ID = 'anthropic/claude-haiku-5.5';

export const LIMITS = {
    // Longest single visitor message, in characters.
    maxMessageChars: 500,
    // Earlier guide replies are sent back as context; cut them to this length.
    maxAssistantChars: 1500,
    // Only this many most recent turns are kept; older ones are dropped.
    maxTurns: 12,
    // A request with more messages than this is rejected outright.
    maxMessagesHard: 60,
    // Largest request body accepted, in bytes.
    maxBodyBytes: 48 * 1024,
    // Cap on generated tokens per model step.
    maxOutputTokens: 450,
    // Cap on agent steps (model calls) per request.
    maxSteps: 3,
    // Whole-request time budget for the model path.
    timeoutMs: 25_000,
    // How long to wait for the model's first output before falling back.
    firstChunkMs: 10_000,
};

export const SCOPE_MESSAGE =
    "Sorry, I can only help with questions about Kavin Pasupathy and this portfolio site. Try asking about Kavin's experience, projects or skills, or how to get in touch.";

// One line, shown at the top of a new conversation.
export const GREETING = "Hi! I can answer questions about Kavin's work in plain language and show you around this site.";

export const SUGGESTIONS = [
    'Who is Kavin?',
    'Show me the projects',
    'Take me on a tour',
    'How do I contact Kavin?',
    'What is the Career City game?',
];

export const TOUR_NEXT = 'Next stop';
export const TOUR_END = 'End the tour';
