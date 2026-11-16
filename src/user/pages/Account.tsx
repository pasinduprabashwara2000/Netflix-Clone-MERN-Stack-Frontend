import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAlert } from '../../alerts/context.ts'
import SafeImage from '../components/SafeImage'
import PlanTab from './PlanTab'
import { clearProfile, getProfile, logout, saveProfile } from '../auth'
import type { ActiveProfile } from '../auth'
import {
    changePassword,
    clearHistory,
    deleteProfile,
    errorMessage,
    getHistory,
    getMe,
    removeHistory,
    updateProfile,
} from '../accountApi'
import type { HistoryItem } from '../accountApi'
import { accountPath, profilesPath, replaceWith, watchPath } from '../router'
import type { AccountTab } from '../router'

const inputClass = 'h-12 w-full rounded border border-zinc-700 bg-zinc-800/80 px-4 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-white'
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted'
const cardClass = 'rounded-md bg-panel p-6 ring-1 ring-white/10 sm:p-8'

const TABS: { id: AccountTab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'plan', label: 'Plan' },
    { id: 'history', label: 'Watch History' },
    { id: 'security', label: 'Password' },
]

/** "Today, 9:41 PM" / "Yesterday, …" / "12 Nov 2026" */
const formatWhen = (iso: string) => {
    const d = new Date(iso)
    const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
    const days = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86_400_000)
    const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

    if (days === 0) return `Today, ${time}`
    if (days === 1) return `Yesterday, ${time}`
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

/* ------------------------------------------------------------------ */
/* Profile tab: rename, kids toggle, switch, delete                     */
/* ------------------------------------------------------------------ */
function ProfileTab({ profile, onSaved }: { profile: ActiveProfile; onSaved: (p: ActiveProfile) => void }) {
    const { success, warning, confirm } = useAlert()
    const [name, setName] = useState(profile.name)
    const [isKids, setIsKids] = useState(profile.isKids)
    const [saving, setSaving] = useState(false)

    const changed = name.trim() !== profile.name || isKids !== profile.isKids

    const handleSave = async (e: FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            warning('Profile name is required')
            return
        }

        try {
            setSaving(true)
            const updated = await updateProfile(profile._id, { name: name.trim(), isKids })
            const next: ActiveProfile = {
                _id: updated._id,
                name: updated.name,
                avatarUrl: updated.avatarUrl,
                isKids: updated.isKids,
            }
            saveProfile(next)
            onSaved(next)
            success('Profile updated')
        } catch (err) {
            warning(errorMessage(err, 'Failed to update profile'))
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        const ok = await confirm({
            title: 'Delete profile',
            message: `Delete "${profile.name}"? Its watch history will be removed too. This cannot be undone.`,
            confirmText: 'Delete Profile',
            danger: true,
        })
        if (!ok) return

        try {
            await deleteProfile(profile._id)
            clearProfile()
            success('Profile deleted')
            replaceWith(profilesPath)
        } catch (err) {
            warning(errorMessage(err, 'Failed to delete profile'))
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <form onSubmit={handleSave} className={cardClass}>
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                    <img
                        src={profile.avatarUrl}
                        alt={profile.name}
                        className="size-28 shrink-0 rounded-md bg-raised object-cover"
                    />

                    <div className="w-full">
                        <label className={labelClass}>Profile Name</label>
                        <input
                            type="text"
                            className={inputClass}
                            value={name}
                            maxLength={20}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
                            <input
                                type="checkbox"
                                checked={isKids}
                                onChange={(e) => setIsKids(e.target.checked)}
                                className="size-4 accent-[#e50914]"
                            />
                            Kids profile (maturity level 7+)
                        </label>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={saving || !changed}
                                className="h-11 rounded bg-brand px-8 text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                            <a
                                href={profilesPath}
                                className="flex h-11 items-center rounded bg-zinc-700 px-6 text-sm font-bold text-white transition hover:bg-zinc-600"
                            >
                                Switch Profile
                            </a>
                        </div>
                    </div>
                </div>
            </form>

            <section className="rounded-md border border-brand/40 bg-brand/5 p-6 sm:p-8">
                <h2 className="text-lg font-bold text-brand">Delete Profile</h2>
                <p className="mt-1 text-sm text-zinc-300">
                    Permanently removes this profile and its watch history. Your account and other profiles are not affected.
                </p>
                <button
                    type="button"
                    onClick={handleDelete}
                    className="mt-5 h-11 rounded bg-brand px-6 text-sm font-bold text-white transition hover:bg-brand-600"
                >
                    Delete "{profile.name}"
                </button>
            </section>
        </div>
    )
}

/* ------------------------------------------------------------------ */
/* Watch history tab                                                    */
/* ------------------------------------------------------------------ */
function HistoryTab({ profile }: { profile: ActiveProfile }) {
    const { success, warning, confirm } = useAlert()
    const [items, setItems] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false

        setLoading(true)
        setError('')

        getHistory(profile._id)
            .then((data) => {
                if (!cancelled) setItems(data)
            })
            .catch((err) => {
                if (!cancelled) setError(errorMessage(err, 'Failed to load watch history'))
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [profile._id])

    const handleRemove = async (item: HistoryItem) => {
        try {
            await removeHistory(item._id)
            setItems((list) => list.filter((i) => i._id !== item._id))
        } catch (err) {
            warning(errorMessage(err, 'Failed to remove item'))
        }
    }

    const handleClear = async () => {
        const ok = await confirm({
            title: 'Clear watch history',
            message: `Remove everything "${profile.name}" has watched?`,
            confirmText: 'Clear All',
            danger: true,
        })
        if (!ok) return

        try {
            await clearHistory(profile._id)
            setItems([])
            success('Watch history cleared')
        } catch (err) {
            warning(errorMessage(err, 'Failed to clear history'))
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-24 animate-pulse rounded-md bg-panel" />
                ))}
            </div>
        )
    }

    if (error) {
        return <p className="rounded-md bg-panel p-6 text-sm text-muted">{error}</p>
    }

    if (items.length === 0) {
        return (
            <div className={`${cardClass} text-center`}>
                <p className="text-lg font-semibold">Nothing watched yet</p>
                <p className="mt-1 text-sm text-muted">
                    Titles you watch as <span className="text-white">{profile.name}</span> will show up here.
                </p>
                <a
                    href="#/"
                    className="mt-6 inline-block rounded bg-brand px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600"
                >
                    Browse titles
                </a>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm text-muted">
                    {items.length} {items.length === 1 ? 'title' : 'titles'} · most recent first
                </p>
                <button
                    type="button"
                    onClick={handleClear}
                    className="rounded border border-zinc-600 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-300 transition hover:border-brand hover:text-brand"
                >
                    Clear All
                </button>
            </div>

            <ul className="flex flex-col gap-3">
                {items.map((item) => {
                    const { content, episode } = item

                    return (
                        <li
                            key={item._id}
                            className="flex items-center gap-3 rounded-md bg-panel p-3 ring-1 ring-white/5 transition hover:ring-white/20"
                        >
                            <a
                                href={watchPath(content._id, episode?._id)}
                                className="flex min-w-0 flex-1 items-center gap-4"
                            >
                                <div className="relative aspect-[2/3] w-14 shrink-0 overflow-hidden rounded bg-raised sm:w-16">
                                    <SafeImage src={content.posterUrl} alt={content.title} className="size-full object-cover" />
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate font-semibold">{content.title}</p>
                                    <p className="mt-0.5 truncate text-sm text-zinc-300">
                                        {episode
                                            ? `S${episode.seasonNumber ?? 1} · E${episode.episodeNumber} - ${episode.title}`
                                            : content.type}
                                    </p>
                                    <p className="mt-1 text-xs text-muted">{formatWhen(item.watchedAt)}</p>
                                </div>
                            </a>

                            <button
                                type="button"
                                onClick={() => handleRemove(item)}
                                aria-label={`Remove ${content.title} from history`}
                                title="Remove from history"
                                className="flex size-9 shrink-0 items-center justify-center rounded text-zinc-400 transition hover:bg-raised hover:text-brand"
                            >
                                ✕
                            </button>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

/* ------------------------------------------------------------------ */
/* Password tab                                                         */
/* ------------------------------------------------------------------ */
function SecurityTab() {
    const { success, warning } = useAlert()
    const [current, setCurrent] = useState('')
    const [next, setNext] = useState('')
    const [confirmNext, setConfirmNext] = useState('')
    const [saving, setSaving] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!current || !next || !confirmNext) {
            warning('All Fields are Required')
            return
        }

        if (next.length < 8) {
            warning('New password must be at least 8 characters')
            return
        }

        if (next !== confirmNext) {
            warning('New passwords do not match')
            return
        }

        if (next === current) {
            warning('New password must be different from the current one')
            return
        }

        try {
            setSaving(true)
            await changePassword(current, next)
            success('Password changed')
            setCurrent('')
            setNext('')
            setConfirmNext('')
        } catch (err) {
            warning(errorMessage(err, 'Failed to change password'))
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <form onSubmit={handleSubmit} className={cardClass}>
                <h2 className="text-lg font-bold">Change Password</h2>
                <p className="mt-1 text-sm text-muted">Use at least 8 characters.</p>

                <div className="mt-6 flex max-w-md flex-col gap-5">
                    <div>
                        <label className={labelClass}>Current Password</label>
                        <input type="password" className={inputClass} value={current} autoComplete="current-password" placeholder="Enter Current Password" onChange={(e) => setCurrent(e.target.value)} />
                    </div>

                    <div>
                        <label className={labelClass}>New Password</label>
                        <input type="password" className={inputClass} value={next} autoComplete="new-password" placeholder="Enter New Password" onChange={(e) => setNext(e.target.value)} />
                    </div>

                    <div>
                        <label className={labelClass}>Confirm New Password</label>
                        <input type="password" className={inputClass} value={confirmNext} autoComplete="new-password" placeholder="Re-enter New Password" onChange={(e) => setConfirmNext(e.target.value)} />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="mt-8 h-11 rounded bg-brand px-8 text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {saving ? 'Updating…' : 'Update Password'}
                </button>
            </form>

            <section className={cardClass}>
                <h2 className="text-lg font-bold">Sign Out</h2>
                <p className="mt-1 text-sm text-muted">Sign out of Hotflix on this device.</p>
                <button
                    type="button"
                    onClick={logout}
                    className="mt-5 h-11 rounded bg-zinc-700 px-6 text-sm font-bold text-white transition hover:bg-zinc-600"
                >
                    Sign Out
                </button>
            </section>
        </div>
    )
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */
function Account({ tab }: { tab: AccountTab }) {
    const [profile, setProfile] = useState<ActiveProfile | null>(getProfile())
    const [email, setEmail] = useState('')

    // no profile picked yet → choose one first
    useEffect(() => {
        if (!profile) replaceWith(profilesPath)
    }, [profile])

    useEffect(() => {
        getMe()
            .then((me) => setEmail(me.email))
            .catch(() => {})
    }, [])

    if (!profile) return null

    return (
        <div className="mx-auto w-full max-w-4xl px-4 pb-20 pt-24 sm:px-8">
            <h1 className="text-3xl font-black sm:text-4xl">Account</h1>
            <p className="mt-1 text-sm text-muted">
                {email && <>{email} · </>}
                Watching as <span className="text-white">{profile.name}</span>
            </p>

            <nav className="mt-8 flex gap-1 overflow-x-auto border-b border-line">
                {TABS.map((t) => (
                    <a
                        key={t.id}
                        href={accountPath(t.id)}
                        aria-current={tab === t.id ? 'page' : undefined}
                        className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                            tab === t.id
                                ? 'border-brand text-white'
                                : 'border-transparent text-muted hover:text-white'
                        }`}
                    >
                        {t.label}
                    </a>
                ))}
            </nav>

            <div className="mt-8">
                {tab === 'profile' && <ProfileTab profile={profile} onSaved={setProfile} />}
                {tab === 'plan' && <PlanTab />}
                {tab === 'history' && <HistoryTab profile={profile} />}
                {tab === 'security' && <SecurityTab />}
            </div>
        </div>
    )
}

export default Account
