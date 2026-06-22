'use client';
import React from 'react';
import { Element } from 'react-scroll';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, ChevronRight } from 'lucide-react';
import './ExperienceContainer.css';

const experience = [
    {
        company: 'Belsterns Technologies',
        role: 'Junior Software Engineer',
        duration: 'Jan 2025 – Present',
        desc: 'Working across Eztest and client projects — building full-stack web applications with Next.js, MERN Stack, and Dockerized environments. Contributing to AI Agents, Agentic AI, and Agentic Workflow solutions for business automation, open-source tooling with Next.js & PostgreSQL, and cross-functional client deliverables.',
        type: 'Full-time',
        skills: ['Next.js', 'MERN Stack', 'AI Agents', 'Agentic AI', 'Agentic Workflow', 'PostgreSQL', 'Docker']
    },
    {
        company: 'Belsterns Technologies',
        role: 'Software Development Engineer Intern',
        duration: 'Sep 2024 – Jan 2025',
        desc: 'Designed and optimized web applications in MERN Stack and Next.js. Assisted senior developers in delivering scalable software aligned with client requirements.',
        type: 'Internship',
        skills: ['React', 'Next.js', 'JavaScript', 'CSS', 'Git']
    },
];

function ExperienceContainer() {
    return (
        <Element name="experience" className="experience-container">
            <div className="experience-wrapper">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                    className="section-title"
                >
                    <h2>Professional Journey</h2>
                    <div className="title-underline"></div>
                </motion.div>

                <div className="exp-list">
                    {experience.map((item, index) => (
                        <motion.div
                            key={index}
                            className="exp-row"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            viewport={{ once: true }}
                        >
                            {/* Timeline graphic */}
                            <div className="exp-timeline-graphic">
                                <div className="exp-line"></div>
                                <div className="exp-node">
                                    <div className="exp-node-inner"></div>
                                </div>
                            </div>

                            {/* Content Card */}
                            <div className="exp-content">
                                <div className="exp-card glass-panel">
                                    <div className="exp-header">
                                        <div className="exp-role-group">
                                            <h3>{item.role}</h3>
                                            <div className="exp-company-row">
                                                <Briefcase size={14} className="icon-subtle" />
                                                <h4>{item.company}</h4>
                                            </div>
                                        </div>
                                        <div className="exp-meta">
                                            <div className="exp-badge">{item.type}</div>
                                            <div className="exp-date">
                                                <Calendar size={14} />
                                                <span>{item.duration}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="exp-description">{item.desc}</p>

                                    <div className="exp-tags">
                                        {item.skills.map((skill, i) => (
                                            <span key={i} className="exp-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </Element>
    );
}

export default ExperienceContainer;
