import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function AdminClients() {
  const [clients, setClients] = useState([])

  useEffect(() => {
    api.get('/admin/clients').then(res => setClients(res.data))
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm('Delete this client?')) {
      await api.delete(`/admin/clients/${id}`)
      setClients(clients.filter(c => c.id !== id))
    }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Manage Clients</h1>
        <Link to="/admin/clients/create" className="btn btn-primary">+ Add New Client</Link>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr><th>Client</th><th>Category</th><th>Industry</th><th>License #</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {clients.length > 0 ? clients.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <span style={{fontSize:'1.5rem'}}>{c.icon}</span>
                    <div>
                      <strong>{c.name}</strong>
                      <div style={{color:'var(--gray)',fontSize:'0.85rem'}}>{c.location}</div>
                    </div>
                  </div>
                </td>
                <td>{c.category}</td>
                <td>{c.industry}</td>
                <td>{c.license_number}</td>
                <td><span className={`status status-${c.is_active ? 'active' : 'inactive'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <a href={`/clients/${c.slug}`} target="_blank" className="btn btn-sm btn-outline">View</a>
                  <Link to={`/admin/clients/${c.id}/edit`} className="btn btn-sm btn-primary">Edit</Link>
                  <button onClick={() => handleDelete(c.id)} className="btn btn-sm btn-danger">Delete</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" style={{textAlign:'center',color:'var(--gray)',padding:'3rem'}}>No clients yet. <Link to="/admin/clients/create" style={{color:'var(--primary)'}}>Add your first client</Link></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
