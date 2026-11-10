import { useEffect, useState } from 'react'

export type Section = 'all' | 'Movie' | 'Series'

const LINKS: { id: Section; label: string }[] = [
    { id: 'all', label: 'Home' },
    { id: 'Movie', label: 'Movies' },
    { id: 'Series', label: 'TV Series' },
]

type NavbarProps = {
    section: Section
    onSectionChange: (section: Section) => void
}

function Navbar({ section, onSectionChange }: NavbarProps) {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <header
            className={`fixed inset-x-0 top-0 z-30 transition-colors duration-300 ${
                scrolled ? 'bg-surface shadow-lg shadow-black/40' : 'bg-gradient-to-b from-black/80 to-transparent'
            }`}
        >
            <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-6 px-4 sm:px-8 lg:px-12">
                <button
                    type="button"
                    onClick={() => onSectionChange('all')}
                    className="text-2xl font-black uppercase tracking-tighter text-brand sm:text-3xl"
                >
                    Hotflix
                </button>

                <nav className="flex flex-1 items-center gap-1 overflow-x-auto scrollbar-none sm:gap-3">
                    {LINKS.map((link) => (
                        <button
                            key={link.id}
                            type="button"
                            onClick={() => onSectionChange(link.id)}
                            aria-current={section === link.id ? 'page' : undefined}
                            className={`shrink-0 rounded px-3 py-1.5 text-sm transition ${
                                section === link.id
                                    ? 'font-semibold text-white'
                                    : 'font-medium text-zinc-300 hover:text-white'
                            }`}
                        >
                            {link.label}
                        </button>
                    ))}
                </nav>

                {/* Placeholder: replaced by search + profile switcher in later steps */}
                <div
                    className="flex size-8 shrink-0 items-center justify-center rounded bg-brand text-sm font-bold"
                    aria-hidden="true"
                >
                    U
                </div>
            </div>
        </header>
    )
}

export default Navbar
