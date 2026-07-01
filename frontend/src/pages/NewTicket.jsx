import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTicket } from '../api/ticketApi'

export default function NewTicket() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ subject: '', description: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { data } = await createTicket(form)
      navigate(`/tickets/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-12 px-4">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-white">Raise a ticket</h1>
        <p className="text-dim text-sm mt-1.5">
          Our ML pipeline classifies category, predicts priority, scores sentiment, and checks for duplicates — instantly.
        </p>
      </div>

      <div className="glass tilt-card p-8">
        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger text-sm px-3 py-2.5 rounded-lg mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-dim uppercase tracking-wide">Subject</label>
            <input
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="input-glass mt-1.5 w-full px-3.5 py-2.5 text-sm"
              placeholder="App crashes on login"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-dim uppercase tracking-wide">Description</label>
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-glass mt-1.5 w-full px-3.5 py-2.5 text-sm resize-none"
              placeholder="Describe the issue in as much detail as possible..."
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-2.5 text-sm disabled:opacity-50 shadow-glow"
          >
            {submitting ? 'Analyzing & submitting…' : 'Submit ticket'}
          </button>
        </form>
      </div>
    </div>
  )
}
