import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../LangContext';
import { SocialIcons } from './socials';

export default function Footer() {
  const { t } = useLang();

  const links = [
    ['/', t.home], ['/clients', t.clients], ['/news', t.news],
    ['/about', t.about], ['/contact', t.contact],
  ];

  return (
    <footer style={{ background: '#111', borderTop: '1px solid #1a1a1a', padding: '40px 24px', marginTop: 80 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <img src="/logo.jpg" alt="All Things" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
            <span style={{ fontSize: 18, fontWeight: 900 }}>All <span style={{ color: '#f97316' }}>Things</span> Solution</span>
          </div>
          <div style={{ color: '#555', fontSize: 13, marginBottom: 14 }}>{t.footerTagline}</div>
          <SocialIcons />
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {links.map(([to, label]) => (
            <Link key={to} to={to} style={{ color: '#555', fontSize: 13 }}
              onMouseEnter={e => e.target.style.color = '#f97316'}
              onMouseLeave={e => e.target.style.color = '#555'}>
              {label}
            </Link>
          ))}
        </div>
        <div style={{ color: '#333', fontSize: 12 }}>{t.copyright}</div>
      </div>
    </footer>
  );
}
