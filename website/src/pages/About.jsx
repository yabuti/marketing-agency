import { useLanguage } from '../context/LanguageContext'
import '../styles/about.css'

export default function About() {
  const { t } = useLanguage()
  
  return (
    <>
      <section className="about-hero">
        <div className="section-tag">👋 {t('aboutUs')}</div>
        <h1>{t('weAre')} <span>All Things</span></h1>
        <p>{t('missionDesc')}</p>
      </section>

      <section className="story-section">
        <div className="story-content">
          <div className="mission-vision-grid">
            <div className="mission-box">
              <div className="box-icon">🎯</div>
              <h3>{t('ourMission')}</h3>
              <p>{t('missionDesc')}</p>
            </div>
            <div className="vision-box">
              <div className="box-icon">🚀</div>
              <h3>{t('ourVision')}</h3>
              <p>{t('visionDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="why-licensed">
        <div className="section-header">
          <div className="section-tag">✅ {t('whyLicensed')}</div>
          <h2 className="section-title">{t('whyLicensed')}</h2>
        </div>
        <div className="process-grid">
          {[
            { num: 1, icon: '🔍', title: t('verification'), desc: t('verificationDesc') },
            { num: 2, icon: '🤝', title: t('trust'), desc: t('trustDesc') },
            { num: 3, icon: '📈', title: t('quality'), desc: t('qualityDesc') },
            { num: 4, icon: '✅', title: t('compliance'), desc: t('complianceDesc') }
          ].map(s => (
            <div key={s.num} className="process-step">
              <div className="step-number">{s.num}</div>
              <div className="step-icon">{s.icon}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="values-section">
        <div className="section-header">
          <div className="section-tag">💎 {t('ourValues')}</div>
          <h2 className="section-title">{t('ourValues')}</h2>
        </div>
        <div className="values-grid">
          {[
            { icon: '🎯', title: t('excellence'), desc: t('qualityDesc') },
            { icon: '💎', title: t('integrity'), desc: t('trustDesc') },
            { icon: '🚀', title: t('innovation'), desc: t('growthStrategyDesc') }
          ].map(v => (
            <div key={v.title} className="value-card">
              <div className="value-icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
