import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { useLang } from '../LangContext';

const LANGS = [{ code: 'en', label: 'EN' }, { code: 'am', label: 'አማ' }, { code: 'or', label: 'OR' }];

export default function Login() {
  const navigate = useNavigate();
  const { t, lang, switchLang } = useLang();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const { data } = await API.post('/users/login', form);
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) { setError(err.response?.data?.message || t.loginFailed); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#0a0a0a' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
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
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900 }}>All <span style={{ color: '#f97316' }}>Things</span> Solution</h1>
          <p style={{ color: '#a3a3a3', marginTop: 6 }}>{t.loginTitle}</p>
        </div>
        <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 16, padding: 'clamp(20px, 4vw, 32px)' }}>
          {error && <div style={errStyle}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>{t.phoneLabel}</label>
              <input type="tel" name="phone" value={form.phone} onChange={set} required style={inp} placeholder="+251 9XX XXX XXX or +251 7XX XXX XXX" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>{t.passwordLabel}</label>
              <input type="password" name="password" value={form.password} onChange={set} required style={inp} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} style={btn}>{loading ? t.loggingIn : t.loginBtn}</button>
          </form>
        </div>
        <p style={{ textAlign: 'center', color: '#a3a3a3', marginTop: 18, fontSize: 14 }}>
          {t.noAccount} <Link to="/register" style={{ color: '#f97316' }}>{t.registerBusiness}</Link>
        </p>
      </div>
    </div>
  );
}

const inp = { width: '100%', padding: '11px 14px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 };
const lbl = { display: 'block', fontSize: 13, color: '#a3a3a3', marginBottom: 6 };
const btn = { width: '100%', padding: '13px', background: '#f97316', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' };
const errStyle = { background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 };
