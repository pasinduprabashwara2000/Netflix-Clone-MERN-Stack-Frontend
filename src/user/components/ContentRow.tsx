import { useRef } from 'react'
import type { Content } from '../../services/api'
import ContentCard from './ContentCard'

type ContentRowProps = {
    title: string
    items: Content[]
}

function ContentRow({ title, items }: ContentRowProps) {
    const scroller = useRef<HTMLDivElement>(null)

    if (items.length === 0) return null

    const scrollBy = (direction: 1 | -1) => {
        const el = scroller.current
        if (!el) return
        el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' })
    }

    return (
        <section className="group/row relative">
            <h2 className="mb-3 px-4 text-lg font-bold sm:px-8 sm:text-xl lg:px-12">{title}</h2>

            <div className="relative">
                <button
                    type="button"
                    aria-label={`Scroll ${title} left`}
                    onClick={() => scrollBy(-1)}
                    className="absolute inset-y-0 left-0 z-20 hidden w-10 items-center justify-center bg-black/60 text-2xl opacity-0 transition hover:bg-black/80 group-hover/row:opacity-100 md:flex"
                >
                    ‹
                </button>

                <div
                    ref={scroller}
                    className="scrollbar-none flex gap-3 overflow-x-auto px-4 py-3 sm:gap-4 sm:px-8 lg:px-12"
                >
                    {items.map((item) => (
                        <ContentCard key={item._id} item={item} />
                    ))}
                </div>

                <button
                    type="button"
                    aria-label={`Scroll ${title} right`}
                    onClick={() => scrollBy(1)}
                    className="absolute inset-y-0 right-0 z-20 hidden w-10 items-center justify-center bg-black/60 text-2xl opacity-0 transition hover:bg-black/80 group-hover/row:opacity-100 md:flex"
                >
                    ›
                </button>
            </div>
        </section>
    )
}

export default ContentRow
