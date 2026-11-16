import { useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import { useAlert } from '../../alerts/context.ts'

const inputClass = 'h-12 w-full rounded border border-zinc-700 bg-zinc-800/80 px-4 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-white'
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted'

function Signup() {
    const { success, warning } = useAlert()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleClear = () => {
        setName('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
    }

    const handleSignup = async (e: FormEvent) => {
        e.preventDefault()

        if (!name.trim() || !email.trim() || !password || !confirmPassword) {
            warning('All Fields are Required')
            return
        }

        if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            warning('Enter a valid Email Address')
            return
        }

        // backend rejects anything shorter than 8
        if (password.length < 8) {
            warning('Password must be at least 8 characters')
            return
        }

        if (password !== confirmPassword) {
            warning('Passwords do not match')
            return
        }

        try {
            setLoading(true)
            await axios.post('http://localhost:5000/api/auth/register', {
                name: name.trim(),
                email: email.trim(),
                password,
            })
            success('Account created! Please sign in.')
            window.location.hash = '/login'
        } catch (err) {
            // show the server's message, e.g. "User already exists"
            const msg = axios.isAxiosError(err) ? err.response?.data?.message : null
            warning(msg || 'Signup Failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative flex min-h-screen flex-col bg-surface text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(229,9,20,0.18),transparent_60%)]" />

            <header className="relative mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-8 lg:px-12">
                <a href="#/welcome" className="text-2xl font-black uppercase tracking-tighter text-brand sm:text-3xl">Hotflix</a>
            </header>

            <main className="relative flex flex-1 items-center justify-center px-4 pb-16">
                <form
                    onSubmit={handleSignup}
                    className="w-full max-w-md rounded-md bg-black/70 p-6 shadow-2xl shadow-black/60 ring-1 ring-white/10 backdrop-blur sm:p-10"
                >
                    <h1 className="text-3xl font-black">Sign Up</h1>
                    <p className="mt-1 text-sm text-muted">Create your account to start watching.</p>

                    <div className="mt-8 flex flex-col gap-5">
                        <div>
                            <label className={labelClass}>Full Name</label>
                            <input type="text" className={inputClass} value={name} placeholder="Enter Full Name" autoComplete="name" onChange={(e) => setName(e.target.value)} />
                        </div>

                        <div>
                            <label className={labelClass}>Email</label>
                            <input type="email" className={inputClass} value={email} placeholder="Enter Email Address" autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <div>
                            <label className={labelClass}>Password</label>
                            <input type="password" className={inputClass} value={password} placeholder="At least 8 characters" autoComplete="new-password" onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        <div>
                            <label className={labelClass}>Confirm Password</label>
                            <input type="password" className={inputClass} value={confirmPassword} placeholder="Re-enter Password" autoComplete="new-password" onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-12 flex-1 rounded bg-brand text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? 'Creating…' : 'Sign Up'}
                        </button>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="h-12 rounded bg-zinc-700 px-6 text-sm font-bold text-white transition hover:bg-zinc-600"
                        >
                            Clear
                        </button>
                    </div>

                    <p className="mt-6 text-sm text-muted">
                        Already have an account?{' '}
                        <a href="#/login" className="font-semibold text-white hover:underline">Sign in</a>
                    </p>
                </form>
            </main>
        </div>
    )
}

export default Signup
