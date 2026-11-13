'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Github, ArrowUpRight, ExternalLink, Play, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import './ProjectContainer.css';

const GITHUB = 'https://github.com/Professional-Web-Developer';

// The real ChatCart AI request path, drawn instead of a screenshot.
const chatcartFlow = [
  { step: 'Customer chat', detail: 'Order written in plain language' },
  { step: 'Agent', detail: 'Tool calls: get_menu, create_order' },
  { step: 'Server-priced order', detail: 'Total computed from the menu in integer cents' },
  { step: 'PayPal (sandbox)', detail: 'Orders v2: create, verify, capture' },
  { step: 'Owner dashboard', detail: 'Orders, refunds and invoices by assistant' },
];

const featured = [
  {
    title: 'ChatCart AI',
    subtitle: 'AI sales agent with in-chat PayPal checkout',
    date: 'Nov 2026',
    note: 'PayPal AI Hackathon (Devpost)',
    flow: chatcartFlow,
    flowLabel:
      'ChatCart AI flow: customer chat, then the agent, then a server-priced order, then PayPal sandbox checkout, then the owner dashboard',
    desc: 'Built for the PayPal AI Hackathon on Devpost. Customers order in plain language and pay with PayPal inside the chat, and the shop owner handles orders, refunds and invoices by talking to an assistant. All payments run in the PayPal sandbox; no real money moves.',
    highlights: [
      'Tool-calling customer and owner agents on the Vercel AI SDK, with multi-provider model fallback (Gemini, Groq, Claude, OpenAI); a new shop is created from a pasted price list via structured output.',
      'Prices are computed server-side in integer cents from the menu, and confirm-before-payment and confirm-before-refund are enforced in code rather than left to the model.',
      'PayPal REST integration in sandbox: Orders v2 create and capture, refunds, Invoicing and webhook signature verification.',
    ],
    links: [
      { kind: 'demo', label: 'Live demo', href: 'https://chatcart-ai-alpha.vercel.app', aria: 'Open the ChatCart AI live demo' },
      { kind: 'code', label: 'View code', href: `${GITHUB}/chatcart-ai`, aria: 'View ChatCart AI source code on GitHub' },
      { kind: 'video', label: 'Watch demo', href: 'https://youtu.be/ixOMI0m0H_M', aria: 'Watch the ChatCart AI demo video on YouTube' },
    ],
    tags: ['Next.js 16', 'TypeScript', 'Vercel AI SDK', 'PayPal REST', 'Postgres (Neon)', 'Zod'],
  },
  {
    img: '/assets/blackspace.webp',
    imgAlt: 'BlackSpace AI cover: built-in agents, the Claude tool-calling loop, and RAG, caching and tracing',
    title: 'BlackSpace AI',
    subtitle: 'Multi-agent LLM platform',
    date: 'Aug 2026',
    desc: 'A general-purpose AI agent platform where Claude runs an agentic tool-calling loop with streamed reasoning, tool status and source citations. Agents are config profiles (prompt, tools, step limit, reasoning effort).',
    highlights: [
      'RAG on Postgres/Supabase with pgvector: paragraph-aware chunking with overlap, cosine-similarity search with a calibrated relevance floor, and pluggable embeddings (Gemini, OpenAI) that switch providers without a migration.',
      'Prompt caching and server-side context compaction cut cost on long runs, with per-turn cost tracking, per-user monthly spend limits and full run tracing in Langfuse via OpenTelemetry.',
      'scrypt password hashing, hashed server-side sessions, role-based admin access and repository-level data ownership; Drizzle migrations, AWS S3 presigned uploads and Dockerized Postgres.',
    ],
    links: [
      { kind: 'code', label: 'View code', href: `${GITHUB}/BlackSpaceAI`, aria: 'View BlackSpace AI source code on GitHub' },
    ],
    tags: ['Next.js', 'TypeScript', 'Claude API', 'Vercel AI SDK', 'pgvector', 'Langfuse'],
  },
];

const earlier = [
  {
    img: '/assets/houserental.webp',
    title: 'Home Rental Platform',
    desc: 'MERN rental marketplace with a booking calendar, search by location and dates, JWT authentication, image uploads and email notifications.',
    link: `${GITHUB}/House_Rental`,
    tags: ['MERN', 'JWT'],
  },
  {
    img: '/assets/realestate.webp',
    title: 'Real Estate Platform',
    desc: 'Property listings with multi-criteria search (continent, price range, property type), authentication and REST APIs on Express and MongoDB.',
    link: `${GITHUB}/Real-Estate`,
    tags: ['React', 'Express', 'MongoDB'],
  },
  {
    img: '/assets/et.webp',
    title: 'Expense Tracker',
    desc: 'MERN application for tracking daily expenses, with charts of spending by category.',
    link: `${GITHUB}/expense-tracker`,
    tags: ['MERN', 'Chart.js'],
  },
];

const linkIcons = {
  demo: <ExternalLink size={16} />,
  code: <Github size={16} />,
  video: <Play size={16} />,
};

function FlowDiagram({ steps, label }) {
  return (
    <div className="flow" role="img" aria-label={label}>
      <ol className="flow__steps" aria-hidden="true">
        {steps.map((item, index) => (
          <li key={item.step} className="flow__item">
            <div className="flow__node">
              <span className="flow__index">{String(index + 1).padStart(2, '0')}</span>
              <span className="flow__title">{item.step}</span>
              <span className="flow__detail">{item.detail}</span>
            </div>
            {index < steps.length - 1 && <ChevronRight className="flow__arrow" size={18} />}
          </li>
        ))}
      </ol>
    </div>
  );
}

function ProjectContainer() {
  return (
    <section id="projects" className="projectcontainer">
      <div className="project-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="section-header"
        >
          <h2>Selected Projects</h2>
          <p>AI agent systems built end to end, from schema and API design to the UI.</p>
        </motion.div>

        <div className="projects-grid">
          {featured.map((project) => (
            <motion.article
              key={project.title}
              className="project-card project-card--featured"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {project.flow ? (
                <FlowDiagram steps={project.flow} label={project.flowLabel} />
              ) : (
                <div className="project-image-wrapper">
                  <Image
                    src={project.img}
                    alt={project.imgAlt}
                    fill
                    className="project-img"
                    sizes="(max-width: 768px) 100vw, 1120px"
                  />
                </div>
              )}
              <div className="project-info">
                <div className="project-tags">
                  <span className="tag tag--featured">Featured · {project.date}</span>
                  {project.note && <span className="tag tag--featured">{project.note}</span>}
                  {project.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <h3>
                  {project.title} <span className="project-subtitle">— {project.subtitle}</span>
                </h3>
                <p>{project.desc}</p>
                <ul className="project-highlights">
                  {project.highlights.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <div className="project-links">
                  {project.links.map((link, index) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`project-link ${index === 0 && project.links.length > 1 ? 'project-link--primary' : ''}`}
                      aria-label={`${link.aria} (opens in a new tab)`}
                    >
                      {linkIcons[link.kind]} {link.label} <ArrowUpRight size={14} />
                    </a>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <h3 className="projects-subheading">Earlier work</h3>
        <div className="projects-grid projects-grid--compact">
          {earlier.map((project, index) => (
            <motion.article
              key={project.title}
              className="project-card project-card--compact"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <div className="project-image-wrapper">
                <Image
                  src={project.img}
                  alt={`${project.title} screenshot`}
                  fill
                  className="project-img"
                  sizes="(max-width: 800px) 100vw, 360px"
                />
              </div>
              <div className="project-info">
                <div className="project-tags">
                  {project.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <h4>{project.title}</h4>
                <p>{project.desc}</p>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link"
                  aria-label={`View ${project.title} source code on GitHub (opens in a new tab)`}
                >
                  <Github size={16} /> View code <ArrowUpRight size={14} />
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProjectContainer;
