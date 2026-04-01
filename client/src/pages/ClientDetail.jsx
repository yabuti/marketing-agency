import { useParams, Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import '../styles/client-detail.css'

export default function ClientDetail() {
  const { t } = useLanguage()
  const { slug } = useParams()
  
  // Create translated client data
  const getClientData = () => ({
    'luxury-home-furniture': {
      id: 1,
      slug: 'luxury-home-furniture',
      name: t('luxuryHomeFurniture'),
      category: t('furnitureStore'),
      icon: '🛋️',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      full_description: t('luxuryFurnitureDesc') + ' With over 15 years of experience, they provide high-quality furniture pieces that transform houses into homes.',
      established: '2009',
      location: 'Bole, Addis Ababa, Ethiopia',
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
      name: t('wellnessMedicalCenter'),
      category: t('medicalClinic'),
      icon: '🏥',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      full_description: t('wellnessMedicalDesc') + ' Our team of experienced doctors and medical professionals are dedicated to providing the highest quality care.',
      established: '2015',
      location: 'Kazanchis, Addis Ababa, Ethiopia',
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
      name: t('freshMartSupermarket'),
      category: t('supermarketRetail'),
      icon: '🛒',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      full_description: t('freshMartDesc') + ' We source locally and internationally to bring you the best selection of groceries, household items, and more.',
      established: '2012',
      location: 'Megenagna, Addis Ababa, Ethiopia',
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
  })

  const client = getClientData()[slug]

  if (!client) {
    return (
      <section className="client-detail">
        <Link to="/clients" className="back-link">← {t('backToClients')}</Link>
        <div className="loading">Client not found</div>
      </section>
    )
  }

  return (
    <section className="client-detail">
      <Link to="/clients" className="back-link">← {t('backToClients')}</Link>
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
    </section>
  )
}
