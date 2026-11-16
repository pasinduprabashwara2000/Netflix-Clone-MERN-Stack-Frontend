import { useState } from 'react'
import type { SeasonWithEpisodes } from '../../services/api'
import SafeImage from './SafeImage'
import { watchPath } from '../router'

type EpisodeListProps = {
    contentId: string
    seasons: SeasonWithEpisodes[]
    activeEpisodeId?: string
}

/** Season tabs + clickable episode rows. Give it a `key` of the active season to re-sync the tab. */
function EpisodeList({ contentId, seasons, activeEpisodeId }: EpisodeListProps) {
    const [seasonIndex, setSeasonIndex] = useState(() =>
        Math.max(0, seasons.findIndex((s) => s.episodes.some((e) => e._id === activeEpisodeId))),
    )

    if (seasons.length === 0) {
        return <p className="mt-4 text-sm text-muted">No episodes have been added yet.</p>
    }

    const season = seasons[seasonIndex] ?? seasons[0]

    return (
        <>
            {seasons.length > 1 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {seasons.map((s, i) => (
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

            <p className="mt-4 text-sm text-muted">
                {season.title} · {season.releaseYear} · {season.episodes.length}{' '}
                {season.episodes.length === 1 ? 'episode' : 'episodes'}
            </p>

            {season.episodes.length === 0 ? (
                <p className="mt-4 text-sm text-muted">No episodes in this season yet.</p>
            ) : (
                <ul className="mt-3 flex flex-col divide-y divide-line">
                    {season.episodes.map((ep) => {
                        const active = ep._id === activeEpisodeId
                        return (
                            <li key={ep._id}>
                                <a
                                    href={watchPath(contentId, ep._id)}
                                    aria-current={active ? 'true' : undefined}
                                    className={`group flex gap-3 rounded-md p-3 transition sm:gap-4 ${
                                        active ? 'bg-white/10' : 'hover:bg-white/5'
                                    }`}
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
                                        <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xl opacity-0 transition group-hover:opacity-100">
                                            {active ? 'Now playing' : '▶'}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-baseline justify-between gap-3">
                                            <h3 className="truncate font-semibold">{ep.title}</h3>
                                            <span className="shrink-0 text-xs text-muted">{ep.durationMins} min</span>
                                        </div>
                                        <p className="mt-1 line-clamp-2 text-sm text-muted">{ep.description}</p>
                                    </div>
                                </a>
                            </li>
                        )
                    })}
                </ul>
            )}
        </>
    )
}

export default EpisodeList
