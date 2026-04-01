import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { useLang } from '../LangContext';
import { ETHIOPIAN_CITIES, CITY_TRANSLATIONS, BUSINESS_TYPE_GROUPS } from '../constants';

const LANGS = [{ code: 'en', label: 'EN' }, { code: 'am', label: 'አማ' }, { code: 'or', label: 'OR' }];

export default function Register() {
  const navigate = useNavigate();
  const { t, lang, switchLang } = useLang();
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

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const nextStep = () => {
    setError('');
    if (step === 0) {
      if (!form.full_name || !form.phone || !form.password) return setError(t.fillRequired);
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
      const { data } = await API.post('/users/register', form);
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

  // ─── Success screen shown after registration ──────────────────
  if (registered) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#0a0a0a' }}>
        <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⏳</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>
            All <span style={{ color: '#f97316' }}>Things</span>
          </h1>
          <div style={{ background: '#171717', border: '1px solid #f9731640', borderRadius: 16, padding: 32, marginTop: 24 }}>
            <div style={{ color: '#f97316', fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
              🎉 Registration Submitted!
            </div>
            <p style={{ color: '#d4d4d4', lineHeight: 1.7, marginBottom: 16 }}>
              Thank you, <strong style={{ color: '#fff' }}>{registeredName}</strong>! Your account is currently <strong style={{ color: '#f97316' }}>under review</strong>.
            </p>
            <div style={{ background: '#f9731615', border: '1px solid #f9731640', borderRadius: 10, padding: 16, marginBottom: 20, textAlign: 'left' }}>
              <p style={{ color: '#f97316', fontWeight: 600, margin: '0 0 6px' }}>What happens next?</p>
              <p style={{ color: '#a3a3a3', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                Our team will review your business information and verify your license. You will receive an <strong style={{ color: '#fff' }}>SMS notification</strong> on your registered phone number within <strong style={{ color: '#fff' }}>48 hours</strong> once your account is approved.
              </p>
            </div>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 24 }}>
              Questions? Contact us at <span style={{ color: '#f97316' }}>+251 911 031 884</span>
            </p>
            <button onClick={() => navigate('/login')} style={{ padding: '12px 28px', background: '#f97316', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              Go to Login →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#0a0a0a' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Language picker */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, gap: 4 }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => switchLang(l.code)} style={{
              padding: '5px 10px', borderRadius: 6,
              border: `1px solid ${lang === l.code ? '#f97316' : '#333'}`,
              background: lang === l.code ? '#f97316' : 'transparent',
              color: lang === l.code ? '#000' : '#a3a3a3',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>{l.label}</button>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900 }}>All <span style={{ color: '#f97316' }}>Things</span></h1>
          <p style={{ color: '#a3a3a3', marginTop: 6 }}>{t.registerTitle}</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
          {[t.accountDetails, t.businessInfo, t.documents].map((label, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700,
                  background: i < step ? '#22c55e' : i === step ? '#f97316' : '#262626',
                  color: i <= step ? '#000' : '#666' }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 11, color: i === step ? '#f97316' : '#666', marginTop: 4 }}>{label}</span>
              </div>
              {i < [t.accountDetails, t.businessInfo, t.documents].length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < step ? '#22c55e' : '#262626', margin: '0 4px', marginBottom: 20 }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 16, padding: 32 }}>
          {error && <div style={errStyle}>{error}</div>}

          {step === 0 && (
            <div>
              <h3 style={{ fontSize: 16, color: '#f97316', marginBottom: 20 }}>{t.accountDetails}</h3>
              <Field label={t.fullNameLabel} name="full_name" value={form.full_name} onChange={set} />
              <Field label={t.phoneLabel2} name="phone" value={form.phone} onChange={set} placeholder="+251 9XX XXX XXX or +251 7XX XXX XXX" />
              <Field label={t.emailLabel} name="email" type="email" value={form.email} onChange={set} />
              <Field label={t.passwordPlaceholder} name="password" type="password" value={form.password} onChange={set} placeholder={t.minPassword} />
              <Field label={t.confirmPassword} name="confirm_password" type="password" value={form.confirm_password} onChange={set} />
              <button onClick={nextStep} style={btnPrimary}>{t.nextBusiness}</button>
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 style={{ fontSize: 16, color: '#f97316', marginBottom: 20 }}>{t.businessInfo}</h3>
              <Field label={t.companyNameLabel} name="company_name" value={form.company_name} onChange={set} />
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>{t.businessTypeLabel2}</label>
                <select name="business_type" value={form.business_type} onChange={set} style={inputStyle}>
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
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>{t.locationLabel}</label>
                <select name="location" value={form.location} onChange={set} style={inputStyle}>
                  <option value="">Select city...</option>
                  {ETHIOPIAN_CITIES.map(c => (
                    <option key={c} value={c}>{CITY_TRANSLATIONS[lang]?.[c] || c}</option>
                  ))}
                </select>
              </div>
              <Field label={t.websiteLabel} name="website" value={form.website} onChange={set} placeholder="www.yourbusiness.com" />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(0)} style={btnSecondary}>{t.back}</button>
                <button onClick={nextStep} style={{ ...btnPrimary, flex: 1 }}>{t.nextDocs}</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontSize: 16, color: '#f97316', marginBottom: 8 }}>{t.businessDocsTitle}</h3>
              <p style={{ color: '#a3a3a3', fontSize: 13, marginBottom: 20 }}>{t.businessDocsDesc}</p>
              <Field label={t.businessLicenseLabel} name="business_license_number" value={form.business_license_number} onChange={set} />
              <Field label={t.tinLabel} name="tin_number" value={form.tin_number} onChange={set} />
              <Field label={t.elmisLabel} name="elmis_registration" value={form.elmis_registration} onChange={set} />
              <div style={{ background: '#f9731610', border: '1px solid #f9731630', borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 13, color: '#a3a3a3' }}>
                {t.licenseInfo}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setStep(1)} style={btnSecondary}>{t.back}</button>
                <button type="submit" disabled={loading} style={{ ...btnPrimary, flex: 1 }}>
                  {loading ? t.creating : t.createAccount}
                </button>
              </div>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', color: '#a3a3a3', marginTop: 20, fontSize: 14 }}>
          {t.alreadyHave} <Link to="/login" style={{ color: '#f97316' }}>{t.signIn}</Link>
        </p>
      </div>
    </div>
  );
}

const Field = ({ label, name, type = 'text', value, onChange, placeholder }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={labelStyle}>{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} style={inputStyle} />
  </div>
);

const inputStyle = { width: '100%', padding: '11px 14px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 };
const labelStyle = { display: 'block', fontSize: 13, color: '#a3a3a3', marginBottom: 6 };
const btnPrimary = { width: '100%', padding: '13px', background: '#f97316', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' };
const btnSecondary = { padding: '13px 20px', background: '#262626', color: '#fff', border: '1px solid #333', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' };
const errStyle = { background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 };
