import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../LangContext';

export default function AdBanner() {
  const [banners, setBanners] = useState([]);
  const [index, setIndex]     = useState(0);
  const [sliding, setSliding] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    fetch('http://localhost:5000/api/banners/current')
      .then(r => r.json())
      .then(data => { if (data.banners?.length) setBanners(data.banners); })
      .catch(() => {});
  }, []);

  const goTo = (i) => {
    if (i === index) return;
    setSliding(true);
    setTimeout(() => { setIndex(i); setSliding(false); }, 400);
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => {
      setSliding(true);
      setTimeout(() => {
        setIndex(i => (i + 1) % banners.length);
        setSliding(false);
      }, 400);
    }, 4000);
    return () => clearInterval(t);
  }, [banners]);

  if (!banners.length) return null;
  const current = banners[index];

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 16, overflow: 'hidden', background: '#111', height: 380 }}>
      <img
        key={current.url}
        src={current.url}
        alt=""
        style={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
          opacity: sliding ? 0 : 1,
          transition: 'opacity 0.4s ease',
          userSelect: 'none',
        }}
      />
      {/* See More button - bottom left */}
      <div style={{ position: 'absolute', bottom: 24, left: 24 }}>
        <Link to="/clients" style={{
          display: 'inline-block', padding: '12px 32px',
          background: '#f97316', color: '#000',
          borderRadius: 24, fontWeight: 700, fontSize: 15,
          textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          whiteSpace: 'nowrap',
        }}>{t.seeMore}</Link>
      </div>

      {/* dots */}
      {banners.length > 1 && (
        <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, alignItems: 'center' }}>
          {banners.map((_, i) => (
            <div key={i} onClick={() => goTo(i)} style={{
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
