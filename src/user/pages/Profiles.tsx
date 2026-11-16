import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import { API_URL } from '../../config'
import { useAlert } from '../../alerts/context.ts'
import { authHeader, getToken, logout, saveProfile } from '../auth'
import type { ActiveProfile } from '../auth'
import { replaceWith } from '../router'

const API = `${API_URL}/profile/mine`
const MAX_PROFILES = 5

const inputClass = 'h-12 w-full rounded border border-zinc-700 bg-zinc-800/80 px-4 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-white'

function Profiles() {
    const { success, warning, confirm } = useAlert()
    const [profiles, setProfiles] = useState<ActiveProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [managing, setManaging] = useState(false)
    const [adding, setAdding] = useState(false)
    const [saving, setSaving] = useState(false)
    const [name, setName] = useState('')
    const [isKids, setIsKids] = useState(false)

    const loadProfiles = async () => {
        try {
            const res = await axios.get<ActiveProfile[]>(API, { headers: authHeader() })
            setProfiles(res.data)
        } catch (err) {
            // expired / invalid token → back to login
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                logout()
                return
            }
            warning('Failed to load profiles')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!getToken()) {
            replaceWith('#/login')
            return
        }
        loadProfiles()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const choose = (profile: ActiveProfile) => {
        saveProfile(profile)
        replaceWith('#/')
    }

    const handleAdd = async (e: FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            warning('Profile name is required')
            return
        }

        try {
            setSaving(true)
            await axios.post(API, { name: name.trim(), isKids }, { headers: authHeader() })
            success('Profile created')
            setName('')
            setIsKids(false)
            setAdding(false)
            await loadProfiles()
        } catch (err) {
            const msg = axios.isAxiosError(err) ? err.response?.data?.message : null
            warning(msg || 'Failed to create profile')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (profile: ActiveProfile) => {
        const ok = await confirm({
            title: 'Delete profile',
            message: `Delete "${profile.name}"? This cannot be undone.`,
            confirmText: 'Delete',
            danger: true,
        })
        if (!ok) return

        try {
            await axios.delete(`${API}/${profile._id}`, { headers: authHeader() })
            success('Profile deleted')
            await loadProfiles()
        } catch {
            warning('Failed to delete profile')
        }
    }

    return (
        <div className="relative flex min-h-screen flex-col bg-surface text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(229,9,20,0.18),transparent_60%)]" />

            <header className="relative mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 py-5 sm:px-8 lg:px-12">
                <span className="text-2xl font-black uppercase tracking-tighter text-brand sm:text-3xl">Hotflix</span>
                <button
                    type="button"
                    onClick={logout}
                    className="rounded bg-zinc-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
                >
                    Sign Out
                </button>
            </header>

            <main className="relative flex flex-1 flex-col items-center justify-center px-4 pb-16">
                <h1 className="text-3xl font-black sm:text-5xl">Who's watching?</h1>

                {loading ? (
                    <p className="mt-12 text-muted">Loading profiles…</p>
                ) : (
                    <div className="mt-10 flex flex-wrap items-start justify-center gap-6 sm:gap-8">

                        {profiles.map((profile) => (
                            <div key={profile._id} className="group relative flex w-28 flex-col items-center gap-3 sm:w-36">
                                <button
                                    type="button"
                                    onClick={() => (managing ? undefined : choose(profile))}
                                    className="relative block"
                                    aria-label={`Watch as ${profile.name}`}
                                >
                                    <img
                                        src={profile.avatarUrl}
                                        alt={profile.name}
                                        className={`size-28 rounded-md bg-raised object-cover ring-2 ring-transparent transition sm:size-36 ${managing ? 'opacity-50' : 'group-hover:ring-white'}`}
                                    />
                                    {profile.isKids && (
                                        <span className="absolute bottom-1 left-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase">Kids</span>
                                    )}
                                </button>

                                {managing && (
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(profile)}
                                        className="absolute left-1/2 top-12 -translate-x-1/2 rounded bg-brand px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-600 sm:top-16"
                                    >
                                        Delete
                                    </button>
                                )}

                                <span className="max-w-full truncate text-sm text-muted group-hover:text-white">{profile.name}</span>
                            </div>
                        ))}

                        {profiles.length < MAX_PROFILES && !adding && (
                            <button
                                type="button"
                                onClick={() => setAdding(true)}
                                className="group flex w-28 flex-col items-center gap-3 sm:w-36"
                            >
                                <span className="flex size-28 items-center justify-center rounded-md border-2 border-dashed border-zinc-600 text-5xl text-zinc-500 transition group-hover:border-white group-hover:text-white sm:size-36">+</span>
                                <span className="text-sm text-muted group-hover:text-white">Add Profile</span>
                            </button>
                        )}
                    </div>
                )}

                {adding && (
                    <form
                        onSubmit={handleAdd}
                        className="mt-10 w-full max-w-sm rounded-md bg-black/70 p-6 ring-1 ring-white/10"
                    >
                        <h2 className="text-xl font-bold">Add Profile</h2>

                        <input
                            type="text"
                            className={`${inputClass} mt-4`}
                            placeholder="Profile name"
                            value={name}
                            maxLength={20}
                            autoFocus
                            onChange={(e) => setName(e.target.value)}
                        />

                        <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
                            <input
                                type="checkbox"
                                checked={isKids}
                                onChange={(e) => setIsKids(e.target.checked)}
                                className="size-4 accent-[#e50914]"
                            />
                            Kids profile
                        </label>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="h-11 flex-1 rounded bg-brand text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? 'Saving…' : 'Save'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setAdding(false); setName(''); setIsKids(false) }}
                                className="h-11 rounded bg-zinc-700 px-6 text-sm font-bold text-white transition hover:bg-zinc-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {!loading && profiles.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setManaging((m) => !m)}
                        className="mt-12 rounded border border-zinc-600 px-6 py-2 text-sm font-semibold uppercase tracking-widest text-zinc-300 transition hover:border-white hover:text-white"
                    >
                        {managing ? 'Done' : 'Manage Profiles'}
                    </button>
                )}
            </main>
        </div>
    )
}

export default Profiles
