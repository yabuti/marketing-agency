import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import '../styles/auth.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const { t } = useLanguage()

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage(t('resetLinkSent'))
  }

  return (
    <section className="auth-section">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{t('forgotPasswordTitle').split(' ')[0]} <span>{t('forgotPasswordTitle').split(' ')[1] || 'Password'}</span></h1>
          <p>{t('enterEmailReset')}</p>
        </div>
        {message && <div className="success-box">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('emailAddress')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@company.com" required />
          </div>
          <button type="submit" className="submit-btn">{t('sendResetLink')} →</button>
        </form>
        <div className="auth-footer">
          <Link to="/login">← {t('backToLogin')}</Link>
        </div>
      </div>
    </section>
  )
}
