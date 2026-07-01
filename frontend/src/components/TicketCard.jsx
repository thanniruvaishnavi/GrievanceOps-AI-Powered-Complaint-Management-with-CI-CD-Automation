import { Link } from 'react-router-dom'
import Badge from './Badge'

export default function TicketCard({ ticket }) {
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="block glass tilt-card p-5 group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-medium text-white group-hover:text-accent-light transition-colors truncate">
            {ticket.subject}
          </h3>
          <p className="text-sm text-dim mt-1 line-clamp-2">{ticket.description}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Badge value={ticket.priority} />
          <Badge value={ticket.status} />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5 text-xs text-dim mono">
        <span>#{ticket.id}</span>
        {ticket.category && <span className="text-accent-light">{ticket.category}</span>}
        {ticket.assignedToEmail && <span>→ {ticket.assignedToEmail}</span>}
        <span className="ml-auto">{new Date(ticket.createdAt).toLocaleString()}</span>
      </div>
    </Link>
  )
}
