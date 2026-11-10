import { useEffect, useState } from 'react'

export const PAGE_SIZE = 5

export type Pager<T> = {
    items: T[]
    page: number
    totalPages: number
    total: number
    from: number
    to: number
    setPage: (page: number) => void
}

/** Slices a list into pages of 5 rows. Pass resetKey (e.g. a search string) to jump back to page 1 when it changes. */
export function usePagination<T>(list: T[], resetKey: unknown = null): Pager<T> {
    const [page, setPageState] = useState(1)

    const total = list.length
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    // clamp, so deleting the last row of the last page doesn't leave an empty page
    const current = Math.min(page, totalPages)

    useEffect(() => {
        setPageState(1)
    }, [resetKey])

    const start = (current - 1) * PAGE_SIZE
    const items = list.slice(start, start + PAGE_SIZE)

    return {
        items,
        page: current,
        totalPages,
        total,
        from: total === 0 ? 0 : start + 1,
        to: start + items.length,
        setPage: (p) => setPageState(Math.min(Math.max(1, p), totalPages)),
    }
}
