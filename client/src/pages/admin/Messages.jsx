import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function Messages() {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    api.get('/admin/messages').then(res => setMessages(res.data))
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm('Delete this message?')) {
      await api.delete(`/admin/messages/${id}`)
      setMessages(messages.filter(m => m.id !== id))
    }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Contact Messages</h1>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Company</th><th>Business Type</th><th>Status</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {messages.length > 0 ? messages.map(m => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.email}</td>
                <td>{m.company}</td>
                <td>{m.business_type}</td>
                <td><span className={`status status-${m.status}`}>{m.status}</span></td>
                <td>{new Date(m.created_at).toLocaleDateString()}</td>
                <td>
                  <Link to={`/admin/messages/${m.id}`} className="btn btn-sm btn-outline">View</Link>
                  <button onClick={() => handleDelete(m.id)} className="btn btn-sm btn-danger">Delete</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="7" style={{textAlign:'center',color:'var(--gray)',padding:'3rem'}}>No messages yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
