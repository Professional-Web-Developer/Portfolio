import React from 'react'
import {Element} from 'react-scroll'
import skills from '../assets/skills.jpg'
import { LinearProgress } from '@mui/material';
import './Skillcontainer.css'
function Skillcontainer() {
  return (
    <Element className='skillcontainer' id='skills'>
        <div className='skillcontainer__img'>
            <img src={skills} alt="" />
        </div>
        <div className='skillcontainer__text'>
            <h2>SKILLSET</h2>
            <div className='skillcontainer__skillset'>
                <h5>React JS</h5>
                <div className='skillcontainer__slider skillcontainer__slider1'>
                    <LinearProgress variant="determinate" value={60} />
                </div>
                <h5>Node JS</h5>
                <div className='skillcontainer__slider skillcontainer__slider2'>
                <LinearProgress variant="determinate" value={80} />
                </div>
                <h5>Express JS</h5>
                <div className='skillcontainer__slider skillcontainer__slider3'>
                <LinearProgress variant="determinate" value={90} />
                </div>
                <h5>Mongo DB</h5>
                <div className='skillcontainer__slider skillcontainer__slider4'>
                <LinearProgress variant="determinate" value={90} />
                </div>
                <h5>C</h5>
                <div className='skillcontainer__slider skillcontainer__slider5'>
                <LinearProgress variant="determinate" value={100} />
                </div>
                <h5>C++</h5>
                <div className='skillcontainer__slider skillcontainer__slider6'>
                <LinearProgress variant="determinate" value={90} />
                </div>
                <h5>Python</h5>
                <div className='skillcontainer__slider skillcontainer__slider7'>
                <LinearProgress variant="determinate" value={80} />
                </div>
                <h5>JavaScript</h5>
                <div className='skillcontainer__slider skillcontainer__slider8'>
                <LinearProgress variant="determinate" value={80} />
                </div>
            </div>
        </div>
    </Element>
  )
}
export default Skillcontainer
