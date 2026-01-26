'use client';
import React from 'react';
import { Element } from 'react-scroll';
import { motion } from 'framer-motion';
import './Skillcontainer.css';
import {
    Code2,
    Database,
    Terminal,
    Globe,
    Cpu,
    Server,
    FileJson,
    Layout,
    Layers,
    Container,
    Github as GithubIcon,
    Languages,
    Workflow,
    BarChart3
} from 'lucide-react';

const skills = [
    { name: 'Next.js', icon: <Layers /> },
    { name: 'React JS', icon: <Code2 /> },
    { name: 'Node JS', icon: <Server /> },
    { name: 'Docker', icon: <Container /> },
    { name: 'SQL', icon: <Database /> },
    { name: 'Mongo DB', icon: <Database /> },
    { name: 'Git & GitHub', icon: <GithubIcon /> },
    { name: 'JavaScript', icon: <FileJson /> },
    { name: 'Python', icon: <Terminal /> },
    { name: 'Power Automate', icon: <Workflow /> },
    { name: 'Zoho Analytics', icon: <BarChart3 /> },
    { name: 'Java', icon: <Cpu /> },
    { name: 'C Programming', icon: <Code2 /> },
    { name: 'HTML/CSS', icon: <Layout /> },
];

function Skillcontainer() {
    return (
        <Element name="skills" className="skillcontainer">
            <div className="skill-content">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="section-header"
                >
                    <h2>Technical Expertise</h2>
                    <p>Proficient in the MERN stack and modern development tools.</p>
                </motion.div>

                <motion.div
                    className="skills-grid"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.1 }
                        }
                    }}
                >
                    {skills.map((skill, index) => (
                        <motion.div
                            key={index}
                            className="skill-card glass"
                            variants={{
                                hidden: { y: 20, opacity: 0 },
                                visible: { y: 0, opacity: 1 }
                            }}
                        >
                            <div className="skill-icon">{skill.icon}</div>
                            <h3>{skill.name}</h3>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    className="additional-info"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="language-badge">
                        <Languages size={18} />
                        <span>Languages: English (Professional), Tamil (Native)</span>
                    </div>
                </motion.div>
            </div>
        </Element>
    );
}

export default Skillcontainer;
