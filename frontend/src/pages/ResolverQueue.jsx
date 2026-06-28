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
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="text-xl font-bold mb-6">My Resolver Queue</h1>
      {loading && <p className="text-slate-400">Loading...</p>}
      {!loading && tickets.length === 0 && (
        <p className="text-slate-400">No tickets assigned to you right now.</p>
      )}
      <div className="space-y-3">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  )
}
