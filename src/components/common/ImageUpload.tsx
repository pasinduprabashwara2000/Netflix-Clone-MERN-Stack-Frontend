import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { ui } from '../../lib/ui'
import { resolveImageUrl } from '../../lib/media'

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024

type ImageUploadProps = {
    label: string
    /** Image already saved on the server (shown as the preview until a new file is picked) */
    existingUrl?: string
    onChange: (file: File | null) => void
    onInvalid: (message: string) => void
    previewClassName?: string
    hint?: string
}

/** File picker with instant preview. Give it a new `key` to reset it (e.g. when the form is cleared or another row is edited). */
function ImageUpload({
    label,
    existingUrl = '',
    onChange,
    onInvalid,
    previewClassName = 'h-40',
    hint,
}: ImageUploadProps) {
    const [preview, setPreview] = useState(() => resolveImageUrl(existingUrl))
    const blobUrl = useRef('')

    useEffect(() => {
        return () => {
            if (blobUrl.current) URL.revokeObjectURL(blobUrl.current)
        }
    }, [])

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            onInvalid(`${label.replace(/\s*:\s*$/, '')} must be an image file`)
            e.target.value = ''
            return
        }
        if (file.size > MAX_IMAGE_BYTES) {
            onInvalid(`${label.replace(/\s*:\s*$/, '')} must be 2 MB or smaller`)
            e.target.value = ''
            return
        }

        if (blobUrl.current) URL.revokeObjectURL(blobUrl.current)
        blobUrl.current = URL.createObjectURL(file)
        setPreview(blobUrl.current)
        onChange(file)
    }

    return (
        <div className={ui.field}>
            <label className={ui.label}>{label}</label>
            <input
                className={ui.input}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                onChange={handleChange}
            />
            {preview && (
                <img
                    src={preview}
                    alt={`${label.replace(/\s*:\s*$/, '')} preview`}
                    referrerPolicy="no-referrer"
                    className={`mt-2 w-auto max-w-full rounded border-2 border-zinc-800 object-cover ${previewClassName}`}
                />
            )}
            <p className="mt-1 text-xs text-zinc-500">
                JPEG, PNG, WebP, GIF or AVIF, max 2 MB{hint ? ` - ${hint}` : ''}
            </p>
        </div>
    )
}

export default ImageUpload
