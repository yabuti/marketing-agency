import React from 'react';

export const SOCIALS = [
  {
    href: 'https://web.facebook.com/allthings.ethiopia',
    label: 'Facebook',
    color: '#1877F2',
    bg: '#1877F215',
    border: '#1877F240',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    href: 'https://www.instagram.com/allthings.ethiopia/',
    label: 'Instagram',
    color: '#E1306C',
    bg: '#E1306C15',
    border: '#E1306C40',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    href: 'https://www.tiktok.com/@allthings.solution',
    label: 'TikTok',
    color: '#fff',
    bg: '#ffffff10',
    border: '#ffffff25',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
      </svg>
    ),
  },
  {
    href: 'https://t.me/Allthings2026',
    label: 'Telegram',
    color: '#29A8E0',
    bg: '#29A8E015',
    border: '#29A8E040',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.5l-2.95-.924c-.64-.203-.658-.64.136-.954l11.57-4.461c.537-.194 1.006.131.968.06z"/>
      </svg>
    ),
  },
];

export function SocialIcons({ size = 36, iconSize = 18 }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {SOCIALS.map(({ href, label, icon, color, bg, border }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
          style={{
            color, display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: size, height: size, borderRadius: 8,
            border: `1px solid ${border}`, background: bg,
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.boxShadow = `0 0 10px ${color}55`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>
          {React.cloneElement(icon, { width: iconSize, height: iconSize })}
        </a>
      ))}
    </div>
  );
}
