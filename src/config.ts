/** Backend base URL. Set VITE_API_URL in your host (Netlify / Vercel) env settings. */
export const API_URL: string = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api').replace(/\/+$/, '')
