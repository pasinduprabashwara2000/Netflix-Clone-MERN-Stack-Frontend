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
        <div className="font-mono">
            <div
                role="tablist"
                className="flex gap-3 overflow-x-auto border-b-2 border-zinc-800 px-4 pb-4 pt-2"
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
                            className={`flex shrink-0 items-center gap-2 border-2 px-4 py-3 text-xs font-black uppercase tracking-widest whitespace-nowrap transition active:translate-x-0.5 active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400 ${
                                selected
                                    ? 'border-black bg-lime-400 text-black shadow-[4px_4px_0_0_#000]'
                                    : 'border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-lime-400 hover:text-lime-400'
                            }`}
                        >
                            {t.icon}
                            {t.label}
                        </button>
                    )
                })}
            </div>

            <div role="tabpanel" key={current.id} className="animate-fade-in pt-2">
                {current.content}
            </div>
        </div>
    )
}

export default Tabs