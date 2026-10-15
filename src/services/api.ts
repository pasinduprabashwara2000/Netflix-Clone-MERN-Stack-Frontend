const API_URL = 'http://localhost:5000/api'

export interface Plan {
  _id: string
  name: string
  price: number
  maxStreams: number
  videoQuality: string
}

export interface User {
  _id: string
  name: string
  email: string
  hashedPassword: string
  role: string
  isActive: boolean
}

export interface Subscription {
  _id: string
  userId: string
  planId: string
  status: string
  startDate: string
  endDate: string
  paymentRef: string
}

export interface Profile {
  _id: string
  userId: string
  name: string
  avatarUrl: string
  isKids: boolean
  language: string
  maturityLevel: string
}

async function request<T>(
    path: string,
    options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    const detail =
        typeof body.error === 'string'
            ? body.error
            : body.error?.message

    throw new Error(
        [body.message, detail].filter(Boolean).join(' ') ||
        'Request failed'
    )
  }

  return body as T
}

// Accepts either an array or { data: [...] } from the backend
async function getList<T>(path: string): Promise<T[]> {
  const body = await request<T[] | { data: T[] }>(path)
  return Array.isArray(body) ? body : body.data ?? []
}

function makeApi<T extends { _id: string }>(path: string) {
  type Body = Omit<T, '_id'>
  return {
    getAll: (): Promise<T[]> => getList<T>(path),

    create: (data: Body): Promise<T> =>
        request<T>(path, {
          method: 'POST',
          body: JSON.stringify(data),
        }),

    update: (id: string, data: Partial<Body>): Promise<T> =>
        request<T>(`${path}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),

    remove: (id: string): Promise<void> =>
        request<void>(`${path}/${id}`, {
          method: 'DELETE',
        }),
  }
}

export const planApi = makeApi<Plan>('/plan')
export const userApi = makeApi<User>('/user')
export const subscriptionApi = makeApi<Subscription>('/subscription')
export const profileApi = makeApi<Profile>('/profile')