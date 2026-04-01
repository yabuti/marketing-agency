import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import '../../styles/admin-login.css'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/admin/login', { username, password })
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials')
    }
  }

  return (
    <div className="admin-login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>All <span>Things</span></h1>
          <p>Admin Panel Login</p>
        </div>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-login">Login →</button>
        </form>
        <a href="/" className="back-link">← Back to Website</a>
      </div>
    </div>
  )
}
