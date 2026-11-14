// Content for the six Career City stops. Everything here mirrors the main
// site's sections (TopContainer, ExperienceContainer, ProjectContainer,
// Skillcontainer, EducationContainer, Contact). Edit the copy here; the 3D
// game and the plain-list fallback both read from this file.

const GITHUB = 'https://github.com/Professional-Web-Developer';
const CREDLY = 'https://www.credly.com/badges/6cd276b2-03bc-44cf-98b6-950d17dbc8e3';

export const CONTACT_EMAIL = 'pasupathy.kavinmca@gmail.com';
export const RESUME_URL = '/assets/KAVIN_PASUPATHY_RESUME.pdf';

/*
 Block types understood by StopCard.jsx:
   text       { text }
   facts      { items: [{ value, label }] }
   role       { role, org, date, badge, points[], tags[] }
   project    { title, subtitle, date, note?, desc, points[]?, links[], tags[] }
   list       { title, items: [{ title, desc, href, linkLabel, tags[] }] }
   chips      { title, desc?, items[] }
   credential { kind, title, org, meta[]?, link? }
   links      { items: [{ label, value, href, external? }] }
*/
export const STOPS = [
  {
    id: 'home',
    name: 'Home',
    place: 'Kavin’s house',
    sectionHref: '/#about',
    sectionLabel: 'See the About section',
    kicker: 'Kavin Pasupathy · Software Engineer at Belsterns Technologies',
    title: 'Full-stack engineer building AI agents that ship.',
    blocks: [
      {
        type: 'text',
        text: 'I design and build web products with Next.js, TypeScript and PostgreSQL, and agentic workflows with Claude (tool calling, RAG with pgvector, Langfuse observability) that automate real business processes, from API and database design through to Dockerized deployment.',
      },
      {
        type: 'facts',
        items: [
          { value: '~2 yrs', label: 'Building production apps' },
          { value: 'Claude', label: 'Certified Architect' },
          { value: '8.4', label: 'MCA CGPA' },
          { value: '1st', label: 'Rank, B.Sc. Computer Science' },
        ],
      },
      {
        type: 'links',
        items: [
          { label: 'Credential', value: 'Claude Certified Architect – Foundations', href: CREDLY, external: true },
          { label: 'Resume', value: 'Download the resume (PDF)', href: RESUME_URL, external: true },
        ],
      },
    ],
  },
  {
    id: 'experience',
    name: 'Experience',
    place: 'Belsterns Technologies office tower',
    sectionHref: '/#experience',
    sectionLabel: 'See the Experience section',
    kicker: 'Professional journey',
    title: 'Belsterns Technologies',
    blocks: [
      {
        type: 'role',
        role: 'Junior Software Engineer',
        org: 'Belsterns Technologies',
        date: 'Jan 2025 – Present',
        badge: 'Full-time',
        points: [
          'Develop and ship full-stack features for client web applications using Next.js, TypeScript and PostgreSQL, deployed in Dockerized environments.',
          'Design AI-agent workflows that automate client reporting and business processes: integrating Claude LLM APIs with tool/function calling, orchestrating multi-step agent tasks, and monitoring agent behavior with Langfuse.',
          'Lead client modules end-to-end, from requirements and API/database design to implementation and release, working with cross-functional teams.',
          'Reduced manual reporting effort for clients by replacing repetitive workflows with automated agent pipelines.',
        ],
        tags: ['Next.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AI Agents', 'Claude API', 'Langfuse'],
      },
      {
        type: 'role',
        role: 'Software Development Engineer Intern',
        org: 'Belsterns Technologies',
        date: 'Sep 2024 – Jan 2025',
        badge: 'Internship',
        points: [
          'Built and optimized responsive web applications in the MERN stack and Next.js for client-facing projects.',
          'Contributed to client projects using Next.js and was promoted to full-time Junior Software Engineer within 4 months.',
        ],
        tags: ['React', 'Next.js', 'MERN', 'JavaScript', 'Git'],
      },
    ],
  },
  {
    id: 'projects',
    name: 'Projects',
    place: 'Project lab and showroom',
    sectionHref: '/#projects',
    sectionLabel: 'See the Projects section',
    kicker: 'Selected projects',
    title: 'AI agent systems built end to end',
    blocks: [
      {
        type: 'project',
        title: 'ChatCart AI',
        subtitle: 'AI sales agent with in-chat PayPal checkout',
        date: 'Nov 2026',
        note: 'PayPal AI Hackathon (Devpost)',
        desc: 'Built for the PayPal AI Hackathon on Devpost. Customers order in plain language and pay with PayPal inside the chat, and the shop owner handles orders, refunds and invoices by talking to an assistant. All payments run in the PayPal sandbox; no real money moves.',
        points: [
          'Tool-calling customer and owner agents on the Vercel AI SDK, with multi-provider model fallback (Gemini, Groq, Claude, OpenAI).',
          'Prices are computed server-side in integer cents from the menu, and confirm-before-payment and confirm-before-refund are enforced in code rather than left to the model.',
        ],
        links: [
          { label: 'Live demo', href: 'https://chatcart-ai-alpha.vercel.app' },
          { label: 'View code', href: `${GITHUB}/chatcart-ai` },
          { label: 'Watch demo', href: 'https://youtu.be/ixOMI0m0H_M' },
        ],
        tags: ['Next.js 16', 'TypeScript', 'Vercel AI SDK', 'PayPal REST', 'Postgres (Neon)', 'Zod'],
      },
      {
        type: 'project',
        title: 'BlackSpace AI',
        subtitle: 'Multi-agent LLM platform',
        date: 'Aug 2026',
        desc: 'A general-purpose AI agent platform where Claude runs an agentic tool-calling loop with streamed reasoning, tool status and source citations. Agents are config profiles (prompt, tools, step limit, reasoning effort).',
        points: [
          'RAG on Postgres/Supabase with pgvector, with pluggable embeddings (Gemini, OpenAI) that switch providers without a migration.',
          'Prompt caching and server-side context compaction cut cost on long runs, with per-turn cost tracking and full run tracing in Langfuse via OpenTelemetry.',
        ],
        links: [{ label: 'View code', href: `${GITHUB}/BlackSpaceAI` }],
        tags: ['Next.js', 'TypeScript', 'Claude API', 'Vercel AI SDK', 'pgvector', 'Langfuse'],
      },
      {
        type: 'list',
        title: 'Earlier work',
        items: [
          {
            title: 'Home Rental Platform',
            desc: 'MERN rental marketplace with a booking calendar, search by location and dates, JWT authentication, image uploads and email notifications.',
            href: `${GITHUB}/House_Rental`,
            linkLabel: 'View code',
            tags: ['MERN', 'JWT'],
          },
          {
            title: 'Real Estate Platform',
            desc: 'Property listings with multi-criteria search (continent, price range, property type), authentication and REST APIs on Express and MongoDB.',
            href: `${GITHUB}/Real-Estate`,
            linkLabel: 'View code',
            tags: ['React', 'Express', 'MongoDB'],
          },
          {
            title: 'Expense Tracker',
            desc: 'MERN application for tracking daily expenses, with charts of spending by category.',
            href: `${GITHUB}/expense-tracker`,
            linkLabel: 'View code',
            tags: ['MERN', 'Chart.js'],
          },
        ],
      },
    ],
  },
  {
    id: 'skills',
    name: 'Skills',
    place: 'Skills workshop',
    sectionHref: '/#skills',
    sectionLabel: 'See the Skills section',
    kicker: 'Skills',
    title: 'Full-stack foundations with a focus on AI agents and automation.',
    blocks: [
      {
        type: 'chips',
        title: 'AI & Agents',
        desc: 'Designing agent workflows that automate real business processes.',
        items: [
          'AI Agents', 'Agentic Workflows', 'Agent Orchestration', 'Claude API', 'Anthropic SDK',
          'Tool / Function Calling', 'MCP', 'RAG', 'Vector Search', 'Embeddings', 'Agent Skills',
          'Prompt Engineering', 'Prompt Caching', 'Vercel AI SDK', 'Langfuse', 'OpenTelemetry',
        ],
      },
      {
        type: 'chips',
        title: 'Frontend',
        items: ['Next.js', 'React.js', 'TypeScript', 'JavaScript (ES6+)', 'Responsive UI'],
      },
      {
        type: 'chips',
        title: 'Backend',
        items: ['Node.js', 'Express.js', 'Python', 'REST APIs', 'PayPal REST APIs', 'JWT Auth', 'Zod'],
      },
      {
        type: 'chips',
        title: 'Databases & ORM',
        items: ['PostgreSQL', 'Supabase', 'pgvector', 'MongoDB', 'Mongoose', 'Drizzle ORM', 'Prisma ORM', 'SQL'],
      },
      {
        type: 'chips',
        title: 'Tools & DevOps',
        items: [
          'Docker', 'Docker Compose', 'GitHub Actions (CI/CD)', 'AWS S3', 'AWS EC2', 'Git & GitHub', 'Vercel',
          'Claude', 'Cursor',
        ],
      },
      {
        type: 'chips',
        title: 'Data Structures & Algorithms',
        items: [
          'Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Hash Maps', 'Trees', 'Graphs', 'Heaps',
          'Sorting', 'Binary Search', 'Dynamic Programming',
        ],
      },
      { type: 'chips', title: 'Languages', items: ['English (Professional)', 'Tamil (Native)'] },
    ],
  },
  {
    id: 'education',
    name: 'Education',
    place: 'Campus',
    sectionHref: '/#education',
    sectionLabel: 'See the Education section',
    kicker: 'Education & Certification',
    title: 'Degrees and a Claude credential',
    blocks: [
      {
        type: 'credential',
        kind: 'Certification',
        title: 'Claude Certified Architect – Foundations',
        org: 'Anthropic',
        link: { label: 'Verify on Credly', href: CREDLY },
      },
      {
        type: 'credential',
        kind: 'Degree',
        title: 'Master of Computer Applications (MCA)',
        org: 'Kongu Engineering College, Perundurai',
        meta: ['2023 – 2025', 'CGPA 8.4'],
      },
      {
        type: 'credential',
        kind: 'Degree',
        title: 'B.Sc. Computer Science',
        org: 'Government Arts and Science College, Thittamalai',
        meta: ['2020 – 2023', 'CGPA 7.57 · Ranked 1st in department'],
      },
    ],
  },
  {
    id: 'contact',
    name: 'Contact',
    place: 'Post office',
    sectionHref: '/#contact',
    sectionLabel: 'See the Contact section',
    kicker: 'Get in touch',
    title: 'Send Kavin a message',
    blocks: [
      {
        type: 'text',
        text: 'For roles, projects or questions about my work, email is the quickest way to reach me.',
      },
      {
        type: 'links',
        items: [
          { label: 'Email', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
          { label: 'Phone', value: '+91 8667328882', href: 'tel:+918667328882' },
          { label: 'GitHub', value: 'Professional-Web-Developer', href: GITHUB, external: true },
          {
            label: 'LinkedIn',
            value: 'kavin-pasupathy',
            href: 'https://www.linkedin.com/in/kavin-pasupathy-839010289/',
            external: true,
          },
          { label: 'LeetCode', value: 'KavinPasupathy', href: 'https://leetcode.com/u/KavinPasupathy/', external: true },
          {
            label: 'Product Hunt',
            value: '@kavin_pasupathy',
            href: 'https://www.producthunt.com/@kavin_pasupathy',
            external: true,
          },
          {
            label: 'Instagram',
            value: 'kavinpasupathy',
            href: 'https://www.instagram.com/kavinpasupathy/',
            external: true,
          },
          { label: 'Resume', value: 'Download the resume (PDF)', href: RESUME_URL, external: true },
        ],
      },
    ],
  },
];

export const STOP_BY_ID = Object.fromEntries(STOPS.map((stop) => [stop.id, stop]));
