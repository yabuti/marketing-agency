import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import '../styles/clients.css'

export default function Clients() {
  const { t } = useLanguage()
  
  // Create translated client data
  const getClientData = () => [
    {
      id: 1,
      slug: 'luxury-home-furniture',
      name: t('luxuryHomeFurniture'),
      category: t('furnitureStore'),
      icon: '🛋️',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      short_desc: t('luxuryFurnitureDesc'),
      location: 'Bole, Addis Ababa',
      followers: '25K+',
      growth: '+180%',
      engagement: '8.5%'
    },
    {
      id: 2,
      slug: 'wellness-medical-center',
      name: t('wellnessMedicalCenter'),
      category: t('medicalClinic'),
      icon: '🏥',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      short_desc: t('wellnessMedicalDesc'),
      location: 'Kazanchis, Addis Ababa',
      followers: '18K+',
      growth: '+150%',
      engagement: '7.2%'
    },
    {
      id: 3,
      slug: 'fresh-mart-supermarket',
      name: t('freshMartSupermarket'),
      category: t('supermarketRetail'),
      icon: '🛒',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      short_desc: t('freshMartDesc'),
      location: 'Megenagna, Addis Ababa',
      followers: '32K+',
      growth: '+220%',
      engagement: '9.1%'
    }
  ]
  
  return (
    <>
      <section className="clients-hero">
        <div className="section-tag">🏢 {t('ourClients')}</div>
        <h1>{t('businessesWePromote')}</h1>
        <p>{t('everyBusinessVerified')}</p>
        <div className="verification-banner">
          <div className="icon">✓</div>
          <div className="text">
            <h3>{t('verifiedBusinesses')}</h3>
            <p>{t('allClientsVerified')}</p>
          </div>
        </div>
      </section>

      <section className="clients-section">
        <div className="clients-grid">
          {getClientData().map(client => (
            <Link to={`/clients/${client.slug}`} key={client.id} className="client-card">
              <div className="client-header">
                <div className="client-logo" style={{background: client.gradient}}>{client.icon}</div>
                <div className="client-title">
                  <h3>{client.name}</h3>
                  <p>{client.category}</p>
                  <div className="client-location">📍 {client.location}</div>
                </div>
              </div>
              <div className="client-body">
                <p>{client.short_desc}</p>
                <div className="license-badge">
                  <div className="license-header">
                    <div className="verified-icon">✓</div>
                    <span>{t('verifiedLicensed')}</span>
                  </div>
                </div>
                <div className="client-stats">
                  <div className="stat"><div className="stat-value">{client.followers}</div><div className="stat-name">{t('followers')}</div></div>
                  <div className="stat"><div className="stat-value">{client.growth}</div><div className="stat-name">{t('growth')}</div></div>
                  <div className="stat"><div className="stat-value">{client.engagement}</div><div className="stat-name">{t('engagement')}</div></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2>{t('wantToJoin')} <span>{t('verifiedNetwork')}</span>?</h2>
        <p>{t('ifYouHaveLicense')}</p>
        <Link to="/contact" className="btn btn-primary">{t('applyNow')} →</Link>
      </section>
    </>
  )
}
