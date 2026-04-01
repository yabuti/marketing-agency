import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import '../../styles/client-form.css'

const initialForm = {
  name: '', icon: '🏢', category: '', industry: '', gradient: 'linear-gradient(135deg, #f97316, #fb923c)',
  short_desc: '', full_description: '', established: '', location: '', employees: '', address: '', phone: '',
  website: '', license_type: '', license_number: '', license_issue: '', license_expiry: '', authority: '',
  extra_doc: '', followers: '0', growth: '0%', engagement: '0%', is_active: true
}

export default function ClientForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const isEdit = !!id

  useEffect(() => {
    if (id) {
      api.get(`/admin/clients/${id}`).then(res => setForm(res.data))
    }
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isEdit) {
      await api.put(`/admin/clients/${id}`, form)
    } else {
      await api.post('/admin/clients', form)
    }
    navigate('/admin/clients')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Client' : 'Add New Client'}</h1>
        <Link to="/admin/clients" className="btn btn-outline">← Back to Clients</Link>
      </div>
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>📋 Basic Information</h3>
            <div className="form-grid">
              <div className="form-group"><label>Business Name *</label><input name="name" value={form.name} onChange={handleChange} required /></div>
              <div className="form-group"><label>Icon (Emoji)</label><input name="icon" value={form.icon} onChange={handleChange} /></div>
              <div className="form-group"><label>Category *</label><input name="category" value={form.category} onChange={handleChange} required /></div>
              <div className="form-group">
                <label>Industry *</label>
                <select name="industry" value={form.industry} onChange={handleChange} required>
                  <option value="">Select Industry</option>
                  <option value="Home & Living">Home & Living</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Retail">Retail</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Beauty & Wellness">Beauty & Wellness</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group"><label>Established Year *</label><input name="established" value={form.established} onChange={handleChange} required /></div>
              <div className="form-group full"><label>Short Description *</label><textarea name="short_desc" value={form.short_desc} onChange={handleChange} rows="2" required></textarea></div>
              <div className="form-group full"><label>Full Description *</label><textarea name="full_description" value={form.full_description} onChange={handleChange} rows="4" required></textarea></div>
            </div>
          </div>
          <div className="form-section">
            <h3>📍 Contact Information</h3>
            <div className="form-grid">
              <div className="form-group"><label>Location *</label><input name="location" value={form.location} onChange={handleChange} required /></div>
              <div className="form-group"><label>Employees *</label><input name="employees" value={form.employees} onChange={handleChange} required /></div>
              <div className="form-group full"><label>Full Address *</label><input name="address" value={form.address} onChange={handleChange} required /></div>
              <div className="form-group"><label>Phone *</label><input name="phone" value={form.phone} onChange={handleChange} required /></div>
              <div className="form-group"><label>Website</label><input name="website" value={form.website} onChange={handleChange} /></div>
            </div>
          </div>
          <div className="form-section">
            <h3>📄 License Information</h3>
            <div className="form-grid">
              <div className="form-group"><label>License Type *</label><input name="license_type" value={form.license_type} onChange={handleChange} required /></div>
              <div className="form-group"><label>License Number *</label><input name="license_number" value={form.license_number} onChange={handleChange} required /></div>
              <div className="form-group"><label>Issue Date *</label><input name="license_issue" value={form.license_issue} onChange={handleChange} required /></div>
              <div className="form-group"><label>Expiry Date *</label><input name="license_expiry" value={form.license_expiry} onChange={handleChange} required /></div>
              <div className="form-group"><label>Issuing Authority *</label><input name="authority" value={form.authority} onChange={handleChange} required /></div>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{isEdit ? 'Update Client' : 'Add Client'}</button>
            <Link to="/admin/clients" className="btn btn-outline">Cancel</Link>
          </div>
        </form>
      </div>
    </>
  )
}
