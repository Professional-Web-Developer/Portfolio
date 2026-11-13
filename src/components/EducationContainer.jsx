'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BadgeCheck, Calendar, Award, ArrowUpRight } from 'lucide-react';
import './EducationContainer.css';

const items = [
  {
    kind: 'Certification',
    title: 'Claude Certified Architect – Foundations',
    org: 'Anthropic',
    icon: <BadgeCheck />,
    featured: true,
    link: {
      href: 'https://www.credly.com/badges/6cd276b2-03bc-44cf-98b6-950d17dbc8e3',
      label: 'Verify on Credly',
      aria: 'Verify the Claude Certified Architect – Foundations credential on Credly (opens in a new tab)',
    },
  },
  {
    kind: 'Degree',
    title: 'Master of Computer Applications (MCA)',
    org: 'Kongu Engineering College, Perundurai',
    duration: '2023 – 2025',
    score: 'CGPA 8.4',
    icon: <GraduationCap />,
  },
  {
    kind: 'Degree',
    title: 'B.Sc. Computer Science',
    org: 'Government Arts and Science College, Thittamalai',
    duration: '2020 – 2023',
    score: 'CGPA 7.57 · Ranked 1st in department',
    icon: <GraduationCap />,
  },
];

function EducationContainer() {
  return (
    <section id="education" className="educationcontainer">
      <div className="education-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="section-header"
        >
          <h2>Education &amp; Certification</h2>
        </motion.div>

        <div className="timeline">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              className="timeline-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className={`timeline-content glass ${item.featured ? 'timeline-content--featured' : ''}`}>
                <div className="timeline-header">
                  <div className="timeline-icon">{item.icon}</div>
                  <div className="timeline-info">
                    <span className="timeline-kind">{item.kind}</span>
                    <h3>{item.title}</h3>
                    <h4>{item.org}</h4>
                  </div>
                </div>
                {(item.duration || item.score) && (
                  <div className="timeline-details">
                    <div className="detail-row">
                      <Calendar size={16} /> <span>{item.duration}</span>
                    </div>
                    <div className="detail-row">
                      <Award size={16} /> <span>{item.score}</span>
                    </div>
                  </div>
                )}
                {item.link && (
                  <a
                    className="timeline-link"
                    href={item.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.link.aria}
                  >
                    {item.link.label} <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EducationContainer;
