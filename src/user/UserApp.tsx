import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import type { Section } from './components/Navbar'
import Home from './pages/Home'
import TitleDetails from './pages/TitleDetails'
import Watch from './pages/Watch'
import Trailer from './pages/Trailer'
import { goHome, useRoute } from './router'

function UserApp() {
    const [section, setSection] = useState<Section>('all')
    const route = useRoute()

    const routeKey =
        route.name === 'home'
            ? 'home'
            : route.name === 'watch'
              ? `watch-${route.id}-${route.episodeId ?? ''}`
              : `${route.name}-${route.id}`

    useEffect(() => {
        document.title = 'Hotflix'
    }, [])

    // every page change starts at the top
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [routeKey])

    const handleSectionChange = (next: Section) => {
        setSection(next)
        goHome()
    }

    return (
        <div className="min-h-screen bg-surface text-white">
            <Navbar section={section} onSectionChange={handleSectionChange} />
            <main>
                {route.name === 'title' && <TitleDetails key={route.id} id={route.id} />}
                {route.name === 'watch' && <Watch key={route.id} id={route.id} episodeId={route.episodeId} />}
                {route.name === 'trailer' && <Trailer key={route.id} id={route.id} />}
                {route.name === 'home' && <Home section={section} />}
            </main>
        </div>
    )
}

export default UserApp
