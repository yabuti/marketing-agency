import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import '../styles/contact.css'

export default function Contact() {
  const { t } = useLanguage()
  const [form, setForm] = useState({ name: '', email: '', phone: '', business_type: '', company: '', message: '' })
  const [success, setSuccess] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setSuccess(t('thankYou'))
    setForm({ name: '', email: '', phone: '', business_type: '', company: '', message: '' })
  }

  return (
    <>
      <section className="contact-hero">
        <div className="section-tag">📞 {t('contactUs')}</div>
        <h1>{t('letsWorkTogether').split(' ')[0]} <span>{t('letsWorkTogether').split(' ').slice(1).join(' ')}</span></h1>
        <p>{t('readyToGrow')}</p>
      </section>

      <section className="contact-section">
        <div className="contact-grid">
          <div className="contact-info">
            <div className="info-card"><div className="info-icon">📧</div><div className="info-text"><h4>{t('emailUs')}</h4><p>allthingsethiopia2026@gmail.com</p></div></div>
            <div className="info-card"><div className="info-icon">📞</div><div className="info-text"><h4>{t('callUs')}</h4><p>+251 911 031 884</p><p>+251 905 841 982</p><p>+251 915 840 037</p></div></div>
            <div className="info-card"><div className="info-icon">📍</div><div className="info-text"><h4>{t('visitUs')}</h4><p>Addis Ababa, Ethiopia</p></div></div>
            <div className="info-card"><div className="info-icon">🕐</div><div className="info-text"><h4>{t('workingHours')}</h4><p>{t('monFri')}</p></div></div>
            <a href="https://t.me/Allthings2026" target="_blank" rel="noopener noreferrer" className="info-card telegram-card">
              <div className="info-icon telegram-icon">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </div>
              <div className="info-text"><h4>Telegram</h4><p>@Allthings2026</p></div>
            </a>
          </div>

          <div className="contact-form-card">
            <h3>{t('sendMessage')}</h3>
            <p>{t('fillForm')}</p>
            {success && <div className="success-box">{success}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('yourName')} *</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" required />
                </div>
                <div className="form-group">
                  <label>{t('emailAddress')} *</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@company.com" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('phoneNumber')} *</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+251 91 234 5678" required />
                </div>
                <div className="form-group">
                  <label>{t('businessType')} *</label>
                  <select value={form.business_type} onChange={e => setForm({...form, business_type: e.target.value})} required>
                    <option value="">{t('selectIndustry')}</option>
                    <option value="Furniture Store">{t('furnitureStore')}</option>
                    <option value="Medical Clinic">{t('medicalClinic')}</option>
                    <option value="Supermarket / Retail">{t('supermarket')}</option>
                    <option value="Restaurant / Cafe">{t('restaurant')}</option>
                    <option value="Beauty Salon">{t('beautySalon')}</option>
                    <option value="Fitness Center">{t('fitnessCenter')}</option>
                    <option value="Other Licensed Business">{t('otherBusiness')}</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>{t('companyName')} *</label>
                <input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="Your Business Name" required />
              </div>
              <div className="form-group">
                <label>{t('tellUsAbout')} *</label>
                <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder={t('describeYourBusiness')} required></textarea>
              </div>
              <div className="license-notice">
                <span className="icon">📋</span>
                <p><strong>{t('important')}</strong> {t('onlyLicensed')}</p>
              </div>
              <button type="submit" className="submit-btn">{t('submitApplication')}</button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
