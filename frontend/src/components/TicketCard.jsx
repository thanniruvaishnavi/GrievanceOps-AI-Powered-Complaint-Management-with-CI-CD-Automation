import { Link } from 'react-router-dom'
import Badge from './Badge'

export default function TicketCard({ ticket }) {
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="block bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{ticket.subject}</h3>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{ticket.description}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge value={ticket.priority} />
          <Badge value={ticket.status} />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
        <span>#{ticket.id}</span>
        {ticket.category && <span>· {ticket.category}</span>}
        {ticket.assignedToEmail && <span>· assigned to {ticket.assignedToEmail}</span>}
        <span>· {new Date(ticket.createdAt).toLocaleString()}</span>
      </div>
    </Link>
  )
}
