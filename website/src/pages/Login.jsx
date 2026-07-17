import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import '../styles/auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
          <h1>{t('welcomeBack').split(' ')[0]} <span>{t('welcomeBack').split(' ')[1] || 'Back'}</span></h1>
          <p>{t('loginToContact')}</p>
        </div>
        <div className="info-box">
          <strong>🚧 {t('comingSoon')}</strong> {t('comingSoonMsg')}
        </div>
        {info && <div className="info-box">{info}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('emailAddress')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@company.com" required />
          </div>
          <div className="form-group">
            <label>{t('password')}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" required />
          </div>
          <button type="submit" className="submit-btn">{t('login')} →</button>
        </form>
        <div className="auth-footer">
          <Link to="/forgot-password" style={{display:'block',marginBottom:'1rem'}}>{t('forgotPassword')}</Link>
          {t('dontHaveAccount')} <Link to="/register">{t('registerHere')}</Link>
        </div>
      </div>
    </section>
  )
}
