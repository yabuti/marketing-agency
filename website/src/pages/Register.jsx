import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import '../styles/auth.css'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' })
  const [info, setInfo] = useState('')
  const { t } = useLanguage()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setInfo(t('comingSoonMsg'))
  }

  return (
    <section className="auth-section">
      <div className="auth-card">
        <Link to="/" className="auth-back-link">← {t('back')}</Link>
        <div className="auth-header">
          <h1>{t('createAccount').split(' ')[0]} <span>{t('createAccount').split(' ')[1] || 'Account'}</span></h1>
          <p>{t('registerToContact')}</p>
        </div>
        <div className="info-box">
          <strong>🚧 {t('comingSoon')}</strong> {t('comingSoonMsg')}
        </div>
        {info && <div className="info-box">{info}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('fullName')} *</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" required />
          </div>
          <div className="form-group">
            <label>{t('emailAddress')} *</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@company.com" required />
          </div>
          <div className="form-group">
            <label>{t('phoneNumber')} *</label>
            <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+251 91 234 5678" required />
          </div>
          <div className="form-group">
            <label>{t('password')} *</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Minimum 8 characters" required />
          </div>
          <div className="form-group">
            <label>{t('confirmPassword')} *</label>
            <input type="password" value={form.password_confirmation} onChange={e => setForm({...form, password_confirmation: e.target.value})} placeholder="Confirm your password" required />
          </div>
          <button type="submit" className="submit-btn">{t('createAccount')} →</button>
        </form>
        <div className="auth-footer">
          {t('alreadyHaveAccount')} <Link to="/login">{t('loginHere')}</Link>
        </div>
      </div>
    </section>
  )
}
