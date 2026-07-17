import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api';
import { useLang } from '../LangContext';
import { ETHIOPIAN_CITIES, CITY_TRANSLATIONS, BUSINESS_TYPE_GROUPS } from '../constants';

const LANGS = [{ code: 'en', label: 'EN' }, { code: 'am', label: 'አማ' }, { code: 'or', label: 'OR' }];

export default function Register() {
  const navigate = useNavigate();
  const { t, lang, switchLang } = useLang();
  const [mode, setMode] = useState('choose');
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirm_password: '',
    phone: '', company_name: '', business_type: '',
    tin_number: '', elmis_registration: '', business_license_number: '',
    location: '', website: '',
  });
  const [registered, setRegistered] = useState(false);
  const [registeredName, setRegisteredName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (e) => {
    let { name, value } = e.target;
    if (name === 'phone') value = value.replace(/\D/g, '').slice(0, 9);
    if (['tin_number', 'business_license_number', 'elmis_registration'].includes(name))
      value = value.replace(/[^a-zA-Z0-9/\-]/g, '');
    setForm({ ...form, [name]: value });
  };

  const nextStep = () => {
    setError('');
    if (step === 0) {
      if (!form.full_name.trim()) return setError(t.fillRequired);
      if (!/^\d{9}$/.test(form.phone)) return setError(t.phoneMustBe9);
      if (form.password !== form.confirm_password) return setError(t.passwordMismatch);
      if (form.password.length < 6) return setError(t.passwordShort);
    }
    if (step === 1) {
      if (!form.company_name) return setError(t.companyRequired);
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.business_license_number) return setError(t.businessLicenseReq);
    setLoading(true);
    setError('');
    try {
      const { data } = await API.post('/users/register', { ...form, phone: '+251' + form.phone, lang });
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setRegisteredName(form.full_name);
      setRegistered(true);
    } catch (err) {
      setError(err.response?.data?.message || t.registrationFailed);
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div style={containerStyle}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="creative-card" style={{ maxWidth: 500, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>⏳</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 16 }}>{t.registrationSubmitted}</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
            {typeof t.thankYouName === 'function' ? t.thankYouName(registeredName) : `Thank you, ${registeredName}!`} {t.thankYouRegistering}
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>{t.goToLogin}</button>
        </motion.div>
      </div>
    );
  }

  if (mode === 'choose') {
    return (
      <div style={containerStyle}>
        <div className="hero-gradient" style={{ height: '40vh' }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 480, position: 'relative' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0, marginBottom: 16 }}>
            {t.back || '← Back'}
          </button>
          <div className="creative-card" style={{ textAlign: 'center', padding: '48px 40px' }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🏪</div>
            <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>{t.joinAllThings} <span style={{ color: 'var(--primary)' }}>{t.joinAllThingsHighlight}</span></h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 40 }}>{t.chooseAccountType}</p>
            
            <button onClick={() => setMode('seller')} className="creative-card" style={{ width: '100%', border: '2px solid var(--primary)', background: 'rgba(255, 122, 0, 0.03)', textAlign: 'left', marginBottom: 32 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🏢</div>
              <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{t.registerAsSeller}</div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>{t.registerYourBusiness}</p>
            </button>

            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              {t.haveAccount} <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>{t.signIn}</Link>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div className="hero-gradient" style={{ height: '30vh' }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 520, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', background: '#fff', borderRadius: 10, padding: 4 }}>
            {LANGS.map(l => (
              <button key={l.code} onClick={() => switchLang(l.code)} style={{
                padding: '6px 14px', borderRadius: 8, border: 'none',
                background: lang === l.code ? 'var(--primary)' : 'transparent',
                color: lang === l.code ? '#fff' : 'var(--text-muted)',
                fontSize: 12, fontWeight: 800, cursor: 'pointer'
              }}>{l.label}</button>
            ))}
          </div>
        </div>

        <div className="creative-card" style={{ padding: '40px' }}>
          {/* Step Indicator */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i <= step ? 'var(--primary)' : 'rgba(0,0,0,0.05)', transition: 'all 0.3s' }} />
            ))}
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 32 }}>{step === 0 ? t.accountDetails : step === 1 ? t.businessInfo : t.businessDocsTitle}</h2>

          {error && <div style={errStyle}>{error}</div>}

          {step === 0 && (
            <div style={stepAnim}>
              <Field label={t.fullNameLabel} name="full_name" value={form.full_name} onChange={set} placeholder="John Doe" />
              <div style={{ marginBottom: 20 }}>
                <label style={lblStyle}>{t.phoneLabel2}</label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-subtle)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, overflow: 'hidden' }}>
                  <span style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: 800, borderRight: '1px solid rgba(0,0,0,0.08)' }}>+251</span>
                  <input type="tel" name="phone" value={form.phone} onChange={set} placeholder="9XX XXX XXX" maxLength={9} style={inpStyle} />
                </div>
              </div>
              <Field label={t.emailLabel} name="email" type="email" value={form.email} onChange={set} placeholder="email@example.com" />
              <Field label={t.passwordPlaceholder} name="password" type="password" value={form.password} onChange={set} />
              <Field label={t.confirmPassword} name="confirm_password" type="password" value={form.confirm_password} onChange={set} />
              <button onClick={nextStep} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>{t.nextBusiness}</button>
            </div>
          )}

          {step === 1 && (
            <div style={stepAnim}>
              <Field label={t.companyNameLabel} name="company_name" value={form.company_name} onChange={set} />
              <div style={{ marginBottom: 20 }}>
                <label style={lblStyle}>{t.businessTypeLabel2}</label>
                <select name="business_type" value={form.business_type} onChange={set} style={selectStyle}>
                  <option value="">{t.selectType}</option>
                  {BUSINESS_TYPE_GROUPS[lang]?.map((group, gi) => (
                    <optgroup key={gi} label={group.group}>
                      {group.items.map((item, ii) => (
                        <option key={ii} value={BUSINESS_TYPE_GROUPS.en[gi]?.items[ii] || item}>{item}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={lblStyle}>{t.locationLabel}</label>
                <select name="location" value={form.location} onChange={set} style={selectStyle}>
                  <option value="">{t.selectCity}</option>
                  {ETHIOPIAN_CITIES.map(c => <option key={c} value={c}>{CITY_TRANSLATIONS[lang]?.[c] || c}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button onClick={() => setStep(0)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>{t.back}</button>
                <button onClick={nextStep} className="btn-primary" style={{ flex: 1.5, justifyContent: 'center' }}>{t.nextDocs}</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} style={stepAnim}>
              <Field label={t.businessLicenseLabel} name="business_license_number" value={form.business_license_number} onChange={set} />
              <Field label={t.tinLabel} name="tin_number" value={form.tin_number} onChange={set} />
              <div style={{ background: 'rgba(255,122,0,0.05)', padding: 16, borderRadius: 12, fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
                ℹ️ {t.licenseInfo}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setStep(1)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>{t.back}</button>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1.5, justifyContent: 'center' }}>
                  {loading ? t.creating : t.createAccount}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

const Field = ({ label, name, type = 'text', value, onChange, placeholder }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={lblStyle}>{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} style={{ ...inpStyle, width: '100%', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, background: 'var(--bg-subtle)', padding: '12px 16px' }} />
  </div>
);

const containerStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: 'var(--bg-subtle)' };
const inpStyle = { background: 'transparent', border: 'none', color: 'var(--secondary)', fontSize: 16, outline: 'none', fontWeight: 600 };
const selectStyle = { width: '100%', padding: '12px 16px', background: 'var(--bg-subtle)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, color: 'var(--secondary)', fontSize: 16, fontWeight: 600, appearance: 'none' };
const lblStyle = { display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 };
const errStyle = { background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, marginBottom: 20, fontSize: 14, fontWeight: 600 };
const stepAnim = { animation: 'fadeIn 0.4s ease' };
