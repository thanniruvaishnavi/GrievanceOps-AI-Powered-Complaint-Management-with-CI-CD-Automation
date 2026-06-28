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

  const fetchTicket = () => {
    getTicket(id)
      .then(({ data }) => setTicket(data))
      .catch(() => setError('Could not load this ticket.'))
  }

  useEffect(() => {
    fetchTicket()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>
  if (!ticket) return <p className="text-slate-400 text-center mt-10">Loading...</p>

  const canUpdateStatus = user?.role === 'ADMIN' || user?.role === 'RESOLVER'

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">{ticket.subject}</h1>
          <p className="text-sm text-slate-400 mt-1">
            #{ticket.id} · raised by {ticket.createdByEmail} ·{' '}
            {new Date(ticket.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge value={ticket.priority} />
          <Badge value={ticket.status} />
        </div>
      </div>

      <p className="mt-6 text-slate-700 whitespace-pre-wrap">{ticket.description}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm bg-slate-50 rounded-lg p-4">
        <div>
          <span className="text-slate-400">ML Category</span>
          <p className="font-medium">{ticket.category || '—'}</p>
        </div>
        <div>
          <span className="text-slate-400">Sentiment score</span>
          <p className="font-medium">
            {ticket.sentimentScore != null ? ticket.sentimentScore.toFixed(2) : '—'}
          </p>
        </div>
        <div>
          <span className="text-slate-400">Assigned to</span>
          <p className="font-medium">{ticket.assignedToEmail || 'Unassigned'}</p>
        </div>
        {ticket.duplicateOfTicketId && (
          <div>
            <span className="text-slate-400">Duplicate of</span>
            <p className="font-medium">#{ticket.duplicateOfTicketId}</p>
          </div>
        )}
      </div>

      {canUpdateStatus && (
        <div className="mt-6">
          <label className="text-sm font-medium text-slate-700">Update status</label>
          <div className="flex gap-2 mt-2">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                disabled={updating || ticket.status === status}
                onClick={() => handleStatusChange(status)}
                className="text-xs font-medium px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-40"
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
