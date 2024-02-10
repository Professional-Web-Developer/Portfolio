import React from 'react'
import { Element } from 'react-scroll'
import { IconButton } from '@mui/material'
import { GitHub } from '@mui/icons-material'
import { LinkedIn } from '@mui/icons-material'
import { Instagram } from '@mui/icons-material'
import { Email } from '@mui/icons-material'
import { Phone } from '@mui/icons-material'
import './Contact.css'
export default function Contact() {
  return (
    <Element className='contact' classID='contact'>
      <h1>Contact</h1>
      <div className='contact_container'>
     <IconButton>
      <a href="https://github.com/Professional-Web-Developer" target='_blank'>
      <GitHub /></a>
     </IconButton>
     <IconButton>
      <a href="https://www.linkedin.com/in/kavin-pasupathy-839010289/" target='_'>
      <LinkedIn /></a>
     </IconButton>
     <IconButton>
      <a href="https://www.instagram.com/kavinpasupathy/" target='_blank'>
      <Instagram /></a>
     </IconButton>
     <IconButton>
      <a>
      <Email /></a>
     </IconButton>
     <strong>pasupathy.kavinmca@gmail.com</strong>
     <IconButton>
      <a>
      <Phone /></a>
     </IconButton>
     <strong>+918667328882</strong>
     </div>
    </Element>
  )
  
}

