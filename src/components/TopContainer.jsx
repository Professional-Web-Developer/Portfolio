'use client';
import React from 'react';
import { Element, Link } from 'react-scroll';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, BadgeCheck, Download } from 'lucide-react';
import './TopContainer.css';

const agentSteps = [
  { label: 'plan', text: 'Break the task into steps', ms: '0.4s' },
  { label: 'tool', text: 'Query PostgreSQL for client data', ms: '1.2s' },
  { label: 'llm', text: 'Claude drafts the report', ms: '2.9s' },
  { label: 'trace', text: 'Logged to Langfuse', ms: '0.1s' },
];

function TopContainer() {
  return (
    <Element name="about" className="topcontainer">
      <div className="hero-content">
        <div className="hero-text">
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            Full-stack engineer building{' '}
            <span className="gradient-text">AI agents</span> that ship.
          </motion.h1>

          <motion.p
            className="description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            I&apos;m <b>Kavin Pasupathy</b>, a Software Engineer at <b>Belsterns Technologies</b>. I build
            web products with Next.js and PostgreSQL, and agentic workflows with Claude that automate real
            business processes.
          </motion.p>

          <motion.a
            className="cert-pill"
            href="https://www.credly.com/badges/6cd276b2-03bc-44cf-98b6-950d17dbc8e3"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <BadgeCheck size={16} />
            Claude Certified Architect – Foundations
            <ArrowUpRight size={14} />
          </motion.a>

          <motion.div
            className="cta-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <Link to="projects" smooth={true} duration={800} offset={-70} className="btn primary-btn">
              View projects
            </Link>
            <a href="/assets/KAVIN_PASUPATHY_RESUME.pdf" target="_blank" rel="noopener noreferrer" className="btn secondary-btn">
              <Download size={16} /> Resume
            </a>
          </motion.div>
        </div>

        <motion.div
          className="hero-visuals"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
        >
          <div className="agent-card">
            <div className="agent-card__bar">
              <span /><span /><span />
              <em>agent.run · example trace</em>
            </div>
            <div className="agent-card__body">
              <div className="agent-task">
                <span className="eyebrow">task</span>
                Generate weekly client report
              </div>
              {agentSteps.map((step, i) => (
                <motion.div
                  key={step.label}
                  className="agent-step"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 + i * 0.35 }}
                >
                  <span className={`agent-tag agent-tag--${step.label}`}>{step.label}</span>
                  <span className="agent-text">{step.text}</span>
                  <span className="agent-ms">{step.ms}</span>
                </motion.div>
              ))}
              <motion.div
                className="agent-done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.4 }}
              >
                ✓ Completed — report delivered
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ delay: 1, duration: 2, repeat: Infinity }}
      >
        <ArrowDown size={20} />
      </motion.div>
    </Element>
  );
}

export default TopContainer;
