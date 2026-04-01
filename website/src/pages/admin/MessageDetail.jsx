import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function MessageDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState(null)

  useEffect(() => {
    api.get(`/admin/messages/${id}`).then(res => setMessage(res.data))
  }, [id])

  const handleDelete = async () => {
    if (window.confirm('Delete this message?')) {
      await api.delete(`/admin/messages/${id}`)
      navigate('/admin/messages')
    }
  }

  if (!message) return <div>Loading...</div>

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Message Details</h1>
        <Link to="/admin/messages" className="btn btn-outline">← Back to Messages</Link>
      </div>
      <div className="card" style={{maxWidth:'800px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:'2rem',paddingBottom:'1.5rem',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
          <div>
            <h2 style={{fontSize:'1.5rem',marginBottom:'0.5rem'}}>{message.name}</h2>
            <p style={{color:'var(--gray)'}}>{message.email}</p>
          </div>
          <span className={`status status-${message.status}`}>{message.status}</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',marginBottom:'2rem'}}>
          <div><label style={{color:'var(--gray)',fontSize:'0.85rem'}}>Company</label><p>{message.company}</p></div>
          <div><label style={{color:'var(--gray)',fontSize:'0.85rem'}}>Business Type</label><p>{message.business_type}</p></div>
          <div><label style={{color:'var(--gray)',fontSize:'0.85rem'}}>Phone</label><p>{message.phone || 'Not provided'}</p></div>
          <div><label style={{color:'var(--gray)',fontSize:'0.85rem'}}>Received</label><p>{new Date(message.created_at).toLocaleString()}</p></div>
        </div>
        <div style={{background:'var(--black-lighter)',borderRadius:'12px',padding:'1.5rem',marginBottom:'2rem'}}>
          <h4 style={{color:'var(--gray)',fontSize:'0.85rem',marginBottom:'1rem'}}>Message</h4>
          <p style={{lineHeight:'1.8'}}>{message.message}</p>
        </div>
        <div style={{display:'flex',gap:'1rem'}}>
          <a href={`mailto:${message.email}`} className="btn btn-primary">📧 Reply via Email</a>
          <button onClick={handleDelete} className="btn btn-danger">🗑️ Delete</button>
        </div>
      </div>
    </>
  )
}
