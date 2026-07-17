import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import API from '../api';
import { useLang } from '../LangContext';

const Reveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

function ImageSlider({ images }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % images.length), 4000);
    return () => clearInterval(t);
  }, [images.length]);

  if (!images.length) return null;

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px 24px 0 0', aspectRatio: '16/10' }}>
      {images.map((img, i) => (
        <img
          key={img.id}
          src={img.url}
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: i === idx ? 1 : 0,
            transition: 'opacity 0.8s ease',
          }}
        />
      ))}
      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
          {images.map((_, i) => (
            <div key={i} onClick={() => setIdx(i)}
              style={{ width: i === idx ? 24 : 8, height: 8, borderRadius: 4, background: i === idx ? 'var(--primary)' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'width 0.3s' }} />
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

  const getTitle   = n => (lang === 'am' && n.title_am)   ? n.title_am   : (lang === 'or' && n.title_or)   ? n.title_or   : n.title   || n.title_am   || n.title_or   || '';
  const getContent = n => (lang === 'am' && n.content_am) ? n.content_am : (lang === 'or' && n.content_or) ? n.content_or : n.content || n.content_am || n.content_or || '';

  if (loading) return <div style={{ textAlign: 'center', padding: 100, fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{t.loading}</div>;

  return (
    <div className="page" style={{ paddingTop: 140 }}>
      <div className="hero-gradient" style={{ height: '40vh' }} />
      
      <Reveal>
        <div className="section-tag">{t.updatesTag}</div>
        <h1 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 900, marginBottom: 16 }}>
          {t.latestNews} <span className="serif-title" style={{ color: 'var(--primary)' }}>{t.latestNewsHighlight}</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 64, maxWidth: 600 }}>
          {t.newsDesc}
        </p>
      </Reveal>

      <div className="grid-3">
        {news.map((n, i) => (
          <Reveal key={n.id} delay={i * 0.05}>
            <div className="creative-card" style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <ImageSlider images={n.images || []} />
              <div style={{ padding: 32, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={catBadgeStyle}>{n.category}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>{new Date(n.created_at || n.date).toLocaleDateString()}</span>
                </div>
                <h3 style={{ fontSize: 20, marginBottom: 16, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {getTitle(n)}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6, marginBottom: 24, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {getContent(n)}
                </p>
                <button onClick={() => setSelected(n)} className="btn-outline" style={{ padding: '12px 24px', fontSize: 14, width: '100%' }}>
                  {t.readMore}
                </button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={modalOverlay}
          >
            <motion.div 
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={modalContent}
            >
              <ImageSlider images={selected.images || []} />
              <div style={{ padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <span style={catBadgeStyle}>{selected.category}</span>
                    <h2 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 900, marginTop: 16 }}>{getTitle(selected)}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>{new Date(selected.created_at || selected.date).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => setSelected(null)} style={closeBtnStyle}>✕</button>
                </div>
                <p style={{ color: 'var(--text-main)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{getContent(selected)}</p>
                
                {(selected.source_url || selected.source_urls?.length > 0) && (
                  <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ color: 'var(--secondary)', fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>{t.sources}</div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      {selected.source_url && (
                        <a href={selected.source_url} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ padding: '10px 20px', fontSize: 13 }}>
                          {t.sourceRef} ↗
                        </a>
                      )}
                      {selected.source_urls?.filter(u => u).map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ padding: '10px 20px', fontSize: 13 }}>
                          {t.sourceRef} {i + 1} ↗
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const catBadgeStyle = { background: 'rgba(255, 122, 0, 0.1)', color: 'var(--primary)', padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 800 };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 };
const modalContent = { background: '#fff', borderRadius: 32, width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 50px 100px rgba(0,0,0,0.2)' };
const closeBtnStyle = { background: 'var(--bg-subtle)', border: 'none', color: 'var(--secondary)', width: 48, height: 48, borderRadius: '50%', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' };
