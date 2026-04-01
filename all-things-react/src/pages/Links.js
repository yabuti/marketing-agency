import React from 'react';
import { SOCIALS } from '../components/socials';
import { useLang } from '../LangContext';

export default function Links() {
  const { t } = useLang();

  const LINKS = [
    ...SOCIALS.map(s => ({ label: s.label, href: s.href, icon: s.icon, color: s.color, bg: s.bg, border: s.border })),
    {
      label: t.linksWebsite,
      href: 'https://allthings.ethiopia',
      color: '#f97316',
      bg: '#f9731615',
      border: '#f9731640',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      ),
    },
  ];
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>

        {/* Logo */}
        <img
          src="/logo.jpg"
          alt="All Things"
          style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid #f97316', marginBottom: 16 }}
          onError={e => { e.target.style.display = 'none'; }}
        />

        {/* Name */}
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>
          All <span style={{ color: '#f97316' }}>Things</span>
        </h1>

        {/* Description */}
        <p style={{ color: '#a3a3a3', fontSize: 14, lineHeight: 1.7, marginBottom: 36, maxWidth: 360, margin: '0 auto 36px' }}>
          {t.linksTagline}<br />
          {t.linksDesc}
        </p>

        {/* Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {LINKS.map(({ label, href, icon, color, bg, border }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 24px', borderRadius: 14,
                background: bg, border: `1px solid ${border}`,
                color, fontWeight: 700, fontSize: 15,
                textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = `0 4px 20px ${color}33`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {React.cloneElement(icon, { width: 22, height: 22 })}
              </span>
              <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          ))}
        </div>

        <p style={{ color: '#333', fontSize: 12, marginTop: 40 }}>{t.copyright}</p>
      </div>
    </div>
  );
}
