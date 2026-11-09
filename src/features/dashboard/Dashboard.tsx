import { useEffect, useState } from 'react'
import {planApi, userApi, subscriptionApi, profileApi, genreApi, contentApi, seasonApi, episodeApi, watchlistApi,} from '../../services/api'
import type {Plan, User, Subscription, Profile, Genre, Content, Season, Episode, WatchList,} from '../../services/api'
import { ui } from '../../lib/ui'
import { useAlert } from '../../alerts/context'

type Data = {
    users: User[]
    profiles: Profile[]
    plans: Plan[]
    subscriptions: Subscription[]
    genres: Genre[]
    contents: Content[]
    seasons: Season[]
    episodes: Episode[]
    watchlist: WatchList[]
}

type Row = { label: string; value: number }

function StatCard({ label, value, icon, hint }: { label: string; value: string | number; icon: string; hint?: string }) {
    return (
        <div className={ui.statCard}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className={ui.statLabel}>{label}</p>
                    <p className={ui.statValue}>{value}</p>
                    {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
                </div>
                <div className={ui.statIcon} aria-hidden="true">{icon}</div>
            </div>
        </div>
    )
}

function Breakdown({ title, rows }: { title: string; rows: Row[] }) {
    const max = Math.max(1, ...rows.map((r) => r.value))

    return (
        <div className={ui.card}>
            <h2 className={ui.cardTitle}>{title}</h2>
            {rows.length === 0 ? (
                <p className="text-sm text-muted">No data yet.</p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {rows.map((r) => (
                        <li key={r.label}>
                            <div className="mb-1 flex items-center justify-between text-sm">
                                <span className="font-medium text-zinc-300">{r.label}</span>
                                <span className="text-muted">{r.value}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-raised">
                                <div
                                    className="h-full rounded-full bg-brand transition-all"
                                    style={{ width: `${(r.value / max) * 100}%` }}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

function countBy<T>(items: T[], key: (item: T) => string): Row[] {
    const map = new Map<string, number>()
    for (const item of items) {
        const k = key(item) || 'Unknown'
        map.set(k, (map.get(k) ?? 0) + 1)
    }
    return [...map.entries()]
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
}

function Dashboard() {
    const { error } = useAlert()
    const [data, setData] = useState<Data | null>(null)
    const [loading, setLoading] = useState(true)

    const load = async () => {
        setLoading(true)
        try {
            const [users, profiles, plans, subscriptions, genres, contents, seasons, episodes, watchlist] =
                await Promise.all([
                    userApi.getAll(),
                    profileApi.getAll(),
                    planApi.getAll(),
                    subscriptionApi.getAll(),
                    genreApi.getAll(),
                    contentApi.getAll(),
                    seasonApi.getAll(),
                    episodeApi.getAll(),
                    watchlistApi.getAll(),
                ])
            setData({ users, profiles, plans, subscriptions, genres, contents, seasons, episodes, watchlist })
        } catch (e) {
            error((e as Error).message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loading && !data) {
        return (
            <div className={ui.page}>
                <h1 className={ui.title}>Dashboard</h1>
                <div className={ui.loading}>Loading…</div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className={ui.page}>
                <h1 className={ui.title}>Dashboard</h1>
                <div className={`${ui.error} mt-6`}>Could not load dashboard data.</div>
                <div className={ui.actions}>
                    <button className={ui.btnPrimary} onClick={load}>Retry</button>
                </div>
            </div>
        )
    }

    const { users, profiles, plans, subscriptions, genres, contents, seasons, episodes, watchlist } = data

    const activeUsers = users.filter((u) => u.isActive).length
    const activeSubs = subscriptions.filter((s) => s.status?.toLowerCase() === 'active')
    const planPrice = new Map(plans.map((p) => [p._id, Number(p.price) || 0]))
    const monthlyRevenue = activeSubs.reduce((sum, s) => sum + (planPrice.get(s.planId) ?? 0), 0)
    const kidsProfiles = profiles.filter((p) => p.isKids).length

    const subsByStatus = countBy(subscriptions, (s) => s.status)
    const subsByPlan = countBy(subscriptions, (s) => plans.find((p) => p._id === s.planId)?.name ?? 'Unknown plan')
    const contentByType = countBy(contents, (c) => c.type)

    const topRated = [...contents]
        .sort((a, b) => (Number(b.avgRating) || 0) - (Number(a.avgRating) || 0))
        .slice(0, 5)

    return (
        <div className={ui.page}>
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className={ui.title}>Dashboard</h1>
                    <p className={ui.subtitle}>Overview of users, billing and catalog.</p>
                </div>
                <button className={ui.btn} onClick={load} disabled={loading}>
                    {loading ? 'Refreshing…' : 'Refresh'}
                </button>
            </div>

            <div className={ui.statGrid}>
                <StatCard label="Users" value={users.length} icon="👤" hint={`${activeUsers} active`} />
                <StatCard label="Profiles" value={profiles.length} icon="🧑‍🤝‍🧑" hint={`${kidsProfiles} kids`} />
                <StatCard
                    label="Active subscriptions"
                    value={activeSubs.length}
                    icon="💳"
                    hint={`${subscriptions.length} total`}
                />
                <StatCard
                    label="Monthly revenue"
                    value={`$${monthlyRevenue.toFixed(2)}`}
                    icon="💰"
                    hint="From active subscriptions"
                />
                <StatCard label="Plans" value={plans.length} icon="📋" />
                <StatCard label="Content" value={contents.length} icon="🎬" hint={`${genres.length} genres`} />
                <StatCard
                    label="Seasons / Episodes"
                    value={`${seasons.length} / ${episodes.length}`}
                    icon="📺"
                />
                <StatCard label="Watchlist items" value={watchlist.length} icon="⭐" />
            </div>

            <div className="grid gap-0 lg:grid-cols-2 lg:gap-6">
                <Breakdown title="Subscriptions by status" rows={subsByStatus} />
                <Breakdown title="Subscriptions by plan" rows={subsByPlan} />
                <Breakdown title="Content by type" rows={contentByType} />
            </div>

            <h2 className="mt-10 text-xl font-bold">Top rated content</h2>
            <div className={ui.tableWrap}>
                <table className={ui.table}>
                    <thead>
                    <tr>
                        <th className={ui.th}>Title</th>
                        <th className={ui.th}>Type</th>
                        <th className={ui.th}>Year</th>
                        <th className={ui.th}>Rating</th>
                    </tr>
                    </thead>
                    <tbody>
                    {topRated.map((c) => (
                        <tr key={c._id} className={ui.tr}>
                            <td className={`${ui.td} font-semibold`}>{c.title}</td>
                            <td className={ui.td}><span className={ui.badge('blue')}>{c.type}</span></td>
                            <td className={ui.td}>{c.releaseYear}</td>
                            <td className={ui.td}>
                                <span className={ui.badge('amber')}>{(Number(c.avgRating) || 0).toFixed(1)}</span>
                            </td>
                        </tr>
                    ))}
                    {topRated.length === 0 && (
                        <tr>
                            <td colSpan={4} className={ui.empty}>No content yet.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Dashboard