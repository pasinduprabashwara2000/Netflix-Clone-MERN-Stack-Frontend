import { useSyncExternalStore } from 'react'

// Hash routing: works on Vercel/Netlify with no rewrite rules.
//   #/                          -> home
//   #/title/<id>                -> title details
//   #/watch/<id>                -> player (movie, or first episode of a series)
//   #/watch/<id>/<episodeId>    -> player for one episode
//   #/trailer/<id>              -> trailer player
export type Route =
    | { name: 'home' }
    | { name: 'title'; id: string }
    | { name: 'watch'; id: string; episodeId?: string }
    | { name: 'trailer'; id: string }

export const titlePath = (id: string) => `#/title/${id}`

export const watchPath = (id: string, episodeId?: string) =>
    episodeId ? `#/watch/${id}/${episodeId}` : `#/watch/${id}`

export const trailerPath = (id: string) => `#/trailer/${id}`

export const goHome = () => {
    window.location.hash = '/'
}

export const goTo = (path: string) => {
    window.location.hash = path
}

const subscribe = (callback: () => void) => {
    window.addEventListener('hashchange', callback)
    return () => window.removeEventListener('hashchange', callback)
}

const getSnapshot = () => window.location.hash

export function useRoute(): Route {
    const hash = useSyncExternalStore(subscribe, getSnapshot)

    const watch = hash.match(/^#\/watch\/([A-Za-z0-9]+)(?:\/([A-Za-z0-9]+))?/)
    if (watch) return { name: 'watch', id: watch[1], episodeId: watch[2] }

    const trailer = hash.match(/^#\/trailer\/([A-Za-z0-9]+)/)
    if (trailer) return { name: 'trailer', id: trailer[1] }

    const title = hash.match(/^#\/title\/([A-Za-z0-9]+)/)
    if (title) return { name: 'title', id: title[1] }

    return { name: 'home' }
}
