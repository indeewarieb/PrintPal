import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import SupabaseConfigNotice from '../components/SupabaseConfigNotice.jsx'
import './AuthPages.css'

export default function RegisterPage() {
  const { signUp, configured } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await signUp(email, password)
      setDone(true)
    } catch (err) {
      setError(err.message || 'Could not create your account.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="auth-page container">
        <div className="auth-page__card">
          <h1>Check your email</h1>
          <p>
            We've sent a confirmation link to <strong>{email}</strong>. Confirm it, then{' '}
            <Link to="/login">log in</Link>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page container">
      <div className="auth-page__card">
        <h1>Create an account</h1>
        <p>New accounts start as regular customers — an existing admin can upgrade you.</p>

        {!configured && <SupabaseConfigNotice />}

        <form onSubmit={handleSubmit}>
          <label>
            <Mail size={16} strokeWidth={1.75} />
            <input
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </label>
          <label>
            <Lock size={16} strokeWidth={1.75} />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="auth-page__error">{error}</p>}

          <button type="submit" disabled={submitting}>
            <UserPlus size={16} strokeWidth={2} />
            {submitting ? 'Creating account\u2026' : 'Register'}
          </button>
        </form>

        <p className="auth-page__switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}
