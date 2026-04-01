import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import api from '../services/api'

export default function AdminRoute({ children }) {
  const [authenticated, setAuthenticated] = useState(null)

  useEffect(() => {
    api.get('/admin/check')
      .then(res => setAuthenticated(res.data.authenticated))
      .catch(() => setAuthenticated(false))
  }, [])

  if (authenticated === null) return <div className="loading">Loading...</div>
  if (!authenticated) return <Navigate to="/admin/login" />
  
  return children
}
