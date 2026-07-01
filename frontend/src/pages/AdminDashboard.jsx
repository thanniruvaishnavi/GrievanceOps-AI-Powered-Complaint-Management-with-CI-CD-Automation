import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import TicketCard from '../components/TicketCard'
import { getAllTickets, getAnalyticsSummary } from '../api/ticketApi'

const STATUS_COLORS = ['#f59e0b', '#6366f1', '#10b981', '#64748b', '#a78bfa']
const PRIORITY_COLORS = { LOW: '#64748b', MEDIUM: '#6366f1', HIGH: '#f59e0b', CRITICAL: '#ef4444' }

const tooltipStyle = {
  background: '#161f33',
  border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: 10,
  fontSize: 12,
  color: '#f8fafc',
}

function StatCard({ label, value, accent }) {
  return (
    <div className="glass tilt-card p-5">
      <p className="text-dim text-xs uppercase tracking-wide">{label}</p>
      <p className={`font-display text-2xl font-semibold mt-1.5 ${accent || 'text-white'}`}>{value}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAnalyticsSummary(), getAllTickets(0, 10)])
      .then(([summaryRes, ticketsRes]) => {
        setSummary(summaryRes.data)
        setTickets(ticketsRes.data.content)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-dim text-center mt-16 text-sm">Loading dashboard…</p>
  if (!summary) return null

  const statusData = Object.entries(summary.byStatus).map(([name, value]) => ({ name, value }))
  const priorityData = Object.entries(summary.openByPriority).map(([name, value]) => ({ name, value }))
  const categoryData = Object.entries(summary.byCategory).map(([name, value]) => ({ name, value }))
  const totalTickets = statusData.reduce((sum, s) => sum + s.value, 0)
  const criticalOpen = priorityData.find((p) => p.name === 'CRITICAL')?.value || 0

  return (
    <div className="max-w-5xl mx-auto mt-12 px-4">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-white">Analytics</h1>
        <p className="text-dim text-sm mt-1">Live view of the complaint pipeline.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total tickets" value={totalTickets} />
        <StatCard label="Critical & open" value={criticalOpen} accent="text-danger" />
        <StatCard label="Categories detected" value={categoryData.length} accent="text-accent-light" />
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-10">
        <div className="glass tilt-card p-5">
          <h2 className="font-medium mb-4 text-sm text-dim uppercase tracking-wide">Tickets by status</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90} label={{ fill: '#94a3b8', fontSize: 11 }}>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass tilt-card p-5">
          <h2 className="font-medium mb-4 text-sm text-dim uppercase tracking-wide">Open tickets by priority</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={PRIORITY_COLORS[entry.name] || '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass tilt-card p-5 md:col-span-2">
          <h2 className="font-medium mb-4 text-sm text-dim uppercase tracking-wide">Tickets by ML-predicted category</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis type="number" allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h2 className="font-display text-lg font-semibold text-white mb-4">Recent tickets</h2>
      <div className="space-y-3">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  )
}
