import { useEffect, useState } from 'react'
import { planApi, subscriptionApi, userApi } from '../services/api'
import { ui } from '../ui'
import type { Plan, Subscription, User } from '../services/api'
import { useAlert } from '../alerts/context'

const statusColor: Record<string, 'green' | 'amber' | 'red' | 'gray'> = {
  Active: 'green',
  Pending: 'amber',
  Cancelled: 'red',
  Expired: 'gray',
}

const dateOnly = (iso: string) => (iso ? iso.slice(0, 10) : '')

function SubscriptionManagement() {
    const { success, error, warning, confirm } = useAlert()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [userId, setUserId] = useState('')
  const [planId, setPlanId] = useState('')
  const [status, setStatus] = useState('Active')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [paymentRef, setPaymentRef] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const loadAll = async () => {
    try {
      setSubscriptions(await subscriptionApi.getAll())
      setUsers(await userApi.getAll())
      setPlans(await planApi.getAll())
    } catch (e) {
      error((e as Error).message)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll()
  }, [])

  const saveSubscription = async () => {
    if (!userId || !planId || !startDate || !endDate || !paymentRef) {
      warning('Please fill in all fields')
      return
    }

    const data = { userId, planId, status, startDate, endDate, paymentRef }

    try {
      if (selectedId) {
        await subscriptionApi.update(selectedId, data)
      } else {
        await subscriptionApi.create(data)
      }
      success(selectedId ? 'Subscription updated' : 'Subscription created')
      clearForm()
      loadAll()
    } catch (e) {
      error((e as Error).message)
    }
  }

  const editSubscription = (s: Subscription) => {
    setSelectedId(s._id)
    setUserId(s.userId)
    setPlanId(s.planId)
    setStatus(s.status)
    setStartDate(dateOnly(s.startDate))
    setEndDate(dateOnly(s.endDate))
    setPaymentRef(s.paymentRef)
  }

  const deleteSubscription = async (id: string) => {
    if (await confirm({ title: 'Delete subscription?', message: 'This subscription will be permanently removed.' })) {
      try {
        await subscriptionApi.remove(id)
        success('Subscription deleted')
        loadAll()
      } catch (e) {
        error((e as Error).message)
      }
    }
  }

  const clearForm = () => {
    setSelectedId(null)
    setUserId('')
    setPlanId('')
    setStatus('Active')
    setStartDate('')
    setEndDate('')
    setPaymentRef('')
  }

  const userLabel = (id: string) => users.find((u) => u._id === id)?.email ?? id
  const planLabel = (id: string) => plans.find((p) => p._id === id)?.name ?? id

  return (
    <div className={ui.page}>
      <h1 className={ui.title}>Manage Subscriptions</h1>
      <p className={ui.subtitle}>Which user is on which plan, and for how long.</p>

      <div className={ui.card}>
        <h2 className={ui.cardTitle}>{selectedId ? 'Edit subscription' : 'New subscription'}</h2>
        <div className={ui.grid}>
          <div className={ui.field}>
            <label className={ui.label}>User</label>
            <select className={ui.input} value={userId} onChange={(e) => setUserId(e.target.value)}>
              <option value="">Select a user…</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
          <div className={ui.field}>
            <label className={ui.label}>Plan</label>
            <select className={ui.input} value={planId} onChange={(e) => setPlanId(e.target.value)}>
              <option value="">Select a plan…</option>
              {plans.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} - ${Number(p.price).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
          <div className={ui.field}>
            <label className={ui.label}>Status</label>
            <select className={ui.input} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Active</option>
              <option>Pending</option>
              <option>Cancelled</option>
              <option>Expired</option>
            </select>
          </div>
          <div className={ui.field}>
            <label className={ui.label}>Payment ref</label>
            <input className={ui.input} type="text" placeholder="PAY-10293" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} />
          </div>
          <div className={ui.field}>
            <label className={ui.label}>Start date</label>
            <input className={ui.input} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className={ui.field}>
            <label className={ui.label}>End date</label>
            <input className={ui.input} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className={ui.actions}>
          <button className={ui.btnPrimary} onClick={saveSubscription}>{selectedId ? 'Update subscription' : 'Save subscription'}</button>
          <button className={ui.btn} onClick={clearForm}>Clear</button>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-bold">
        All subscriptions <span className="ml-1 text-sm font-normal text-muted">({subscriptions.length})</span>
      </h2>

      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th className={ui.th}>User</th>
              <th className={ui.th}>Plan</th>
              <th className={ui.th}>Status</th>
              <th className={ui.th}>Period</th>
              <th className={ui.th}>Payment ref</th>
              <th className={`${ui.th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((s) => (
              <tr key={s._id} className={ui.tr}>
                <td className={`${ui.td} font-semibold`}>{userLabel(s.userId)}</td>
                <td className={ui.td}>{planLabel(s.planId)}</td>
                <td className={ui.td}>
                  <span className={ui.badge(statusColor[s.status] ?? 'gray')}>{s.status}</span>
                </td>
                <td className={`${ui.td} whitespace-nowrap text-muted`}>{dateOnly(s.startDate)} → {dateOnly(s.endDate)}</td>
                <td className={`${ui.td} font-mono text-xs text-muted`}>{s.paymentRef}</td>
                <td className={`${ui.td} text-right whitespace-nowrap`}>
                  <button className={ui.btnSm} onClick={() => editSubscription(s)}>Edit</button>
                  <button className={ui.btnDanger} onClick={() => deleteSubscription(s._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={6} className={ui.empty}>
                  No subscriptions yet. Create users and plans first, then add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


export default SubscriptionManagement
