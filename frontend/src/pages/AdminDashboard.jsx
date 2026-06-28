import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import TicketCard from '../components/TicketCard'
import { getAllTickets, getAnalyticsSummary } from '../api/ticketApi'

const STATUS_COLORS = ['#f59e0b', '#2563eb', '#16a34a', '#94a3b8', '#9333ea']
const PRIORITY_COLORS = { LOW: '#94a3b8', MEDIUM: '#2563eb', HIGH: '#f97316', CRITICAL: '#dc2626' }

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

  if (loading) return <p className="text-slate-400 text-center mt-10">Loading dashboard...</p>
  if (!summary) return null

  const statusData = Object.entries(summary.byStatus).map(([name, value]) => ({ name, value }))
  const priorityData = Object.entries(summary.openByPriority).map(([name, value]) => ({ name, value }))
  const categoryData = Object.entries(summary.byCategory).map(([name, value]) => ({ name, value }))

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <h1 className="text-xl font-bold mb-6">Admin Analytics Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold mb-4 text-sm text-slate-600">Tickets by status</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90} label>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold mb-4 text-sm text-slate-600">Open tickets by priority</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value">
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={PRIORITY_COLORS[entry.name] || '#2563eb'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 md:col-span-2">
          <h2 className="font-semibold mb-4 text-sm text-slate-600">Tickets by ML-predicted category</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={120} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-4">Recent tickets</h2>
      <div className="space-y-3">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  )
}
