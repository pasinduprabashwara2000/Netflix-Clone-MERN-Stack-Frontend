import { useEffect, useState } from 'react'
import { contentApi } from '../../services/api'
import type { Content } from '../../services/api'
import { getProfile } from '../auth'
import { aiSearch } from '../accountApi'
import TitleGrid from '../components/TitleGrid'

type Result = { query: string; items: Content[]; error: string }
type AiResult = { query: string; items: Content[] }

function Search({ query }: { query: string }) {
    const [result, setResult] = useState<Result | null>(null)
    const [ai, setAi] = useState<AiResult | null>(null)

    useEffect(() => {
        let cancelled = false

        contentApi
            .search(query)
            .then((items) => {
                if (!cancelled) setResult({ query, items, error: '' })
            })
            .catch((e) => {
                if (!cancelled)
                    setResult({ query, items: [], error: e instanceof Error ? e.message : 'Search failed' })
            })

        // AI search runs alongside; if it fails the normal results are still shown
        aiSearch(query, getProfile()?._id)
            .then((items) => {
                if (!cancelled) setAi({ query, items })
            })
            .catch(() => {
                if (!cancelled) setAi({ query, items: [] })
            })

        return () => {
            cancelled = true
        }
    }, [query])

    // still waiting for this query (older results stay visible, dimmed, so the page doesn't flicker)
    const loading = result?.query !== query

    // AI matches that the keyword search did not already return
    const related =
        ai && ai.query === query && result && result.query === query
            ? ai.items.filter((a) => !result.items.some((r) => r._id === a._id))
            : []

    const noKeywordMatches = !loading && !!result && !result.error && result.items.length === 0

    return (
        <div className="mx-auto min-h-screen w-full max-w-[1600px] px-4 pb-16 pt-24 sm:px-8 lg:px-12">
            <h1 className="text-xl font-bold sm:text-2xl">
                Results for <span className="text-brand">“{query}”</span>
            </h1>

            {!loading && result && !result.error && (
                <p className="mt-1 text-sm text-muted">
                    {result.items.length} {result.items.length === 1 ? 'title' : 'titles'} found
                </p>
            )}

            <div className={`mt-6 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
                {result?.error ? (
                    <p className="text-sm text-muted">{result.error}</p>
                ) : result && result.items.length > 0 ? (
                    <TitleGrid items={result.items} />
                ) : !loading ? (
                    <div className="py-4 text-sm text-muted">
                        <p>
                            No exact match for “{query}”.
                            {related.length === 0 && ' Check the spelling or try a different word.'}
                        </p>
                        {related.length === 0 && (
                            <a href="#/" className="mt-3 inline-block font-semibold text-white hover:underline">
                                ← Back to Home
                            </a>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-muted">Searching…</p>
                )}
            </div>

            {related.length > 0 && (
                <section className="mt-10">
                    <h2 className="text-lg font-bold sm:text-xl">
                        {noKeywordMatches ? 'Closest matches' : 'Related titles'}
                    </h2>
                    <p className="mb-4 mt-1 text-xs text-muted">Found by AI based on what you described</p>
                    <TitleGrid items={related} />
                </section>
            )}
        </div>
    )
}

export default Search
