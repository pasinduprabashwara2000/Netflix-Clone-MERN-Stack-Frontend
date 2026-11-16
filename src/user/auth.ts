const TOKEN_KEY = 'hotflix_token'
const PROFILE_KEY = 'hotflix_profile'

export type ActiveProfile = {
    _id: string
    name: string
    avatarUrl: string
    isKids: boolean
}

export const saveToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const authHeader = () => ({ Authorization: `Bearer ${getToken()}` })

export const saveProfile = (profile: ActiveProfile) =>
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))

export const getProfile = (): ActiveProfile | null => {
    try {
        const raw = localStorage.getItem(PROFILE_KEY)
        return raw ? (JSON.parse(raw) as ActiveProfile) : null
    } catch {
        return null
    }
}

export const clearProfile = () => localStorage.removeItem(PROFILE_KEY)

export const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(PROFILE_KEY)
    // replace, so Back doesn't return to a signed-in page
    window.location.replace('#/login')
}
