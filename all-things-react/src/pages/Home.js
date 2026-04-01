import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../LangContext';
import { SocialIcons } from '../components/socials';
import AdBanner from '../components/AdBanner';

export default function Home() {
  const { t } = useLang();
  return (
    <div className="page">
      {/* Hero */}
      <section style={{ padding: 'clamp(32px, 6vw, 60px) 0 clamp(24px, 4vw, 50px)', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#22c55e15', border: '1px solid #22c55e40', borderRadius: 50, padding: '6px 16px', marginBottom: 24 }}>
          <span style={{ color: '#22c55e', fontSize: 13 }}>✓ {t.heroTag}</span>
        </div>
        <h1 style={{ fontSize: 'clamp(22px, 3.5vw, 48px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 20 }}>
          {t.heroTitle1}<br /><span style={{ color: '#f97316' }}>{t.heroTitle2}</span>
        </h1>
        <p style={{ fontSize: 'clamp(16px, 2.2vw, 22px)', color: '#a3a3a3', maxWidth: 520, margin: '0 auto 0', lineHeight: 1.7 }}>
          {t.heroDesc}
        </p>
      </section>

      {/* Ad Banner */}
      <AdBanner />

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 36 }}>
        <Link to={localStorage.getItem('userToken') ? '/contact' : '/login'} style={{ padding: '13px 28px', background: '#f97316', color: '#000', borderRadius: 10, fontWeight: 700, fontSize: 15 }}>{t.applyNow}</Link>
        <Link to="/clients" style={{ padding: '13px 28px', background: '#171717', color: '#fff', borderRadius: 10, fontWeight: 600, fontSize: 15, border: '1px solid #333' }}>{t.viewClients}</Link>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <SocialIcons size={40} iconSize={20} />
      </div>

      {/* App Store Buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
        <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" style={appBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 10, opacity: 0.8 }}>Download on the</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>App Store</div>
          </div>
        </a>
        <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" style={appBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.64.24.99.2l12.6-7.27-2.72-2.72-10.87 9.79zM.5 1.4C.19 1.74 0 2.28 0 2.98v18.04c0 .7.19 1.24.51 1.58l.08.08 10.1-10.1v-.24L.58 1.32.5 1.4zM20.49 10.5l-2.72-1.57-3.04 3.04 3.04 3.04 2.74-1.58c.78-.45.78-1.48-.02-1.93zM4.17.24L16.77 7.5l-2.72 2.72L3.18.47c.3-.17.65-.24.99-.23z"/></svg>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 10, opacity: 0.8 }}>Get it on</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Google Play</div>
          </div>
        </a>
      </div>

      {/* Stats */}
      <section className="grid-3" style={{ marginTop: 60, marginBottom: 60 }}>
        {[['50+', t.totalClients], ['100%', t.licensed], ['200%', t.avgGrowth]].map(([v, l]) => (
          <div key={l} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 20, padding: '28px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: '#f97316' }}>{v}</div>
            <div style={{ color: '#a3a3a3', marginTop: 6, fontSize: 14 }}>{l}</div>
          </div>
        ))}
      </section>

      {/* Services */}
      <section style={{ marginBottom: 60 }}>
        <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>{t.ourServices}</h2>
        <p style={{ color: '#a3a3a3', textAlign: 'center', marginBottom: 36, fontSize: 14 }}>What we do for your business</p>
        <div className="grid-2">
          {[
            ['📱', t.service1Title, t.service1Desc, '#3b82f6'],
            ['🎨', t.service2Title, t.service2Desc, '#a855f7'],
            ['📈', t.service3Title, t.service3Desc, '#22c55e'],
            ['💰', t.service4Title, t.service4Desc, '#f97316'],
          ].map(([icon, title, desc, color]) => (
            <div key={title} style={{
              background: 'linear-gradient(135deg, #171717, #1c1c1c)',
              border: `1px solid ${color}30`,
              borderTop: `3px solid ${color}`,
              borderRadius: 16, padding: '24px 22px',
              display: 'flex', gap: 16, alignItems: 'flex-start',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${color}25`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{
                width: 50, height: 50, borderRadius: 12, flexShrink: 0,
                background: `${color}20`, border: `1px solid ${color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              }}>{icon}</div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color }}>{title}</h3>
                <p style={{ color: '#a3a3a3', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AdSlideshow() {
  const [ads, setAds] = useState([]);
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/ads/active')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length) setAds(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % ads.length);
        setFade(true);
      }, 400);
    }, 4000);
    return () => clearInterval(t);
  }, [ads]);

  if (!ads.length) return null;
  const ad = ads[index];

  return (
    <div style={{ width: '100%', marginTop: 36, borderRadius: 20, overflow: 'hidden', position: 'relative', background: '#111', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
      {ad.image_url && (
        <img
          src={ad.image_url}
          alt={ad.title || 'Ad'}
          style={{ width: '100%', height: 500, objectFit: 'cover', display: 'block', opacity: fade ? 1 : 0, transition: 'opacity 0.4s ease' }}
        />
      )}
      {/* bottom overlay */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', padding: '40px 32px 24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          {ad.title && <div style={{ fontWeight: 800, fontSize: 22, color: '#fff', marginBottom: 6 }}>{ad.title}</div>}
          {ad.description && <div style={{ color: '#ccc', fontSize: 14, maxWidth: 500 }}>{ad.description}</div>}
        </div>
        {ad.link_url
          ? <a href={ad.link_url} target="_blank" rel="noopener noreferrer" style={viewMoreBtn}>View More →</a>
          : <span style={viewMoreBtn}>View More →</span>
        }
      </div>
      {/* dots */}
      {ads.length > 1 && (
        <div style={{ position: 'absolute', top: 16, right: 20, display: 'flex', gap: 6 }}>
          {ads.map((_, i) => (
            <div key={i} onClick={() => { setFade(false); setTimeout(() => { setIndex(i); setFade(true); }, 400); }} style={{
              width: i === index ? 22 : 8, height: 8, borderRadius: 4,
              background: i === index ? '#f97316' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer', transition: 'width 0.3s',
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

const viewMoreBtn = {
  display: 'inline-block', padding: '10px 24px',
  background: '#f97316', color: '#000',
  borderRadius: 20, fontWeight: 700, fontSize: 14,
  textDecoration: 'none', cursor: 'pointer', flexShrink: 0,
};

const appBtn = {
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '10px 20px', borderRadius: 12,
  background: '#171717', border: '1px solid #333',
  color: '#fff', textDecoration: 'none',
  transition: 'border-color 0.2s, transform 0.2s',
};
