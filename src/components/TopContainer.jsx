'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowUpRight, BadgeCheck, Car, Download } from 'lucide-react';
import './TopContainer.css';

// Decorative WebGL graph: its own chunk, never part of first-load JS.
const AgentScene = dynamic(() => import('./AgentScene'), { ssr: false, loading: () => null });

const DESKTOP_QUERY = '(min-width: 960px)';

// Only capable, unconstrained devices get the 3D scene; everyone else keeps the plain hero.
function canRunScene() {
  if (!window.matchMedia(DESKTOP_QUERY).matches) return false;
  if (navigator.connection?.saveData) return false;
  if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency < 4) return false;
  return true;
}

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

function TopContainer() {
  const heroRef = useRef(null);
  const [showScene, setShowScene] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const handleStep = useCallback((index) => setActiveStep(index), []);

  // Mount the scene only once the hero is on screen and the browser is idle.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || showScene) return undefined;
    let idleId = 0;
    let timeoutId = 0;
    let observer = null;
    const media = window.matchMedia(DESKTOP_QUERY);

    const cancelIdle = () => {
      if (idleId && window.cancelIdleCallback) window.cancelIdleCallback(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
      idleId = 0;
      timeoutId = 0;
    };
    const stop = () => {
      cancelIdle();
      if (observer) observer.disconnect();
      observer = null;
    };
    const mount = () => setShowScene(true);
    const start = () => {
      stop();
      if (!canRunScene() || typeof IntersectionObserver === 'undefined') return;
      observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        observer = null;
        if (window.requestIdleCallback) idleId = window.requestIdleCallback(mount, { timeout: 2000 });
        else timeoutId = window.setTimeout(mount, 300);
      });
      observer.observe(hero);
    };

    start();
    media.addEventListener('change', start);
    return () => {
      media.removeEventListener('change', start);
      stop();
    };
  }, [showScene]);

  return (
    <section id="about" className="topcontainer" ref={heroRef}>
      {showScene && <AgentScene onStep={handleStep} />}
      <div className="hero-content">
        <div className="hero-text">
          <p className="hero-eyebrow">
            Kavin Pasupathy · Software Engineer at Belsterns Technologies
          </p>

          <h1 className="hero-title">
            Full-stack engineer building{' '}
            <span className="gradient-text">AI agents</span> that ship.
          </h1>

          <p className="description">
            I design and build web products with Next.js, TypeScript and PostgreSQL, and agentic
            workflows with Claude (tool calling, RAG with pgvector, Langfuse observability) that
            automate real business processes, from API and database design through to Dockerized
            deployment.
          </p>

          <div className="cta-container">
            <a href="#projects" className="btn primary-btn">
              View projects
            </a>
            <a href="/assets/KAVIN_PASUPATHY_RESUME.pdf" target="_blank" rel="noopener noreferrer" className="btn secondary-btn">
              <Download size={16} /> Resume
            </a>
            <a href="/city" className="btn secondary-btn">
              <Car size={16} aria-hidden="true" /> Drive through my resume
            </a>
          </div>

          <a
            className="cert-pill"
            href="https://www.credly.com/badges/6cd276b2-03bc-44cf-98b6-950d17dbc8e3"
            target="_blank"
            rel="noopener noreferrer">
            <BadgeCheck size={16} />
            Claude Certified Architect – Foundations
            <ArrowUpRight size={14} />
          </a>
        </div>

        <div className="hero-visuals">
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
                <div
                  key={step.label}
                  className={`agent-step${activeStep === i ? ' is-active' : ''}`}
                  style={{ '--i': i }}
                >
                  <span className={`agent-tag agent-tag--${step.label}`}>{step.label}</span>
                  <span className="agent-text">{step.text}</span>
                </div>
              ))}
              <div className="agent-done" style={{ '--i': agentSteps.length }}>
                ✓ Completed – report delivered
              </div>
            </div>
          </div>
        </div>
      </div>

      <dl className="hero-facts">
        {facts.map((fact) => (
          <div key={fact.label} className="hero-fact">
            <dt>{fact.value}</dt>
            <dd>{fact.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default TopContainer;
