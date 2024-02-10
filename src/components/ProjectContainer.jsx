import React from 'react'
import './ProjectContainer.css'
import tm from '../assets/tm.png'
import vd from '../assets/vd.png'
import et from '../assets/et.png'
import mc1 from '../assets/mc1.png'
import { Element } from 'react-scroll'
import Project from './project/Project'

function ProjectContainer() {
  const my_projects=[{
    img:tm,
    title:"task manager",
    desc:"we can manage work with time",
    link:"https://github.com/Professional-Web-Developer/Project-Time-Tracker.git",
  },
  {
    img:vd,
    title:"Vaccation Desitination",
    desc:"Let's make our dream true",
    link:"https://github.com/Professional-Web-Developer/destination-wishlist.git",
  },
  {
    img:et,
    title:"expense tracker",
    desc:"calculate money calculate life",
    link:"https://github.com/Professional-Web-Developer/expense-tracker-be.git",
  },
  {
    img:mc1,
    title:"miles converter",
    desc:"dont worry about destination",
    link:"https://github.com/Professional-Web-Developer/miles-converter.git",
  },
];
  return (
    <Element className="projectcontainer" id="projects">
        <h1>Projects</h1>
        <p>My projects which from my starting days to now</p>
        <p>Click projects to enter into github</p>
        <div className='project_container_projects'>
         {
            my_projects.map((project,index)=>{
                return(
                    <Project key={index} img={project.img} title={project.title} desc={project.desc} link={project.link}/>
                )
         }
            )
            }
        </div>
    </Element>
            
  )
}

export default ProjectContainer