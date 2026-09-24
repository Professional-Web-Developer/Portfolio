'use client';
import React from 'react';
import { Element } from 'react-scroll';
import { motion } from 'framer-motion';
import { Github, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import './ProjectContainer.css';

const projects = [
  {
    img: '/assets/houserental.webp',
    title: 'Home Rental Platform',
    desc: 'MERN stack rental marketplace with a booking calendar and real-time availability, search by location and dates, JWT authentication, image uploads and automated email notifications.',
    link: 'https://github.com/Professional-Web-Developer/House_Rental.git',
    tags: ['MERN', 'JWT', 'Nodemailer', 'Multer'],
  },
  {
    img: '/assets/realestate.webp',
    title: 'Real Estate Platform',
    desc: 'Property listing platform for buying and selling, with multi-criteria search (continent, price range, property type), secure authentication and REST APIs on Express and MongoDB.',
    link: 'https://github.com/Professional-Web-Developer/Real-Estate.git',
    tags: ['React', 'Express', 'MongoDB', 'Bcrypt'],
  },
  {
    img: '/assets/et.webp',
    title: 'Expense Tracker',
    desc: 'MERN application for tracking daily expenses and visualizing spending habits with interactive charts.',
    link: 'https://github.com/Professional-Web-Developer/expense-tracker.git',
    tags: ['MERN', 'Chart.js'],
  },
  {
    img: '/assets/tm.webp',
    title: 'Task Manager',
    desc: 'Task management with time tracking, built with React and Node.js for productivity and workflow management.',
    link: 'https://github.com/Professional-Web-Developer/Project-Time-Tracker.git',
    tags: ['React', 'Node.js'],
  },
];

function ProjectContainer() {
  return (
    <Element name="projects" className="projectcontainer">
      <div className="project-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="section-header"
        >
          <h2>Selected Projects</h2>
          <p>Full-stack applications built end to end, from schema and API design to the UI.</p>
        </motion.div>

        <div className="projects-grid">
          {projects.map((project, index) => (
            <motion.article
              key={project.title}
              className="project-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index % 2) * 0.08 }}
            >
              <div className="project-image-wrapper">
                <Image
                  src={project.img}
                  alt={`${project.title} screenshot`}
                  fill
                  className="project-img"
                  sizes="(max-width: 768px) 100vw, 560px"
                />
              </div>
              <div className="project-info">
                <div className="project-tags">
                  {project.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <h3>{project.title}</h3>
                <p>{project.desc}</p>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link"
                  aria-label={`View ${project.title} source code on GitHub`}
                >
                  <Github size={16} /> View code <ArrowUpRight size={14} />
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </Element>
  );
}

export default ProjectContainer;
