import React from 'react'
import './Header.css'
import {Link} from 'react-scroll'

 function Header() {
  return (
    <div className='header'>
        <div className='header__left'>
            <h1>Develop<span>er</span></h1>
        </div>
        <div className='header__right'>
            <Link to="about" smooth={true} duration={500}>
                <h4>About</h4>
            </Link>
            <Link to="skills" smooth={true} duration={500}>
                <h4>Skills</h4>
            </Link>
            <Link to="projects" smooth={true} duration={500}>
                <h4>Projects</h4>
            </Link>
            <Link to="education" smooth={true} duration={500}>
                <h4>Education</h4>
            </Link>
            <Link to="contact" smooth={true} duration={500}>
                <h4>Contact</h4>
            </Link>
            {/* <h4 className='header__rightbutton'>Join with Me</h4> */}
        </div>
    </div>
  )
}
export default Header