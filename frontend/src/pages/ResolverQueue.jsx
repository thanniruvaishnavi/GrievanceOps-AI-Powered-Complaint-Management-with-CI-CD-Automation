import { useEffect, useState } from 'react'
import TicketCard from '../components/TicketCard'
import { getResolverQueue } from '../api/ticketApi'

export default function ResolverQueue() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getResolverQueue()
      .then(({ data }) => setTickets(data.content))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto mt-12 px-4">
      <h1 className="font-display text-2xl font-semibold text-white mb-1">Resolver queue</h1>
      <p className="text-dim text-sm mb-8">Tickets routed to you by the assignment engine.</p>

      {loading && <p className="text-dim text-sm">Loading…</p>}
      {!loading && tickets.length === 0 && (
        <div className="glass p-10 text-center">
          <p className="text-white font-medium">Queue is empty</p>
          <p className="text-dim text-sm mt-1.5">No tickets assigned to you right now.</p>
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
