import React, { useEffect, useState } from 'react';
import { useLang } from '../LangContext';
import API from '../api';

export default function AdBanner() {
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    API.get('/banners/current')
      .then(res => { if (res.data.banners?.length) setBanners(res.data.banners); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % banners.length);
        setFade(true);
      }, 400);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners]);

  if (!banners.length) return null;

  const banner = banners[index];

  return (
    <div style={{ width: '100%', borderRadius: 24, overflow: 'hidden', position: 'relative', background: 'var(--secondary)' }}>
      {banner.url && (
        <img
          src={banner.url}
          alt={banner.filename || 'Banner'}
          style={{ width: '100%', height: 'auto', maxHeight: 500, objectFit: 'contain', display: 'block', opacity: fade ? 1 : 0, transition: 'opacity 0.4s ease' }}
        />
      )}
      {/* dots */}
      {banners.length > 1 && (
        <div style={{ position: 'absolute', top: 16, right: 20, display: 'flex', gap: 6 }}>
          {banners.map((_, i) => (
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
