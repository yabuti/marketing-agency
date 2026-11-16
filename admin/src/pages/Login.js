import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useToast } from '../components/Toast';
import Alert from '../components/Alert';

export default function Login() {
  const [email, setEmail] = useState('admin@allthings.com');
  const [password, setPassword] = useState('Allthings@2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      toast.success('Signed in successfully! Welcome back.');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: 20 }}>
      <div style={{ background: '#141414', padding: '40px 36px', borderRadius: 20, width: 380, border: '1px solid #262626', boxShadow: '0 25px 70px rgba(0,0,0,0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>All <span style={{ color: '#f97316' }}>Things</span> Solution</h2>
        </div>
        <p style={{ color: '#a3a3a3', marginBottom: 28, fontSize: 13 }}>Enterprise Admin Workspace</p>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#a3a3a3', marginBottom: 6, fontWeight: 600 }}>Admin Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#a3a3a3', marginBottom: 6, fontWeight: 600 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ ...inputStyle, marginBottom: 0, paddingRight: 44 }}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPw(s => !s)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                title={showPw ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: showPw ? '#f97316' : '#a3a3a3', lineHeight: 0,
                }}
              >
                {showPw ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Authenticating...' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 14px', background: '#0a0a0a',
  border: '1px solid #333', borderRadius: 8, color: '#fff',
  fontSize: 14, display: 'block', boxSizing: 'border-box',
};

const btnStyle = {
  width: '100%', padding: '13px', background: '#f97316',
  border: 'none', borderRadius: 8, color: '#000',
  fontWeight: 700, fontSize: 15, cursor: 'pointer',
};
