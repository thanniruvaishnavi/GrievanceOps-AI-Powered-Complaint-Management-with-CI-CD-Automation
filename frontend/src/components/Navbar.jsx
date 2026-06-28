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
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-lg font-bold text-brand-700">
        Smart Support SaaS
      </Link>

      <div className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            <Link to="/tickets" className="hover:text-brand-600">My Tickets</Link>
            {user.role === 'RESOLVER' && (
              <Link to="/resolver" className="hover:text-brand-600">Resolver Queue</Link>
            )}
            {user.role === 'ADMIN' && (
              <Link to="/admin" className="hover:text-brand-600">Admin Dashboard</Link>
            )}
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">{user.email} · {user.role}</span>
            <button
              onClick={handleLogout}
              className="bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-brand-600">Login</Link>
            <Link
              to="/register"
              className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-md font-medium"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
