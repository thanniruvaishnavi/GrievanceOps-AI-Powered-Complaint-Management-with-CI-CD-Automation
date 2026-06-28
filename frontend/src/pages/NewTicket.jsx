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
    <div className="max-w-lg mx-auto mt-10 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
      <h1 className="text-xl font-bold mb-1">Raise a new ticket</h1>
      <p className="text-slate-500 mb-6 text-sm">
        Our ML pipeline will auto-categorize, prioritize, and check for duplicates.
      </p>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Subject</label>
          <input
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="App crashes on login"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea
            required
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Describe the issue in as much detail as possible..."
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-md"
        >
          {submitting ? 'Submitting...' : 'Submit ticket'}
        </button>
      </form>
    </div>
  )
}
