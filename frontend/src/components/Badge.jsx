const COLORS = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
  OPEN: 'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-slate-200 text-slate-600',
  DUPLICATE: 'bg-purple-100 text-purple-700',
}

export default function Badge({ value }) {
  const classes = COLORS[value] || 'bg-slate-100 text-slate-700'
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${classes}`}>
      {value?.replace('_', ' ')}
    </span>
  )
}
