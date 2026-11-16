import { useEffect, useState } from 'react'
import { contentApi } from '../../services/api'
import type { ContentDetails } from '../../services/api'
import { resolveImageUrl } from '../../lib/media'
import VideoPlayer from '../components/VideoPlayer'
import { goHome, titlePath, watchPath } from '../router'

function Trailer({ id }: { id: string }) {
    const [data, setData] = useState<ContentDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        let cancelled = false

        contentApi
            .getDetails(id)
            .then((details) => {
                if (!cancelled) setData(details)
            })
            .catch((e) => {
                if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load trailer')
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [id, attempt])

    const retry = () => {
        setLoading(true)
        setError('')
        setAttempt((n) => n + 1)
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center text-sm font-semibold uppercase tracking-widest text-muted">
                Loading…
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 px-4 text-center">
                <p className="text-lg font-semibold">Couldn’t load this trailer</p>
                <p className="max-w-md text-sm text-muted">{error || 'Title not found'}</p>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={retry}
                        className="rounded bg-brand px-5 py-2 text-sm font-bold transition hover:bg-brand-600"
                    >
                        Try again
                    </button>
                    <button
                        type="button"
                        onClick={goHome}
                        className="rounded bg-zinc-700 px-5 py-2 text-sm font-bold transition hover:bg-zinc-600"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        )
    }

    const poster = resolveImageUrl(data.bannerUrl || data.posterUrl)

    return (
        <div className="mx-auto w-full max-w-[1400px] pt-16 sm:px-8 sm:pt-20 lg:px-12">
            <div className="relative aspect-video w-full overflow-hidden bg-black sm:rounded-md">
                <VideoPlayer key={data.trailer} src={data.trailer} poster={poster} title={`${data.title} - Trailer`} />
            </div>

            <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-5 sm:px-0">
                <div className="min-w-0">
                    <a
                        href={titlePath(id)}
                        className="text-xs font-semibold uppercase tracking-widest text-muted transition hover:text-white"
                    >
                        ← Details
                    </a>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.3em] text-brand">Official Trailer</p>
                    <h1 className="mt-1 text-2xl font-black sm:text-3xl">{data.title}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
                        <span className="font-semibold text-green-400">★ {data.avgRating.toFixed(1)}</span>
                        <span>{data.releaseYear}</span>
                        <span className="rounded border border-zinc-600 px-1.5">{data.maturityRating}</span>
                        {data.genre && <span>{data.genre.name}</span>}
                    </div>
                </div>

                <a
                    href={watchPath(id)}
                    className="flex shrink-0 items-center gap-2 rounded bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-white/80"
                >
                    <span aria-hidden="true">▶</span> Play {data.type === 'Series' ? 'Series' : 'Movie'}
                </a>
            </div>

            <p className="max-w-3xl px-4 pb-16 pt-4 text-sm leading-relaxed text-zinc-300 sm:px-0">
                {data.description}
            </p>
        </div>
    )
}

export default Trailer
