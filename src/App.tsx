import { useState } from 'react'
import PlanManagement from './components/PlanManagement.tsx'
import UserManagement from './components/UserManagement.tsx'
import SubscriptionManagement from './components/SubscriptionManagement.tsx'
import ProfileManagement from './components/ProfileManagement.tsx'
import Tabs from './components/Tabs.tsx'

type Page = 'accounts' | 'billing'

const MENU: { id: Page; label: string }[] = [
    { id: 'accounts', label: 'Users & Profiles' },
    { id: 'billing', label: 'Plans & Subscriptions' },
]

function App() {
    const [page, setPage] = useState<Page>('accounts')

    return (
        <div className="min-h-screen md:grid md:grid-cols-[15rem_1fr]">
            <aside className="border-b border-line bg-black/60 p-4 backdrop-blur md:sticky md:top-0 md:h-screen md:border-r md:border-b-0 md:p-6">
                <div className="flex items-baseline justify-between md:block">
                    <h2 className="text-2xl font-black tracking-[0.25em] text-brand">HOTFLIX</h2>
                    <span className="text-[11px] font-semibold tracking-widest text-muted uppercase md:mt-1 md:block">Admin</span>
                </div>

                <nav className="mt-4 flex gap-1 overflow-x-auto md:mt-8 md:flex-col">
                    {MENU.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setPage(m.id)}
                            aria-current={page === m.id ? 'page' : undefined}
                            className={`relative rounded-lg px-4 py-2.5 text-left text-sm font-medium whitespace-nowrap transition ${
                                page === m.id
                                    ? 'bg-raised text-white before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-full before:bg-brand'
                                    : 'text-muted hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            {m.label}
                        </button>
                    ))}
                </nav>
            </aside>

            <main className="p-4 sm:p-6 md:p-10">
                <div className="mx-auto max-w-5xl">
                    {page === 'accounts' && (
                        <Tabs
                            tabs={[
                                { id: 'users', label: 'Users', content: <UserManagement /> },
                                { id: 'profiles', label: 'Profiles', content: <ProfileManagement /> },
                            ]}
                        />
                    )}
                    {page === 'billing' && (
                        <Tabs
                            tabs={[
                                { id: 'plans', label: 'Plans', content: <PlanManagement /> },
                                { id: 'subscriptions', label: 'Subscriptions', content: <SubscriptionManagement /> },
                            ]}
                        />
                    )}
                </div>
            </main>
        </div>
    )
}

export default App