import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../services/api'
import '../styles/admin.css'

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [newCount, setNewCount] = useState(0)
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/') ? 'active' : ''

  useEffect(() => {
    api.get('/admin/dashboard').then(res => setNewCount(res.data.newMessages))
  }, [location])

  const handleLogout = async () => {
    await api.post('/admin/logout')
    navigate('/admin/login')
  }

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>All <em>Things</em></span>
        </div>
        <ul className="nav-menu">
          <li><Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>📊 Dashboard</Link></li>
          <li>
            <Link to="/admin/messages" className={`nav-link ${isActive('/admin/messages')}`}>
              📧 Messages {newCount > 0 && <span className="nav-badge">{newCount}</span>}
            </Link>
          </li>
          <li><Link to="/admin/clients" className={`nav-link ${isActive('/admin/clients')}`}>🏢 Clients</Link></li>
          <li><Link to="/admin/news" className={`nav-link ${isActive('/admin/news')}`}>📰 News</Link></li>
          <li style={{marginTop: '2rem'}}><a href="/" target="_blank" className="nav-link">🌐 View Website</a></li>
          <li><button onClick={handleLogout} className="nav-link" style={{background:'none',border:'none',width:'100%',textAlign:'left',cursor:'pointer',color:'inherit',font:'inherit'}}>🚪 Logout</button></li>
        </ul>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
