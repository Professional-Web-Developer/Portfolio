import MotionProvider from '../components/MotionProvider'
import Header from '../components/Header'
import TopContainer from '../components/TopContainer'
import ExperienceContainer from '../components/ExperienceContainer'
import ProjectContainer from '../components/ProjectContainer'
import Skillcontainer from '../components/Skillcontainer'
import EducationContainer from '../components/EducationContainer'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'

export default function Home() {
    return (
        <MotionProvider>
            <a href="#main" className="skip-link">Skip to content</a>
            <Header />
            <main className="App" id="main">
                {/* The hero has no DOM id of its own; this is the #about anchor target. */}
                <div id="about">
                    <TopContainer />
                </div>
                <ExperienceContainer />
                <ProjectContainer />
                <Skillcontainer />
                <EducationContainer />
                <Contact />
            </main>
            <Footer />
            <BackToTop />
        </MotionProvider>
    )
}
