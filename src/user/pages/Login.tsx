import { useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import { useAlert } from '../../alerts/context.ts'
import { saveToken } from '../auth'
import { replaceWith, profilesPath } from '../router'

const inputClass = 'h-12 w-full rounded border border-zinc-700 bg-zinc-800/80 px-4 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-white'
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted'

function Login() {
    const { success, warning } = useAlert()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const clearForm = () => {
        setEmail('')
        setPassword('')
    }

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault()

        if (!email || !password) {
            warning('Email and Password are Required')
            return
        }

        try {
            setLoading(true)
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password })
            saveToken(res.data.token)
            success('Login Successfully')
            // replace (not push) so Back doesn't return to the login form
            replaceWith(profilesPath)
        } catch (err) {
            const msg = axios.isAxiosError(err) ? err.response?.data?.message : null
            warning(msg || 'Login Failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative flex min-h-screen flex-col bg-surface text-white">

            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(229,9,20,0.18),transparent_60%)]" />

            <header className="relative mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-8 lg:px-12">
                <a href="#/welcome" className="text-2xl font-black uppercase tracking-tighter text-brand sm:text-3xl">Hotflix</a>
            </header>

            <main className="relative flex flex-1 items-center justify-center px-4 pb-16">
                <form
                    onSubmit={handleLogin}
                    className="w-full max-w-md rounded-md bg-black/70 p-6 shadow-2xl shadow-black/60 ring-1 ring-white/10 backdrop-blur sm:p-10"
                >

                    <h1 className="text-3xl font-black">Sign In</h1>
                    <p className="mt-1 text-sm text-muted">
                        Welcome back! Sign in to continue watching.
                    </p>

                    <div className="mt-8 flex flex-col gap-5">

                        <div>
                            <label className={labelClass}>Email</label>
                            <input type="email" className={inputClass} value={email} placeholder="Enter Email Address" autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <div>
                            <label className={labelClass}>Password</label>
                            <input type="password" className={inputClass} value={password} placeholder="Enter Password" autoComplete="current-password" onChange={(e) => setPassword(e.target.value)} />
                        </div>

                    </div>

                    <div className="mt-8 flex gap-3">
                        <button type="submit" disabled={loading} className="h-12 flex-1 rounded bg-brand text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60">
                            {loading ? 'Signing in…' : 'Login'}
                        </button>
                        <button type="button" onClick={clearForm} className="h-12 rounded bg-zinc-700 px-6 text-sm font-bold text-white transition hover:bg-zinc-600">Clear</button>
                    </div>

                    <p className="mt-6 text-sm text-muted">
                        Don't have an account?{' '}
                        <a href="#/signup" className="font-semibold text-white hover:underline">
                            Sign up now
                        </a>
                    </p>

                </form>
            </main>
        </div>
    )
}

export default Login
