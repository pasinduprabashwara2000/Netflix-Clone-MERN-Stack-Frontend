import { useEffect, useState } from 'react'
import { contentApi } from '../../services/api'
import type { ContentDetails, EpisodeItem, SeasonWithEpisodes } from '../../services/api'
import { resolveImageUrl } from '../../lib/media'
import VideoPlayer from '../components/VideoPlayer'
import EpisodeList from '../components/EpisodeList'
import { goHome, goTo, titlePath, watchPath } from '../router'
import { getProfile } from '../auth'
import { recordHistory } from '../accountApi'

type FlatEpisode = EpisodeItem & { season: SeasonWithEpisodes }

function Watch({ id, episodeId }: { id: string; episodeId?: string }) {
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
                if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load video')
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [id, attempt])

    // save this title (and episode) to the selected profile's watch history
    useEffect(() => {
        if (!data) return

        const profile = getProfile()
        if (!profile) return

        let episode: string | undefined
        if (data.type === 'Series') {
            const all = data.seasons.flatMap((s) => s.episodes)
            episode = (all.find((e) => e._id === episodeId) ?? all[0])?._id
        }

        recordHistory(profile._id, data._id, episode).catch(() => {})
    }, [data, episodeId])

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
                <p className="text-lg font-semibold">Couldn’t load this video</p>
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

    const isSeries = data.type === 'Series'

    // all episodes in play order
    const flat: FlatEpisode[] = data.seasons.flatMap((s) => s.episodes.map((e) => ({ ...e, season: s })))
    const current = isSeries ? (flat.find((e) => e._id === episodeId) ?? flat[0]) : undefined
    const next = current ? flat[flat.indexOf(current) + 1] : undefined

    const src = isSeries ? (current?.videoUrl ?? '') : data.videoUrl
    const poster = resolveImageUrl(data.bannerUrl || data.posterUrl)
    const playerTitle = current ? `${data.title} - ${current.title}` : data.title

    const playNext = () => {
        if (next) goTo(watchPath(id, next._id))
    }

    return (
        <div className="mx-auto w-full max-w-[1400px] pt-16 sm:px-8 sm:pt-20 lg:px-12">
            {/* Player */}
            <div className="relative aspect-video w-full overflow-hidden bg-black sm:rounded-md">
                <VideoPlayer
                    key={src}
                    src={src}
                    poster={poster}
                    title={playerTitle}
                    onEnded={playNext}
                />
            </div>

            {/* Title bar */}
            <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-5 sm:px-0">
                <div className="min-w-0">
                    <a
                        href={titlePath(id)}
                        className="text-xs font-semibold uppercase tracking-widest text-muted transition hover:text-white"
                    >
                        ← Details
                    </a>
                    <h1 className="mt-1 text-2xl font-black sm:text-3xl">{data.title}</h1>
                    {current && (
                        <p className="mt-1 text-sm text-zinc-300">
                            S{current.season.seasonNumber} · E{current.episodeNumber} - {current.title}
                        </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
                        <span className="font-semibold text-green-400">★ {data.avgRating.toFixed(1)}</span>
                        <span>{data.releaseYear}</span>
                        <span className="rounded border border-zinc-600 px-1.5">{data.maturityRating}</span>
                        {data.genre && <span>{data.genre.name}</span>}
                    </div>
                </div>

                {next && (
                    <a
                        href={watchPath(id, next._id)}
                        className="flex shrink-0 items-center gap-2 rounded bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-white/80"
                    >
                        Next Episode <span aria-hidden="true">▶</span>
                    </a>
                )}
            </div>

            <p className="max-w-3xl px-4 pt-4 text-sm leading-relaxed text-zinc-300 sm:px-0">
                {current?.description || data.description}
            </p>

            {/* Episodes */}
            {isSeries && (
                <section className="px-4 pb-16 pt-10 sm:px-0">
                    <h2 className="text-xl font-bold">Episodes</h2>
                    <EpisodeList
                        key={current?.season._id ?? 'none'}
                        contentId={id}
                        seasons={data.seasons}
                        activeEpisodeId={current?._id}
                    />
                </section>
            )}

            {!isSeries && <div className="pb-16" />}
        </div>
    )
}

export default Watch
