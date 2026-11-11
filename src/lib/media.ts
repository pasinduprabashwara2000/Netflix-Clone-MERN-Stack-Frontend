import { API_ORIGIN } from '../services/api'

/** Turns whatever was saved in posterUrl/bannerUrl into a URL the browser can load. */
export function resolveImageUrl(raw?: string): string {
    const url = (raw ?? '').trim().replace(/\\/g, '/')
    if (!url) return ''

    if (/^(data:|blob:)/i.test(url)) return url

    // Google Drive share links -> direct thumbnail
    const drive =
        url.match(/drive\.google\.com\/file\/d\/([^/?]+)/) ??
        url.match(/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([^&]+)/)
    if (drive) return `https://drive.google.com/thumbnail?id=${drive[1]}&sz=w1000`

    if (url.startsWith('//')) return `https:${url}`

    if (/^https?:\/\//i.test(url)) {
        // avoid mixed-content blocking on the deployed https site
        const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)/i.test(url)
        if (url.startsWith('http://') && !isLocal && window.location.protocol === 'https:') {
            return url.replace('http://', 'https://')
        }
        return url
    }

    // relative path stored by the backend (e.g. "uploads/x.jpg" or "/uploads/x.jpg")
    return `${API_ORIGIN}/${url.replace(/^\/+/, '')}`
}
