import React from 'react'
import { Element } from 'react-scroll'
import TopContent from './TopContent'
import './TopContainer.css'

function TopContainer() {
  return (
    <Element name='about' className='topcontainer'>
              <h1 className='Aboutme'>About Me</h1>
        <TopContent/>
    </Element>

  )
}
export default TopContainer