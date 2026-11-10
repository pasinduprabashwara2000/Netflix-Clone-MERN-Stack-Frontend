import { useEffect, useState } from 'react'
import { resolveImageUrl } from '../../lib/media'

type SafeImageProps = {
    src?: string
    alt: string
    className?: string
    eager?: boolean
}

function SafeImage({ src, alt, className = '', eager = false }: SafeImageProps) {
    const resolved = resolveImageUrl(src)
    const [loaded, setLoaded] = useState(false)
    const [failed, setFailed] = useState(!resolved)

    // reset when the URL changes (e.g. after an admin edit)
    useEffect(() => {
        setLoaded(false)
        setFailed(!resolved)
    }, [resolved])

    if (failed) {
        return (
            <div
                role="img"
                aria-label={alt}
                className={`flex items-center justify-center bg-raised p-2 text-center text-xs font-semibold text-muted ${className}`}
            >
                {alt || 'No image'}
            </div>
        )
    }

    return (
        <>
            {!loaded && <div className={`animate-pulse bg-raised ${className}`} />}
            <img
                src={resolved}
                alt={alt}
                loading={eager ? 'eager' : 'lazy'}
                decoding="async"
                referrerPolicy="no-referrer"
                onLoad={() => setLoaded(true)}
                onError={() => setFailed(true)}
                className={`${className} ${loaded ? '' : 'absolute opacity-0'}`}
            />
        </>
    )
}

export default SafeImage
