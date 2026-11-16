import { ui } from '../../lib/ui'
import { resolveImageUrl } from '../../lib/media'

type ImageUrlInputProps = {
    label: string
    value: string
    onChange: (value: string) => void
    previewClassName?: string
}

/** Text field for an image link, with a live preview (hidden while the link is empty or broken). */
function ImageUrlInput({ label, value, onChange, previewClassName = 'h-40' }: ImageUrlInputProps) {
    const src = resolveImageUrl(value)

    return (
        <div className={ui.field}>
            <label className={ui.label}>{label}</label>
            <input
                className={ui.input}
                type="url"
                value={value}
                placeholder="https://example.com/image.jpg"
                onChange={(e) => onChange(e.target.value)}
            />
            {src && (
                <img
                    key={src}
                    src={src}
                    alt={`${label.replace(/\s*:\s*$/, '')} preview`}
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                    className={`mt-2 w-auto max-w-full rounded border-2 border-zinc-800 object-cover ${previewClassName}`}
                />
            )}
        </div>
    )
}

export default ImageUrlInput
