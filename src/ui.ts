// Shared Tailwind class strings, so every page looks the same.
// Change a style here and all forms, tables and badges update.

const badgeColors = {
  green: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  red: 'bg-brand/15 text-red-300 ring-brand/40',
  amber: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  blue: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  gray: 'bg-white/5 text-muted ring-white/10',
}

export const ui = {
  page: 'mx-auto max-w-5xl animate-fade-in',
  title: 'text-3xl font-extrabold tracking-tight',
  subtitle: 'mt-1 text-sm text-muted',
  card: 'mt-6 rounded-xl border border-line bg-panel p-5 shadow-lg shadow-black/30 sm:p-6',
  cardTitle: 'mb-4 text-sm font-semibold uppercase tracking-wider text-muted',
  grid: 'grid gap-4 sm:grid-cols-2',
  field: 'flex flex-col gap-1.5',
  label: 'text-sm font-medium text-zinc-300',
  input:
    'w-full rounded-lg border border-line bg-raised px-3 py-2.5 text-sm text-white placeholder:text-muted/60 transition ' +
    'hover:border-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40',
  check:
    'flex cursor-pointer items-center gap-3 self-end rounded-lg border border-line bg-raised px-3 py-2.5 text-sm font-medium ' +
    'text-zinc-300 transition hover:border-zinc-500 has-[:checked]:border-emerald-500/50 has-[:checked]:text-emerald-300',
  checkbox: 'size-4 accent-emerald-500',
  actions: 'mt-6 flex flex-wrap gap-3 border-t border-line pt-5',
  btn:
    'rounded-lg border border-line bg-raised px-5 py-2.5 text-sm font-medium transition ' +
    'hover:bg-zinc-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
  btnPrimary:
    'rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/20 transition ' +
    'hover:bg-brand-600 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
  btnSm:
    'rounded-md px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white active:scale-95',
  btnDanger:
    'rounded-md px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-brand/15 hover:text-red-300 active:scale-95',
  tableWrap: 'mt-4 overflow-x-auto rounded-xl border border-line bg-panel shadow-lg shadow-black/30',
  table: 'w-full min-w-[640px] text-left text-sm',
  th: 'border-b border-line bg-raised/60 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted',
  tr: 'transition-colors hover:bg-white/[0.03] [&:not(:last-child)>td]:border-b [&:not(:last-child)>td]:border-line/60',
  td: 'px-4 py-3 align-middle',
  empty: 'px-4 py-12 text-center text-muted',
  badge: (color: keyof typeof badgeColors) =>
    `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeColors[color]}`,
}
