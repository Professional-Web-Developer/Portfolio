'use client';
import React from 'react';
import { Element } from 'react-scroll';
import { motion } from 'framer-motion';
import { Briefcase, Calendar } from 'lucide-react';
import './ExperienceContainer.css';

const experience = [
    {
        company: 'Belsterns Technologies',
        role: 'Junior Software Engineer',
        duration: 'Jan 2025 – Present',
        type: 'Full-time',
        points: [
            'Develop and ship full-stack features for client web applications using Next.js and PostgreSQL, deployed in Dockerized environments.',
            'Build features for Eztest, an online test management platform, and AI-agent based task orchestration for business workflows.',
            'Design AI-agent workflows that automate client reporting and business processes: integrating the Claude API, orchestrating multi-step agent tasks, and monitoring agent behavior with Langfuse.',
            'Lead client modules end-to-end, from requirements and API/database design to implementation and release, working with cross-functional teams.',
            'Reduced manual reporting effort for clients by replacing repetitive workflows with automated agent pipelines.',
        ],
        skills: ['Next.js', 'PostgreSQL', 'Docker', 'AI Agents', 'Claude API', 'Langfuse'],
    },
    {
        company: 'Belsterns Technologies',
        role: 'Software Development Engineer Intern',
        duration: 'Sep 2024 – Jan 2025',
        type: 'Internship',
        points: [
            'Built and optimized responsive web applications in the MERN stack and Next.js for client-facing projects.',
            'Contributed to client projects using Next.js and was promoted to full-time Junior Software Engineer within 4 months.',
        ],
        skills: ['React', 'Next.js', 'MERN', 'JavaScript', 'Git'],
    },
];

function ExperienceContainer() {
    return (
        <Element name="experience" className="experience-container">
            <div className="experience-wrapper">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
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
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            viewport={{ once: true }}
                        >
                            <div className="exp-timeline-graphic">
                                <div className="exp-line"></div>
                                <div className="exp-node"></div>
                            </div>

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
                                                <Calendar size={13} />
                                                <span>{item.duration}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <ul className="exp-points">
                                        {item.points.map((point, i) => (
                                            <li key={i}>{point}</li>
                                        ))}
                                    </ul>

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
