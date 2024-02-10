import React from 'react'
import './App.css'
import Header from './components/header'
import TopContainer from './components/TopContainer'
import ProjectContainer from './components/ProjectContainer'
import Skillcontainer from './components/skillcontainer'
import EducationContainer from './components/EducationContainer'
import Contact from './components/Contact'
export default function App() {
  return (
    <div>
      <Header/>
      <TopContainer/>
      <Skillcontainer/>
      <ProjectContainer/>
      <EducationContainer/>
      <Contact/>
    </div>
  )
}
