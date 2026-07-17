import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import AdBanner from '../components/AdBanner'
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
              <div className="badge orange">🌐 {t('allPlatforms')}</div>
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
              <p className="hero-card-title">{t('platformsWeMaster')}</p>
              <div className="platforms-grid">
                {['📘 Facebook', '📸 Instagram', '🎵 TikTok', '💼 LinkedIn', '🐦 Twitter/X', '▶️ YouTube'].map(p => (
                  <div key={p} className="platform-item">
                    <div className="platform-icon">{p.split(' ')[0]}</div>
                    <div className="platform-name">{p.split(' ')[1]}</div>
                  </div>
                ))}
                <a href="https://t.me/Allthings2026" target="_blank" rel="noopener noreferrer" className="platform-item telegram-platform">
                  <div className="platform-icon">✈️</div>
                  <div className="platform-name">{t('telegram')}</div>
                </a>
              </div>
            </div>
            <div className="floating-stat stat-1"><div className="stat-number">50+</div><div className="stat-label">{t('clients')}</div></div>
            <div className="floating-stat stat-2"><div className="stat-number">100%</div><div className="stat-label">{t('licensed')}</div></div>
          </div>
        </div>
      </section>

      <section className="ad-section" style={{ padding: '0 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <AdBanner />
        </div>
      </section>

      <section className="services-preview">
        <div className="section-header">
          <div className="section-tag">🚀 {t('ourServices')}</div>
          <h2 className="section-title">{t('completeMarketingSolutions')}</h2>
        </div>
        <div className="services-grid">
          {[
            { icon: '📱', title: t('socialMediaMgmt'), desc: t('socialMediaMgmtDesc') },
            { icon: '🎨', title: t('contentCreation'), desc: t('contentCreationDesc') },
            { icon: '📈', title: t('growthStrategy'), desc: t('growthStrategyDesc') },
            { icon: '💰', title: t('paidAds'), desc: t('paidAdsDesc') }
          ].map(s => (
            <Link to="/contact" key={s.title} className="service-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="service-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="trust-section">
        <div className="section-header">
          <div className="section-tag">🛡️ {t('trustAndResults')}</div>
          <h2 className="section-title">{t('numbersThatSpeak')}</h2>
        </div>
        <div className="trust-grid">
          {[
            { num: '50+', label: t('clients') },
            { num: '100%', label: t('licensed') },
            { num: '200%', label: t('avgGrowth') },
            { num: '6', label: t('platforms') }
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
