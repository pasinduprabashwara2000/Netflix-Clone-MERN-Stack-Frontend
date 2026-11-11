import { useEffect, useState } from 'react'
import { contentApi } from '../../services/api'
import type { ContentDetails } from '../../services/api'
import SafeImage from '../components/SafeImage'
import ContentRow from '../components/ContentRow'
import { goHome } from '../router'

function TitleDetails({ id }: { id: string }) {
    const [data, setData] = useState<ContentDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [attempt, setAttempt] = useState(0)
    const [seasonIndex, setSeasonIndex] = useState(0)

    useEffect(() => {
        let cancelled = false

        contentApi
            .getDetails(id)
            .then((details) => {
                if (!cancelled) setData(details)
            })
            .catch((e) => {
                if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load title')
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

    const back = () => {
        if (window.history.length > 1) window.history.back()
        else goHome()
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
                <p className="text-lg font-semibold">Couldn’t load this title</p>
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
    const season = data.seasons[seasonIndex] ?? data.seasons[0]
    const hasTrailer = /^https?:\/\//i.test(data.trailer)

    return (
        <>
            {/* Banner */}
            <section className="relative h-[60vh] min-h-[380px] w-full overflow-hidden sm:h-[70vh]">
                <SafeImage
                    src={data.bannerUrl || data.posterUrl}
                    alt=""
                    eager
                    className="absolute inset-0 size-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/40" />

                <div className="relative mx-auto flex h-full max-w-[1600px] flex-col justify-end px-4 pb-12 sm:px-8 sm:pb-16 lg:px-12">
                    <button
                        type="button"
                        onClick={back}
                        className="absolute left-4 top-20 flex items-center gap-2 rounded bg-black/50 px-3 py-1.5 text-sm font-semibold backdrop-blur transition hover:bg-black/70 sm:left-8 lg:left-12"
                    >
                        <span aria-hidden="true">←</span> Back
                    </button>

                    <div className="max-w-2xl animate-fade-in">
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand">
                            {isSeries ? 'Series' : 'Film'}
                        </span>
                        <h1 className="mt-2 text-4xl font-black leading-tight sm:text-6xl">{data.title}</h1>

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
                            <span className="font-semibold text-green-400">★ {data.avgRating.toFixed(1)}</span>
                            <span>{data.releaseYear}</span>
                            <span className="rounded border border-zinc-500 px-1.5 text-xs">{data.maturityRating}</span>
                            <span>
                                {data.durationMins} min{isSeries ? ' / episode' : ''}
                            </span>
                            {data.genre && (
                                <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-semibold">
                                    {data.genre.name}
                                </span>
                            )}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            {/* Play is wired to the player in step 3 */}
                            <button
                                type="button"
                                className="flex items-center gap-2 rounded bg-white px-6 py-2.5 text-sm font-bold text-black transition hover:bg-white/80"
                            >
                                <span aria-hidden="true">▶</span> Play
                            </button>
                            {hasTrailer && (
                                <a
                                    href={data.trailer}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 rounded bg-zinc-500/60 px-6 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-zinc-500/40"
                                >
                                    <span aria-hidden="true">🎬</span> Watch Trailer
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <div className="relative z-10 flex flex-col gap-12 pb-16">
                {/* About */}
                <section className="mx-auto grid w-full max-w-[1600px] gap-6 px-4 sm:px-8 md:grid-cols-[14rem_1fr] lg:px-12">
                    <div className="relative hidden aspect-[2/3] w-56 overflow-hidden rounded-md bg-raised md:block">
                        <SafeImage src={data.posterUrl} alt={data.title} className="size-full object-cover" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold">About</h2>
                        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-300 sm:text-base">
                            {data.description}
                        </p>

                        <dl className="mt-6 grid max-w-xl grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <dt className="text-muted">Type</dt>
                            <dd>{isSeries ? 'TV Series' : 'Movie'}</dd>
                            <dt className="text-muted">Release year</dt>
                            <dd>{data.releaseYear}</dd>
                            <dt className="text-muted">Maturity rating</dt>
                            <dd>{data.maturityRating}</dd>
                            {data.genre && (
                                <>
                                    <dt className="text-muted">Genre</dt>
                                    <dd>{data.genre.name}</dd>
                                </>
                            )}
                            {isSeries && (
                                <>
                                    <dt className="text-muted">Seasons</dt>
                                    <dd>{data.seasons.length}</dd>
                                </>
                            )}
                        </dl>
                    </div>
                </section>

                {/* Seasons & episodes */}
                {isSeries && (
                    <section className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12">
                        <h2 className="text-xl font-bold">Episodes</h2>

                        {data.seasons.length === 0 ? (
                            <p className="mt-4 text-sm text-muted">No episodes have been added yet.</p>
                        ) : (
                            <>
                                {data.seasons.length > 1 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {data.seasons.map((s, i) => (
                                            <button
                                                key={s._id}
                                                type="button"
                                                onClick={() => setSeasonIndex(i)}
                                                aria-pressed={i === seasonIndex}
                                                className={`rounded px-4 py-1.5 text-sm font-semibold transition ${
                                                    i === seasonIndex
                                                        ? 'bg-white text-black'
                                                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                                }`}
                                            >
                                                Season {s.seasonNumber}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {season && (
                                    <>
                                        <p className="mt-4 text-sm text-muted">
                                            {season.title} · {season.releaseYear} · {season.episodes.length}{' '}
                                            {season.episodes.length === 1 ? 'episode' : 'episodes'}
                                        </p>

                                        {season.episodes.length === 0 ? (
                                            <p className="mt-4 text-sm text-muted">No episodes in this season yet.</p>
                                        ) : (
                                            <ul className="mt-3 flex flex-col divide-y divide-line">
                                                {season.episodes.map((ep) => (
                                                    <li
                                                        key={ep._id}
                                                        className="flex gap-3 rounded-md p-3 transition hover:bg-white/5 sm:gap-4"
                                                    >
                                                        <span className="w-6 shrink-0 self-center text-center text-lg font-bold text-muted sm:w-8 sm:text-2xl">
                                                            {ep.episodeNumber}
                                                        </span>
                                                        <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded bg-raised sm:w-44">
                                                            <SafeImage
                                                                src={ep.thumbnailUrl}
                                                                alt={ep.title}
                                                                className="size-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-baseline justify-between gap-3">
                                                                <h3 className="truncate font-semibold">{ep.title}</h3>
                                                                <span className="shrink-0 text-xs text-muted">
                                                                    {ep.durationMins} min
                                                                </span>
                                                            </div>
                                                            <p className="mt-1 line-clamp-2 text-sm text-muted">
                                                                {ep.description}
                                                            </p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </section>
                )}

                {/* More like this */}
                <ContentRow title="More Like This" items={data.similar} />
            </div>
        </>
    )
}

export default TitleDetails
