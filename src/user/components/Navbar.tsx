import { useEffect, useRef, useState } from 'react'
import SearchBar from './SearchBar'
import { getProfile, logout } from '../auth'
import { accountPath, goTo, profilesPath } from '../router'

export type Section = 'all' | 'Movie' | 'Series'

const LINKS: { id: Section; label: string }[] = [
    { id: 'all', label: 'Home' },
    { id: 'Movie', label: 'Movies' },
    { id: 'Series', label: 'TV Series' },
]

type NavbarProps = {
    /** which nav link is highlighted (null on pages like search or details) */
    active: Section | null
    onNavigate: (section: Section) => void
    /** text of the current search page ('' when not searching) */
    activeQuery: string
    onSearch: (text: string) => void
}

function Navbar({ active, onNavigate, activeQuery, onSearch }: NavbarProps) {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const profile = getProfile()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // close the profile menu when clicking anywhere outside it
    useEffect(() => {
        if (!menuOpen) return
        const onDown = (e: MouseEvent) => {
            if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
        }
        document.addEventListener('mousedown', onDown)
        return () => document.removeEventListener('mousedown', onDown)
    }, [menuOpen])

    return (
        <header
            className={`fixed inset-x-0 top-0 z-30 transition-colors duration-300 ${
                scrolled ? 'bg-surface shadow-lg shadow-black/40' : 'bg-gradient-to-b from-black/80 to-transparent'
            }`}
        >
            <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:gap-6 sm:px-8 lg:px-12">
                <button
                    type="button"
                    onClick={() => onNavigate('all')}
                    className="text-2xl font-black uppercase tracking-tighter text-brand sm:text-3xl"
                >
                    Hotflix
                </button>

                <nav className="scrollbar-none flex flex-1 items-center gap-1 overflow-x-auto sm:gap-3">
                    {LINKS.map((link) => (
                        <button
                            key={link.id}
                            type="button"
                            onClick={() => onNavigate(link.id)}
                            aria-current={active === link.id ? 'page' : undefined}
                            className={`shrink-0 rounded px-3 py-1.5 text-sm transition ${
                                active === link.id
                                    ? 'font-semibold text-white'
                                    : 'font-medium text-zinc-300 hover:text-white'
                            }`}
                        >
                            {link.label}
                        </button>
                    ))}
                </nav>

                <SearchBar live value={activeQuery} onSearch={onSearch} />

                {/* Profile menu */}
                <div ref={menuRef} className="relative shrink-0">
                    <button
                        type="button"
                        onClick={() => setMenuOpen((o) => !o)}
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        aria-label="Profile menu"
                        className="block size-8 overflow-hidden rounded bg-brand text-sm font-bold ring-2 ring-transparent transition hover:ring-white"
                    >
                        {profile?.avatarUrl ? (
                            <img src={profile.avatarUrl} alt={profile.name} className="size-full object-cover" />
                        ) : (
                            <span className="flex size-full items-center justify-center">
                                {profile?.name?.[0]?.toUpperCase() ?? 'U'}
                            </span>
                        )}
                    </button>

                    {menuOpen && (
                        <div
                            role="menu"
                            className="absolute right-0 top-11 w-52 animate-fade-in overflow-hidden rounded-md bg-panel shadow-2xl shadow-black/70 ring-1 ring-white/10"
                        >
                            <p className="truncate border-b border-line px-4 py-3 text-sm font-semibold">
                                {profile?.name ?? 'Guest'}
                            </p>

                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => { setMenuOpen(false); goTo(accountPath()) }}
                                className="block w-full px-4 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-raised hover:text-white"
                            >
                                Account
                            </button>

                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => { setMenuOpen(false); goTo(accountPath('plan')) }}
                                className="block w-full px-4 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-raised hover:text-white"
                            >
                                Subscription Plan
                            </button>

                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => { setMenuOpen(false); goTo(accountPath('history')) }}
                                className="block w-full px-4 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-raised hover:text-white"
                            >
                                Watch History
                            </button>

                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => { setMenuOpen(false); goTo(profilesPath) }}
                                className="block w-full px-4 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-raised hover:text-white"
                            >
                                Switch Profile
                            </button>

                            <button
                                type="button"
                                role="menuitem"
                                onClick={logout}
                                className="block w-full px-4 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-raised hover:text-brand"
                            >
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Navbar
