'use client';
import React from 'react';
import { Element } from 'react-scroll';
import { motion } from 'framer-motion';
import { GraduationCap, School, Calendar, Award } from 'lucide-react';
import './EducationContainer.css';

const education = [
  {
    institution: 'Kongu Engineering College, Perundurai',
    degree: 'Master of Computer Applications (MCA)',
    duration: 'August 2023 - April 2025',
    score: 'CGPA: 8.4',
    desc: 'Deep specialization in MERN Stack, Advanced Software Engineering, and Data Structures.',
    icon: <GraduationCap />
  },
  {
    institution: 'Government Arts And Science College, Thittamalai',
    degree: 'Bachelor of Computer Science',
    duration: 'August 2020 - April 2023',
    score: 'CGPA: 7.571',
    desc: 'Founded strong foundations in computer science principles and programming.',
    icon: <School />
  },
  {
    institution: 'Shree Gurukulam Higher Secondary School',
    degree: 'HSC & SSLC',
    duration: 'Completed March 2018',
    score: 'SSLC: 86% | HSC: 78.5%',
    desc: 'Completed secondary and higher secondary education with a science-focused curriculum.',
    icon: <School />
  },
];

function EducationContainer() {
  return (
    <Element name="education" className="educationcontainer">
      <div className="education-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="section-header"
        >
          <h2>Education</h2>
          <p>My academic path and certifications.</p>
        </motion.div>

        <div className="timeline">
          {education.map((item, index) => (
            <motion.div
              key={index}
              className="timeline-item"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="timeline-dot"></div>
              <div className="timeline-content glass">
                <div className="timeline-header">
                  <div className="timeline-icon">{item.icon}</div>
                  <div className="timeline-info">
                    <h3>{item.degree}</h3>
                    <h4>{item.institution}</h4>
                  </div>
                </div>
                <div className="timeline-details">
                  <div className="detail-row">
                    <Calendar size={16} /> <span>{item.duration}</span>
                  </div>
                  <div className="detail-row">
                    <Award size={16} /> <span>{item.score}</span>
                  </div>
                </div>
                <p className="timeline-desc">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Element>
  );
}

export default EducationContainer;
