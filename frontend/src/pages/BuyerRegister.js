import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api';
import { useLang } from '../LangContext';
import PasswordInput from '../components/PasswordInput';

const LANGS = [{ code: 'en', label: 'EN' }, { code: 'am', label: 'አማ' }, { code: 'or', label: 'OR' }];

export default function BuyerRegister() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/buyer-dashboard';
  const { t, lang, switchLang } = useLang();

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (e) => {
    let { name, value } = e.target;
    if (name === 'phone') value = value.replace(/\D/g, '').slice(0, 9);
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.full_name.trim()) { setError(t.regNameRequired); return; }
    if (!form.phone || form.phone.length !== 9) { setError(t.regPhoneDigits); return; }
    if (form.password.length < 6) { setError(t.passwordShort); return; }
    if (form.password !== form.confirm_password) { setError(t.passwordMismatch); return; }

    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        phone: '+251' + form.phone,
        password: form.password,
      };
      if (form.email.trim()) payload.email = form.email.trim();

      const { data } = await API.post('/buyers/register', payload);
      localStorage.setItem('buyerToken', data.token);
      localStorage.setItem('buyer', JSON.stringify(data.buyer));
      navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || t.regFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: 'var(--bg-main)' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Back button */}
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#f97316', fontSize: 17, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0, marginBottom: 16 }}>
          {t.regBack}
        </button>
        {/* Language picker */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, gap: 4 }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => switchLang(l.code)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 16, cursor: 'pointer', background: lang === l.code ? 'var(--primary)' : 'var(--bg-subtle)', color: lang === l.code ? '#000' : 'var(--text-muted)', fontWeight: lang === l.code ? 700 : 400, border: '1px solid rgba(0,0,0,0.08)' }}>
              {l.label}
            </button>
          ))}
        </div>

        <div className="buyer-register-card" style={{ background: 'var(--bg-main)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 20, padding: '40px 32px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🛒</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--secondary)', marginBottom: 6 }}>{t.buyerRegisterTitle}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>
              {redirectTo !== '/buyer-dashboard'
                ? t.regTaglineRedirect
                : t.regTaglineDefault}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t.regFullName}</label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={set}
                placeholder={t.regFullNamePh}
                required
                style={inputStyle}
              />
            </div>

            {/* Phone */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t.regPhoneLabel}</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-subtle)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8, overflow: 'hidden' }}>
                <span style={{ padding: '11px 12px', color: 'var(--primary)', fontWeight: 700, fontSize: 17, borderRight: '1px solid rgba(0,0,0,0.08)', whiteSpace: 'nowrap', flexShrink: 0 }}>+251</span>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={set}
                  maxLength={9}
                  placeholder="9XX XXX XXX"
                  style={{ flex: '1 1 0', minWidth: 0, width: '100%', boxSizing: 'border-box', padding: '11px 12px', background: 'transparent', border: 'none', color: 'var(--secondary)', fontSize: 16, outline: 'none' }}
                />
              </div>
            </div>

            {/* Email (optional) */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t.regEmailOptional}</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={set}
                placeholder="your@email.com"
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t.regPassword}</label>
              <PasswordInput
                name="password"
                value={form.password}
                onChange={set}
                placeholder={t.minPassword}
                required
                autoComplete="new-password"
                style={inputStyle}
              />
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>{t.regConfirmPassword}</label>
              <PasswordInput
                name="confirm_password"
                value={form.confirm_password}
                onChange={set}
                placeholder={t.regConfirmPh}
                required
                autoComplete="new-password"
                style={inputStyle}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: '#ef444420', border: '1px solid #ef444440', color: '#ef4444', borderRadius: 8, padding: '10px 14px', fontSize: 16, marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '13px', background: '#f97316', color: '#000', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 17, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? t.regCreating : t.regSubmit}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 16, color: 'var(--text-muted)' }}>
            {t.alreadyHave}{' '}
            <Link to="/login" style={{ color: '#f97316', textDecoration: 'none' }}>{t.signIn}</Link>
          </div>
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 16, color: 'var(--text-muted)' }}>
            {t.regWantToSell}{' '}
            <Link to="/register" style={{ color: '#f97316', textDecoration: 'none' }}>{t.registerAsSeller}</Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .buyer-register-card { padding: 24px 18px !important; }
          .buyer-register-card h1 { font-size: 20px !important; }
        }
      `}</style>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  background: 'var(--bg-subtle)',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 8,
  color: 'var(--secondary)',
  fontSize: 16,
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: 16,
  color: 'var(--secondary)',
  marginBottom: 6,
};

// Responsive styles injected once
const styleTag2 = document.getElementById('buyer-register-responsive') || document.createElement('style');
if (!document.getElementById('buyer-register-responsive')) {
  styleTag2.id = 'buyer-register-responsive';
  styleTag2.textContent = `
    @media (max-width: 480px) {
      .buyer-register-card { padding: 24px 18px !important; }
      .buyer-register-card h1 { font-size: 20px !important; }
    }
  `;
  document.head.appendChild(styleTag2);
}
