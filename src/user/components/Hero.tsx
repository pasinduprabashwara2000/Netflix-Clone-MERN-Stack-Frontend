import type { Content } from '../../services/api'
import SafeImage from './SafeImage'
import { titlePath } from '../router'

function Hero({ item }: { item: Content }) {
    return (
        <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden sm:h-[80vh]">
            <SafeImage
                src={item.bannerUrl || item.posterUrl}
                alt=""
                eager
                className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/40" />

            <div className="relative mx-auto flex h-full max-w-[1600px] flex-col justify-end px-4 pb-16 sm:px-8 sm:pb-24 lg:px-12">
                <div className="max-w-xl animate-fade-in">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand">
                        {item.type === 'Series' ? 'Series' : 'Film'}
                    </span>
                    <h1 className="mt-2 text-4xl font-black leading-tight sm:text-6xl">{item.title}</h1>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
                        <span className="font-semibold text-green-400">★ {item.avgRating.toFixed(1)}</span>
                        <span>{item.releaseYear}</span>
                        <span className="rounded border border-zinc-500 px-1.5 text-xs">{item.maturityRating}</span>
                        <span>
                            {item.durationMins} min{item.type === 'Series' ? ' / episode' : ''}
                        </span>
                    </div>

                    <p className="mt-4 line-clamp-3 text-sm text-zinc-200 sm:text-base">{item.description}</p>

                    {/* Play is wired to the player page in step 3 */}
                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            type="button"
                            className="flex items-center gap-2 rounded bg-white px-6 py-2.5 text-sm font-bold text-black transition hover:bg-white/80"
                        >
                            <span aria-hidden="true">▶</span> Play
                        </button>
                        <a
                            href={titlePath(item._id)}
                            className="flex items-center gap-2 rounded bg-zinc-500/60 px-6 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-zinc-500/40"
                        >
                            <span aria-hidden="true">ⓘ</span> More Info
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero
