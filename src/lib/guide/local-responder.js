// Deterministic responder used when no AI model is available (no credentials,
// gateway error, or the hourly model budget is spent).
//
// It matches the visitor's message against a fixed list of intents and answers
// only from src/data/profile.js. Anything it does not recognise is declined
// with the same scope message the model is told to use, so the widget stays on
// topic on this path too.

import {
    profile,
    experience,
    projects,
    skillGroups,
    resumeOnlySkills,
    programmingLanguages,
    education,
    certification,
    contact,
    destinations,
    tourStops,
    glossary,
} from '../../data/profile.js';
import { SCOPE_MESSAGE } from './config.js';

// --- text helpers ---------------------------------------------------------

function normalise(text) {
    return ` ${text
        .toLowerCase()
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/é/g, 'e')
        .replace(/\s+/g, ' ')
        .trim()} `;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

// Whole-word / whole-phrase match that also works for tokens such as
// "next.js", "ci/cd" or "c++".
function has(q, ...phrases) {
    return phrases.some((p) => new RegExp(`(^|[^a-z0-9+#])${escapeRe(p)}($|[^a-z0-9+#])`).test(q));
}

const linkTo = (label) => contact.links.find((l) => l.label === label)?.url;

// --- guards ---------------------------------------------------------------

const INJECTION = [
    /\b(ignore|disregard|forget|override|bypass)\b.{0,40}\b(instruction|instructions|prompt|prompts|rules|rule|guidelines|above|previous|prior|earlier|everything|restrictions)\b/,
    /\b(system|initial|original|hidden|developer) (prompt|message|instructions)\b/,
    /\byour (prompt|instructions|rules|guidelines|configuration)\b/,
    /\b(pretend|role-?play|act as|behave as|you are now|from now on|jailbreak|dan mode|developer mode|no restrictions|unrestricted)\b/,
    /\b(repeat|print|output|reveal|show|tell me) (the |your |all )?(text|words|everything|message)s? (above|before)\b/,
];

const OFF_TOPIC = [
    /\b(write|generate|compose|draft|create|make|give|code)\b.{0,40}\b(code|script|function|program|essay|poem|story|email|letter|song|joke|haiku|recipe|query|regex|article|blog|tweet|post|speech|paragraph)\b/,
    /\b(translate|solve|calculate|compute|debug|homework|assignment|weather|forecast|news|stock|stocks|bitcoin|crypto|recipe|joke|riddle|lyrics|horoscope)\b/,
    /\bhow (do|can|should|would|to)\b.{0,60}\b(in|with|using) (python|javascript|java|react|sql|typescript|node|c\+\+|html|css|excel)\b/,
    /\d\s*[-+*x/^]\s*\d/,
    /\b(capital of|president of|prime minister|population of|meaning of life|world cup|who won)\b/,
    /\bwho (is|was|are|were) (?!kavin|he\b|she\b|they\b|this\b|you\b|the (owner|developer|author|person|engineer|candidate|guy)\b)/,
    /\bwhat do you think (of|about) (?!kavin|this site|the site|his|their)/,
];

// --- intent vocabulary ----------------------------------------------------

const WANTS_NAV =
    /\b(show|take me|go to|goto|open|scroll|navigate|jump|bring me|let me see|view|visit|launch|play|download|where is the|where's the|where are the|where can i (find|see|get)|see the|see kavin's|see his|see their)\b/;
const ASKS_MEANING = /\b(what is|what's|what are|whats|what does|explain|define|meaning of|what do you mean by|in simple terms|in plain)\b/;
const ABOUT_KAVIN = /\b(kavin|pasupathy|he|him|his|she|her|they|them|their|candidate|this person|the owner|the developer|the engineer|the author)\b/;
const KNOWS = /\b(know|knows|knowledge|use|uses|used|using|familiar|experience with|experienced|worked with|work with|works with|skilled|proficient|good at|expert)\b/;

// Extra spellings for skills, on top of the names listed in profile.js.
const SKILL_ALIASES = {
    'React.js': ['react'],
    'Next.js': ['nextjs', 'next js', 'next'],
    'Node.js': ['node', 'nodejs'],
    'Express.js': ['express'],
    'JavaScript (ES6+)': ['javascript', 'js', 'es6'],
    HTML5: ['html'],
    CSS3: ['css'],
    'PayPal REST APIs': ['paypal api', 'paypal apis'],
    'AWS EC2': ['ec2'],
    'Dynamic Programming': ['dp'],
    'Hash Maps': ['hashmap', 'hash map', 'hashmaps'],
    'Tool / Function Calling': ['tool calling', 'function calling'],
    'Git & GitHub': ['git'],
    'GitHub Actions (CI/CD)': ['github actions', 'ci/cd', 'cicd', 'ci cd'],
    MongoDB: ['mongo'],
    PostgreSQL: ['postgres'],
    'REST APIs': ['rest api', 'rest'],
    'JWT Auth': ['jwt'],
    'AI Agents': ['ai agent'],
    'AWS S3': ['aws', 's3'],
    'Drizzle ORM': ['drizzle'],
    'Prisma ORM': ['prisma'],
    'VS Code': ['vscode'],
    MCP: ['model context protocol'],
    RAG: ['retrieval augmented generation'],
    'Claude API': ['claude'],
};

const SKILL_INDEX = [
    ...skillGroups.flatMap((group) =>
        group.skills.map((skill) => ({
            skill,
            group: group.title,
            terms: [skill.toLowerCase(), ...(SKILL_ALIASES[skill] || [])],
        })),
    ),
    ...resumeOnlySkills.map((skill) => ({
        skill,
        group: null,
        terms: [skill.toLowerCase(), ...(SKILL_ALIASES[skill] || [])],
    })),
];

function findSkills(q) {
    return SKILL_INDEX.filter((entry) => has(q, ...entry.terms));
}

function whereUsed(skill) {
    const names = [skill.toLowerCase(), ...(SKILL_ALIASES[skill] || [])];
    const matches = (tags) => tags.some((tag) => names.includes(tag.toLowerCase()) || tag.toLowerCase() === skill.toLowerCase());
    const places = [];
    const job = experience.find((j) => matches(j.skills));
    if (job) places.push(`the ${job.role} role at ${job.company}`);
    const used = projects.filter((p) => matches(p.tags)).map((p) => p.title);
    if (used.length) places.push(`the ${used.join(' and ')} project${used.length > 1 ? 's' : ''}`);
    return places;
}

// --- answers --------------------------------------------------------------

const junior = experience[0];
const intern = experience[1];
const [mca, bsc] = education;

const answers = {
    greeting: () =>
        `Hello! I'm the guide for ${profile.name}'s portfolio. Ask me about Kavin's experience, projects, skills or education, or say "take me on a tour" and I'll walk you through the site.`,

    thanks: () => "You're welcome! Ask me anything else about Kavin or this site.",

    guide: () =>
        "I'm an automated guide for this portfolio, not Kavin. I answer questions about Kavin from the information on this site, and I can take you to any section, open the résumé or start a short tour.",

    help: () =>
        `This is ${profile.name}'s portfolio. From top to bottom it has: ${tourStops.map((id) => destinations[id].label).join(', ')}. You can scroll, use the menu at the top, or just ask me, for example "show me the projects" or "take me on a tour". I can also open the résumé or the Career City game.`,

    about: () =>
        `${profile.plainSummary}\n\nHighlights: ${certification.title} (certified by ${certification.issuer}), an MCA with ${mca.score}, 1st rank in the B.Sc. Computer Science department, and AI projects such as ${projects[0].title} and ${projects[1].title}.`,

    location: () => `Kavin is based in ${profile.location}, and works at ${profile.company} there.`,

    spoken: () => `Kavin speaks ${profile.spokenLanguages.join(' and ')}.`,

    experience: () =>
        `Kavin has about 2 years of experience, all at ${junior.company} in ${junior.location}:\n` +
        `- ${junior.role} (${junior.duration}, ${junior.type.toLowerCase()}): builds complete web applications for clients with Next.js, TypeScript and PostgreSQL, works on Eztest (an online test management platform), and designs AI agents that automate client reporting and other business processes.\n` +
        `- ${intern.role} (${intern.duration}): built responsive web applications for client projects and was promoted to full-time within 4 months.`,

    projects: () =>
        `Kavin's portfolio shows ${projects.length} projects:\n` +
        projects.map((p) => `- ${p.title}${p.featured ? ' (featured)' : ''}: ${p.plain}`).join('\n') +
        `\nEach one links to its code on GitHub, and ${projects[0].title} also has a live demo and a demo video. Ask me about any of them for more detail.`,

    project: (p) =>
        `${p.title}${p.subtitle ? ` (${p.subtitle})` : ''}${p.date ? `, ${p.date}` : ''}: ${p.plain}\n\n` +
        `In technical terms: ${p.desc}\n\nBuilt with: ${p.tags.join(', ')}.\n` +
        p.links.map((l) => `${l.label}: ${l.url}`).join('\n'),

    eztest: () =>
        `Eztest is an online test management platform built with Next.js and PostgreSQL. Kavin builds features for it as part of the ${junior.role} role at ${junior.company}. It is a work project, so it is not in the Projects section.`,

    skills: () =>
        "Kavin's skills, by area:\n" +
        skillGroups
            .map((g) => `- ${g.title}: ${g.skills.slice(0, 8).join(', ')}${g.skills.length > 8 ? ' and more' : ''}`)
            .join('\n') +
        `\nProgramming languages: ${programmingLanguages.join(', ')}.`,

    skillGroup: (g) => `Kavin's ${g.title} skills: ${g.skills.join(', ')}.${g.desc ? ` ${g.desc}` : ''}`,

    skillYes: (entries) => {
        const lines = entries.slice(0, 3).map(({ skill, group }) => {
            const places = whereUsed(skill);
            const where = group ? `(under ${group})` : '(on the résumé)';
            return `Yes, ${skill} is one of Kavin's listed skills ${where}${places.length ? `. Kavin has used it in ${places.join(' and in ')}` : ''}.`;
        });
        return lines.join('\n');
    },

    skillNotListed: () =>
        `I don't see that in Kavin's listed skills, so I can't say either way. The profile lists skills in ${skillGroups.map((g) => g.title).join(', ')}. To check, you can ask Kavin directly at ${contact.email}.`,

    education: () =>
        "Kavin's education:\n" +
        `- ${mca.degree}, ${mca.institution} (${mca.duration}), ${mca.score}\n` +
        `- ${bsc.degree}, ${bsc.institution} (${bsc.duration}), ${bsc.score}. ${bsc.note}\n` +
        `Kavin is also a ${certification.title} (certified by ${certification.issuer}).`,

    certification: () =>
        `Kavin holds the ${certification.title} certification, issued by ${certification.issuer} on ${certification.issued}. ${certification.plain}\n` +
        `You can verify it on Credly: ${certification.link}\n` +
        'Kavin also ranked 1st in the undergraduate Computer Science department. Both are in the Education & Certification section.',

    contact: () =>
        'You can reach Kavin here:\n' +
        `- Email: ${contact.email}\n- Phone: ${contact.phone}\n- LinkedIn: ${linkTo('LinkedIn')}\n- GitHub: ${linkTo('GitHub')}\n` +
        'Email is the quickest way. The Contact section at the bottom of the page has these, plus a "Copy email" button.',

    resume: () =>
        'Kavin\'s résumé is a one-page PDF. Say "open the résumé" and I\'ll open it for you, or use the Resume button in the introduction at the top of the page.',

    city: () => `${destinations.city.summary} Say "open the game" and I'll take you there.`,

    fit: (group) =>
        "I can't make the hiring call, but here is what the profile shows. " +
        `Kavin has ${profile.yearsOfExperience} of experience as a software engineer at ${profile.company}. The main strengths are full-stack web development (Next.js, TypeScript, PostgreSQL, the MERN stack) and AI agents (Claude API, tool calling, RAG).` +
        (group ? `\nRelevant ${group.title} skills listed: ${group.skills.slice(0, 10).join(', ')}.` : '') +
        `\nThe Experience and Projects sections have the detail, and you can ask Kavin directly at ${contact.email}.`,

    unknown: () =>
        `I don't have that information; it isn't in Kavin's profile. The best way to find out is to ask Kavin directly at ${contact.email}.`,

    decline: () => SCOPE_MESSAGE,
};

// --- tour -----------------------------------------------------------------

// Two sentences per stop, in page order (see tourStops in profile.js).
const TOUR_TEXT = {
    about: `${profile.name} is a software engineer at ${profile.company} with about 2 years of experience building complete web applications and AI agents, which are software helpers that carry out multi-step tasks on their own. This top section also has buttons to view the projects and download the résumé, Kavin's Claude certification badge and four quick facts.`,
    experience: `Kavin joined ${intern.company} in ${intern.location} as an intern in Sep 2024 and was promoted to full-time ${junior.role} within 4 months. Today Kavin builds web applications for clients and AI agents that automate reporting and other repetitive business work.`,
    projects: `The two featured projects are ${projects[0].title}, an AI shop assistant that takes orders and PayPal payments inside a chat, and ${projects[1].title}, a platform for AI assistants that can use tools and search your own documents. Below them are three earlier web apps (${projects
        .filter((p) => !p.featured)
        .map((p) => p.title)
        .join(', ')}), each with a link to its code.`,
    skills: `Kavin's skills fall into six groups, AI & Agents, Frontend (what you see), Backend (what runs behind the scenes), Databases, Tools & DevOps, and Data Structures & Algorithms. The main focus is AI agents together with full-stack web development using Next.js, TypeScript and PostgreSQL.`,
    education: `Kavin holds a ${mca.degree} from ${mca.institution.split(',')[0]} (${mca.score}) and a bachelor's degree in Computer Science, where Kavin ranked 1st in the department. This section also shows Kavin's ${certification.title} certification from ${certification.issuer}, which you can verify on Credly.`,
    contact: `You can reach Kavin by email at ${contact.email}, which is the quickest way, or by phone at ${contact.phone}. There are also links to GitHub, LinkedIn and other profiles, and that ends the tour, so feel free to ask me to open the résumé or the Career City game next.`,
};

export const TOUR_STOP_PATTERN = /Stop (\d+) of (\d+)/;

function tourStop(index) {
    const id = tourStops[index];
    const isLast = index === tourStops.length - 1;
    return {
        navigate: id,
        text:
            `Stop ${index + 1} of ${tourStops.length}: ${destinations[id].label}\n${TOUR_TEXT[id]}` +
            (isLast ? '' : '\n\nSay "next" when you are ready for the next stop.'),
    };
}

// Where the tour stands, read from the guide's own most recent reply.
function tourProgress(turns) {
    for (let i = turns.length - 2; i >= 0; i -= 1) {
        if (turns[i].role !== 'assistant') continue;
        const match = turns[i].text.match(TOUR_STOP_PATTERN);
        return match ? Number(match[1]) : 0;
    }
    return 0;
}

// --- section navigation ---------------------------------------------------

const SECTION_WORDS = {
    about: ['about', 'intro', 'introduction', 'top', 'top of the page', 'home', 'start of the page', 'beginning'],
    skills: ['skills', 'skill', 'technical expertise', 'tech stack'],
    experience: ['experience', 'work history', 'professional journey', 'career', 'jobs'],
    projects: ['projects', 'project', 'work samples', 'portfolio projects'],
    education: ['education', 'degrees', 'degree', 'qualifications', 'studies', 'certification', 'certificate', 'certifications', 'achievements', 'awards'],
    contact: ['contact', 'contact details', 'get in touch'],
};

const here = (id) => `Here is the ${destinations[id].label} section.`;

// --- main entry -----------------------------------------------------------

/**
 * @param {{ role: 'user' | 'assistant', text: string }[]} turns validated conversation, last turn from the visitor
 * @returns {{ text: string, navigate?: string }}
 */
export function respondLocally(turns) {
    const q = normalise(turns[turns.length - 1].text);
    const words = q.trim().split(' ').length;
    const wantsNav = WANTS_NAV.test(q);

    if (INJECTION.some((re) => re.test(q)) || OFF_TOPIC.some((re) => re.test(q))) return { text: answers.decline() };

    // Greetings and courtesies.
    if (words <= 4 && has(q, 'hi', 'hello', 'hey', 'hiya', 'good morning', 'good afternoon', 'good evening')) {
        return { text: answers.greeting() };
    }
    if (words <= 6 && has(q, 'thanks', 'thank you', 'thank u', 'thx', 'bye', 'goodbye', 'cheers', 'great', 'cool', 'awesome', 'nice')) {
        return { text: answers.thanks() };
    }

    // Guided tour.
    const stopNumber = tourProgress(turns);
    const inTour = stopNumber > 0 && stopNumber < tourStops.length;
    const mentionsTour = has(q, 'tour', 'walk me through', 'walkthrough', 'show me around', 'guide me', 'show me everything');
    if (words <= 6 && has(q, 'next', 'next stop', 'continue', 'go on', 'keep going', 'carry on', 'move on') || (inTour && words <= 3 && has(q, 'yes', 'ok', 'okay', 'sure', 'yep', 'ready'))) {
        if (inTour) return tourStop(stopNumber);
        return {
            text:
                stopNumber >= tourStops.length
                    ? 'That was the last stop of the tour. Say "tour" to start again, or ask me anything about Kavin.'
                    : 'We are not on a tour right now. Say "take me on a tour" and I will walk you through the site.',
        };
    }
    if (has(q, 'end the tour', 'end tour', 'stop the tour', 'stop tour', 'cancel the tour', 'quit the tour', 'exit the tour') || (inTour && words <= 4 && has(q, 'stop', 'end', 'cancel', 'quit', 'exit', "that's enough", 'no', 'no thanks'))) {
        return { text: 'No problem, the tour is over. Ask me anything about Kavin, or say "tour" to start again.' };
    }
    if (mentionsTour) return tourStop(0);

    // What Kavin does, in plain words.
    const wantsPlain = has(q, 'simple terms', 'plain english', 'plain language', 'layman', 'non-technical') && has(q, 'kavin', 'he', 'they') && !glossary.some((g) => has(q, ...g.keywords));
    if (wantsPlain || has(q, 'what does kavin do', 'what kavin does', 'what does he do', 'what do they do', 'what he does', 'what they do', 'do for a living')) {
        return { text: answers.about() };
    }

    // How the guide itself works.
    if (has(q, 'how does this work', 'how do i use', 'what can you do', 'what can i ask', 'what can you help')) {
        return { text: answers.help() };
    }

    // Where Kavin is based (checked before the game, which also says "city").
    if (has(q, 'based', 'located', 'location', 'live', 'lives', 'living', 'which city', 'what city', 'which country', 'where is kavin', "where's kavin", 'where is he', 'where are they', 'from where', 'timezone', 'time zone')) {
        if (has(q, 'timezone', 'time zone')) return { text: answers.unknown() };
        return { text: answers.location() };
    }

    // Career City game.
    if (has(q, 'city', 'game', 'career city', '3d', 'drive', 'driving', 'car')) {
        if (wantsNav || has(q, 'start', 'try', 'take me')) {
            return { navigate: 'city', text: `Taking you to Career City. ${destinations.city.summary}` };
        }
        return { text: answers.city() };
    }

    // Résumé.
    if (has(q, 'resume', 'cv', 'curriculum vitae')) {
        if (wantsNav || has(q, 'get', 'send', 'pdf', 'copy')) {
            return {
                navigate: 'resume',
                text: "I've opened Kavin's résumé (a one-page PDF) in a new tab. If nothing opened, use the button below.",
            };
        }
        return { text: answers.resume() };
    }

    // Plain-language explanation of a technical term from the site.
    if (ASKS_MEANING.test(q) && !has(q, 'kavin', 'his', 'their')) {
        const term = glossary.find((g) => has(q, ...g.keywords));
        if (term) return { text: term.plain };
    }

    // A specific project.
    if (has(q, 'eztest', 'ez test')) return { text: answers.eztest() };
    const project = projects.find((p) => has(q, p.title.toLowerCase(), ...p.keywords));
    if (project) {
        return wantsNav
            ? { navigate: 'projects', text: `${here('projects')} ${project.title}: ${project.plain}\n${project.links.map((l) => `${l.label}: ${l.url}`).join('\n')}` }
            : { text: answers.project(project) };
    }

    // Things the profile does not state.
    if (has(q, 'salary', 'pay', 'compensation', 'ctc', 'rate', 'notice period', 'available', 'availability', 'start date', 'join', 'relocate', 'relocation', 'remote', 'visa', 'sponsorship', 'age', 'old', 'born', 'birthday', 'married', 'single', 'family', 'religion', 'hobbies', 'hobby', 'gender', 'pronouns', 'address', 'open to work', 'looking for', 'freelance')) {
        return { text: answers.unknown() };
    }

    // Fit for a role.
    if (has(q, 'fit', 'suitable', 'suited', 'match', 'qualified', 'right person', 'good candidate', 'good choice', 'should i hire', 'should we hire', 'why hire', 'why should')) {
        return { text: answers.fit(skillGroups.find((g) => has(q, ...g.keywords))) };
    }

    // Contact.
    if (has(q, 'contact', 'email', 'e-mail', 'mail', 'phone', 'call', 'number', 'reach', 'get in touch', 'linkedin', 'github', 'leetcode', 'instagram', 'product hunt', 'social', 'socials', 'hire', 'message', 'connect', 'talk to')) {
        const text = answers.contact();
        return wantsNav || /\bhow (do|can|could|would|should) (i|we)\b/.test(q)
            ? { navigate: 'contact', text: `${here('contact')} ${text}` }
            : { text };
    }

    // Certification and achievements (shown in the Education & Certification section).
    if (has(q, 'certification', 'certifications', 'certified', 'certificate', 'certificates', 'credly', 'badge', 'achievement', 'achievements', 'award', 'awards', 'rank', 'ranked', 'topper', 'architect')) {
        const text = answers.certification();
        return wantsNav ? { navigate: 'education', text: `${here('education')} ${text}` } : { text };
    }

    // Education.
    if (has(q, 'education', 'degree', 'degrees', 'college', 'university', 'school', 'mca', 'masters', "master's", 'bsc', 'b.sc', 'bachelor', 'cgpa', 'gpa', 'grades', 'marks', 'study', 'studied', 'studies', 'graduate', 'graduated', 'qualification', 'qualifications', 'academic')) {
        const text = answers.education();
        return wantsNav ? { navigate: 'education', text: `${here('education')} ${text}` } : { text };
    }

    // Spoken languages (before skills, which also matches "languages").
    if (has(q, 'speak', 'speaks', 'spoken', 'english', 'tamil') || (has(q, 'languages', 'language') && !has(q, 'programming', 'coding', 'code'))) {
        return { text: answers.spoken() };
    }

    // Experience.
    if (has(q, 'experience', 'experiences', 'work', 'works', 'worked', 'working', 'job', 'jobs', 'career', 'company', 'companies', 'employer', 'belsterns', 'role', 'roles', 'position', 'intern', 'internship', 'currently', 'current', 'years', 'professional', 'journey', 'employment', 'senior', 'junior', 'title', 'level', 'seniority') && !findSkills(q).length) {
        const text = answers.experience();
        return wantsNav ? { navigate: 'experience', text: `${here('experience')} ${text}` } : { text };
    }

    // Skills: a specific one, a group, or all of them.
    const skills = findSkills(q);
    if (skills.length && (KNOWS.test(q) || ABOUT_KAVIN.test(q) || words <= 3 || has(q, 'skill', 'skills'))) {
        return { text: answers.skillYes(skills) };
    }
    const group = skillGroups.find((g) => has(q, ...g.keywords));
    if (group && (has(q, 'skill', 'skills', 'stack', 'technologies', 'tools') || KNOWS.test(q) || ABOUT_KAVIN.test(q) || words <= 3)) {
        const text = answers.skillGroup(group);
        return wantsNav ? { navigate: 'skills', text: `${here('skills')} ${text}` } : { text };
    }
    if (has(q, 'skill', 'skills', 'tech stack', 'stack', 'technologies', 'technology', 'expertise', 'strengths', 'programming languages', 'tools', 'good at', 'specialise', 'specialize', 'speciality', 'specialty')) {
        const text = answers.skills();
        return wantsNav ? { navigate: 'skills', text: `${here('skills')} ${text}` } : { text };
    }
    if (KNOWS.test(q) && ABOUT_KAVIN.test(q)) return { text: answers.skillNotListed() };

    // Projects in general.
    if (has(q, 'project', 'projects', 'built', 'build', 'builds', 'made', 'apps', 'applications', 'repos', 'repositories', 'source code', 'work samples', 'portfolio pieces')) {
        const text = answers.projects();
        return wantsNav ? { navigate: 'projects', text: `${here('projects')} ${text}` } : { text };
    }

    // The guide itself and the site.
    if (has(q, 'who are you', 'what are you', 'what model', 'which model', 'chatgpt', 'gpt', 'which ai', 'are you kavin', 'are you a bot', 'are you an ai', 'are you ai', 'are you human', 'are you real', 'your name')) {
        return { text: answers.guide() };
    }

    // "Take me to the X section" for anything not handled above.
    if (wantsNav) {
        const section = Object.keys(SECTION_WORDS).find((id) => has(q, ...SECTION_WORDS[id]));
        if (section) return { navigate: section, text: `${here(section)} ${destinations[section].summary}` };
    }

    // Who Kavin is.
    const asksAbout =
        has(q, 'who is', "who's", 'tell me about', 'introduce', 'summary', 'summarise', 'summarize', 'background', 'bio', 'overview', 'describe', 'about kavin', 'about him', 'about them') && ABOUT_KAVIN.test(q);
    if (asksAbout || (words <= 3 && has(q, 'about', 'kavin', 'kavin pasupathy'))) {
        return wantsNav ? { navigate: 'about', text: `${here('about')} ${answers.about()}` } : { text: answers.about() };
    }

    if (has(q, 'site', 'website', 'page', 'portfolio', 'navigate', 'navigation', 'sections', 'section', 'menu', 'help', 'what can you do', 'what can i ask', 'what can you help', 'how does this work', 'how do i use', 'get around', 'find my way', 'dark mode', 'theme')) {
        return { text: answers.help() };
    }

    // A follow-up with no subject ("tell me more"): ask what about.
    if (words <= 4 && has(q, 'more', 'details', 'detail', 'elaborate', 'anything else', 'what else')) {
        return { text: 'Happy to. What would you like to know more about: experience, projects, skills, education, or how to contact Kavin?' };
    }

    // A question about Kavin that the facts do not cover vs. anything else.
    return { text: ABOUT_KAVIN.test(q) && has(q, 'kavin', 'pasupathy') ? answers.unknown() : answers.decline() };
}
