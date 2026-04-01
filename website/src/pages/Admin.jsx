import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import '../styles/admin.css'

const defaultCompanyInfo = {
  name: 'All Things Marketing Agency',
  email: 'allthingsethiopia2026@gmail.com',
  phone1: '+251 911 031 884',
  phone2: '+251 905 841 982',
  phone3: '+251 915 840 037',
  address: 'Addis Ababa, Ethiopia',
  workingHours: 'Mon - Fri: 9AM - 6PM'
}

const defaultServices = [
  { id: 1, name: 'Social Media Management', description: 'Complete management of your social accounts', icon: '📱' },
  { id: 2, name: 'Content Creation', description: 'Professional photos, videos & graphics', icon: '🎨' },
  { id: 3, name: 'Growth Strategy', description: 'Data-driven strategies for growth', icon: '📈' },
  { id: 4, name: 'Paid Advertising', description: 'Targeted ads on all platforms', icon: '💰' }
]

const defaultClients = [
  { id: 1, name: 'Luxury Home Furniture', category: 'Furniture Store', status: 'Active' },
  { id: 2, name: 'Wellness Medical Center', category: 'Medical Clinic', status: 'Active' },
  { id: 3, name: 'Fresh Mart Supermarket', category: 'Supermarket', status: 'Active' }
]

export default function Admin() {
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState('company')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Load from localStorage or use defaults
  const [companyInfo, setCompanyInfo] = useState(() => {
    const saved = localStorage.getItem('adminCompanyInfo')
    return saved ? JSON.parse(saved) : defaultCompanyInfo
  })

  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('adminServices')
    return saved ? JSON.parse(saved) : defaultServices
  })

  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('adminClients')
    return saved ? JSON.parse(saved) : defaultClients
  })

  // Modal states
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showClientModal, setShowClientModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [editingClient, setEditingClient] = useState(null)
  const [saveMessage, setSaveMessage] = useState('')

  // Form states for modals
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', icon: '📱' })
  const [clientForm, setClientForm] = useState({ name: '', category: '', status: 'Active' })

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === 'allthings2026') {
      setIsLoggedIn(true)
      setLoginError('')
    } else {
      setLoginError(language === 'en' ? 'Invalid password' : 'የተሳሳተ የይለፍ ቃል')
    }
  }

  const showSaveMessage = (msg) => {
    setSaveMessage(msg)
    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleSaveCompany = () => {
    localStorage.setItem('adminCompanyInfo', JSON.stringify(companyInfo))
    showSaveMessage(language === 'en' ? '✓ Company info saved!' : '✓ የኩባንያ መረጃ ተቀምጧል!')
  }

  // Service functions
  const openAddService = () => {
    setEditingService(null)
    setServiceForm({ name: '', description: '', icon: '📱' })
    setShowServiceModal(true)
  }

  const openEditService = (service) => {
    setEditingService(service)
    setServiceForm({ name: service.name, description: service.description, icon: service.icon })
    setShowServiceModal(true)
  }

  const handleSaveService = () => {
    if (!serviceForm.name || !serviceForm.description) return
    
    let updatedServices
    if (editingService) {
      updatedServices = services.map(s => s.id === editingService.id ? { ...s, ...serviceForm } : s)
    } else {
      const newService = { id: Date.now(), ...serviceForm }
      updatedServices = [...services, newService]
    }
    
    setServices(updatedServices)
    localStorage.setItem('adminServices', JSON.stringify(updatedServices))
    setShowServiceModal(false)
    showSaveMessage(language === 'en' ? '✓ Service saved!' : '✓ አገልግሎት ተቀምጧል!')
  }

  const handleDeleteService = (id) => {
    if (confirm(language === 'en' ? 'Delete this service?' : 'ይህን አገልግሎት ይሰርዙ?')) {
      const updatedServices = services.filter(s => s.id !== id)
      setServices(updatedServices)
      localStorage.setItem('adminServices', JSON.stringify(updatedServices))
    }
  }

  // Client functions
  const openAddClient = () => {
    setEditingClient(null)
    setClientForm({ name: '', category: '', status: 'Active' })
    setShowClientModal(true)
  }

  const openEditClient = (client) => {
    setEditingClient(client)
    setClientForm({ name: client.name, category: client.category, status: client.status })
    setShowClientModal(true)
  }

  const handleSaveClient = () => {
    if (!clientForm.name || !clientForm.category) return
    
    let updatedClients
    if (editingClient) {
      updatedClients = clients.map(c => c.id === editingClient.id ? { ...c, ...clientForm } : c)
    } else {
      const newClient = { id: Date.now(), ...clientForm }
      updatedClients = [...clients, newClient]
    }
    
    setClients(updatedClients)
    localStorage.setItem('adminClients', JSON.stringify(updatedClients))
    setShowClientModal(false)
    showSaveMessage(language === 'en' ? '✓ Client saved!' : '✓ ደንበኛ ተቀምጧል!')
  }

  const handleDeleteClient = (id) => {
    if (confirm(language === 'en' ? 'Delete this client?' : 'ይህን ደንበኛ ይሰርዙ?')) {
      const updatedClients = clients.filter(c => c.id !== id)
      setClients(updatedClients)
      localStorage.setItem('adminClients', JSON.stringify(updatedClients))
    }
  }

  const iconOptions = ['📱', '🎨', '📈', '💰', '🎯', '📊', '🚀', '💼', '🌐', '📣', '✨', '🔥']
  const categoryOptions = ['Furniture Store', 'Medical Clinic', 'Supermarket / Retail', 'Restaurant / Cafe', 'Beauty Salon', 'Fitness Center', 'Real Estate', 'Technology', 'Education', 'Other']

  if (!isLoggedIn) {
    return (
      <section className="admin-login-section">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <h1>🔐 {language === 'en' ? 'Admin Panel' : 'የአስተዳዳሪ ፓነል'}</h1>
            <p>{language === 'en' ? 'Enter password to access admin panel' : 'የአስተዳዳሪ ፓነልን ለመድረስ የይለፍ ቃል ያስገቡ'}</p>
          </div>
          {loginError && <div className="error-box">{loginError}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>{language === 'en' ? 'Password' : 'የይለፍ ቃል'}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="submit-btn">{language === 'en' ? 'Login' : 'ግባ'} →</button>
          </form>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-section">
      {saveMessage && <div className="save-toast">{saveMessage}</div>}
      
      <div className="admin-header">
        <h1>⚙️ {language === 'en' ? 'Admin Panel' : 'የአስተዳዳሪ ፓነል'}</h1>
        <button className="logout-btn" onClick={() => setIsLoggedIn(false)}>
          {language === 'en' ? 'Logout' : 'ውጣ'}
        </button>
      </div>

      <div className="admin-tabs">
        <button className={activeTab === 'company' ? 'active' : ''} onClick={() => setActiveTab('company')}>
          🏢 {language === 'en' ? 'Company Info' : 'የኩባንያ መረጃ'}
        </button>
        <button className={activeTab === 'services' ? 'active' : ''} onClick={() => setActiveTab('services')}>
          💼 {language === 'en' ? 'Services' : 'አገልግሎቶች'}
        </button>
        <button className={activeTab === 'clients' ? 'active' : ''} onClick={() => setActiveTab('clients')}>
          👥 {language === 'en' ? 'Clients' : 'ደንበኞች'}
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'company' && (
          <div className="admin-card">
            <h2>{language === 'en' ? 'Company Information' : 'የኩባንያ መረጃ'}</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>{language === 'en' ? 'Company Name' : 'የኩባንያ ስም'}</label>
                <input type="text" value={companyInfo.name} onChange={e => setCompanyInfo({...companyInfo, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>{language === 'en' ? 'Email' : 'ኢሜይል'}</label>
                <input type="email" value={companyInfo.email} onChange={e => setCompanyInfo({...companyInfo, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>{language === 'en' ? 'Phone 1' : 'ስልክ 1'}</label>
                <input type="tel" value={companyInfo.phone1} onChange={e => setCompanyInfo({...companyInfo, phone1: e.target.value})} />
              </div>
              <div className="form-group">
                <label>{language === 'en' ? 'Phone 2' : 'ስልክ 2'}</label>
                <input type="tel" value={companyInfo.phone2} onChange={e => setCompanyInfo({...companyInfo, phone2: e.target.value})} />
              </div>
              <div className="form-group">
                <label>{language === 'en' ? 'Phone 3' : 'ስልክ 3'}</label>
                <input type="tel" value={companyInfo.phone3} onChange={e => setCompanyInfo({...companyInfo, phone3: e.target.value})} />
              </div>
              <div className="form-group">
                <label>{language === 'en' ? 'Address' : 'አድራሻ'}</label>
                <input type="text" value={companyInfo.address} onChange={e => setCompanyInfo({...companyInfo, address: e.target.value})} />
              </div>
              <div className="form-group full-width">
                <label>{language === 'en' ? 'Working Hours' : 'የስራ ሰዓት'}</label>
                <input type="text" value={companyInfo.workingHours} onChange={e => setCompanyInfo({...companyInfo, workingHours: e.target.value})} />
              </div>
            </div>
            <button className="save-btn" onClick={handleSaveCompany}>
              💾 {language === 'en' ? 'Save Changes' : 'ለውጦችን አስቀምጥ'}
            </button>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="admin-card">
            <h2>{language === 'en' ? 'Services' : 'አገልግሎቶች'}</h2>
            <div className="services-list">
              {services.map(service => (
                <div key={service.id} className="service-item">
                  <span className="service-icon">{service.icon}</span>
                  <div className="service-info">
                    <h4>{service.name}</h4>
                    <p>{service.description}</p>
                  </div>
                  <button className="edit-btn" onClick={() => openEditService(service)}>✏️</button>
                  <button className="edit-btn delete" onClick={() => handleDeleteService(service.id)}>🗑️</button>
                </div>
              ))}
            </div>
            <button className="add-btn" onClick={openAddService}>+ {language === 'en' ? 'Add Service' : 'አገልግሎት ጨምር'}</button>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="admin-card">
            <h2>{language === 'en' ? 'Clients' : 'ደንበኞች'}</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{language === 'en' ? 'Name' : 'ስም'}</th>
                  <th>{language === 'en' ? 'Category' : 'ምድብ'}</th>
                  <th>{language === 'en' ? 'Status' : 'ሁኔታ'}</th>
                  <th>{language === 'en' ? 'Actions' : 'ድርጊቶች'}</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.category}</td>
                    <td><span className={`status-badge ${client.status.toLowerCase()}`}>{client.status}</span></td>
                    <td>
                      <button className="action-btn" onClick={() => openEditClient(client)}>✏️</button>
                      <button className="action-btn delete" onClick={() => handleDeleteClient(client.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="add-btn" onClick={openAddClient}>+ {language === 'en' ? 'Add Client' : 'ደንበኛ ጨምር'}</button>
          </div>
        )}
      </div>

      {/* Service Modal */}
      {showServiceModal && (
        <div className="modal-overlay" onClick={() => setShowServiceModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingService ? (language === 'en' ? 'Edit Service' : 'አገልግሎት አርትዕ') : (language === 'en' ? 'Add Service' : 'አገልግሎት ጨምር')}</h3>
            <div className="form-group">
              <label>{language === 'en' ? 'Icon' : 'አዶ'}</label>
              <div className="icon-picker">
                {iconOptions.map(icon => (
                  <button key={icon} type="button" className={`icon-option ${serviceForm.icon === icon ? 'selected' : ''}`} onClick={() => setServiceForm({...serviceForm, icon})}>{icon}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>{language === 'en' ? 'Service Name' : 'የአገልግሎት ስም'}</label>
              <input type="text" value={serviceForm.name} onChange={e => setServiceForm({...serviceForm, name: e.target.value})} placeholder="e.g. Social Media Management" />
            </div>
            <div className="form-group">
              <label>{language === 'en' ? 'Description' : 'መግለጫ'}</label>
              <textarea value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} placeholder="Brief description of the service" />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowServiceModal(false)}>{language === 'en' ? 'Cancel' : 'ሰርዝ'}</button>
              <button className="save-btn" onClick={handleSaveService}>{language === 'en' ? 'Save' : 'አስቀምጥ'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Client Modal */}
      {showClientModal && (
        <div className="modal-overlay" onClick={() => setShowClientModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingClient ? (language === 'en' ? 'Edit Client' : 'ደንበኛ አርትዕ') : (language === 'en' ? 'Add Client' : 'ደንበኛ ጨምር')}</h3>
            <div className="form-group">
              <label>{language === 'en' ? 'Client Name' : 'የደንበኛ ስም'}</label>
              <input type="text" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} placeholder="e.g. ABC Company" />
            </div>
            <div className="form-group">
              <label>{language === 'en' ? 'Category' : 'ምድብ'}</label>
              <select value={clientForm.category} onChange={e => setClientForm({...clientForm, category: e.target.value})}>
                <option value="">{language === 'en' ? 'Select category' : 'ምድብ ይምረጡ'}</option>
                {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{language === 'en' ? 'Status' : 'ሁኔታ'}</label>
              <select value={clientForm.status} onChange={e => setClientForm({...clientForm, status: e.target.value})}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowClientModal(false)}>{language === 'en' ? 'Cancel' : 'ሰርዝ'}</button>
              <button className="save-btn" onClick={handleSaveClient}>{language === 'en' ? 'Save' : 'አስቀምጥ'}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
