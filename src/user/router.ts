import { useSyncExternalStore } from 'react';

export type AccountTab = 'profile' | 'plan' | 'history' | 'security'

export type Route =
    | { name: 'home' }
    | { name: 'title'; id: string }
    | { name: 'watch'; id: string; episodeId?: string }
    | { name: 'trailer'; id: string }
    | { name: 'search'; query: string }
    | { name: 'welcome' }
    | { name: 'signup' }
    | { name: 'login' }
    | { name: 'profiles' }
    | { name: 'account'; tab: AccountTab }

export const titlePath = (id: string) => `#/title/${id}`;
export const watchPath = (id: string, episodeId?: string) => episodeId ? `#/watch/${id}/${episodeId}` : `#/watch/${id}`;
export const trailerPath = (id: string) => `#/trailer/${id}`;
export const searchPath = (query: string) => `#/search/${encodeURIComponent(query)}`;

export const welcomePath = '#/welcome';
export const signupPath = '#/signup';
export const loginPath = '#/login';
export const profilesPath = '#/profiles';
export const accountPath = (tab: AccountTab = 'profile') => tab === 'profile' ? '#/account' : `#/account/${tab}`;

export const goHome = () => window.location.hash = '/';
export const goTo = (path: string) => window.location.hash = path;
export const replaceWith = (path: string) => window.location.replace(path);

const subscribe = (callback: () => void) => {
    window.addEventListener('hashchange', callback);
    return () => window.removeEventListener('hashchange', callback);
};

const getSnapshot = () => window.location.hash;

export function useRoute(): Route {
    const hash = useSyncExternalStore(subscribe, getSnapshot);

    const watch = hash.match(/^#\/watch\/([^/]+)(?:\/([^/]+))?/);
    if (watch) return { name: 'watch', id: watch[1], episodeId: watch[2] };

    const trailer = hash.match(/^#\/trailer\/([^/]+)/);
    if (trailer) return { name: 'trailer', id: trailer[1] };

    const title = hash.match(/^#\/title\/([^/]+)/);
    if (title) return { name: 'title', id: title[1] };

    const search = hash.match(/^#\/search\/(.*)$/);
    if (search) return {
        name: 'search',
        query: decodeURIComponent(search[1])
    };

    const account = hash.match(/^#\/account(?:\/(plan|history|security))?\/?$/);
    if (account) return { name: 'account', tab: (account[1] as AccountTab | undefined) ?? 'profile' };

    if (hash === '#/welcome') return { name: 'welcome' };
    if (hash === '#/signup') return { name: 'signup' };
    if (hash === '#/login') return { name: 'login'};
    if (hash === '#/profiles') return { name: 'profiles' };

    return { name: 'home' };
}
