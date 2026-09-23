'use client';
import React from 'react';
import { Element } from 'react-scroll';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, BadgeCheck } from 'lucide-react';
import './Achievements.css';

const achievements = [
    {
        title: 'Top 6.9% LeetCoder',
        desc: 'Ranked in the top 6.9% globally on LeetCode with 50+ days of consistent problem-solving in 2024.',
        icon: <TrendingUp />,
        color: 'var(--primary)'
    },
    {
        title: 'College First Rank',
        desc: 'Secured First Rank at the college level during the Undergraduate Department of Computer Science (BSc).',
        icon: <Trophy />,
        color: 'var(--secondary)'
    },
    {
        title: 'Claude Certified Architect – Foundations',
        desc: 'Certified by Anthropic as a Claude Certified Architect (Foundations).',
        icon: <BadgeCheck />,
        color: 'var(--primary)',
        link: 'https://www.credly.com/badges/6cd276b2-03bc-44cf-98b6-950d17dbc8e3'
    }
];

function Achievements() {
    return (
        <Element name="achievements" className="achievements-container">
            <div className="achievements-content">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="section-header"
                >
                    <h2>Achievements</h2>
                    <p>Recognition and milestones in my coding journey.</p>
                </motion.div>

                <div className="achievements-grid">
                    {achievements.map((item, index) => (
                        <motion.div
                            key={index}
                            className="achievement-card glass"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <div className="card-scan" />
                            <div className="achievement-icon" style={{ color: item.color }}>{item.icon}</div>
                            <h3>{item.title}</h3>
                            <p>{item.desc}</p>
                            {item.link && (
                                <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: item.color }}>
                                    Verify on Credly →
                                </a>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </Element>
    );
}

export default Achievements;
