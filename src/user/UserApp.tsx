import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import type { Section } from './components/Navbar'
import Home from './pages/Home'

function UserApp() {
    const [section, setSection] = useState<Section>('all')

    useEffect(() => {
        document.title = 'Hotflix'
    }, [])

    return (
        <div className="min-h-screen bg-surface text-white">
            <Navbar section={section} onSectionChange={setSection} />
            <main>
                <Home section={section} />
            </main>
        </div>
    )
}

export default UserApp
