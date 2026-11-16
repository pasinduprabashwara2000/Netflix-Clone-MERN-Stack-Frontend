import { useCallback, useEffect, useState } from 'react';

import Navbar from './components/Navbar';
import type { Section } from './components/Navbar';
import Home from './pages/Home';
import TitleDetails from './pages/TitleDetails';
import Watch from './pages/Watch';
import Trailer from './pages/Trailer';
import Search from './pages/Search';
import Welcome from './pages/Welcome';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profiles from './pages/Profiles';
import Account from './pages/Account';
import AiChat from './components/AiChat';

import { goHome, goTo, replaceWith, searchPath, useRoute } from './router';

function UserApp() {
    const [section, setSection] = useState<Section>('all');
    const route = useRoute();

    useEffect(() => {
        document.title = 'Hotflix';
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [route.name, route.name === 'watch' ? route.id : '']);

    const searching = route.name === 'search';

    // pages that have their own header: no main Navbar
    const bare =
        route.name === 'welcome' ||
        route.name === 'signup' ||
        route.name === 'login' ||
        route.name === 'profiles';

    const handleNavigate = (next: Section) => {
        setSection(next);
        goHome();
    };

    const handleSearch = useCallback((text: string) => {
        const query = text.trim();

        if (!query) {
            if (searching) goHome();
            return;
        }

        const path = searchPath(query);

        if (searching) {
            replaceWith(path);
        } else {
            goTo(path);
        }
    }, [searching]);

    return (
        <div className="min-h-screen bg-surface text-white">

            {!bare && (
                <Navbar
                    active={route.name === 'home' ? section : null}
                    onNavigate={handleNavigate}
                    activeQuery={searching ? route.query.trim() : ''}
                    onSearch={handleSearch}
                />
            )}

            <main>
                {route.name === 'home' && <Home section={section} />}

                {route.name === 'title' && (
                    <TitleDetails id={route.id} />
                )}

                {route.name === 'watch' && (
                    <Watch id={route.id} episodeId={route.episodeId} />
                )}

                {route.name === 'trailer' && (
                    <Trailer id={route.id} />
                )}

                {route.name === 'search' && (
                    <Search query={route.query.trim()} />
                )}

                {route.name === 'welcome' && <Welcome />}

                {route.name === 'signup' && <Signup />}

                {route.name === 'login' && <Login />}

                {route.name === 'profiles' && <Profiles />}

                {route.name === 'account' && <Account tab={route.tab} />}
            </main>

            {!bare && <AiChat />}

        </div>
    );
}

export default UserApp;
