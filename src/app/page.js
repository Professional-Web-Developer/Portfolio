'use client';

import Header from '../components/Header'
import TopContainer from '../components/TopContainer'
import ExperienceContainer from '../components/ExperienceContainer'
import ProjectContainer from '../components/ProjectContainer'
import Skillcontainer from '../components/Skillcontainer'
import EducationContainer from '../components/EducationContainer'
import Achievements from '../components/Achievements'
import Contact from '../components/Contact'

export default function Home() {
    return (
        <main className="App">
            <Header />
            <TopContainer />
            <Skillcontainer />
            <ExperienceContainer />
            <ProjectContainer />
            <EducationContainer />
            <Achievements />
            <Contact />
        </main>
    )
}
