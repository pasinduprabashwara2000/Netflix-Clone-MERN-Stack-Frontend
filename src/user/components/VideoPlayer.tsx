import { useState } from 'react'

type Source =
    | { kind: 'iframe'; url: string }
    | { kind: 'video'; url: string }
    | { kind: 'none' }

/** Turns a saved video link into something the browser can play. */
export function resolveVideoSource(raw: string): Source {
    const url = raw.trim()

    const youtube = url.match(
        /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/,
    )
    if (youtube) {
        return { kind: 'iframe', url: `https://www.youtube.com/embed/${youtube[1]}?autoplay=1&rel=0` }
    }

    const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
    if (vimeo) {
        return { kind: 'iframe', url: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1` }
    }

    const drive = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/)
    if (drive) {
        return { kind: 'iframe', url: `https://drive.google.com/file/d/${drive[1]}/preview` }
    }

    // a YouTube link that isn't a single video (search results, channel pages ...) can't be embedded
    if (/youtube\.com|youtu\.be/.test(url)) return { kind: 'none' }

    // direct file (mp4, webm, ...)
    return { kind: 'video', url }
}

type VideoPlayerProps = {
    src: string
    poster?: string
    title: string
    onEnded?: () => void
}

/** Fills its parent (give the parent `relative` + an aspect ratio). Use a `key` on src to reset it between videos. */
function VideoPlayer({ src, poster, title, onEnded }: VideoPlayerProps) {
    const [failed, setFailed] = useState(false)

    if (!src.trim()) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-black text-sm text-muted">
                No video available for this title yet.
            </div>
        )
    }

    const source = resolveVideoSource(src)

    if (source.kind === 'none') {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-black px-4 text-center text-sm text-muted">
                This video isn’t available to play right now.
            </div>
        )
    }

    if (source.kind === 'iframe') {
        return (
            <iframe
                src={source.url}
                title={title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 size-full border-0 bg-black"
            />
        )
    }

    if (failed) {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black px-4 text-center">
                <p className="text-sm text-zinc-300">This video couldn’t be played in the browser.</p>
                <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-white/80"
                >
                    Open video in a new tab
                </a>
            </div>
        )
    }

    return (
        <video
            src={source.url}
            poster={poster}
            controls
            autoPlay
            playsInline
            preload="metadata"
            onEnded={onEnded}
            onError={() => setFailed(true)}
            className="absolute inset-0 size-full bg-black"
        />
    )
}

export default VideoPlayer
