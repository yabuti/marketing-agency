import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useLang } from '../LangContext';

export default function AllClients() {
  const { t } = useLang();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/clients')
      .then(r => setClients(Array.isArray(r.data) ? r.data : []))
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '24px clamp(16px, 4vw, 48px) 64px' }}>
      <style>{`
        .all-clients-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
        @media (max-width: 480px) { .all-clients-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Minimal top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <Link to="/website" style={{ fontWeight: 900, fontSize: 18, color: 'var(--secondary)', textDecoration: 'none' }}>
          All <span style={{ color: 'var(--primary)' }}>Things</span>
        </Link>
        <Link to="/website" style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          ← {t.home || 'Home'}
        </Link>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 900, color: 'var(--secondary)', marginBottom: 8 }}>
          {t.ourPartners} <span style={{ color: 'var(--primary)' }}>{t.ourPartnersHighlight}</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 32 }}>
          {loading ? t.loading : `${clients.length} ${t.verifiedBusinesses || 'verified businesses'}`}
        </p>

        {!loading && clients.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🏢</div>
            <p style={{ color: 'var(--text-muted)' }}>{t.noClients || 'No customers yet.'}</p>
          </div>
        )}

        <div className="all-clients-grid">
          {clients.map(c => (
            <Link key={c.id} to={`/clients/${c.id}`} style={{ textDecoration: 'none', display: 'block', background: 'var(--bg-main)', border: '2px solid #FFE4C7', borderRadius: 20, padding: 20, boxSizing: 'border-box', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#EA580C'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#FFE4C7'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: 64, height: 64, background: 'var(--bg-subtle)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, overflow: 'hidden', border: '1px solid rgba(127,127,127,0.15)', marginBottom: 14 }}>
                {c.logo_url ? <img src={c.logo_url} alt={c.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : '🏢'}
              </div>
              <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--secondary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
              <div style={{ color: 'var(--primary)', fontSize: 17, fontWeight: 700, marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.category || c.business_type || ''}</div>
              <div style={{ fontSize: 16, color: 'var(--text-light)', fontWeight: 600 }}>📍 {c.location || 'Ethiopia'}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
