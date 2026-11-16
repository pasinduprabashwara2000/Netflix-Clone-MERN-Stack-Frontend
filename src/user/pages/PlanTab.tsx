import { useEffect, useState } from 'react'
import { useAlert } from '../../alerts/context.ts'
import { confirmPayment, errorMessage, getMySubscription, getPlans, startCheckout } from '../accountApi'
import type { MySubscription, PlanInfo } from '../accountApi'

const cardClass = 'rounded-md bg-panel p-6 ring-1 ring-white/10 sm:p-8'

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

/** Account → Plan: shows the current subscription and lets the user choose or change plan. */
function PlanTab() {
    const { success, warning, confirm } = useAlert()
    const [plans, setPlans] = useState<PlanInfo[]>([])
    const [current, setCurrent] = useState<MySubscription | null>(null)
    const [loading, setLoading] = useState(true)
    const [savingId, setSavingId] = useState('')

    useEffect(() => {
        let cancelled = false
        const params = new URLSearchParams(window.location.search)
        const sessionId = params.get('session_id')

        // back from the payment page: remove ?session_id / ?payment from the address bar
        const cleanUrl = () => window.history.replaceState(null, '', window.location.pathname + window.location.hash)

        Promise.all([getPlans(), getMySubscription()])
            .then(async ([list, mine]) => {
                if (cancelled) return
                setPlans([...list].sort((a, b) => a.price - b.price))
                setCurrent(mine)

                if (sessionId) {
                    const res = await confirmPayment(sessionId)
                    if (cancelled) return
                    setCurrent(res.data)
                    success(res.message)
                } else if (params.get('payment') === 'cancelled') {
                    warning('Payment cancelled. Your plan was not changed')
                }
            })
            .catch((err) => !cancelled && warning(errorMessage(err, 'Failed to load plans')))
            .finally(() => {
                if (cancelled) return
                if (sessionId || params.has('payment')) cleanUrl()
                setLoading(false)
            })

        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const isActive = current?.status === 'Active'

    const handleChoose = async (plan: PlanInfo) => {
        const changing = isActive && current?.plan
        const price = `$${plan.price.toFixed(2)}`
        const ok = await confirm({
            title: changing ? 'Change plan' : 'Choose plan',
            message: changing
                ? `Switch from ${current.plan!.name} to ${plan.name} (${price} for 1 month)? You will be taken to a secure payment page.`
                : `Subscribe to ${plan.name} (${price} for 1 month)? You will be taken to a secure payment page.`,
            confirmText: 'Continue to Payment',
        })
        if (!ok) return

        try {
            setSavingId(plan._id)
            window.location.assign(await startCheckout(plan._id))
        } catch (err) {
            warning(errorMessage(err, 'Failed to start payment'))
            setSavingId('')
        }
    }

    if (loading) {
        return <div className="h-64 animate-pulse rounded-md bg-panel" />
    }

    return (
        <div className="flex flex-col gap-6">
            <section className={cardClass}>
                <h2 className="text-lg font-bold">Current Plan</h2>
                {current?.plan ? (
                    <p className="mt-2 text-sm text-zinc-300">
                        <span className="font-semibold text-white">{current.plan.name}</span> · {current.status} ·{' '}
                        {isActive ? 'renews' : 'ended'} {formatDate(current.endDate)}
                    </p>
                ) : (
                    <p className="mt-2 text-sm text-muted">You are not subscribed yet. Choose a plan below.</p>
                )}
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
                {plans.map((plan) => {
                    const isCurrent = isActive && current?.plan?._id === plan._id

                    return (
                        <div
                            key={plan._id}
                            className={`${cardClass} flex flex-col ${isCurrent ? 'ring-2 ring-brand' : ''}`}
                        >
                            <h3 className="text-xl font-black">{plan.name}</h3>
                            <p className="mt-1 text-3xl font-black text-brand">
                                ${plan.price.toFixed(2)}<span className="text-sm font-medium text-muted"> / month</span>
                            </p>

                            <ul className="mt-4 flex-1 space-y-1 text-sm text-zinc-300">
                                <li>{plan.videoQuality} video quality</li>
                                <li>{plan.maxStreams} {plan.maxStreams === 1 ? 'screen' : 'screens'} at the same time</li>
                            </ul>

                            <button
                                type="button"
                                disabled={isCurrent || !!savingId}
                                onClick={() => handleChoose(plan)}
                                className="mt-6 h-11 rounded bg-brand px-6 text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {savingId === plan._id ? 'Redirecting…' : isCurrent ? 'Current Plan' : isActive ? 'Change to this plan' : 'Choose Plan'}
                            </button>
                        </div>
                    )
                })}
            </div>

            <p className="text-xs text-muted">Payments are processed securely by Stripe. Each payment covers one month.</p>
        </div>
    )
}

export default PlanTab
