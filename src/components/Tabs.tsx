import { useState } from 'react'
import type { ReactNode } from 'react'

export type TabItem = {
    id: string
    label: string
    icon?: ReactNode
    content: ReactNode
}

type TabsProps = {
    tabs: TabItem[]
    initial?: string
}

function Tabs({ tabs, initial }: TabsProps) {
    const [active, setActive] = useState(initial ?? tabs[0].id)
    const current = tabs.find((t) => t.id === active) ?? tabs[0]

    return (
        <div>
            <div
                role="tablist"
                className="flex gap-1 overflow-x-auto border-b border-line"
            >
                {tabs.map((t) => {
                    const selected = t.id === current.id
                    return (
                        <button
                            key={t.id}
                            role="tab"
                            type="button"
                            aria-selected={selected}
                            onClick={() => setActive(t.id)}
                            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white ${
                                selected
                                    ? 'border-brand text-white'
                                    : 'border-transparent text-muted hover:border-zinc-600 hover:text-white'
                            }`}
                        >
                            {t.icon}
                            {t.label}
                        </button>
                    )
                })}
            </div>

            <div role="tabpanel" key={current.id} className="animate-fade-in pt-6">
                {current.content}
            </div>
        </div>
    )
}

export default Tabs