import { Element } from "react-scroll";
import React from 'react'
import './EducationContainer.css'
export default function EducationContainer() {
  return (
    <Element className="educationcontainer" id="education">
           
        <div className="edu_container">
            <h1>EDUCATION</h1>
            <div className="edu_content">
                
              <div className="school">
            <h2>School</h2>
            <h3>SSLC PERCENTAGE:86%</h3>
            <h3>HSC Percentage:78.25%</h3>
            <p>I have completed my School in <span>Shree Gurukulam Higher Secondary School</span></p>
                        
            </div>
            <div className="undergraduate">
            <h2>Bachelor of Computer Science</h2>
            <h3>PERCENTAGE:74%</h3>
            <h3>2020-2023</h3>
            <p>I have completed my Bachelor's Degree in <span>Government Arts And Science College, Thittamalai</span></p>
            </div>
            <div className="postgraduate">
            <h2>Master Of Computer Application</h2>
            <h3>PERCENTAGE:waiting...</h3>
            <h3>2023-2025</h3>
            <p>I am currently pursuing my master’s degree in computer application at <span>Kongu Engineering College</span></p>
            </div>
            </div>
        </div>
  
    </Element>
  )
}
