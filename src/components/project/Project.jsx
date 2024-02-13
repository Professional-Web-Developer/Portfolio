import React from 'react'
import { useState } from 'react'
import "./Project.css"

export default function Project(key,img,title,desc,link) {
const [show,setshow]=useState(false)
  return (
    <a href={key.link} target={'_blank'}>
        <div onMouseEnter={()=>setshow(true)}  onMouseLeave={()=>setshow(false)} className='project'>
            {show?(
                <div className='project_content'>
                    <h4>{key.title}</h4>
                    <p>{key.desc}</p>
                </div>
            ):(
                <img className='project_imag' src={key.img} alt={key.title} />
            )}
        </div>
    </a>
  )
}
