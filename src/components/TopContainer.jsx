'use client';
import React, { useRef } from 'react';
import { Element } from 'react-scroll';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { Link } from 'react-scroll';
import './TopContainer.css';

function TopContainer() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <Element name="about" className="topcontainer" style={{ position: 'relative', overflow: 'hidden' }}>
      <motion.div
        ref={ref}
        className="hero-content"
        style={{ y, opacity }}
      >
        <div className="hero-text">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Available for Opportunities
          </motion.div>
          <h1 className="hero-title">
            <motion.span
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ display: 'block', overflow: 'hidden' }}
            >
              Building Digital
            </motion.span>
            <motion.span
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="gradient-text-hero"
              data-text="Experience"
              style={{ display: 'block', overflow: 'hidden' }}
            >
              Experience
            </motion.span>
          </h1>

          <motion.p
            className="description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            I&apos;m <b>Kavin Pasupathy</b>. A Software Engineer specializing in full-stack development,
            <b> AI Agents</b>, and <b>Agentic AI</b>. Building scalable web applications and intelligent automation systems at <b>Belsterns Technologies</b>.
          </motion.p>

          <motion.div
            className="cta-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <a href="/assets/KAVIN_PASUPATHY_RESUME.pdf" download className="btn primary-btn glow-effect">
              Download Resume
            </a>
            <Link to="projects" smooth={true} duration={800} offset={-50} className="btn secondary-btn">
              View Projects
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="hero-visuals"
          initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2, type: "spring" }}
        >
          <div className="abstract-shape">
            <div className="shape-blur"></div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 1, duration: 2, repeat: Infinity }}
      >
        <ArrowDown size={24} />
      </motion.div>
    </Element>
  );
}

export default TopContainer;