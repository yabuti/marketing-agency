import React from 'react';
import { useSiteSettings } from '../SiteSettingsContext';

const WHATSAPP_NUMBER = '251911031884';

export { WHATSAPP_NUMBER };

const FALLBACK = {
  facebook: 'https://facebook.com/Allthingssolutionplc',
  instagram: 'https://www.instagram.com/allthings.ethiopia/',
  tiktok: 'https://www.tiktok.com/@kingarsenal26',
  youtube: 'https://www.youtube.com/@ALLTHINGS-2026',
  telegram: 'https://t.me/Allthings2026',
  whatsapp: `https://wa.me/${WHATSAPP_NUMBER}`,
  messenger: 'https://m.me/61586399832267',
};

export const SOCIALS = [
  {
    key: 'facebook',
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
    key: 'instagram',
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
    key: 'tiktok',
    label: 'TikTok',
    color: '#010101',
    bg: '#01010115',
    border: '#01010140',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
      </svg>
    ),
  },
  {
    key: 'youtube',
    label: 'YouTube',
    color: '#FF0000',
    bg: '#FF000015',
    border: '#FF000040',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    key: 'telegram',
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
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    color: '#25D366',
    bg: '#25D36615',
    border: '#25D36640',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.372.69 4.588 1.978 6.512L.88 23.12l4.608-1.098A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm6.182 16.968c-.386 1.028-1.404 1.72-2.458 1.79-.624.04-1.394.05-2.23-.16-.54-.136-1.102-.33-1.78-.63-2.5-1.11-4.14-3.22-4.73-4.22l-.01-.02c-.36-.62-.66-1.18-.88-1.71-.34-.82-.52-1.52-.62-2.14-.08-.52-.06-.96.06-1.36.12-.4.34-.78.66-1.14.3-.34.64-.48 1.02-.34.1.04.2.08.3.14.1.06.22.14.34.24.28.24.56.56.86.96.18.24.38.5.58.78.12.18.24.36.36.56.08.14.16.28.22.42.04.1.06.2.06.3 0 .14-.06.28-.18.42-.12.14-.26.3-.4.44-.12.12-.22.22-.28.3-.02.02-.04.04-.06.06-.04.04-.06.08-.08.1.06.12.14.28.26.48.14.26.32.54.54.82.44.58 1.06 1.28 1.82 1.88.4.32.8.6 1.2.82.26.14.5.26.72.34.16.06.3.1.42.12.08.02.16.02.22 0 .1-.02.2-.1.34-.24.14-.16.32-.36.52-.6.12-.14.24-.28.38-.4.1-.1.2-.16.32-.18.12-.02.24 0 .38.06.32.12.64.28.98.48.68.4 1.36.84 2.02 1.26.3.2.58.38.82.56.16.12.28.24.38.36.06.08.1.16.12.26.02.1.02.22-.02.36-.06.14-.14.28-.26.42-.12.14-.26.28-.42.4-.2.16-.42.3-.64.4-.28.12-.56.2-.82.24-.2.04-.4.06-.58.06z"/>
      </svg>
    ),
  },
];

export function buildSocials(social = {}) {
  return SOCIALS.map(s => ({ ...s, href: (social[s.key] && social[s.key].trim()) || FALLBACK[s.key] || '#' }));
}

export function SocialIcons({ size = 36, iconSize = 18, light }) {
  const { social } = useSiteSettings();
  const items = buildSocials(social);
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {items.map(({ href, label, icon, color, bg, border }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
          style={{
            color: light ? '#fff' : color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: size, height: size, borderRadius: 8,
            border: `1px solid ${light ? 'rgba(255,255,255,0.2)' : border}`,
            background: light ? 'rgba(255,255,255,0.05)' : bg,
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.boxShadow = light ? '0 0 10px rgba(255,255,255,0.3)' : `0 0 10px ${color}55`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>
          {React.cloneElement(icon, { width: iconSize, height: iconSize })}
        </a>
      ))}
    </div>
  );
}
