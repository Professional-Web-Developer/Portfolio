import React from 'react'
import './App.css'
import Header from './components/Header'
import TopContainer from './components/TopContainer'
import ProjectContainer from './components/ProjectContainer'
import Skillcontainer from './components/Skillcontainer'
import EducationContainer from './components/EducationContainer'
import Contact from './components/Contact'
export default function App() {
  return (
    <div  className="App">
      <Header/>
      <TopContainer/>
      <Skillcontainer/>
      <ProjectContainer/>
      <EducationContainer/>
      <Contact/>
    </div>
  )
}
