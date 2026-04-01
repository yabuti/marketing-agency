import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import '../../styles/client-form.css'

const initialForm = {
  name: '', icon: '🏢', category: '', industry: '', business_type: '', gradient: 'linear-gradient(135deg, #f97316, #fb923c)',
  short_desc: '', full_description: '', established: '', location: '', employees: '', address: '', phone: '',
  tin_number: '', business_license_number: '', elmis_registration: '', website: '', license_type: '', license_number: '', license_issue: '', license_expiry: '', authority: '',
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
    let newValue = value
    
    // Auto-format phone number: convert 09 to +2519
    if (name === 'phone' && value.startsWith('09')) {
      newValue = '+2519' + value.substring(2)
    }
    
    setForm({ ...form, [name]: newValue })
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
              <div className="form-group">
                <label>Business Type *</label>
                <select name="business_type" value={form.business_type} onChange={handleChange} required>
                  <option value="">Select Business Type</option>
                  <optgroup label="Startups and Entrepreneurs">
                    <option value="Tech startups (apps, software, IT services)">Tech startups (apps, software, IT services)</option>
                    <option value="E-commerce businesses">E-commerce businesses</option>
                    <option value="Digital service startups">Digital service startups</option>
                    <option value="Creative startups (design, media, photography)">Creative startups (design, media, photography)</option>
                  </optgroup>
                  <optgroup label="Retail and Wholesale Businesses">
                    <option value="Shops and minimarkets">Shops and minimarkets</option>
                    <option value="Clothing and fashion stores">Clothing and fashion stores</option>
                    <option value="Shoe and accessories shops">Shoe and accessories shops</option>
                    <option value="Electronics and mobile phone shops">Electronics and mobile phone shops</option>
                    <option value="Cosmetics and beauty product shops">Cosmetics and beauty product shops</option>
                    <option value="Bookshops and stationery shops">Bookshops and stationery shops</option>
                    <option value="Furniture and home appliance shops">Furniture and home appliance shops</option>
                    <option value="Food and beverage wholesalers">Food and beverage wholesalers</option>
                    <option value="Construction material suppliers">Construction material suppliers</option>
                    <option value="Agricultural input suppliers">Agricultural input suppliers</option>
                    <option value="Textile and garment wholesalers">Textile and garment wholesalers</option>
                  </optgroup>
                  <optgroup label="Hospitality and Tourism Sector">
                    <option value="Restaurants and cafes">Restaurants and cafes</option>
                    <option value="Traditional food houses">Traditional food houses</option>
                    <option value="Event and conference venues">Event and conference venues</option>
                    <option value="Car rental services">Car rental services</option>
                  </optgroup>
                  <optgroup label="Educational Institutions">
                    <option value="Private schools (KG–Grade 12)">Private schools (KG–Grade 12)</option>
                    <option value="Training centers">Training centers</option>
                    <option value="Language schools">Language schools</option>
                    <option value="Computer and IT training centers">Computer and IT training centers</option>
                    <option value="Tutorial and exam preparation centers">Tutorial and exam preparation centers</option>
                    <option value="Online learning platforms">Online learning platforms</option>
                    <option value="Educational consultancy services">Educational consultancy services</option>
                  </optgroup>
                  <optgroup label="Service Providers">
                    <option value="Advertising and marketing agencies">Advertising and marketing agencies</option>
                    <option value="Printing and publishing services">Printing and publishing services</option>
                    <option value="Graphic design and branding services">Graphic design and branding services</option>
                    <option value="Accounting and auditing firms">Accounting and auditing firms</option>
                    <option value="Legal and consultancy services">Legal and consultancy services</option>
                    <option value="Cleaning and maintenance services">Cleaning and maintenance services</option>
                    <option value="Security service providers">Security service providers</option>
                    <option value="Repair services (electronics, machinery, vehicles)">Repair services (electronics, machinery, vehicles)</option>
                    <option value="Beauty salons and barber shops">Beauty salons and barber shops</option>
                    <option value="Transportation and logistics services">Transportation and logistics services</option>
                  </optgroup>
                  <optgroup label="Manufacturers">
                    <option value="Food and beverage processing enterprises">Food and beverage processing enterprises</option>
                    <option value="Garment and textile manufacturers">Garment and textile manufacturers</option>
                    <option value="Shoe and leather product manufacturers">Shoe and leather product manufacturers</option>
                    <option value="Plastic product manufacturers">Plastic product manufacturers</option>
                    <option value="Metal and wood furniture manufacturers">Metal and wood furniture manufacturers</option>
                    <option value="Building material manufacturers (cement blocks, tiles)">Building material manufacturers (cement blocks, tiles)</option>
                    <option value="Packaging and labeling manufacturers">Packaging and labeling manufacturers</option>
                    <option value="Soap, detergent, and cosmetic producers">Soap, detergent, and cosmetic producers</option>
                    <option value="Agro-processing plants">Agro-processing plants</option>
                  </optgroup>
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
              <div className="form-group"><label>Phone * (e.g., +251912345678)</label><input name="phone" value={form.phone} onChange={handleChange} placeholder="+251912345678 or 0912345678" required /></div>
              <div className="form-group"><label>TIN Number *</label><input name="tin_number" value={form.tin_number} onChange={handleChange} placeholder="Tax Identification Number" required /></div>
              <div className="form-group"><label>E-LMIS Registration *</label><input name="elmis_registration" value={form.elmis_registration} onChange={handleChange} placeholder="E-LMIS Registration Number" required /></div>
              <div className="form-group"><label>Website</label><input name="website" value={form.website} onChange={handleChange} placeholder="https://example.com" /></div>
            </div>
          </div>
          <div className="form-section">
            <h3>📄 License Information</h3>
            <div className="form-grid">
              <div className="form-group"><label>Business License Number *</label><input name="business_license_number" value={form.business_license_number} onChange={handleChange} placeholder="Business License Number" required /></div>
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
