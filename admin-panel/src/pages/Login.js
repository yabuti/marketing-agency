import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Login() {
  const [email, setEmail] = useState('admin@allthings.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
      <div style={{ background: '#171717', padding: 40, borderRadius: 16, width: 360, border: '1px solid #262626' }}>
        <h2 style={{ marginBottom: 8, fontSize: 24 }}>All <span style={{ color: '#f97316' }}>Things</span> Solution</h2>
        <p style={{ color: '#a3a3a3', marginBottom: 32, fontSize: 14 }}>Admin Panel</p>

        {error && <div style={{ background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ ...inputStyle, marginBottom: 24 }}
          />
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 14px', background: '#0a0a0a',
  border: '1px solid #333', borderRadius: 8, color: '#fff',
  fontSize: 14, marginBottom: 14, display: 'block',
};
const btnStyle = {
  width: '100%', padding: '13px', background: '#f97316',
  border: 'none', borderRadius: 8, color: '#000',
  fontWeight: 700, fontSize: 15,
};
