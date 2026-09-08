import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import SupabaseConfigNotice from '../components/SupabaseConfigNotice.jsx'
import './AuthPages.css'

export default function LoginPage() {
  const { signIn, configured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = location.state?.from ?? '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await signIn(email, password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message || 'Could not sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page container">
      <div className="auth-page__card">
        <h1>Welcome back</h1>
        <p>Log in to your PrintyPal Ceylon account.</p>

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
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="auth-page__error">{error}</p>}

          <button type="submit" disabled={submitting}>
            <LogIn size={16} strokeWidth={2} />
            {submitting ? 'Logging in\u2026' : 'Login'}
          </button>
        </form>

        <p className="auth-page__switch">
          Don&rsquo;t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}
