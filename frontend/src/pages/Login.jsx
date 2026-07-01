import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(form.email, form.password)
      navigate('/tickets')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent-light text-xs font-medium mono mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-success" /> ML pipeline online
          </span>
          <h1 className="font-display text-3xl font-semibold text-white">Welcome back</h1>
          <p className="text-dim mt-2 text-sm">Sign in to triage and resolve complaints.</p>
        </div>

        <div className="glass tilt-card p-8">
          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-sm px-3 py-2.5 rounded-lg mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-dim uppercase tracking-wide">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-glass mt-1.5 w-full px-3.5 py-2.5 text-sm"
                placeholder="admin@support.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-dim uppercase tracking-wide">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-glass mt-1.5 w-full px-3.5 py-2.5 text-sm"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-2.5 text-sm disabled:opacity-50 shadow-glow"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-sm text-dim mt-6 text-center">
          New here?{' '}
          <Link to="/register" className="text-accent-light font-medium hover:text-white transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
