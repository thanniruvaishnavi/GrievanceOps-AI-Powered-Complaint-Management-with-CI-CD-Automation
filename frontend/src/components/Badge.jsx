const COLORS = {
  LOW: 'bg-slate-500/15 text-slate-300 border-slate-400/20',
  MEDIUM: 'bg-accent/15 text-accent-light border-accent/20',
  HIGH: 'bg-warn/15 text-warn border-warn/20',
  CRITICAL: 'bg-danger/15 text-danger border-danger/20',
  OPEN: 'bg-warn/15 text-warn border-warn/20',
  IN_PROGRESS: 'bg-accent/15 text-accent-light border-accent/20',
  RESOLVED: 'bg-success/15 text-success border-success/20',
  CLOSED: 'bg-slate-500/15 text-slate-300 border-slate-400/20',
  DUPLICATE: 'bg-purple-500/15 text-purple-300 border-purple-400/20',
}

export default function Badge({ value }) {
  const classes = COLORS[value] || 'bg-slate-500/15 text-slate-300 border-slate-400/20'
  return (
    <span className={`mono text-[11px] font-medium tracking-wide uppercase px-2 py-1 rounded-md border ${classes}`}>
      {value?.replace('_', ' ')}
    </span>
  )
}
