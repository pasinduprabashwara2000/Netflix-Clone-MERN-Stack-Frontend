import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL } from '../../config'
import { authHeader, getToken } from '../../user/auth'
import { ui } from '../../lib/ui'

type Insights = {
    totals: {
        views: number
        viewsLast7Days: number
        activeProfiles7Days: number
        titles: number
        indexedTitles: number
    }
    viewsByDay: { date: string; views: number }[]
    topTitles: { id: string; title: string; type: string; views: number }[]
    topGenres: { name: string; views: number }[]
    summary?: string
}

const request = (path: string, method: 'get' | 'post' = 'get') =>
    axios.request<Insights & { count?: number }>({
        url: `${API_URL}/ai${path}`,
        method,
        headers: authHeader(),
    })

const messageFor = (e: unknown): string => {
    if (!axios.isAxiosError(e)) return 'Something went wrong'
    if (e.response?.status === 401) return 'Your session expired. Sign in again on the main site.'
    if (e.response?.status === 403) return 'This account is not an Admin.'
    return e.response?.data?.message ?? 'Could not load AI insights'
}

function Bars({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
    const max = Math.max(1, ...rows.map((r) => r.value))

    return (
        <div className={ui.card}>
            <h3 className={ui.cardTitle}>{title}</h3>
            {rows.length === 0 ? (
                <p className="text-sm text-muted">No viewing data yet.</p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {rows.map((r) => (
                        <li key={r.label}>
                            <div className="mb-1 flex items-center justify-between text-sm">
                                <span className="font-medium text-zinc-300">{r.label}</span>
                                <span className="text-muted">{r.value}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-raised">
                                <div className="h-full rounded-full bg-brand" style={{ width: `${(r.value / max) * 100}%` }} />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
    return (
        <div className={ui.statCard}>
            <p className={ui.statLabel}>{label}</p>
            <p className={ui.statValue}>{value}</p>
            {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
    )
}

function AiInsights() {
    const signedIn = !!getToken()
    const [data, setData] = useState<Insights | null>(null)
    const [loading, setLoading] = useState(signedIn)
    const [error, setError] = useState('')
    const [summary, setSummary] = useState('')
    const [summaryLoading, setSummaryLoading] = useState(false)
    const [indexMessage, setIndexMessage] = useState('')
    const [indexing, setIndexing] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            setData((await request('/insights')).data)
        } catch (e) {
            setError(messageFor(e))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!signedIn) return
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load()
    }, [signedIn, load])

    const generateSummary = async () => {
        setSummaryLoading(true)
        setSummary('')
        try {
            const res = await request('/insights?summary=1')
            setSummary(res.data.summary ?? 'No summary was generated.')
        } catch (e) {
            setSummary(messageFor(e))
        } finally {
            setSummaryLoading(false)
        }
    }

    const rebuildIndex = async () => {
        setIndexing(true)
        setIndexMessage('')
        try {
            const res = await request('/reindex', 'post')
            setIndexMessage(`Index rebuilt for ${res.data.count} titles.`)
            await load()
        } catch (e) {
            setIndexMessage(messageFor(e))
        } finally {
            setIndexing(false)
        }
    }

    return (
        <section className="mt-14">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-zinc-100">AI Insights</h2>
                    <p className={ui.subtitle}>What viewers watch, and AI search status.</p>
                </div>
                {signedIn && (
                    <button className={ui.btn} onClick={() => void load()} disabled={loading}>
                        {loading ? 'Loading…' : 'Refresh'}
                    </button>
                )}
            </div>

            {!signedIn ? (
                <div className={`${ui.card}`}>
                    <p className="text-sm text-zinc-300">
                        Sign in with an Admin account on the main site (same browser) to see AI insights.
                    </p>
                    <a href="/#/login" className={`${ui.btnPrimary} mt-4 inline-block`}>Go to sign in</a>
                </div>
            ) : error ? (
                <div className={`${ui.error} mt-6`}>{error}</div>
            ) : !data ? (
                <div className={ui.loading}>Loading…</div>
            ) : (
                <>
                    <div className={ui.statGrid}>
                        <Stat label="Total views" value={data.totals.views} hint="Profile + title pairs" />
                        <Stat label="Views, last 7 days" value={data.totals.viewsLast7Days} />
                        <Stat label="Active profiles (7d)" value={data.totals.activeProfiles7Days} />
                        <Stat
                            label="AI search index"
                            value={`${data.totals.indexedTitles} / ${data.totals.titles}`}
                            hint={data.totals.indexedTitles < data.totals.titles ? 'Some titles are not indexed yet' : 'All titles indexed'}
                        />
                    </div>

                    <div className="grid gap-0 lg:grid-cols-2 lg:gap-6">
                        <Bars title="Most watched titles" rows={data.topTitles.map((t) => ({ label: t.title, value: t.views }))} />
                        <Bars title="Popular genres" rows={data.topGenres.map((g) => ({ label: g.name, value: g.views }))} />
                    </div>

                    <Bars title="Views per day (last 7 days)" rows={data.viewsByDay.map((d) => ({ label: d.date, value: d.views }))} />

                    <div className={ui.card}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h3 className={ui.cardTitle}>AI summary</h3>
                            <button className={ui.btnPrimary} onClick={() => void generateSummary()} disabled={summaryLoading}>
                                {summaryLoading ? 'Writing…' : summary ? 'Regenerate' : 'Generate summary'}
                            </button>
                        </div>
                        {summary ? (
                            <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-300">{summary}</p>
                        ) : (
                            <p className="mt-3 text-sm text-muted">Click the button to get a short written analysis.</p>
                        )}
                    </div>

                    <div className={ui.card}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h3 className={ui.cardTitle}>AI search index</h3>
                                <p className="text-sm text-muted">Rebuild after bulk-importing titles.</p>
                            </div>
                            <button className={ui.btn} onClick={() => void rebuildIndex()} disabled={indexing}>
                                {indexing ? 'Rebuilding…' : 'Rebuild index'}
                            </button>
                        </div>
                        {indexMessage && <p className="mt-3 text-sm text-zinc-300">{indexMessage}</p>}
                    </div>
                </>
            )}
        </section>
    )
}

export default AiInsights
