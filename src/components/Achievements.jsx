'use client';
import React from 'react';
import { Element } from 'react-scroll';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';
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
                        </motion.div>
                    ))}
                </div>
            </div>
        </Element>
    );
}

export default Achievements;
