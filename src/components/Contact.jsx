'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Instagram, Mail, Phone, Rocket, Code2, Copy, Check } from 'lucide-react';
import './Contact.css';

const EMAIL = 'pasupathy.kavinmca@gmail.com';

function Contact() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      /* clipboard unavailable: the mailto link still works */
    }
  };

  return (
    <section id="contact" className="contact">
      <motion.div
        className="contact-container glass"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="contact-header">
          <h2>Get in Touch</h2>
          <p>For roles, projects or questions about my work, email is the quickest way to reach me.</p>
        </div>

        <div className="contact-links">
          <a href={`mailto:${EMAIL}`} className="contact-link">
            <div className="icon-box"><Mail /></div>
            <span>{EMAIL}</span>
          </a>
          <button type="button" className="copy-btn" onClick={copyEmail} aria-live="polite">
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied' : 'Copy email'}
          </button>
          <a href="tel:+918667328882" className="contact-link">
            <div className="icon-box"><Phone /></div>
            <span>+91 8667328882</span>
          </a>
        </div>

        <div className="social-links">
          <a href="https://github.com/Professional-Web-Developer" target="_blank" rel="noopener noreferrer" className="social-btn" title="GitHub" aria-label="GitHub profile (opens in a new tab)">
            <Github aria-hidden="true" />
          </a>
          <a href="https://www.linkedin.com/in/kavin-pasupathy-839010289/" target="_blank" rel="noopener noreferrer" className="social-btn" title="LinkedIn" aria-label="LinkedIn profile (opens in a new tab)">
            <Linkedin aria-hidden="true" />
          </a>
          <a href="https://leetcode.com/u/KavinPasupathy/" target="_blank" rel="noopener noreferrer" className="social-btn" title="LeetCode" aria-label="LeetCode profile (opens in a new tab)">
            <Code2 aria-hidden="true" />
          </a>
          <a href="https://www.producthunt.com/@kavin_pasupathy" target="_blank" rel="noopener noreferrer" className="social-btn" title="Product Hunt" aria-label="Product Hunt profile (opens in a new tab)">
            <Rocket aria-hidden="true" />
          </a>
          <a href="https://www.instagram.com/kavinpasupathy/" target="_blank" rel="noopener noreferrer" className="social-btn" title="Instagram" aria-label="Instagram profile (opens in a new tab)">
            <Instagram aria-hidden="true" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}

export default Contact;
