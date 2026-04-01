import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import api from '../services/api'
import '../styles/client-detail.css'

// Mock data for frontend-only version
const mockClients = {
  'luxury-home-furniture': {
    id: 1,
    slug: 'luxury-home-furniture',
    name: 'Luxury Home Furniture',
    category: 'Furniture Store',
    icon: '🛋️',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    full_description: 'Luxury Home Furniture is a premium furniture retailer specializing in modern and classic home furnishings. With over 15 years of experience, they provide high-quality furniture pieces that transform houses into homes.',
    established: '2009',
    location: 'Addis Ababa, Ethiopia',
    employees: '50+',
    industry: 'Retail / Furniture',
    license_type: 'Trade License',
    license_number: 'TL-2024-001234',
    license_issue: 'January 15, 2024',
    license_expiry: 'January 14, 2025',
    address: '123 Bole Road, Addis Ababa',
    phone: '+251 91 234 5678',
    website: 'www.luxuryhomefurniture.com'
  },
  'wellness-medical-center': {
    id: 2,
    slug: 'wellness-medical-center',
    name: 'Wellness Medical Center',
    category: 'Medical Clinic',
    icon: '🏥',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    full_description: 'Wellness Medical Center is a full-service medical clinic providing comprehensive healthcare services. Our team of experienced doctors and medical professionals are dedicated to providing the highest quality care.',
    established: '2015',
    location: 'Addis Ababa, Ethiopia',
    employees: '100+',
    industry: 'Healthcare',
    license_type: 'Medical License',
    license_number: 'ML-2024-005678',
    license_issue: 'March 1, 2024',
    license_expiry: 'February 28, 2025',
    address: '456 Kazanchis, Addis Ababa',
    phone: '+251 91 876 5432',
    website: 'www.wellnessmedical.com'
  },
  'fresh-mart-supermarket': {
    id: 3,
    slug: 'fresh-mart-supermarket',
    name: 'Fresh Mart Supermarket',
    category: 'Supermarket / Retail',
    icon: '🛒',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    full_description: 'Fresh Mart Supermarket is your neighborhood supermarket with fresh produce and quality products. We source locally and internationally to bring you the best selection of groceries, household items, and more.',
    established: '2012',
    location: 'Addis Ababa, Ethiopia',
    employees: '200+',
    industry: 'Retail / Grocery',
    license_type: 'Trade License',
    license_number: 'TL-2024-009012',
    license_issue: 'June 1, 2024',
    license_expiry: 'May 31, 2025',
    address: '789 Megenagna, Addis Ababa',
    phone: '+251 91 111 2222',
    website: 'www.freshmart.com'
  }
}

export default function ClientDetail() {
  const { slug } = useParams()
  const { t } = useLanguage()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClient()
  }, [slug])

  const fetchClient = async () => {
    try {
      const response = await api.get(`/clients/${slug}`)
      setClient(response.data)
    } catch (error) {
      console.error('Error fetching client:', error)
      // Fallback to mock data
      setClient(mockClients[slug])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="client-detail">
        <Link to="/clients" className="back-link">{t('backToClients')}</Link>
        <div className="loading">Loading client details...</div>
      </section>
    )
  }

  if (!client) {
    return (
      <section className="client-detail">
        <Link to="/clients" className="back-link">{t('backToClients')}</Link>
        <div className="loading">Client not found</div>
      </section>
    )
  }

  return (
    <section className="client-detail">
      <Link to="/clients" className="back-link">{t('backToClients')}</Link>
      <div className="client-hero">
        <div className="client-main">
          <div className="client-banner" style={{background: client.gradient}}>{client.icon}</div>
          <div className="client-info">
            <h1>{client.name}</h1>
            <span className="client-category">{client.category}</span>
            <p className="client-description">{client.full_description}</p>
            <div className="info-grid">
              <div className="info-item"><label>{t('established')}</label><span>{client.established}</span></div>
              <div className="info-item"><label>{t('location')}</label><span>{client.location}</span></div>
              <div className="info-item"><label>{t('employees')}</label><span>{client.employees}</span></div>
              <div className="info-item"><label>{t('industry')}</label><span>{client.industry}</span></div>
            </div>
          </div>
        </div>
        <div className="license-section">
          <div className="license-card">
            <div className="license-header">
              <div className="verified-badge">✓</div>
              <div className="license-header-text">
                <h3>{t('verifiedLicensed')}</h3>
                <p>{t('allDocsVerified')}</p>
              </div>
            </div>
            <div className="license-details">
              <div className="license-row"><span className="label">📄 {t('licenseType')}</span><span className="value">{client.license_type}</span></div>
              <div className="license-row"><span className="label">🔢 {t('licenseNumber')}</span><span className="value">{client.license_number}</span></div>
              <div className="license-row"><span className="label">📅 {t('issueDate')}</span><span className="value">{client.license_issue}</span></div>
              <div className="license-row"><span className="label">📅 {t('expiryDate')}</span><span className="value">{client.license_expiry}</span></div>
              <div className="license-row"><span className="label">✅ {t('status')}</span><span className="value active">{t('activeVerified')}</span></div>
            </div>
          </div>
          <div className="contact-card">
            <h4>📞 {t('businessContact')}</h4>
            <div className="contact-item"><span className="icon">📍</span> {client.address}</div>
            <div className="contact-item"><span className="icon">📞</span> {client.phone}</div>
            {client.website && <div className="contact-item"><span className="icon">🌐</span> {client.website}</div>}
          </div>
        </div>
      </div>

      {/* Media Gallery */}
      {(client.images?.length > 0 || client.videos?.length > 0) && (
        <div className="media-gallery">
          {client.images?.length > 0 && (
            <div className="gallery-section">
              <h3>📸 Gallery</h3>
              <div className="images-grid">
                {client.images.map((image, index) => (
                  <div key={index} className="gallery-image">
                    <img src={image} alt={`${client.name} - Image ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {client.videos?.length > 0 && (
            <div className="gallery-section">
              <h3>🎥 Videos</h3>
              <div className="videos-grid">
                {client.videos.map((video, index) => (
                  <div key={index} className="gallery-video">
                    <video src={video} controls />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
