import { useCallback, useEffect, useMemo, useState } from 'react'
import { contentApi } from '../../services/api'
import type { Content } from '../../services/api'
import { getProfile } from '../auth'
import { getRecommendations } from '../accountApi'
import Hero from '../components/Hero'
import ContentRow from '../components/ContentRow'
import type { Section } from '../components/Navbar'

// banner title for each tab (matched ignoring case and punctuation)
const BANNER_TITLES: Record<Section, string> = {
    all: 'Joker',
    Movie: 'Avengers Endgame',
    Series: 'Queen of Tears',
}

const simplify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '')

function Home({ section }: { section: Section }) {
    const [contents, setContents] = useState<Content[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [picks, setPicks] = useState<Content[]>([])

    const load = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            setContents(await contentApi.getAll())
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load content')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void load()
    }, [load])

    // AI picks are optional: if the request fails the row is simply not shown
    useEffect(() => {
        const profile = getProfile()
        if (!profile) return

        let cancelled = false

        getRecommendations(profile._id)
            .then((items) => {
                if (!cancelled) setPicks(items)
            })
            .catch(() => {
                if (!cancelled) setPicks([])
            })

        return () => {
            cancelled = true
        }
    }, [])

    const visible = useMemo(
        () => (section === 'all' ? contents : contents.filter((c) => c.type === section)),
        [contents, section],
    )

    const hero = useMemo(() => {
        const wanted = simplify(BANNER_TITLES[section] ?? '')
        const chosen = visible.find((c) => simplify(c.title) === wanted)
        if (chosen) return chosen

        // fallback if that title is missing from the catalog
        const pool = visible.filter((c) => c.isFeatured)
        return [...(pool.length ? pool : visible)].sort((a, b) => b.avgRating - a.avgRating)[0]
    }, [visible, section])

    const visiblePicks = useMemo(
        () => (section === 'all' ? picks : picks.filter((c) => c.type === section)),
        [picks, section],
    )

    const topRated = useMemo(
        () => [...visible].sort((a, b) => b.avgRating - a.avgRating).slice(0, 12),
        [visible],
    )
    const newest = useMemo(
        () => [...visible].sort((a, b) => b.releaseYear - a.releaseYear).slice(0, 12),
        [visible],
    )
    const movies = useMemo(() => visible.filter((c) => c.type === 'Movie'), [visible])
    const series = useMemo(() => visible.filter((c) => c.type === 'Series'), [visible])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center text-sm font-semibold uppercase tracking-widest text-muted">
                Loading…
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 px-4 text-center">
                <p className="text-lg font-semibold">Something went wrong</p>
                <p className="max-w-md text-sm text-muted">{error}</p>
                <button
                    type="button"
                    onClick={() => void load()}
                    className="rounded bg-brand px-5 py-2 text-sm font-bold transition hover:bg-brand-600"
                >
                    Try again
                </button>
            </div>
        )
    }

    if (!hero) {
        return (
            <div className="flex h-screen items-center justify-center text-sm text-muted">
                No titles available yet.
            </div>
        )
    }

    return (
        <>
            <Hero item={hero} />

            <div className="relative z-10 -mt-16 flex flex-col gap-8 pb-16 sm:-mt-24">
                <ContentRow title="Picked for you" items={visiblePicks} />
                <ContentRow title="Top Rated" items={topRated} />
                <ContentRow title="New Releases" items={newest} />
                {section === 'all' && <ContentRow title="Movies" items={movies} />}
                {section === 'all' && <ContentRow title="TV Series" items={series} />}
            </div>
        </>
    )
}

export default Home
