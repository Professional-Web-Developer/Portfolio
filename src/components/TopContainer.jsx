'use client';
import React from 'react';
import { Element, Link } from 'react-scroll';
import { motion } from 'framer-motion';
import { ArrowUpRight, BadgeCheck, Download } from 'lucide-react';
import './TopContainer.css';

const agentSteps = [
  { label: 'plan', text: 'Break the task into steps' },
  { label: 'tool', text: 'Query PostgreSQL for client data' },
  { label: 'llm', text: 'Claude drafts the report' },
  { label: 'trace', text: 'Run logged to Langfuse' },
];

const facts = [
  { value: '~2 yrs', label: 'Building production apps' },
  { value: 'Claude', label: 'Certified Architect' },
  { value: '8.4', label: 'MCA CGPA' },
  { value: '1st', label: 'Rank, B.Sc. Computer Science' },
];

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

function TopContainer() {
  return (
    <Element name="about" className="topcontainer">
      <div className="hero-content">
        <div className="hero-text">
          <motion.p className="hero-eyebrow" {...rise(0.05)}>
            Kavin Pasupathy · Software Engineer at Belsterns Technologies
          </motion.p>

          <motion.h1 className="hero-title" {...rise(0.12)}>
            Full-stack engineer building{' '}
            <span className="gradient-text">AI agents</span> that ship.
          </motion.h1>

          <motion.p className="description" {...rise(0.2)}>
            I design and build web products with Next.js and PostgreSQL, and agentic workflows with
            Claude that automate real business processes, from API and database design through to
            Dockerized deployment.
          </motion.p>

          <motion.div className="cta-container" {...rise(0.28)}>
            <Link to="projects" smooth={true} duration={800} offset={-70} className="btn primary-btn">
              View projects
            </Link>
            <a href="/assets/KAVIN_PASUPATHY_RESUME.pdf" target="_blank" rel="noopener noreferrer" className="btn secondary-btn">
              <Download size={16} /> Resume
            </a>
          </motion.div>

          <motion.a
            className="cert-pill"
            href="https://www.credly.com/badges/6cd276b2-03bc-44cf-98b6-950d17dbc8e3"
            target="_blank"
            rel="noopener noreferrer"
            {...rise(0.36)}
          >
            <BadgeCheck size={16} />
            Claude Certified Architect – Foundations
            <ArrowUpRight size={14} />
          </motion.a>
        </div>

        <motion.div className="hero-visuals" {...rise(0.25)}>
          <div className="agent-card" role="img" aria-label="Example of an AI agent run: plan, tool call, LLM draft, trace">
            <div className="agent-card__bar">
              <span /><span /><span />
              <em>agent.run · example</em>
            </div>
            <div className="agent-card__body">
              <div className="agent-task">
                <span className="agent-task__label">Task</span>
                Generate weekly client report
              </div>
              {agentSteps.map((step, i) => (
                <motion.div
                  key={step.label}
                  className="agent-step"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + i * 0.3 }}
                >
                  <span className={`agent-tag agent-tag--${step.label}`}>{step.label}</span>
                  <span className="agent-text">{step.text}</span>
                </motion.div>
              ))}
              <motion.div
                className="agent-done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.1 }}
              >
                ✓ Completed – report delivered
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.dl className="hero-facts" {...rise(0.5)}>
        {facts.map((fact) => (
          <div key={fact.label} className="hero-fact">
            <dt>{fact.value}</dt>
            <dd>{fact.label}</dd>
          </div>
        ))}
      </motion.dl>
    </Element>
  );
}

export default TopContainer;
