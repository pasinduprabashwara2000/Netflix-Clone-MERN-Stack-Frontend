import { useEffect, useState } from 'react'

type SearchBarProps = {
    /** current search text (from the URL) */
    value?: string
    onSearch: (text: string) => void
    /** search while typing (after a short pause), as well as on Enter */
    live?: boolean
    placeholder?: string
}

/** Small search box for the navbar. */
function SearchBar({ value = '', onSearch, live = false, placeholder = 'Search titles' }: SearchBarProps) {
    const [draft, setDraft] = useState(value)
    const [prevValue, setPrevValue] = useState(value)

    // follow the page when the search text changes from outside (cleared when you leave the search page)
    if (prevValue !== value) {
        setPrevValue(value)
        setDraft(value)
    }

    useEffect(() => {
        if (!live || draft.trim() === value.trim()) return
        const timer = window.setTimeout(() => onSearch(draft), 350)
        return () => window.clearTimeout(timer)
    }, [draft, value, live, onSearch])

    return (
        <form
            role="search"
            onSubmit={(e) => {
                e.preventDefault()
                onSearch(draft)
            }}
            className="relative shrink-0"
        >
            <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
            >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
            </svg>

            <input
                type="search"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') setDraft('')
                }}
                placeholder={placeholder}
                aria-label={placeholder}
                maxLength={100}
                className="h-9 w-28 rounded border border-zinc-700 bg-black/50 pl-8 pr-2 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:w-44 focus:border-white sm:w-44 sm:focus:w-64"
            />
        </form>
    )
}

export default SearchBar
