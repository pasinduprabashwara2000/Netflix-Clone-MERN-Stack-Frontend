import { useSyncExternalStore } from 'react'

// Hash routing: works on Vercel/Netlify with no rewrite rules.
//   #/            -> home
//   #/title/<id>  -> title details
export type Route = { name: 'home' } | { name: 'title'; id: string }

export const titlePath = (id: string) => `#/title/${id}`

export const goHome = () => {
    window.location.hash = '/'
}

const subscribe = (callback: () => void) => {
    window.addEventListener('hashchange', callback)
    return () => window.removeEventListener('hashchange', callback)
}

const getSnapshot = () => window.location.hash

export function useRoute(): Route {
    const hash = useSyncExternalStore(subscribe, getSnapshot)
    const match = hash.match(/^#\/title\/([A-Za-z0-9]+)/)
    return match ? { name: 'title', id: match[1] } : { name: 'home' }
}
