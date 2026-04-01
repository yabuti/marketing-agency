import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLang } from '../LangContext';

const TICK_MS   = 500;          // tick every 500ms
const TICKS_PER = 5;            // 5 ticks × 500ms = 2.5s per banner

export default function AdSplash({ onDone }) {
  const { t } = useLang();
  const [banners, setBanners] = useState(null);
  const [index, setIndex]     = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const slotRef = useRef(null);

  const fetchBanners = useCallback(() => {
    fetch('http://localhost:5000/api/banners/current')
      .then(r => r.json())
      .then(data => {
        if (!data.banners?.length) { onDone(); return; }
        setBanners(data.banners);
        setIndex(0); setElapsed(0); setImgLoaded(false);
        if (slotRef.current) clearTimeout(slotRef.current);
        if (data.slot_ends_in_ms > 0)
          slotRef.current = setTimeout(fetchBanners, data.slot_ends_in_ms);
      })
      .catch(onDone);
  }, [onDone]);

  useEffect(() => {
    fetchBanners();
    return () => clearTimeout(slotRef.current);
  }, [fetchBanners]);

  useEffect(() => {
    if (!banners) return;
    const TOTAL = banners.length * TICKS_PER;
    const tick = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        if (next >= TOTAL) { clearInterval(tick); onDone(); return TOTAL; }
        const ni = Math.floor(next / TICKS_PER);
        setIndex(cur => { if (ni !== cur) setImgLoaded(false); return ni < banners.length ? ni : cur; });
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(tick);
  }, [banners, onDone]);

  // Loading state
  if (!banners) return (
    <div style={overlay}>
      <div style={spinner} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const TOTAL       = banners.length * TICKS_PER;
  const banner      = banners[index];
  const secLeft     = ((TOTAL - elapsed) * TICK_MS / 1000).toFixed(1);
  const tickInBanner = elapsed % TICKS_PER;
  const totalPct    = (elapsed / TOTAL) * 100;

  return (
    <div style={overlay}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>

      {/* Full-screen image */}
      {banner?.url && (
        <img
          key={banner.url}
          src={banner.url}
          alt=""
          onLoad={() => setImgLoaded(true)}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%',
            objectFit: 'contain', objectPosition: 'center',
            opacity: imgLoaded ? 1 : 0,
            transition: 'opacity 0.4s ease',
            display: 'block',
            maxWidth: 'none',
            padding: '60px 0 80px', // clear top bar + bottom bar
          }}
        />
      )}

      {/* Shimmer while loading */}
      {!imgLoaded && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(110deg,#111 30%,#1c1c1c 50%,#111 70%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
        }} />
      )}

      {/* Top gradient */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom,rgba(0,0,0,0.85),transparent)', pointerEvents: 'none' }} />

      {/* Bottom gradient */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 260, background: 'linear-gradient(to top,rgba(0,0,0,0.92),transparent)', pointerEvents: 'none' }} />

      {/* ── TOP BAR: logo | segment bars | countdown ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Logo */}
        <span style={{ fontSize: 18, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
          All <span style={{ color: '#f97316' }}>Things</span>
        </span>

        {/* Segment progress bars */}
        <div style={{ flex: 1, display: 'flex', gap: 6 }}>
          {banners.map((_, i) => {
            const done    = i < index;
            const current = i === index;
            const fill    = done ? '100%' : current ? `${(tickInBanner / TICKS_PER) * 100}%` : '0%';
            return (
              <div key={i} style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden', maxWidth: 100 }}>
                <div style={{ height: '100%', width: fill, background: done ? '#22c55e' : '#f97316', borderRadius: 2, transition: current ? `width ${TICK_MS}ms linear` : 'none' }} />
              </div>
            );
          })}
        </div>

        {/* Small countdown */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#f97316' }}>{secLeft}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>s</span>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px 28px' }}>
        {/* Ad badge */}
        <div style={{ display: 'inline-block', background: 'rgba(249,115,22,0.18)', border: '1px solid rgba(249,115,22,0.4)', color: '#f97316', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, marginBottom: 10 }}>
          📢 {t.adOf(index + 1, banners.length)}
        </div>

        {/* Watch message */}
        <p style={{ color: '#fff', fontSize: 'clamp(14px, 3vw, 20px)', fontWeight: 800, marginBottom: 4, textShadow: '0 2px 8px rgba(0,0,0,0.8)', lineHeight: 1.2 }}>
          {t.watchAd}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 14 }}>
          {t.secondsLeft(secLeft)}
        </p>

        {/* Overall progress bar */}
        <div style={{ height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${totalPct.toFixed(1)}%`, background: '#f97316', borderRadius: 2, transition: `width ${TICK_MS}ms linear` }} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 5 }}>
          {t.overall}: {Math.round(totalPct)}% {t.complete}
        </p>
      </div>
    </div>
  );
}

// Full-screen overlay — uses dvh so mobile browser toolbars don't clip the ad
const overlay = {
  position: 'fixed',
  top: 0, left: 0,
  width: '100dvw',
  height: '100dvh',
  minHeight: '-webkit-fill-available', // older iOS Safari fallback
  zIndex: 9999,
  background: '#000',
  overflow: 'hidden',
  userSelect: 'none',
};

const spinner = {
  position: 'absolute',
  top: '50%', left: '50%',
  transform: 'translate(-50%,-50%)',
  width: 36, height: 36,
  border: '3px solid rgba(249,115,22,0.3)',
  borderTopColor: '#f97316',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};
