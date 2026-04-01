import { useLanguage } from '../context/LanguageContext'
import '../styles/about.css'

export default function About() {
  const { t } = useLanguage()
  
  return (
    <>
      <section className="about-hero">
        <div className="section-tag">👋 {t('aboutUs')}</div>
        <h1>{t('weAre')} <span>All Things</span></h1>
        <p>{t('premiumAgencyDesc')}</p>
      </section>

      <section className="story-section">
        <div className="story-content">
          <div className="story-text">
            <h2>{t('storyTitle')}</h2>
            <p>{t('storyDesc1')}</p>
            <p>{t('storyDesc2')}</p>
          </div>
          <div className="story-visual">
            <div className="big-icon">🛡️</div>
            <h3>{t('trustFirst')}</h3>
            <p>{t('trustFirstDesc')}</p>
          </div>
        </div>
      </section>

      <section className="vision-mission-section">
        <div className="vm-grid">
          <div className="vm-card vision-card">
            <div className="vm-icon">🎯</div>
            <h3>{t('vision')}</h3>
            <p>{t('visionText')}</p>
          </div>
          <div className="vm-card mission-card">
            <div className="vm-icon">🚀</div>
            <h3>{t('mission')}</h3>
            <p>{t('missionText')}</p>
          </div>
        </div>
      </section>

      <section className="objectives-section">
        <div className="section-header">
          <div className="section-tag">🎯 {t('strategicObjectives')}</div>
          <h2 className="section-title">{t('ourGoals')}</h2>
        </div>
        <div className="objectives-grid">
          {[
            { icon: '🌍', title: t('nationwideAccess'), desc: t('nationwideAccessDesc') },
            { icon: '📈', title: t('smeGrowth'), desc: t('smeGrowthDesc') },
            { icon: '💻', title: t('technologyUtilization'), desc: t('technologyUtilizationDesc') },
            { icon: '🤝', title: t('longTermPartnerships'), desc: t('longTermPartnershipsDesc') },
            { icon: '👥', title: t('employmentCreation'), desc: t('employmentCreationDesc') }
          ].map(obj => (
            <div key={obj.title} className="objective-card">
              <div className="objective-icon">{obj.icon}</div>
              <h4>{obj.title}</h4>
              <p>{obj.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="why-licensed">
        <div className="section-header">
          <div className="section-tag">✅ {t('ourProcess')}</div>
          <h2 className="section-title">{t('howWeVerify')}</h2>
        </div>
        <div className="process-grid">
          {[
            { num: 1, icon: '📋', title: t('submitDocuments'), desc: t('submitDocumentsDesc') },
            { num: 2, icon: '🔍', title: t('verificationProcess'), desc: t('verificationProcessDesc') },
            { num: 3, icon: '✅', title: t('approval'), desc: t('approvalDesc') },
            { num: 4, icon: '🚀', title: t('launch'), desc: t('launchDesc') }
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
          <div className="section-tag">💎 {t('coreValues')}</div>
          <h2 className="section-title">{t('whatWeStandFor')}</h2>
        </div>
        <div className="values-grid">
          {[
            { icon: '💡', title: t('innovationCreativity'), desc: t('innovationCreativityDesc') },
            { icon: '🎯', title: t('customerCenteredService'), desc: t('customerCenteredServiceDesc') },
            { icon: '🛡️', title: t('integrityTransparency'), desc: t('integrityTransparencyDesc') },
            { icon: '💻', title: t('technologyAdoption'), desc: t('technologyAdoptionDesc') },
            { icon: '📊', title: t('resultsOriented'), desc: t('resultsOrientedDesc') }
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
