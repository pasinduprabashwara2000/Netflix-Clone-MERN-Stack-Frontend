import { ui } from '../../lib/ui'
import type { Pager } from '../../hooks/usePagination'

function Pagination<T>({ pager }: { pager: Pager<T> }) {
    const { page, totalPages, total, from, to, setPage } = pager

    if (total === 0 || totalPages <= 1) return null

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
        (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
    )

    return (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Showing {from}–{to} of {total}
            </p>

            <div className="flex flex-wrap items-center gap-2">
                <button type="button" className={ui.btnSm} disabled={page === 1} onClick={() => setPage(page - 1)}>
                    Prev
                </button>

                {pages.map((p, i) => (
                    <span key={p} className="flex items-center gap-2">
                        {i > 0 && p - pages[i - 1] > 1 && <span className="text-zinc-500">…</span>}
                        <button
                            type="button"
                            onClick={() => setPage(p)}
                            aria-current={p === page ? 'page' : undefined}
                            className={
                                p === page
                                    ? 'border-2 border-black bg-brand px-3 py-2 text-xs font-black text-white'
                                    : ui.btnSm
                            }
                        >
                            {p}
                        </button>
                    </span>
                ))}

                <button
                    type="button"
                    className={ui.btnSm}
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    )
}

export default Pagination