import React, { useEffect, useState, useCallback } from 'react';
import API from '../api';

const CACHE_KEY = 'adbanner_cache';

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || null; } catch { return null; }
}

export default function AdBanner() {
  const [banners, setBanners] = useState(() => {
    const cached = loadCache();
    return cached || [];
  });
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const fetchBanners = useCallback(() => {
    API.get('/banners/current')
      .then(res => {
        const seen = new Set();
        const unique = (res.data.banners || []).filter(b => {
          if (seen.has(b.filename)) return false;
          seen.add(b.filename);
          return true;
        });
        // Always sync — including empty — so admin deletions reflect on the site
        setBanners(unique);
        setIndex(i => (unique.length ? i % unique.length : 0));
        localStorage.setItem(CACHE_KEY, JSON.stringify(unique));
      })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  // Re-check periodically so admin add/delete shows without a page reload
  useEffect(() => {
    const refetch = setInterval(fetchBanners, 5 * 60 * 1000);
    return () => clearInterval(refetch);
  }, [fetchBanners]);

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

  const banner = banners[index % banners.length];

  return (
    <div style={{ width: '100%', borderRadius: 20, overflow: 'hidden', position: 'relative', background: '#1E293B' }}>
      {banner.url && (
        <img
          src={banner.url}
          alt={banner.filename || 'Banner'}
          style={{ width: '100%', height: 'auto', maxHeight: 500, objectFit: 'contain', display: 'block', opacity: fade ? 1 : 0, transition: 'opacity 0.4s ease' }}
        />
      )}
      {banners.length > 1 && (
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, background: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: '6px 12px' }}>
          {banners.map((_, i) => (
            <div key={i} onClick={() => { setFade(false); setTimeout(() => { setIndex(i); setFade(true); }, 400); }} style={{
              width: i === index ? 24 : 8, height: 8, borderRadius: 4,
              background: i === index ? '#fff' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer', transition: 'width 0.3s',
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
