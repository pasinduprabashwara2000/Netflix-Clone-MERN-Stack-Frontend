import { useEffect, useState } from 'react'
import { userApi } from '../services/api'
import { ui } from '../ui'
import type { User } from '../services/api'
import { useAlert } from '../alerts/context'

function UserManagement() {
    const { success, error, warning, confirm } = useAlert()
  const [users, setUsers] = useState<User[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('User')
  const [isActive, setIsActive] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const loadUsers = async () => {
    try {
      setUsers(await userApi.getAll())
    } catch (e) {
      error((e as Error).message)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers()
  }, [])

  const saveUser = async () => {
    if (!name || !email || (!selectedId && !password)) {
      warning('Please enter name, email and password')
      return
    }

    // When editing, a blank password keeps the existing one
    const data = { name, email, role, isActive, ...(password ? { hashedPassword: password } : {}) }

    try {
      if (selectedId) {
        await userApi.update(selectedId, data)
      } else {
        await userApi.create({ ...data, hashedPassword: password })
      }
      success(selectedId ? 'User updated' : 'User created')
      clearForm()
      loadUsers()
    } catch (e) {
      error((e as Error).message)
    }
  }

  const editUser = (user: User) => {
    setSelectedId(user._id)
    setName(user.name)
    setEmail(user.email)
    setPassword('')
    setRole(user.role)
    setIsActive(user.isActive)
  }

  const deleteUser = async (id: string) => {
    if (await confirm({ title: 'Delete user?', message: 'This user will be permanently removed.' })) {
      try {
        await userApi.remove(id)
        success('User deleted')
        loadUsers()
      } catch (e) {
        error((e as Error).message)
      }
    }
  }

  const clearForm = () => {
    setSelectedId(null)
    setName('')
    setEmail('')
    setPassword('')
    setRole('User')
    setIsActive(true)
  }

  return (
    <div className={ui.page}>
      <h1 className={ui.title}>Manage Users</h1>
      <p className={ui.subtitle}>Customer and admin accounts.</p>

      <div className={ui.card}>
        <h2 className={ui.cardTitle}>{selectedId ? 'Edit user' : 'New user'}</h2>
        <div className={ui.grid}>
          <div className={ui.field}>
            <label className={ui.label}>Name</label>
            <input className={ui.input} type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className={ui.field}>
            <label className={ui.label}>Email</label>
            <input className={ui.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className={ui.field}>
            <label className={ui.label}>Password {selectedId && <span className="text-muted">(leave blank to keep current)</span>}</label>
            <input className={ui.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className={ui.field}>
            <label className={ui.label}>Role</label>
            <select className={ui.input} value={role} onChange={(e) => setRole(e.target.value)}>
              <option>User</option>
              <option>Admin</option>
            </select>
          </div>
          <label className={ui.check}>
            <input className={ui.checkbox} type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Account active
          </label>
        </div>

        <div className={ui.actions}>
          <button className={ui.btnPrimary} onClick={saveUser}>{selectedId ? 'Update user' : 'Save user'}</button>
          <button className={ui.btn} onClick={clearForm}>Clear</button>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-bold">
        All users <span className="ml-1 text-sm font-normal text-muted">({users.length})</span>
      </h2>

      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th className={ui.th}>Name</th>
              <th className={ui.th}>Email</th>
              <th className={ui.th}>Role</th>
              <th className={ui.th}>Status</th>
              <th className={`${ui.th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className={ui.tr}>
                <td className={`${ui.td} font-semibold`}>{user.name}</td>
                <td className={`${ui.td} text-muted`}>{user.email}</td>
                <td className={ui.td}><span className={ui.badge(user.role === 'Admin' ? 'red' : 'gray')}>{user.role}</span></td>
                <td className={ui.td}><span className={ui.badge(user.isActive ? 'green' : 'gray')}>{user.isActive ? 'Active' : 'Disabled'}</span></td>
                <td className={`${ui.td} text-right whitespace-nowrap`}>
                  <button className={ui.btnSm} onClick={() => editUser(user)}>Edit</button>
                  <button className={ui.btnDanger} onClick={() => deleteUser(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className={ui.empty}>
                  No users yet. Create your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserManagement
