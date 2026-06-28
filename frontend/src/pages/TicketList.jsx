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
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">My Tickets</h1>
        <Link
          to="/tickets/new"
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          + New Ticket
        </Link>
      </div>

      {loading && <p className="text-slate-400">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && tickets.length === 0 && (
        <p className="text-slate-400">You haven't raised any tickets yet.</p>
      )}

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  )
}
