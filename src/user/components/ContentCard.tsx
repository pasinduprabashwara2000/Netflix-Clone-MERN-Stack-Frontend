import type { Content } from '../../services/api'
import SafeImage from './SafeImage'
import { titlePath } from '../router'

function ContentCard({ item }: { item: Content }) {
    return (
        <a
            href={titlePath(item._id)}
            className="group relative block w-36 shrink-0 cursor-pointer sm:w-44 lg:w-52"
            title={item.title}
            draggable={false}
        >
            <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-raised transition duration-200 group-hover:z-10 group-hover:scale-105 group-hover:ring-2 group-hover:ring-white/70 group-focus:scale-105 group-focus:ring-2 group-focus:ring-white/70">
                <SafeImage src={item.posterUrl} alt={item.title} className="size-full object-cover" />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted">
                <span className="truncate font-medium text-zinc-200">{item.title}</span>
                <span className="shrink-0 text-green-400">★ {item.avgRating.toFixed(1)}</span>
            </div>
        </a>
    )
}

export default ContentCard
