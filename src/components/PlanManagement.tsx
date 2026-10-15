import { useEffect, useState } from 'react'
import { planApi } from '../services/api'
import { ui } from '../ui'
import type { Plan } from '../services/api'
import { useAlert } from '../alerts/context'

function PlanManagement() {
    const { success, error, warning, confirm } = useAlert()
  const [plans, setPlans] = useState<Plan[]>([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [maxStreams, setMaxStreams] = useState('')
  const [videoQuality, setVideoQuality] = useState('HD')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const loadPlans = async () => {
    try {
      setPlans(await planApi.getAll())
    } catch (e) {
      error((e as Error).message)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPlans()
  }, [])

  const savePlan = async () => {
    if (!name || price === '' || !maxStreams) {
      warning('Please enter name, price and max streams')
      return
    }

    const data = { name, price: Number(price), maxStreams: Number(maxStreams), videoQuality }

    try {
      if (selectedId) {
        await planApi.update(selectedId, data)
      } else {
        await planApi.create(data)
      }
      success(selectedId ? 'Plan updated' : 'Plan created')
      clearForm()
      loadPlans()
    } catch (e) {
      error((e as Error).message)
    }
  }

  const editPlan = (plan: Plan) => {
    setSelectedId(plan._id)
    setName(plan.name)
    setPrice(String(plan.price))
    setMaxStreams(String(plan.maxStreams))
    setVideoQuality(plan.videoQuality)
  }

  const deletePlan = async (id: string) => {
    if (await confirm({ title: 'Delete plan?', message: 'This plan will be permanently removed.' })) {
      try {
        await planApi.remove(id)
        success('Plan deleted')
        loadPlans()
      } catch (e) {
        error((e as Error).message)
      }
    }
  }

  const clearForm = () => {
    setSelectedId(null)
    setName('')
    setPrice('')
    setMaxStreams('')
    setVideoQuality('HD')
  }

  return (
    <div className={ui.page}>
      <h1 className={ui.title}>Manage Plans</h1>
      <p className={ui.subtitle}>Subscription tiers customers can choose from.</p>

      <div className={ui.card}>
        <h2 className={ui.cardTitle}>{selectedId ? 'Edit plan' : 'New plan'}</h2>
        <div className={ui.grid}>
          <div className={ui.field}>
            <label className={ui.label}>Plan name</label>
            <input className={ui.input} type="text" placeholder="Standard" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className={ui.field}>
            <label className={ui.label}>Price (per month)</label>
            <input className={ui.input} type="number" placeholder="9.99" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className={ui.field}>
            <label className={ui.label}>Max streams</label>
            <input className={ui.input} type="number" placeholder="2" value={maxStreams} onChange={(e) => setMaxStreams(e.target.value)} />
          </div>
          <div className={ui.field}>
            <label className={ui.label}>Video quality</label>
            <select className={ui.input} value={videoQuality} onChange={(e) => setVideoQuality(e.target.value)}>
              <option>SD</option>
              <option>HD</option>
              <option>Full HD</option>
              <option>4K</option>
            </select>
          </div>
        </div>

        <div className={ui.actions}>
          <button className={ui.btnPrimary} onClick={savePlan}>{selectedId ? 'Update plan' : 'Save plan'}</button>
          <button className={ui.btn} onClick={clearForm}>Clear</button>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-bold">
        All plans <span className="ml-1 text-sm font-normal text-muted">({plans.length})</span>
      </h2>

      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th className={ui.th}>Name</th>
              <th className={ui.th}>Price</th>
              <th className={ui.th}>Streams</th>
              <th className={ui.th}>Quality</th>
              <th className={`${ui.th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan._id} className={ui.tr}>
                <td className={`${ui.td} font-semibold`}>{plan.name}</td>
                <td className={ui.td}>${Number(plan.price).toFixed(2)}</td>
                <td className={ui.td}>{plan.maxStreams}</td>
                <td className={ui.td}><span className={ui.badge('blue')}>{plan.videoQuality}</span></td>
                <td className={`${ui.td} text-right whitespace-nowrap`}>
                  <button className={ui.btnSm} onClick={() => editPlan(plan)}>Edit</button>
                  <button className={ui.btnDanger} onClick={() => deletePlan(plan._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {plans.length === 0 && (
              <tr>
                <td colSpan={5} className={ui.empty}>
                  No plans yet. Create your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


export default PlanManagement
