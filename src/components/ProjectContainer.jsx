'use client';
import React from 'react';
import { Element } from 'react-scroll';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Github } from 'lucide-react';
import Image from 'next/image';
import './ProjectContainer.css';

const projects = [
  {
    img: '/assets/houserental.png',
    title: "Home Rental",
    desc: "MERN Stack platform for rental listings. Features booking calendar with real-time availability, search by location/dates, and automated email notifications.",
    link: "https://github.com/Professional-Web-Developer/House_Rental.git",
    tags: ["MERN", "Nodemailer", "JWT"]
  },
  {
    img: '/assets/realestate.png',
    title: "Real Estate",
    desc: "Luxury real estate platform allowing users to buy/sell properties. Features advanced filtering by continent, price range, and property type.",
    link: "https://github.com/Professional-Web-Developer/Real-Estate.git",
    tags: ["React", "Mongoose", "Bcrypt"]
  },
  {
    img: '/assets/tm.png',
    title: "Task Manager",
    desc: "Efficient task management with time tracking. Built with React and Node.js for productivity and workflow management.",
    link: "https://github.com/Professional-Web-Developer/Project-Time-Tracker.git",
    tags: ["React", "Node"]
  },
  {
    img: '/assets/et.png',
    title: "Expense Tracker",
    desc: "MERN application to track daily expenses and visualize spending habits with interactive charts.",
    link: "https://github.com/Professional-Web-Developer/expense-tracker-be.git",
    tags: ["MERN", "Chart.js"]
  },
  {
    img: '/assets/vd.png',
    title: "Vacation Dest.",
    desc: "Curate and manage your dream vacation spots. Integrated wishlist functionality and location mapping.",
    link: "https://github.com/Professional-Web-Developer/destination-wishlist.git",
    tags: ["React", "API"]
  },
  {
    img: '/assets/mc1.png',
    title: "Miles Converter",
    desc: "Simple and accurate unit conversion tool for quick distance calculations.",
    link: "https://github.com/Professional-Web-Developer/miles-converter.git",
    tags: ["JS", "CSS"]
  },
];

/* 3D Tilt Card Component */
function TiltCard({ children, className }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  function onMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set(clientX - left - width / 2);
    y.set(clientY - top - height / 2);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);

  return (
    <motion.div
      className={className}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d"
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: "spring", duration: 0.6 }}
    >
      <div style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
}

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
          <h2>Featured Projects</h2>
          <p>A selection of my recent work, leveraging the modern web stack.</p>
        </motion.div>

        <div className="projects-grid">
          {projects.map((project, index) => (
            <TiltCard key={index} className="project-card glass">
              <div className="project-image-wrapper">
                <Image
                  src={project.img}
                  alt={project.title}
                  fill
                  className="project-img"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="project-overlay">
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link-btn">
                    <Github size={20} /> View Code
                  </a>
                </div>
              </div>
              <div className="project-info">
                <div className="project-tags">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="tag">{tag}</span>
                  ))}
                </div>
                <h3>{project.title}</h3>
                <p>{project.desc}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </Element>
  );
}

export default ProjectContainer;