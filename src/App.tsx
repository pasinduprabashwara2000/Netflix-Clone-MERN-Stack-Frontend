import { useState } from 'react'
import Tabs from './components/common/Tabs'
import UserManagement from './features/accounts/UserManagement'
import ProfileManagement from './features/accounts/ProfileManagement'
import PlanManagement from './features/billing/PlanManagement'
import SubscriptionManagement from './features/billing/SubscriptionManagement'
import GenreManagement from './features/catalog/GenreManagement'
import ContentManagement from './features/catalog/ContentManagement'
import SeasonManagement from './features/catalog/SeasonManagement'
import EpisodeManagement from './features/catalog/EpisodeManagement.tsx'
import Dashboard from './features/dashboard/Dashboard.tsx'

type Page =
    | 'dashboard'
    | 'accounts'
    | 'billing'
    | 'content'
    | 'seasons'


const MENU: { id: Page; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'accounts', label: 'Users & Profiles' },
    { id: 'billing', label: 'Plans & Subscriptions' },
    { id: 'content', label: 'Genre & Content' },
    { id: 'seasons', label: 'Season & Episode' }
]

function App() {
    const [page, setPage] = useState<Page>('dashboard')

    return (
        <div className="min-h-screen bg-zinc-950 md:grid md:grid-cols-[17rem_1fr]">
            <aside className="z-10 border-b-2 border-zinc-800 bg-zinc-900 p-4 md:sticky md:top-0 md:h-screen md:border-r-2 md:border-b-0 md:p-6">
                <div className="flex items-center justify-between md:block">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-lime-400">
                            Hotflix
                        </h2>
                        <span className="mt-1 inline-block border-2 border-zinc-800 bg-zinc-950 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Admin
            </span>
                    </div>
                </div>

                <nav className="mt-5 flex gap-2 overflow-x-auto pb-2 md:mt-8 md:flex-col md:gap-3 md:overflow-visible md:pb-0">
                    {MENU.map((item) => {
                        const isActive = page === item.id

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setPage(item.id)}
                                aria-current={isActive ? 'page' : undefined}
                                className={`shrink-0 border-2 px-4 py-3 text-left text-xs font-black uppercase tracking-widest transition active:translate-x-0.5 active:translate-y-0.5 ${
                                    isActive
                                        ? 'border-black bg-lime-400 text-black shadow-[4px_4px_0_0_#000]'
                                        : 'border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-lime-400 hover:text-lime-400'
                                }`}
                            >
                                {item.label}
                            </button>
                        )
                    })}
                </nav>
            </aside>

            <main className="p-4 sm:p-6 md:p-10">
                <div className="mx-auto max-w-6xl">
                    {page === 'dashboard' && <Dashboard />}

                    {page === 'accounts' && (
                        <Tabs
                            tabs={[
                                {
                                    id: 'users',
                                    label: 'Users',
                                    content: <UserManagement />,
                                },
                                {
                                    id: 'profiles',
                                    label: 'Profiles',
                                    content: <ProfileManagement />,
                                },
                            ]}
                        />
                    )}

                    {page === 'billing' && (
                        <Tabs
                            tabs={[
                                {
                                    id: 'plans',
                                    label: 'Plans',
                                    content: <PlanManagement />,
                                },
                                {
                                    id: 'subscriptions',
                                    label: 'Subscriptions',
                                    content: <SubscriptionManagement />,
                                },
                            ]}
                        />
                    )}

                    {page === 'content' && (
                        <Tabs
                            tabs={[
                                {
                                    id: 'genre',
                                    label: 'Genre',
                                    content: <GenreManagement />,
                                },
                                {
                                    id: 'content',
                                    label: 'Content',
                                    content: <ContentManagement />,
                                },
                            ]}
                        />
                    )}

                    {page === 'seasons' && (
                        <Tabs
                            tabs={[
                                {
                                    id: 'seasons',
                                    label: 'Seasons',
                                    content: <SeasonManagement />,
                                },
                                {
                                    id: 'episodes',
                                    label: 'Episodes',
                                    content: <EpisodeManagement />,
                                },
                            ]}
                        />
                    )}
                </div>
            </main>
        </div>
    )
}

export default App