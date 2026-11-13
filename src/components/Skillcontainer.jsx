'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Layout, Server, Database, Bot, Wrench, Languages, Binary } from 'lucide-react';
import './Skillcontainer.css';

const groups = [
    {
        title: 'AI & Agents',
        icon: <Bot />,
        featured: true,
        desc: 'Designing agent workflows that automate real business processes.',
        skills: [
            'AI Agents', 'Agentic Workflows', 'Agent Orchestration', 'Claude API', 'Anthropic SDK',
            'Tool / Function Calling', 'MCP', 'RAG', 'Vector Search', 'Embeddings', 'Agent Skills',
            'Prompt Engineering', 'Prompt Caching', 'Vercel AI SDK', 'Langfuse', 'OpenTelemetry',
        ],
    },
    {
        title: 'Frontend',
        icon: <Layout />,
        skills: ['Next.js', 'React.js', 'TypeScript', 'JavaScript (ES6+)', 'Responsive UI'],
    },
    {
        title: 'Backend',
        icon: <Server />,
        skills: ['Node.js', 'Express.js', 'Python', 'REST APIs', 'PayPal REST APIs', 'JWT Auth', 'Zod'],
    },
    {
        title: 'Databases & ORM',
        icon: <Database />,
        skills: ['PostgreSQL', 'Supabase', 'pgvector', 'MongoDB', 'Mongoose', 'Drizzle ORM', 'Prisma ORM', 'SQL'],
    },
    {
        title: 'Tools & DevOps',
        icon: <Wrench />,
        skills: ['Docker', 'Docker Compose', 'GitHub Actions (CI/CD)', 'AWS S3', 'AWS EC2', 'Git & GitHub', 'Vercel', 'Claude', 'Cursor'],
    },
    {
        title: 'Data Structures & Algorithms',
        icon: <Binary />,
        wide: true,
        skills: [
            'Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Hash Maps', 'Trees', 'Graphs', 'Heaps',
            'Sorting', 'Binary Search', 'Dynamic Programming',
        ],
    },
];

function Skillcontainer() {
    return (
        <section id="skills" className="skillcontainer">
            <div className="skill-content">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="section-header"
                >
                    <h2>Skills</h2>
                    <p>Full-stack foundations with a focus on AI agents and automation.</p>
                </motion.div>

                <div className="skills-bento">
                    {groups.map((group, index) => (
                        <motion.div
                            key={group.title}
                            className={`skill-group ${group.featured ? 'skill-group--featured' : ''} ${group.wide ? 'skill-group--wide' : ''}`}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.07 }}
                            viewport={{ once: true }}
                        >
                            <div className="skill-group__head">
                                <div className="skill-icon">{group.icon}</div>
                                <h3>{group.title}</h3>
                            </div>
                            {group.desc && <p className="skill-group__desc">{group.desc}</p>}
                            <div className="skill-chips">
                                {group.skills.map((skill) => (
                                    <span key={skill} className="skill-chip">{skill}</span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    className="additional-info"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    viewport={{ once: true }}
                >
                    <div className="language-badge">
                        <Languages size={16} />
                        <span>English (Professional) · Tamil (Native)</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default Skillcontainer;
