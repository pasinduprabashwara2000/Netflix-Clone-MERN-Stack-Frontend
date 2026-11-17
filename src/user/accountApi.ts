import axios from 'axios'
import { API_URL } from '../config'
import { getToken, logout } from './auth'
import type { ActiveProfile } from './auth'
import type { Content } from '../services/api'

const http = axios.create({ baseURL: API_URL })

// attach the token to every request
http.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${getToken()}`
    return config
})

// expired / invalid token → sign out
http.interceptors.response.use(
    (res) => res,
    (err) => {
        if (axios.isAxiosError(err) && err.response?.status === 401) logout()
        return Promise.reject(err)
    },
)

/** The server's message if there is one, otherwise the fallback. */
export const errorMessage = (err: unknown, fallback: string): string =>
    axios.isAxiosError(err) ? (err.response?.data?.message ?? fallback) : fallback

// ---------- account ----------
export type Me = { id: string; name: string; email: string; role: 'Admin' | 'User' }

export const getMe = () => http.get<Me>('/auth/me').then((r) => r.data)

export const changePassword = (currentPassword: string, newPassword: string) =>
    http.put('/auth/change-password', { currentPassword, newPassword })

// ---------- subscription ----------
export type PlanInfo = { _id: string; name: string; price: number; maxStreams: number; videoQuality: string }

export type MySubscription = {
    _id: string
    status: string
    startDate: string
    endDate: string
    paymentRef: string
    plan: PlanInfo | null
}

export const getPlans = () => http.get<PlanInfo[]>('/plan').then((r) => r.data)

export const getMySubscription = () => http.get<MySubscription | null>('/subscription/me').then((r) => r.data)

/** Starts a Stripe payment for the plan; returns the payment page URL. */
export const startCheckout = (planId: string) =>
    http.post<{ url: string }>('/subscription/me/checkout', { planId }).then((r) => r.data.url)

/** After paying: verifies the payment and activates the plan. */
export const confirmPayment = (sessionId: string) =>
    http.post<{ message: string; data: MySubscription }>('/subscription/me/confirm', { sessionId }).then((r) => r.data)

// ---------- profile ----------
export const updateProfile = (id: string, data: { name?: string; isKids?: boolean }) =>
    http.put<ActiveProfile>(`/profile/mine/${id}`, data).then((r) => r.data)

export const deleteProfile = (id: string) => http.delete(`/profile/mine/${id}`)

// ---------- watch history ----------
export type HistoryItem = {
    _id: string
    watchedAt: string
    content: {
        _id: string
        title: string
        type: string
        avgRating: number
        maturityRating: string
        releaseYear: number
        posterUrl: string
    }
    episode: { _id: string; title: string; episodeNumber: number; seasonNumber?: number } | null
}

export const getHistory = (profileId: string) =>
    http.get<HistoryItem[]>('/history', { params: { profileId } }).then((r) => r.data)

export const recordHistory = (profileId: string, contentId: string, episodeId?: string) =>
    http.post('/history', { profileId, contentId, episodeId })

export const removeHistory = (id: string) => http.delete(`/history/${id}`)

export const clearHistory = (profileId: string) => http.delete('/history', { params: { profileId } })

// ---------- AI ----------

export type AiChatTurn = { role: 'user' | 'assistant'; content: string }
export type AiChatReply = { reply: string; titles: Content[] }

/** "Picked for you": titles matched to the profile's watch history. */
export const getRecommendations = (profileId: string) =>
    http.get<Content[]>('/ai/recommendations', { params: { profileId } }).then((r) => r.data)

/** Natural language search ("funny space movies"). */
export const aiSearch = (q: string, profileId?: string) =>
    http.get<Content[]>('/ai/search', { params: { q, profileId } }).then((r) => r.data)

/** Chat with the Hotflix assistant. */
export const askAssistant = (profileId: string, message: string, history: AiChatTurn[]) =>
    http.post<AiChatReply>('/ai/chat', { profileId, message, history }).then((r) => r.data)
