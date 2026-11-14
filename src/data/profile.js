// Single source of truth for the portfolio guide (the chat widget).
//
// Every fact here is copied from the site's own components (TopContainer,
// ExperienceContainer, ProjectContainer, Skillcontainer, EducationContainer,
// Contact, Footer, app/layout.js) or from the resume PDF in public/assets.
// Where the two differ, the site wins, because it is the more recent of the
// two. Nothing is inferred. When the site content changes, update this file
// too: the guide can only answer from what is written here.
//
// The site does not state Kavin's pronouns, so the guide uses the name or
// "they".

export const SITE_URL = 'https://kavin-pasupathy.vercel.app';
export const RESUME_PATH = '/assets/KAVIN_PASUPATHY_RESUME.pdf';
export const CITY_PATH = '/city';

const GITHUB = 'https://github.com/Professional-Web-Developer';

export const profile = {
    name: 'Kavin Pasupathy',
    headline: 'Full-stack engineer building AI agents that ship.',
    title: 'Software Engineer',
    currentRole: 'Junior Software Engineer',
    company: 'Belsterns Technologies',
    location: 'Chennai, India', // resume header
    yearsOfExperience: '~2 years',
    summary:
        'Kavin designs and builds web products with Next.js, TypeScript and PostgreSQL, and agentic workflows with Claude (tool calling, RAG with pgvector, Langfuse observability) that automate real business processes, from API and database design through to Dockerized deployment.',
    resumeSummary:
        'Software Engineer with ~2 years of experience building production web applications with the MERN stack, Next.js, TypeScript and PostgreSQL, and delivering AI-agent and workflow-automation solutions for client projects. Owns features end-to-end, from API and database design through Dockerized deployment, with hands-on experience integrating LLM APIs (Claude), tool/function calling, RAG with pgvector, and agent observability tooling (Langfuse). Ranked 1st in the undergraduate Computer Science department.',
    // A version with no jargon, for visitors who are not engineers.
    plainSummary:
        'Kavin Pasupathy is a software engineer at Belsterns Technologies in Chennai, India, with about 2 years of experience. Kavin builds complete web applications (both the screens you see and the behind-the-scenes part) and "AI agents": software helpers that use an AI model to carry out multi-step business tasks, such as preparing client reports, without someone doing each step by hand.',
    quickFacts: [
        '~2 yrs building production apps',
        'Claude Certified Architect',
        '8.4 MCA CGPA',
        '1st rank, B.Sc. Computer Science',
    ],
    spokenLanguages: ['English (Professional)', 'Tamil (Native)'],
};

export const experience = [
    {
        id: 'belsterns-junior',
        company: 'Belsterns Technologies',
        location: 'Chennai', // resume
        role: 'Junior Software Engineer',
        duration: 'Jan 2025 - Present',
        type: 'Full-time',
        points: [
            'Develops and ships full-stack features for client web applications using Next.js, TypeScript and PostgreSQL, deployed in Dockerized environments.',
            'Builds features for Eztest, an online test management platform built with Next.js and PostgreSQL, plus AI-agent based task orchestration and intelligent process automation for business workflows.',
            'Designs AI-agent workflows that automate client reporting and business processes: integrating Claude LLM APIs with tool/function calling, orchestrating multi-step agent tasks, and monitoring agent behavior with Langfuse.',
            'Leads client modules end-to-end, from requirements and API/database design to implementation and release, working with cross-functional teams.',
            'Reduced manual reporting effort for clients by replacing repetitive workflows with automated agent pipelines.',
        ],
        skills: ['Next.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AI Agents', 'Claude API', 'Langfuse'],
    },
    {
        id: 'belsterns-intern',
        company: 'Belsterns Technologies',
        location: 'Chennai',
        role: 'Software Development Engineer Intern',
        duration: 'Sep 2024 - Jan 2025',
        type: 'Internship',
        points: [
            'Built and optimized responsive web applications in the MERN stack and Next.js for client-facing projects.',
            'Contributed to client projects using Next.js and was promoted to full-time Junior Software Engineer within 4 months.',
        ],
        skills: ['React', 'Next.js', 'MERN', 'JavaScript', 'Git'],
    },
];

// In the order the Projects section shows them: two featured, then "Earlier work".
export const projects = [
    {
        id: 'chatcart-ai',
        title: 'ChatCart AI',
        subtitle: 'AI sales agent with in-chat PayPal checkout',
        featured: true,
        date: 'Nov 2026',
        note: 'Built for the PayPal AI Hackathon on Devpost',
        keywords: ['chatcart', 'chat cart', 'paypal', 'hackathon', 'devpost', 'sales agent', 'checkout', 'shop'],
        desc: 'Built for the PayPal AI Hackathon on Devpost. Customers order in plain language and pay with PayPal inside the chat, and the shop owner handles orders, refunds and invoices by talking to an assistant. All payments run in the PayPal sandbox; no real money moves.',
        plain: 'ChatCart AI is an AI shop assistant: customers place an order just by chatting and pay with PayPal right inside the chat, and the shop owner manages orders, refunds and invoices by talking to their own assistant. It uses PayPal\'s test mode, so no real money moves.',
        highlights: [
            'Tool-calling customer and owner agents on the Vercel AI SDK, with multi-provider model fallback (Gemini, Groq, Claude, OpenAI); a new shop is created from a pasted price list via structured output.',
            'Prices are computed server-side in integer cents from the menu, and confirm-before-payment and confirm-before-refund are enforced in code rather than left to the model.',
            'PayPal REST integration in sandbox: Orders v2 create and capture, refunds, Invoicing and webhook signature verification.',
        ],
        flow: 'Customer chat, then the agent (tool calls get_menu and create_order), then a server-priced order, then PayPal sandbox checkout, then the owner dashboard.',
        links: [
            { label: 'Live demo', url: 'https://chatcart-ai-alpha.vercel.app' },
            { label: 'Code', url: `${GITHUB}/chatcart-ai` },
            { label: 'Demo video', url: 'https://youtu.be/ixOMI0m0H_M' },
        ],
        tags: ['Next.js 16', 'TypeScript', 'Vercel AI SDK', 'PayPal REST', 'Postgres (Neon)', 'Zod'],
    },
    {
        id: 'blackspace-ai',
        title: 'BlackSpace AI',
        subtitle: 'Multi-agent LLM platform',
        featured: true,
        date: 'Aug 2026',
        keywords: ['blackspace', 'black space', 'multi-agent', 'multi agent', 'llm platform', 'agent platform'],
        desc: 'A general-purpose AI agent platform where Claude runs an agentic tool-calling loop (call tools, read results, repeat) with streamed reasoning, tool status and source citations. Agents are config profiles (prompt, tools, step limit, reasoning effort), with 5 built in: general, knowledge base, researcher, data analyst and offline.',
        plain: 'BlackSpace AI is a platform for running AI assistants ("agents") that can use tools, look things up in your own documents and show their sources. It also tracks what each run costs and keeps user accounts secure.',
        highlights: [
            'RAG on Postgres/Supabase with pgvector: paragraph-aware chunking with overlap, cosine-similarity search with a calibrated relevance floor, and pluggable embeddings (Gemini, OpenAI) that switch providers without a migration.',
            'Prompt caching and server-side context compaction cut cost on long runs, with per-turn cost tracking, per-user monthly spend limits and full run tracing in Langfuse via OpenTelemetry.',
            'scrypt password hashing, hashed server-side sessions, role-based admin access and repository-level data ownership; Drizzle migrations, AWS S3 presigned uploads and Dockerized Postgres.',
        ],
        links: [{ label: 'Code', url: `${GITHUB}/BlackSpaceAI` }],
        tags: ['Next.js', 'TypeScript', 'Claude API', 'Vercel AI SDK', 'pgvector', 'Langfuse'],
    },
    {
        id: 'home-rental',
        title: 'Home Rental Platform',
        date: 'Jul 2024', // resume
        keywords: ['home rental', 'house rental', 'rental', 'booking'],
        desc: 'MERN rental marketplace with a booking calendar, search by location and dates, JWT authentication, image uploads and email notifications. The resume adds full CRUD, an availability calendar, email notifications with Nodemailer and image uploads with Multer.',
        plain: 'A website for renting homes: people can search by place and dates, see availability on a calendar, book, and get email notifications.',
        links: [{ label: 'Code', url: `${GITHUB}/House_Rental` }],
        tags: ['MERN', 'JWT'],
    },
    {
        id: 'real-estate',
        title: 'Real Estate Platform',
        keywords: ['real estate', 'property', 'properties'],
        desc: 'Property listings with multi-criteria search (continent, price range, property type), authentication and REST APIs on Express and MongoDB.',
        plain: 'A website for property listings, with search by continent, price range and property type, and sign-in.',
        links: [{ label: 'Code', url: `${GITHUB}/Real-Estate` }],
        tags: ['React', 'Express', 'MongoDB'],
    },
    {
        id: 'expense-tracker',
        title: 'Expense Tracker',
        keywords: ['expense tracker', 'expense', 'expenses', 'spending'],
        desc: 'MERN application for tracking daily expenses, with charts of spending by category.',
        plain: 'An app for recording daily expenses and seeing spending by category as charts.',
        links: [{ label: 'Code', url: `${GITHUB}/expense-tracker` }],
        tags: ['MERN', 'Chart.js'],
    },
];

export const skillGroups = [
    {
        id: 'ai',
        title: 'AI & Agents',
        keywords: ['ai', 'agent', 'agents', 'llm', 'automation', 'machine learning', 'genai', 'generative'],
        desc: 'Designing agent workflows that automate real business processes.',
        skills: [
            'AI Agents', 'Agentic Workflows', 'Agent Orchestration', 'Claude API', 'Anthropic SDK',
            'Tool / Function Calling', 'MCP', 'RAG', 'Vector Search', 'Embeddings', 'Agent Skills',
            'Prompt Engineering', 'Prompt Caching', 'Vercel AI SDK', 'Langfuse', 'OpenTelemetry',
        ],
    },
    {
        id: 'frontend',
        title: 'Frontend',
        keywords: ['frontend', 'front-end', 'front end', 'ui', 'user interface'],
        skills: ['Next.js', 'React.js', 'TypeScript', 'JavaScript (ES6+)', 'Responsive UI'],
    },
    {
        id: 'backend',
        title: 'Backend',
        keywords: ['backend', 'back-end', 'back end', 'server', 'api'],
        skills: ['Node.js', 'Express.js', 'Python', 'REST APIs', 'PayPal REST APIs', 'JWT Auth', 'Zod'],
    },
    {
        id: 'databases',
        title: 'Databases & ORM',
        keywords: ['database', 'databases', 'orm'],
        skills: ['PostgreSQL', 'Supabase', 'pgvector', 'MongoDB', 'Mongoose', 'Drizzle ORM', 'Prisma ORM', 'SQL'],
    },
    {
        id: 'devops',
        title: 'Tools & DevOps',
        keywords: ['devops', 'tooling', 'deployment', 'cloud'],
        skills: ['Docker', 'Docker Compose', 'GitHub Actions (CI/CD)', 'AWS S3', 'AWS EC2', 'Git & GitHub', 'Vercel', 'Claude', 'Cursor'],
    },
    {
        id: 'dsa',
        title: 'Data Structures & Algorithms',
        keywords: ['dsa', 'data structures', 'algorithms', 'algorithm', 'leetcode', 'problem solving'],
        skills: [
            'Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Hash Maps', 'Trees', 'Graphs', 'Heaps',
            'Sorting', 'Binary Search', 'Dynamic Programming',
        ],
    },
];

// Listed on the resume but not in the site's Skills section.
export const resumeOnlySkills = ['HTML5', 'CSS3', 'Nodemailer', 'Multer', 'VS Code'];

export const programmingLanguages = ['TypeScript', 'JavaScript', 'Python', 'SQL']; // resume

export const education = [
    {
        institution: 'Kongu Engineering College, Perundurai',
        degree: 'Master of Computer Applications (MCA)',
        duration: '2023 - 2025',
        score: 'CGPA 8.4',
    },
    {
        institution: 'Government Arts and Science College, Thittamalai',
        degree: 'B.Sc. Computer Science',
        duration: '2020 - 2023',
        score: 'CGPA 7.57',
        note: 'Ranked 1st in the undergraduate Computer Science department.',
    },
];

export const certification = {
    title: 'Claude Certified Architect - Foundations',
    issuer: 'Anthropic',
    issued: 'Sep 17, 2026', // resume
    link: 'https://www.credly.com/badges/6cd276b2-03bc-44cf-98b6-950d17dbc8e3',
    plain: 'A certification from Anthropic (the company that makes the Claude AI models) showing that Kavin knows how to design systems built on Claude.',
};

export const contact = {
    email: 'pasupathy.kavinmca@gmail.com',
    phone: '+91 8667328882',
    note: 'The Contact section says email is the quickest way to reach Kavin about roles, projects or questions about their work.',
    links: [
        { label: 'GitHub', url: GITHUB },
        { label: 'LinkedIn', url: 'https://www.linkedin.com/in/kavin-pasupathy-839010289/' },
        { label: 'LeetCode', url: 'https://leetcode.com/u/KavinPasupathy/' },
        { label: 'Product Hunt', url: 'https://www.producthunt.com/@kavin_pasupathy' },
        { label: 'Instagram', url: 'https://www.instagram.com/kavinpasupathy/' },
    ],
};

// Places the guide can take a visitor. `kind: 'section'` entries are in-page
// anchors on the home page (the element ids in the components); their order
// here is the order on the page.
export const destinations = {
    about: {
        kind: 'section',
        label: 'About',
        summary: 'The introduction at the top of the page: who Kavin is, buttons to view projects and download the résumé, the Claude certification badge, an example of an AI agent run, and four quick facts.',
    },
    experience: {
        kind: 'section',
        label: 'Experience',
        summary: 'The "Professional Journey" section: Kavin\'s two roles at Belsterns Technologies, from intern to Junior Software Engineer.',
    },
    projects: {
        kind: 'section',
        label: 'Projects',
        summary: 'The "Selected Projects" section: two featured AI projects, ChatCart AI and BlackSpace AI, then three earlier web apps, each with a link to its code.',
    },
    skills: {
        kind: 'section',
        label: 'Skills',
        summary: 'The "Skills" section: Kavin\'s skills grouped into AI & Agents, Frontend, Backend, Databases & ORM, Tools & DevOps, and Data Structures & Algorithms, plus spoken languages.',
    },
    education: {
        kind: 'section',
        label: 'Education',
        summary: 'The "Education & Certification" section: the Claude Certified Architect certification, an MCA and a B.Sc. in Computer Science.',
    },
    contact: {
        kind: 'section',
        label: 'Contact',
        summary: 'The "Get in Touch" section at the bottom: email (with a copy button), phone and links to Kavin\'s profiles.',
    },
    resume: {
        kind: 'file',
        label: 'Résumé (PDF)',
        href: RESUME_PATH,
        summary: 'Kavin\'s one-page résumé as a PDF, opened in a new tab.',
    },
    city: {
        kind: 'route',
        label: 'Career City',
        href: CITY_PATH,
        summary: 'Career City is a 3D driving game on this site: you drive around a small city to buildings, and each building represents a section of Kavin\'s résumé.',
    },
};

export const DESTINATION_IDS = Object.keys(destinations);

export const SECTION_IDS = DESTINATION_IDS.filter((id) => destinations[id].kind === 'section');

// The guided tour visits every home page section, top to bottom.
export const tourStops = SECTION_IDS;

// Short, plain-language explanations of technical words that appear on the
// site, so the guide can explain them to non-technical visitors.
export const glossary = [
    { term: 'AI agent', keywords: ['ai agent', 'ai agents', 'agent', 'agents', 'agentic'], plain: 'An AI agent is software that uses an AI model to work through a task in several steps on its own: it decides what to do next, uses tools (like looking something up in a database), checks the result and carries on until the job is done.' },
    { term: 'Full-stack', keywords: ['full-stack', 'full stack', 'fullstack'], plain: 'Full-stack means building both halves of an application: the screens people see and click (frontend) and the behind-the-scenes logic and data storage (backend).' },
    { term: 'LLM', keywords: ['llm', 'large language model'], plain: 'An LLM (large language model) is the kind of AI that reads and writes text, such as Claude.' },
    { term: 'Claude', keywords: ['claude'], plain: 'Claude is a family of AI models made by Anthropic. Kavin uses it as the "brain" inside the AI agents they build.' },
    { term: 'Tool calling', keywords: ['tool calling', 'function calling', 'tool/function calling', 'tool call', 'tool calls'], plain: 'Tool calling lets an AI model do things instead of only writing text: the model asks the application to run a specific action (a "tool"), such as looking up data, and then uses the result.' },
    { term: 'RAG', keywords: ['rag', 'retrieval augmented', 'retrieval-augmented'], plain: 'RAG (retrieval-augmented generation) means the AI first looks up relevant passages in your own documents and then answers using them, so answers are based on real sources.' },
    { term: 'pgvector', keywords: ['pgvector', 'vector search', 'embeddings', 'embedding'], plain: 'pgvector is an add-on for the PostgreSQL database that lets it search text by meaning rather than exact words. It powers the document look-up step in RAG.' },
    { term: 'Langfuse', keywords: ['langfuse', 'observability', 'opentelemetry', 'tracing'], plain: 'Langfuse is a monitoring tool for AI applications: it records each step an AI agent takes so engineers can see what happened, what it cost and where it went wrong.' },
    { term: 'MCP', keywords: ['mcp', 'model context protocol'], plain: 'MCP (Model Context Protocol) is a standard way to plug tools and data sources into AI models.' },
    { term: 'MERN', keywords: ['mern'], plain: 'MERN is a popular set of four technologies for building web apps: MongoDB (database), Express and Node.js (backend) and React (frontend).' },
    { term: 'Next.js', keywords: ['next.js', 'nextjs', 'next js'], plain: 'Next.js is a widely used framework for building fast websites and web apps with React. This portfolio is built with it.' },
    { term: 'React', keywords: ['react', 'react.js', 'reactjs'], plain: 'React is a very popular library for building the interactive screens of a website or app.' },
    { term: 'TypeScript', keywords: ['typescript'], plain: 'TypeScript is JavaScript with extra checks that catch mistakes before the code runs.' },
    { term: 'PostgreSQL', keywords: ['postgresql', 'postgres'], plain: 'PostgreSQL is a reliable, widely used database for storing an application\'s data.' },
    { term: 'MongoDB', keywords: ['mongodb', 'mongo'], plain: 'MongoDB is a database that stores data as flexible documents rather than fixed tables.' },
    { term: 'Docker', keywords: ['docker', 'dockerized', 'container', 'containers'], plain: 'Docker packages an application with everything it needs so it runs the same way on any computer or server.' },
    { term: 'Prompt caching', keywords: ['prompt caching'], plain: 'Prompt caching re-uses the parts of an AI request that do not change between calls, which makes long AI tasks cheaper and faster.' },
    { term: 'CI/CD', keywords: ['ci/cd', 'github actions'], plain: 'CI/CD means automatically testing and releasing code every time it changes, so updates ship quickly and safely.' },
    { term: 'Sandbox', keywords: ['sandbox'], plain: 'A sandbox is a test mode of a service such as PayPal: everything works as normal, but no real money moves.' },
    { term: 'REST API', keywords: ['rest api', 'rest apis', 'api', 'apis'], plain: 'An API is how two pieces of software talk to each other; REST is the most common style for web applications.' },
    { term: 'JWT', keywords: ['jwt'], plain: 'JWT is a common, secure way for a website to remember that you are signed in.' },
];

// Every URL the guide is allowed to turn into a clickable link.
export const knownLinks = [
    SITE_URL,
    certification.link,
    ...projects.flatMap((p) => p.links.map((l) => l.url)),
    ...contact.links.map((l) => l.url),
];
