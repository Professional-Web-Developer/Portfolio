import React from 'react'
import { Link } from 'react-scroll'
import'./TopContent.css'
import cv from '../assets/Resume.pdf'

function TopContent() {
  return (
    <div className='topcontent'>
        <div className='topcontent_container'>
            <h1>Mr.Kavin Pasupathy</h1>
            <p>A Professional Web Developer</p>
            <a href={cv} download={cv}>
                <button className='topcontent_downloadbtn'>Download CV</button>
            </a>
            <Link to="projects" smooth={true} duration={500}>
                <button className='topcontent_workbtn'>My Work</button>
            </Link>
        </div>
    </div>
  )
}

export default TopContent