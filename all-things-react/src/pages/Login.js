import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../api';
import { useLang } from '../LangContext';

const LANGS = [{ code: 'en', label: 'EN' }, { code: 'am', label: 'አማ' }, { code: 'or', label: 'OR' }];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang, switchLang } = useLang();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || null;

  const set = e => {
    let { name, value } = e.target;
    if (name === 'phone') value = value.replace(/\D/g, '').slice(0, 9);
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!/^\d{9}$/.test(form.phone)) { setError(t.phoneMustBe9); return; }
    setLoading(true); setError('');
    try {
      const { data } = await API.post('/users/login', { ...form, phone: '+251' + form.phone });
      if (data.buyer) {
        localStorage.setItem('buyerToken', data.token);
        localStorage.setItem('buyer', JSON.stringify(data.buyer));
        navigate(from || '/buyer-dashboard');
      } else {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate(from || '/dashboard');
      }
    } catch (err) { setError(err.response?.data?.message || t.loginFailed); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-subtle)' }}>
      <div className="hero-gradient" style={{ height: '40vh' }} />
      
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
        >
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0, marginBottom: 16 }}>
            {t.back || '← Back'}
          </button>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', background: '#fff', borderRadius: 10, padding: 4, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            {LANGS.map(l => (
              <button key={l.code} onClick={() => switchLang(l.code)} style={{
                padding: '6px 14px', borderRadius: 8, border: 'none',
                background: lang === l.code ? 'var(--primary)' : 'transparent',
                color: lang === l.code ? '#fff' : 'var(--text-muted)',
                fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
              }}>{l.label}</button>
            ))}
          </div>
        </div>

        <div className="creative-card" style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>All <span style={{ color: 'var(--primary)' }}>Things</span></h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>{t.loginTitle}</p>
          </div>

          {error && <div style={errStyle}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={lblStyle}>{t.phoneLabel}</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-subtle)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, overflow: 'hidden' }}>
                <span style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: 800, fontSize: 16, borderRight: '1px solid rgba(0,0,0,0.08)' }}>+251</span>
                <input type="tel" name="phone" value={form.phone} onChange={set} required maxLength={9} placeholder="9XX XXX XXX" style={inpStyle} />
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={lblStyle}>{t.passwordLabel}</label>
                <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>{t.forgot}</Link>
              </div>
              <input type="password" name="password" value={form.password} onChange={set} required style={{ ...inpStyle, width: '100%', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, background: 'var(--bg-subtle)', padding: '12px 16px' }} placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? t.loggingIn : t.loginBtn}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 24, fontSize: 15 }}>
          {t.noAccount} <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>{t.registerBusiness}</Link>
        </p>
      </motion.div>
    </div>
  );
}

const inpStyle = { flex: 1, padding: '12px 16px', background: 'transparent', border: 'none', color: 'var(--secondary)', fontSize: 16, outline: 'none', fontWeight: 600 };
const lblStyle = { display: 'block', fontSize: 14, fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' };
const errStyle = { background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, marginBottom: 20, fontSize: 14, fontWeight: 600 };
