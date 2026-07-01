import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Badge from '../components/Badge'
import { getTicket, updateTicketStatus } from '../api/ticketApi'
import { useAuth } from '../context/AuthContext'

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

export default function TicketDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    getTicket(id)
      .then(({ data }) => setTicket(data))
      .catch(() => setError('Could not load this ticket.'))
  }, [id])

  const handleStatusChange = async (status) => {
    setUpdating(true)
    try {
      const { data } = await updateTicketStatus(id, status)
      setTicket(data)
    } catch {
      setError('Could not update status.')
    } finally {
      setUpdating(false)
    }
  }

  if (error) return <p className="text-danger text-center mt-16 text-sm">{error}</p>
  if (!ticket) return <p className="text-dim text-center mt-16 text-sm">Loading…</p>

  const canUpdateStatus = user?.role === 'ADMIN' || user?.role === 'RESOLVER'
  const sentimentLabel = ticket.sentimentScore == null ? '—'
    : ticket.sentimentScore > 0.2 ? 'Positive'
    : ticket.sentimentScore < -0.2 ? 'Negative'
    : 'Neutral'
  const sentimentColor = ticket.sentimentScore > 0.2 ? 'text-success'
    : ticket.sentimentScore < -0.2 ? 'text-danger'
    : 'text-dim'

  return (
    <div className="max-w-2xl mx-auto mt-12 px-4">
      <div className="glass tilt-card p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-semibold text-white">{ticket.subject}</h1>
            <p className="text-xs text-dim mono mt-1.5">
              #{ticket.id} · raised by {ticket.createdByEmail} · {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Badge value={ticket.priority} />
            <Badge value={ticket.status} />
          </div>
        </div>

        <p className="mt-6 text-slate-200 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <div>
            <span className="text-dim text-xs uppercase tracking-wide">ML Category</span>
            <p className="font-medium text-accent-light mt-1">{ticket.category || '—'}</p>
          </div>
          <div>
            <span className="text-dim text-xs uppercase tracking-wide">Sentiment</span>
            <p className={`font-medium mt-1 ${sentimentColor}`}>
              {sentimentLabel} {ticket.sentimentScore != null && `(${ticket.sentimentScore.toFixed(2)})`}
            </p>
          </div>
          <div>
            <span className="text-dim text-xs uppercase tracking-wide">Assigned to</span>
            <p className="font-medium text-white mt-1">{ticket.assignedToEmail || 'Unassigned'}</p>
          </div>
          {ticket.duplicateOfTicketId && (
            <div>
              <span className="text-dim text-xs uppercase tracking-wide">Duplicate of</span>
              <p className="font-medium text-purple-300 mt-1">#{ticket.duplicateOfTicketId}</p>
            </div>
          )}
        </div>

        {canUpdateStatus && (
          <div className="mt-6">
            <label className="text-xs font-medium text-dim uppercase tracking-wide">Update status</label>
            <div className="flex gap-2 mt-2.5 flex-wrap">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  disabled={updating || ticket.status === status}
                  onClick={() => handleStatusChange(status)}
                  className="text-xs font-medium px-3.5 py-2 rounded-lg border border-white/10 text-dim hover:text-white hover:border-accent/40 disabled:opacity-30 transition-colors"
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
