import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TicketCard from '../components/TicketCard'
import { getMyTickets } from '../api/ticketApi'

export default function TicketList() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getMyTickets()
      .then(({ data }) => setTickets(data.content))
      .catch(() => setError('Could not load tickets.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto mt-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">My Tickets</h1>
          <p className="text-dim text-sm mt-1">Every ticket you raise is auto-classified and prioritized.</p>
        </div>
        <Link to="/tickets/new" className="btn-primary px-4 py-2.5 text-sm shadow-glow whitespace-nowrap">
          + New ticket
        </Link>
      </div>

      {loading && <p className="text-dim text-sm">Loading…</p>}
      {error && <p className="text-danger text-sm">{error}</p>}

      {!loading && tickets.length === 0 && (
        <div className="glass p-10 text-center">
          <p className="text-white font-medium">No tickets yet</p>
          <p className="text-dim text-sm mt-1.5 mb-5">Raise your first ticket — the ML pipeline will classify it instantly.</p>
          <Link to="/tickets/new" className="btn-primary inline-block px-4 py-2.5 text-sm shadow-glow">
            Raise a ticket
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  )
}
