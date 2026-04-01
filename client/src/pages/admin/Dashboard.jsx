import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function Dashboard() {
  const [data, setData] = useState({ totalClients: 0, totalMessages: 0, newMessages: 0, recentMessages: [] })

  useEffect(() => {
    api.get('/admin/dashboard').then(res => setData(res.data))
  }, [])

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="icon">🏢</div><div className="value">{data.totalClients}</div><div className="label">Total Clients</div></div>
        <div className="stat-card"><div className="icon">📧</div><div className="value">{data.totalMessages}</div><div className="label">Total Messages</div></div>
        <div className="stat-card"><div className="icon">🔔</div><div className="value">{data.newMessages}</div><div className="label">New Messages</div></div>
      </div>
      <div className="card">
        <h3 style={{marginBottom:'1rem',color:'var(--gray)'}}>Recent Messages</h3>
        <table>
          <thead>
            <tr><th>Name</th><th>Company</th><th>Business Type</th><th>Status</th><th>Date</th><th>Action</th></tr>
          </thead>
          <tbody>
            {data.recentMessages.length > 0 ? data.recentMessages.map(m => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.company}</td>
                <td>{m.business_type}</td>
                <td><span className={`status status-${m.status}`}>{m.status}</span></td>
                <td>{new Date(m.created_at).toLocaleDateString()}</td>
                <td><Link to={`/admin/messages/${m.id}`} className="btn btn-sm btn-outline">View</Link></td>
              </tr>
            )) : (
              <tr><td colSpan="6" style={{textAlign:'center',color:'var(--gray)'}}>No messages yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
