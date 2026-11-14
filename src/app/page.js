import MotionProvider from '../components/MotionProvider'
import Header from '../components/Header'
import ExploreChooser from '../components/ExploreChooser'
import TopContainer from '../components/TopContainer'
import ExperienceContainer from '../components/ExperienceContainer'
import ProjectContainer from '../components/ProjectContainer'
import Skillcontainer from '../components/Skillcontainer'
import EducationContainer from '../components/EducationContainer'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import LazyGuide from '../components/guide/LazyGuide'
import { isGuideActive } from '../lib/guide/availability'

export default function Home() {
    // Decided while the page is prerendered, i.e. at build time: this page is
    // static, so changing GUIDE_ENABLED or the gateway credential needs a new
    // build (on Vercel, a redeploy). See src/lib/guide/availability.js.
    const guideActive = isGuideActive()

    return (
        <MotionProvider>
            <a href="#main" className="skip-link">Skip to content</a>
            {/* Early in the DOM so keyboard users reach it soon; it is fixed-position. */}
            <ExploreChooser />
            <Header />
            <main className="App" id="main" tabIndex={-1}>
                <TopContainer />
                <ExperienceContainer />
                <ProjectContainer />
                <Skillcontainer />
                <EducationContainer />
                <Contact />
            </main>
            <Footer />
            <BackToTop />
            {/* After BackToTop on purpose: Guide.css positions the launcher relative to it. */}
            {guideActive && <LazyGuide />}
        </MotionProvider>
    )
}
