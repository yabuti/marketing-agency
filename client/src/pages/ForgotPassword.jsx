import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/auth.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage('If an account exists with this email, you will receive a password reset link.')
  }

  return (
    <section className="auth-section">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Forgot <span>Password</span></h1>
          <p>Enter your email and we'll send you a reset link</p>
        </div>
        {message && <div className="success-box">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@company.com" required />
          </div>
          <button type="submit" className="submit-btn">Send Reset Link →</button>
        </form>
        <div className="auth-footer">
          <Link to="/login">← Back to Login</Link>
        </div>
      </div>
    </section>
  )
}
