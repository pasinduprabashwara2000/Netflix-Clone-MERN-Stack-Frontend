import { useEffect, useMemo, useState } from 'react'
import { contentApi } from '../../services/api'
import type { Content } from '../../services/api'
import SafeImage from '../components/SafeImage'
import { goTo, loginPath, signupPath } from '../router'

const TILE_COUNT = 40

function Welcome() {
    const [items, setItems] = useState<Content[]>([])

    useEffect(() => {
        let cancelled = false

        contentApi
            .getAll()
            .then((all) => {
                if (!cancelled) setItems(all)
            })
            .catch(() => {
                // the collage is decoration: the page still works without it
            })

        return () => {
            cancelled = true
        }
    }, [])

    // enough posters to fill the wall, repeating when there are fewer titles
    const tiles = useMemo(
        () => (items.length === 0 ? [] : Array.from({ length: TILE_COUNT }, (_, i) => items[i % items.length])),
        [items],
    )

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-black text-white">
            {/* Poster wall */}
            <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
                <div className="grid w-[150%] shrink-0 grid-cols-6 gap-2 [transform:perspective(1200px)_rotateX(16deg)_rotateZ(-9deg)_scale(1.3)] sm:grid-cols-8 sm:gap-3">
                    {tiles.map((item, i) => (
                        <div
                            key={`${item._id}-${i}`}
                            className="relative aspect-[2/3] overflow-hidden rounded bg-zinc-900"
                        >
                            <SafeImage src={item.posterUrl} alt="" className="size-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Dark overlays so the text stays readable */}
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.65)_100%)]" />

            {/* Top bar */}
            <header className="relative z-10 mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 py-5 sm:px-8 lg:px-12">
                <span className="text-3xl font-black uppercase tracking-tighter text-brand sm:text-4xl">Hotflix</span>
                <a
                    href={loginPath}
                    className="rounded bg-brand px-4 py-1.5 text-sm font-bold text-white transition hover:bg-brand-600"
                >
                    Sign In
                </a>
            </header>

            {/* Hero text */}
            <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-32 pt-8 text-center">
                <h1 className="max-w-3xl animate-fade-in text-4xl font-black leading-tight sm:text-6xl">
                    Unlimited movies, TV shows, and more
                </h1>
                <p className="mt-4 text-base font-semibold sm:text-xl">Watch anywhere. Cancel anytime.</p>

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        goTo(signupPath)
                    }}
                    className="mt-4 flex w-full max-w-2xl flex-col gap-2 sm:flex-row"
                >
                   
                    <button
                    type="submit"className="mt-4 flex w-full max-w-2xl flex-col items-center gap-2 sm:flex-row sm:justify-center">
                        Get Started
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-5"
                        >
                            <path d="m9 6 6 6-6 6" />
                        </svg>
                    </button>
                </form>
            </main>

            {/* Glowing curve at the bottom */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 overflow-hidden">
                <div className="mx-auto mt-6 h-40 w-[170%] -translate-x-[20%] rounded-[50%] border-t-4 border-brand bg-gradient-to-b from-[#1a0b14] to-surface shadow-[0_-10px_50px_rgba(229,9,20,0.55)]" />
            </div>
        </div>
    )
}

export default Welcome