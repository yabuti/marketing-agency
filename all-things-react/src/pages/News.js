import React, { useEffect, useState, useRef } from 'react';
import API from '../api';
import { useLang } from '../LangContext';

// ── Auto-sliding image carousel ──────────────────────────────────
function ImageSlider({ images }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % images.length), 3000);
    return () => clearInterval(t);
  }, [images.length]);

  if (!images.length) return null;

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px 12px 0 0', aspectRatio: '16/9' }}>
      {images.map((img, i) => (
        <img
          key={img.id}
          src={img.url}
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: i === idx ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        />
      ))}
      {/* Dot indicators */}
      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
          {images.map((_, i) => (
            <div key={i} onClick={() => setIdx(i)}
              style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 3, background: i === idx ? '#f97316' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'width 0.3s' }} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const { t, lang } = useLang();

  useEffect(() => {
    API.get('/news').then(r => setNews(r.data)).finally(() => setLoading(false));
  }, []);

  const getTitle   = n => (lang === 'am' && n.title_am)   ? n.title_am   : (lang === 'or' && n.title_or)   ? n.title_or   : n.title;
  const getContent = n => (lang === 'am' && n.content_am) ? n.content_am : (lang === 'or' && n.content_or) ? n.content_or : n.content;
  const getCategory = n => (t.categories && t.categories[n.category]) ? t.categories[n.category] : n.category;

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: '#a3a3a3' }}>{t.loading}</div>;

  return (
    <div className="page">
      <h1 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 900, marginBottom: 6 }}>{t.newsTitle}</h1>
      <p style={{ color: '#a3a3a3', marginBottom: 32, fontSize: 14 }}>{t.latestUpdates}</p>

      {/* 3 cards per row */}
      <div className="news-grid">
        {news.map(n => (
          <div key={n.id} style={card}>
            <ImageSlider images={n.images || []} />

            <div style={{ padding: '14px 16px 16px' }}>
              {/* Category + date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 6, flexWrap: 'wrap' }}>
                <span style={catBadge}>{getCategory(n)}</span>
                <span style={{ color: '#555', fontSize: 11 }}>{new Date(n.created_at || n.date).toLocaleDateString()}</span>
              </div>

              {/* Title */}
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 8, lineHeight: 1.4,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {getTitle(n)}
              </h3>

              {/* Preview */}
              <p style={{ color: '#a3a3a3', fontSize: 12, lineHeight: 1.6, marginBottom: 12,
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {getContent(n)}
              </p>

              <button onClick={() => setSelected(n)} style={readBtn}>{t.readMore}</button>
            </div>
          </div>
        ))}
      </div>

      {news.length === 0 && <p style={{ color: '#a3a3a3', textAlign: 'center', marginTop: 60 }}>{t.noNews}</p>}

      {/* ── Detail modal ── */}
      {selected && (
        <div onClick={() => setSelected(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#111', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Sliding images in modal */}
            <ImageSlider images={selected.images || []} />

            <div style={{ padding: 'clamp(18px, 4vw, 28px)' }}>
              <button onClick={() => setSelected(null)} style={{ float: 'right', background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', marginTop: -4 }}>✕</button>
              <span style={catBadge}>{getCategory(selected)}</span>
              <h2 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 900, margin: '12px 0 6px', lineHeight: 1.3 }}>{getTitle(selected)}</h2>
              <p style={{ color: '#555', fontSize: 12, marginBottom: 18 }}>{new Date(selected.created_at || selected.date).toLocaleDateString()}</p>
              <p style={{ color: '#d4d4d4', fontSize: 15, lineHeight: 1.8 }}>{getContent(selected)}</p>
              {selected.source_url && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #262626' }}>
                  <a href={selected.source_url} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#f97316', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                    {t.sourceRef}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Responsive: collapse to 2 cols on tablet, 1 on mobile via CSS
const card = { background: '#171717', border: '1px solid #262626', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' };
const catBadge = { background: '#f9731620', color: '#f97316', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 };
const readBtn = { background: '#f97316', color: '#000', border: 'none', padding: '7px 14px', borderRadius: 7, fontWeight: 700, fontSize: 12, cursor: 'pointer' };
