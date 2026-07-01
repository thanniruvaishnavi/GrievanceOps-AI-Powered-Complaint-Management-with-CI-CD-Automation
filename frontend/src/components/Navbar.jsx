import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 glass border-x-0 border-t-0 rounded-none px-6 py-3.5 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-semibold text-white">
        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-xs font-bold shadow-glow">
          GO
        </span>
        GrievanceOps
      </Link>

      <div className="flex items-center gap-5 text-sm">
        {user ? (
          <>
            <Link to="/tickets" className="text-dim hover:text-white transition-colors">My Tickets</Link>
            {user.role === 'RESOLVER' && (
              <Link to="/resolver" className="text-dim hover:text-white transition-colors">Resolver Queue</Link>
            )}
            {user.role === 'ADMIN' && (
              <Link to="/admin" className="text-dim hover:text-white transition-colors">Analytics</Link>
            )}
            <span className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2 text-dim">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="mono text-xs">{user.email}</span>
              <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent-light text-[11px] font-medium tracking-wide uppercase">
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-dim hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-dim hover:text-white transition-colors">Log in</Link>
            <Link to="/register" className="btn-primary px-4 py-2 text-sm shadow-glow">
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
