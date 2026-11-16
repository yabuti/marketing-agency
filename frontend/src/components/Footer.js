import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../LangContext';
import { SocialIcons } from './socials';
import { useSiteSettings } from '../SiteSettingsContext';
import API from '../api';
import { useSiteImage } from '../siteImages';

export default function Footer() {
  const { t } = useLang();
  const { footer } = useSiteSettings();
  const logoSrc = useSiteImage('img_logo');
  const footerLogoSrc = useSiteImage('img_footer_logo');
  const quickLinks = (footer.quickLinks || []).filter(Boolean);
  const legalLinks = (footer.legalLinks || []).filter(Boolean);
  const copyright = (footer.copyright && footer.copyright.trim()) || t.copyright;
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await API.post('/newsletter/subscribe', { email: email.trim() });
    } catch {}
    setSubscribed(true);
    setLoading(false);
  };

  const linkStyle = {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    textDecoration: 'none',
    transition: 'color 0.2s',
    lineHeight: 1.4,
  };

  const h4Style = {
    fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 12,
    textTransform: 'uppercase', letterSpacing: '0.06em',
  };

  return (
    <footer className="ft" style={{
      background: '#1E293B',
      padding: '32px 20px 20px',
      marginTop: 48,
      color: '#fff',
    }}>
      <div className="ft-inner" style={{ maxWidth: 1120, margin: '0 auto' }}>

        {/* ─── Top bar: logo ─── */}
        <div className="ft-topbar" style={{
          display: 'flex', alignItems: 'center',
          paddingBottom: 22, borderBottom: '1px solid rgba(255,255,255,0.12)', marginBottom: 28,
        }}>
          <Link to="/website" className="ft-logo" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <img src={logoSrc} alt="All Things" style={{ width: 46, height: 46, borderRadius: 12, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }} />
            <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.01em' }}>
              All<span style={{ color: 'var(--primary)' }}>Things</span>
            </span>
          </Link>
        </div>

        {/* ─── Main grid ─── */}
        <div className="ft-main" style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: 48,
          marginBottom: 24,
        }}>

          {/* Brand: image + store badges */}
          <div className="ft-brand">
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <img src={footerLogoSrc} alt="All Things" style={{ flexShrink: 0, width: 100, height: 100, borderRadius: 10, objectFit: 'cover', display: 'block', border: '1px solid rgba(255,255,255,0.15)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch', flex: '1 1 200px', minWidth: 0 }}>
              <a href="#" aria-label="Google Play" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#000', color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8,
                padding: '6px 8px', textDecoration: 'none', flex: '1 1 0', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-9.437 5.398 7.135-7.7zm4.36-3.706c.34.278.552.7.552 1.199s-.212.921-.552 1.199l-2.107 1.236-2.525-2.525 2.525-2.526 2.107 1.217zM7.364 3.585l9.437 5.404-2.302 2.302-7.135-7.706z"/></svg>
                <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, textAlign: 'left' }}>
                  <span style={{ fontSize: 9, textTransform: 'uppercase', opacity: 0.9 }}>Get it on</span>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{t.googlePlay || 'Google Play'}</span>
                </span>
              </a>
              <a href="#" aria-label="App Store" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#000', color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8,
                padding: '6px 8px', textDecoration: 'none', flex: '1 1 0', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, textAlign: 'left' }}>
                  <span style={{ fontSize: 9, textTransform: 'uppercase', opacity: 0.9 }}>Download on the</span>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{t.appStore || 'App Store'}</span>
                </span>
              </a>
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
              <SocialIcons size={32} iconSize={14} light />
            </div>
          </div>
          <div className="ft-right" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 680, width: '100%', marginLeft: 'auto' }}>

            {/* Stay Updated */}
            <div className="ft-newsletter">
              <h4 style={h4Style}>{t.mpNewsletterTitle || 'Stay Updated'}</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, lineHeight: 1.5, margin: '0 0 12px' }}>
                {t.mpNewsletterDesc || 'Get the latest products and offers straight to your inbox.'}
              </p>
              {!subscribed ? (
                <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 420 }}>
                  <input type="email" required placeholder={t.mpNewsletterPlaceholder || 'Email'}
                    value={email} onChange={e => setEmail(e.target.value)}
                    style={{ flex: '1 1 200px', minWidth: 0, padding: '9px 12px', borderRadius: 8, border: 'none', fontSize: 16, outline: 'none' }} />
                  <button type="submit" disabled={loading} style={{
                    padding: '9px 18px', background: 'var(--primary)', color: '#fff',
                    borderRadius: 8, fontWeight: 700, fontSize: 17, border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
                    opacity: loading ? 0.7 : 1,
                  }}>
                    {loading ? '...' : (t.mpNewsletterBtn || 'Subscribe')}
                  </button>
                </form>
              ) : (
                <span style={{ fontSize: 16, color: '#4ADE80', fontWeight: 600 }}>
                  {t.mpNewsletterSuccess || 'Subscribed!'}
                </span>
              )}
            </div>

            {/* Quick Links + Legal */}
            <div className="ft-links-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 48px', alignItems: 'start' }}>
              <div>
                <h4 style={h4Style}>{t.mpFooterQuickLinks || 'Quick Links'}</h4>
                <div className="ft-quick-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 20px', alignItems: 'start' }}>
                  {quickLinks.map((q, i) => (
                    <Link key={i} to={q.to} style={linkStyle}>{t[q.labelKey] || q.label}</Link>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={h4Style}>{t.legalTitle || 'Legal / Policies'}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                  {legalLinks.map((l, i) => (
                    <Link key={i} to={l.to} style={linkStyle}>{t[l.labelKey] || l.label}</Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 16,
          textAlign: 'center',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, margin: 0 }}>
            {t.copyright}
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .ft-main { grid-template-columns: 1fr !important; gap: 32px !important; }
          .ft-right { margin-left: 0 !important; max-width: 100% !important; }
        }
        @media (max-width: 640px) {
          .ft { padding: 24px 16px 18px !important; margin-top: 32px !important; }
          /* Quick Links and Legal stay side by side on phones - stacking them
             doubles the footer height for no readability gain. */
          .ft-links-grid { grid-template-columns: 1fr 1fr !important; gap: 16px !important; }
          .ft-quick-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 6px 12px !important; }
          .ft-links-grid h4 { font-size: 14px !important; margin-bottom: 8px !important; letter-spacing: 0.04em !important; }
          .ft-links-grid a { font-size: 14px !important; line-height: 1.35 !important; }
          .ft-right { gap: 18px !important; }
          .ft-newsletter p { font-size: 14px !important; margin-bottom: 10px !important; }
          .ft form { width: 100%; max-width: 100% !important; }
          .ft form input,
          .ft form button { width: 100%; }
        }
        @media (max-width: 420px) {
          .ft-brand img { width: 76px !important; height: 76px !important; }
          .ft-logo img { width: 38px !important; height: 38px !important; }
          .ft-links-grid { gap: 12px !important; }
          .ft-quick-grid { gap: 6px 8px !important; }
          .ft-links-grid a { font-size: 13px !important; }
        }
      `}</style>
    </footer>
  );
}
