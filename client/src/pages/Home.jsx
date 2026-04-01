import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import '../styles/home.css'

export default function Home() {
  const { t } = useLanguage()
  
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badges">
              <div className="badge verified">✓ {t('licensedOnly')}</div>
              <div className="badge orange">🌐 All Platforms</div>
            </div>
            <h1>{t('heroTitle1')} <span>{t('heroTitle2')}</span></h1>
            <p>{t('heroDesc')}</p>
            <div className="cta-buttons">
              <Link to="/contact" className="btn btn-primary">{t('getStarted')} →</Link>
              <Link to="/clients" className="btn btn-outline">{t('viewClients')}</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <p className="hero-card-title">Platforms We Master</p>
              <div className="platforms-grid">
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="platform-item">
                  <div className="platform-icon">📘</div>
                  <div className="platform-name">Facebook</div>
                </a>
                <a href="https://www.instagram.com/all63527?igsh=ZWd4Ymo4ZmU3aXgw&utm_source=qr" target="_blank" rel="noopener noreferrer" className="platform-item">
                  <div className="platform-icon">📸</div>
                  <div className="platform-name">Instagram</div>
                </a>
                <a href="https://www.tiktok.com/@allthings2026?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="platform-item">
                  <div className="platform-icon">🎵</div>
                  <div className="platform-name">TikTok</div>
                </a>
                <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="platform-item">
                  <div className="platform-icon">💼</div>
                  <div className="platform-name">LinkedIn</div>
                </a>
                <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="platform-item">
                  <div className="platform-icon">🐦</div>
                  <div className="platform-name">Twitter/X</div>
                </a>
                <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="platform-item">
                  <div className="platform-icon">▶️</div>
                  <div className="platform-name">YouTube</div>
                </a>
              </div>
            </div>
            <div className="floating-stat stat-1"><div className="stat-number">150+</div><div className="stat-label">Licensed Clients</div></div>
            <div className="floating-stat stat-2"><div className="stat-number">100%</div><div className="stat-label">Verified</div></div>
          </div>
        </div>
      </section>

      <section className="services-preview">
        <div className="section-header">
          <div className="section-tag">🚀 {t('ourServices')}</div>
          <h2 className="section-title">{t('completeSolutions')}</h2>
        </div>
        <div className="services-categories">
          <div className="service-category">
            <div className="category-header">
              <div className="category-icon">📱</div>
              <h3>{t('digitalMarketing')}</h3>
            </div>
            <ul className="service-list">
              <li>{t('socialMediaMgmt')}</li>
              <li>{t('contentCreation')}</li>
              <li>{t('socialMediaAds')}</li>
              <li>{t('seo')}</li>
              <li>{t('emailWhatsapp')}</li>
            </ul>
          </div>
          
          <div className="service-category">
            <div className="category-header">
              <div className="category-icon">📢</div>
              <h3>{t('advertisingServices')}</h3>
            </div>
            <ul className="service-list">
              <li>{t('adStrategy')}</li>
              <li>{t('outdoorAds')}</li>
              <li>{t('mediaPlanning')}</li>
            </ul>
          </div>
          
          <div className="service-category">
            <div className="category-header">
              <div className="category-icon">🎨</div>
              <h3>{t('brandingServices')}</h3>
            </div>
            <ul className="service-list">
              <li>{t('logoDesign')}</li>
              <li>{t('companyProfile')}</li>
              <li>{t('printMaterials')}</li>
              <li>{t('packaging')}</li>
            </ul>
          </div>
          
          <div className="service-category">
            <div className="category-header">
              <div className="category-icon">🚀</div>
              <h3>{t('promotionalServices')}</h3>
            </div>
            <ul className="service-list">
              <li>{t('promotionalItems')}</li>
              <li>{t('eventMarketing')}</li>
              <li>{t('digitalSetup')}</li>
              <li>{t('consultation')}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="trust-section">
        <div className="section-header">
          <div className="section-tag">🛡️ {t('trustResults')}</div>
          <h2 className="section-title">{t('numbersThatSpeak')}</h2>
        </div>
        <div className="trust-grid">
          {[
            { num: '150+', label: t('licensedClients') },
            { num: '500K+', label: t('followersGenerated') },
            { num: '100%', label: t('verifiedBusinesses') },
            { num: '6', label: t('platformsCovered') }
          ].map(item => (
            <div key={item.label} className="trust-item">
              <div className="trust-number">{item.num}</div>
              <div className="trust-label">{item.label}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
