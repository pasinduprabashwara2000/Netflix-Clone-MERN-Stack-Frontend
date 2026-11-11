const badgeColors = {
  green: 'bg-lime-400 text-black border-black',
  red: 'bg-red-500 text-white border-black',
  amber: 'bg-yellow-300 text-black border-black',
  blue: 'bg-cyan-400 text-black border-black',
  gray: 'bg-zinc-200 text-zinc-900 border-black',
}

export const ui = {
  // Page
  page: 'mx-auto max-w-6xl px-4 py-8 font-mono',
  title: 'text-4xl font-black uppercase tracking-tighter text-zinc-100',
  subtitle: 'mt-3 max-w-xl text-sm font-medium text-zinc-400',

  // Layout
  layout: 'min-h-screen bg-zinc-950 md:grid md:grid-cols-[17rem_1fr]',
  main: 'p-4 sm:p-6 md:p-10',
  mainInner: 'mx-auto max-w-6xl',

  // Sidebar
  sidebar:
      'z-10 border-b-2 border-zinc-800 bg-zinc-900 p-4 md:sticky md:top-0 md:h-screen md:border-r-2 md:border-b-0 md:p-6',

  sidebarHeader: 'flex items-center justify-between md:block',
  sidebarTitle: 'text-2xl font-black uppercase tracking-tighter text-brand',
  sidebarBadge:
      'mt-1 inline-block border-2 border-zinc-800 bg-zinc-950 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-400',

  sidebarNav:
      'mt-5 flex gap-2 overflow-x-auto pb-2 md:mt-8 md:flex-col md:gap-3 md:overflow-visible md:pb-0',

  sidebarItem:
      'shrink-0 border-2 px-4 py-3 text-left text-xs font-black uppercase tracking-widest transition active:translate-x-0.5 active:translate-y-0.5',

  sidebarItemActive:
      'border-black bg-brand text-white shadow-[4px_4px_0_0_#000]',

  sidebarItemInactive:
      'border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-brand hover:text-brand',

  // Cards
  card: 'mt-6 border-2 border-zinc-800 bg-zinc-900 p-5 shadow-[6px_6px_0_0_#e50914] sm:p-6',
  cardTitle:
      'mb-5 inline-block border-2 border-zinc-800 bg-brand px-3 py-1 text-xs font-black uppercase tracking-widest text-white',

  // Statistics
  statGrid: 'mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3',
  statCard:
      'border-2 border-zinc-800 bg-zinc-900 p-5 transition-transform duration-150 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#e50914]',
  statLabel: 'text-xs font-black uppercase tracking-widest text-zinc-400',
  statValue: 'mt-4 text-4xl font-black tracking-tighter text-brand',
  statIcon:
      'flex size-11 items-center justify-center border-2 border-black bg-brand text-white',

  // Form and Grid
  grid: 'grid gap-5 sm:grid-cols-2',
  field: 'flex flex-col gap-2',
  label: 'text-xs font-black uppercase tracking-widest text-zinc-300',

  input:
      'w-full border-2 border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-medium text-zinc-100 placeholder:text-zinc-500 transition focus:border-brand focus:outline-none focus:ring-0',

  select:
      'w-full border-2 border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-medium text-zinc-100 transition focus:border-brand focus:outline-none focus:ring-0',

  textarea:
      'w-full min-h-28 border-2 border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-medium text-zinc-100 placeholder:text-zinc-500 transition focus:border-brand focus:outline-none focus:ring-0',

  check:
      'flex cursor-pointer items-center gap-3 self-start border-2 border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-bold text-zinc-200 transition hover:border-brand has-[:checked]:border-brand has-[:checked]:bg-brand has-[:checked]:text-white',

  checkbox:
      'size-4 appearance-none border-2 border-zinc-500 bg-zinc-950 checked:border-brand checked:bg-brand',

  // Buttons
  actions: 'mt-6 flex flex-wrap gap-3 border-t-2 border-zinc-800 pt-5',

  btn:
      'border-2 border-zinc-700 bg-zinc-950 px-5 py-2.5 text-sm font-black uppercase tracking-wide text-zinc-200 transition hover:border-brand hover:text-brand active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',

  btnPrimary:
      'border-2 border-black bg-brand px-5 py-2.5 text-sm font-black uppercase tracking-wide text-white shadow-[4px_4px_0_0_#000] transition hover:bg-brand-600 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',

  btnSm:
      'border-2 border-zinc-700 px-3 py-2 text-xs font-black uppercase tracking-wide text-brand transition hover:border-brand hover:bg-brand hover:text-white active:translate-y-0.5',

  btnDanger:
      'border-2 border-zinc-700 px-3 py-2 text-xs font-black uppercase tracking-wide text-red-400 transition hover:border-red-500 hover:bg-red-500 hover:text-white active:translate-y-0.5',

  // Tables
  tableWrap: 'mt-6 overflow-x-auto border-2 border-zinc-800 bg-zinc-900',
  table: 'w-full min-w-[640px] text-left text-sm',
  th: 'border-b-2 border-zinc-800 bg-zinc-800 px-5 py-4 text-xs font-black uppercase tracking-widest text-brand',
  tr: 'transition-colors hover:bg-zinc-800/70 [&:not(:last-child)>td]:border-b-2 [&:not(:last-child)>td]:border-zinc-800',
  td: 'px-5 py-4 align-middle font-medium text-zinc-300',
  empty:
      'px-5 py-14 text-center text-sm font-bold uppercase tracking-widest text-zinc-500',

  // Profile / Image
  avatar: 'size-10 shrink-0 border-2 border-zinc-700 object-cover',
  avatarLg: 'size-16 shrink-0 border-2 border-zinc-700 object-cover',
  profileInfo: 'flex items-center gap-3',
  profileName: 'font-black uppercase tracking-wide text-zinc-100',
  profileEmail: 'text-xs font-medium text-zinc-500',

  // Search
  searchWrapper: 'relative mt-6',
  searchInput:
      'w-full border-2 border-zinc-700 bg-zinc-950 py-3 pl-11 pr-4 text-sm font-medium text-zinc-100 placeholder:text-zinc-500 transition focus:border-brand focus:outline-none focus:ring-0',

  // Details
  detailsGrid: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
  detailItem: 'border-2 border-zinc-800 bg-zinc-950 p-4',
  detailLabel: 'text-xs font-black uppercase tracking-widest text-zinc-500',
  detailValue: 'mt-2 text-sm font-bold text-zinc-100',

  // States
  loading:
      'px-5 py-14 text-center text-sm font-black uppercase tracking-widest text-zinc-500',
  error:
      'border-2 border-red-500 bg-red-500/10 p-4 text-sm font-bold text-red-300',
  emptyState:
      'flex flex-col items-center justify-center px-5 py-14 text-center text-sm font-bold uppercase tracking-widest text-zinc-500',

  // Badges
  badge: (color: keyof typeof badgeColors) =>
      `inline-flex items-center border-2 px-3 py-1 text-xs font-black uppercase tracking-widest ${badgeColors[color]}`,
}