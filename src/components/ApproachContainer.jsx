'use client';
import React from 'react';
import { Element } from 'react-scroll';
import { motion } from 'framer-motion';
import { Zap, Workflow, BrainCircuit, Database, FileText, Activity, Container } from 'lucide-react';
import './ApproachContainer.css';

const pipeline = [
    { icon: <Zap />, title: 'Trigger', text: 'A user action, schedule or client request starts a run.', tone: 'neutral' },
    { icon: <Workflow />, title: 'Orchestrate', text: 'A Next.js service breaks the task into multi-step agent tasks.', tone: 'primary' },
    { icon: <BrainCircuit />, title: 'Reason', text: 'Claude LLM APIs plan each step and decide what to do next.', tone: 'primary' },
    { icon: <Database />, title: 'Act on data', text: 'Steps read and write business data in PostgreSQL.', tone: 'neutral' },
    { icon: <FileText />, title: 'Deliver', text: 'The result, such as a client report, is produced automatically.', tone: 'success' },
];

const principles = [
    {
        icon: <Activity />,
        title: 'Observable by default',
        text: 'Agent behavior is monitored with Langfuse so every run can be traced and reviewed, not treated as a black box.',
    },
    {
        icon: <Container />,
        title: 'Shipped, not just prototyped',
        text: 'Services are built end to end, from API and database design to Dockerized deployment and release.',
    },
    {
        icon: <Workflow />,
        title: 'Automation with a purpose',
        text: 'Repetitive workflows are replaced with automated agent pipelines to cut manual reporting effort for clients.',
    },
];

function ApproachContainer() {
    return (
        <Element name="approach" className="approachcontainer">
            <div className="approach-content">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="section-header"
                >
                    <h2>How I Build Agent Systems</h2>
                    <p>The shape of the AI-agent workflows I build for client projects: orchestrated, grounded in real data and observable.</p>
                </motion.div>

                <ol className="pipeline" aria-label="Agent workflow architecture">
                    {pipeline.map((step, index) => (
                        <motion.li
                            key={step.title}
                            className={`pipeline-step pipeline-step--${step.tone}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, delay: index * 0.08 }}
                            viewport={{ once: true }}
                        >
                            <div className="pipeline-step__icon">{step.icon}</div>
                            <h3>{step.title}</h3>
                            <p>{step.text}</p>
                        </motion.li>
                    ))}
                </ol>

                <motion.div
                    className="pipeline-bar"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                >
                    <Activity size={16} />
                    <span>Every step is traced with <strong>Langfuse</strong></span>
                    <span className="pipeline-bar__sep" aria-hidden="true" />
                    <Container size={16} />
                    <span>Deployed in <strong>Docker</strong></span>
                </motion.div>

                <div className="principles">
                    {principles.map((item, index) => (
                        <motion.div
                            key={item.title}
                            className="principle glass"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.08 }}
                            viewport={{ once: true }}
                        >
                            <div className="principle__icon">{item.icon}</div>
                            <h3>{item.title}</h3>
                            <p>{item.text}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </Element>
    );
}

export default ApproachContainer;
