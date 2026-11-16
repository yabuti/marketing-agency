import React from 'react';
import { useSiteSettings } from '../SiteSettingsContext';

const pillStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '6px 14px', borderRadius: 100,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.16)',
  color: 'rgba(255,255,255,0.92)',
  fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap',
  transition: 'all 0.2s', cursor: 'pointer', flexShrink: 0,
};

const pillIco = {
  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(255,122,0,0.25)', fontSize: 12,
};

const hoverEnter = e => {
  e.currentTarget.style.background = 'var(--primary)';
  e.currentTarget.style.borderColor = 'var(--primary)';
  e.currentTarget.style.color = '#fff';
};
const hoverLeave = e => {
  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)';
  e.currentTarget.style.color = 'rgba(255,255,255,0.92)';
};

export default function ContactBar() {
  const { contact } = useSiteSettings();
  const phones = (contact.phones || []).filter(Boolean);
  const items = [
    { href: `mailto:${contact.email}`, icon: '✉️', text: contact.email, cls: 'contact-pill-email' },
    ...phones.map((p, i) => ({ href: `tel:${p.replace(/[^0-9+]/g, '')}`, icon: i === 0 ? '📞' : '📱', text: p })),
    { icon: '📍', text: contact.address },
  ].filter(it => it.text);

  const renderItems = () =>
    items.map((it, i) =>
      it.href ? (
        <a key={i} href={it.href} style={pillStyle} className={it.cls} onMouseEnter={hoverEnter} onMouseLeave={hoverLeave}>
          <span style={pillIco}>{it.icon}</span> {it.text}
        </a>
      ) : (
        <span key={i} style={pillStyle} className={it.cls}>
          <span style={pillIco}>{it.icon}</span> {it.text}
        </span>
      )
    );

  return (
    <div className="contact-topbar">
      <div className="contact-track">
        {renderItems()}
        <div className="contact-dupe">{renderItems()}</div>
      </div>
    </div>
  );
}