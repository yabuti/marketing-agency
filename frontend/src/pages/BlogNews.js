import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import API from '../api';
import { useLang, localeFor } from '../LangContext';
import { useSiteImage } from '../siteImages';

const NAVY = 'var(--secondary)';
const ORANGE = '#F58220';

function articleImages(a) {
  const arr = Array.isArray(a?.images) ? a.images : (Array.isArray(a?.media_urls) ? a.media_urls : []);
  return arr.map(i => typeof i === 'string' ? i : i?.url).filter(Boolean);
}

const Reveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}>
      {children}
    </motion.div>
  );
};

export default function BlogNews() {
  const { t, lang } = useLang();
  const blogHero = useSiteImage('img_blog_hero');
  const [tab, setTab] = useState('news');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const PER_PAGE = 6;

  useEffect(() => {
    API.get('/news')
      .then(r => setArticles(Array.isArray(r.data) ? r.data : []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  const getTitle = n => (lang === 'am' && n.title_am) ? n.title_am : (lang === 'or' && n.title_or) ? n.title_or : n.title || n.title_am || n.title_or || '';
  const getContent = n => (lang === 'am' && n.content_am) ? n.content_am : (lang === 'or' && n.content_or) ? n.content_or : n.content || n.content_am || n.content_or || '';
  const getDate = n => new Date(n.created_at || n.date || Date.now());

  const isNews = a => String(a.category || '').toLowerCase() === 'news';
  const filtered = useMemo(() => {
    let list = [...articles];
    if (tab === 'blog') list = list.filter(a => !isNews(a));
    else if (tab === 'news') list = list.filter(a => isNews(a));
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(a => getTitle(a).toLowerCase().includes(s) || getContent(a).toLowerCase().includes(s));
    }
    list.sort((a, b) => {
      const newsFirst = (isNews(b) ? 1 : 0) - (isNews(a) ? 1 : 0);
      if (newsFirst !== 0) return newsFirst;
      if (sort === 'oldest') return getDate(a) - getDate(b);
      return getDate(b) - getDate(a);
    });
    return list;
  }, [articles, tab, search, sort, lang]);

  const featured = useMemo(() => filtered.slice(0, 4), [filtered]);
  const rest = useMemo(() => filtered.slice(4), [filtered]);
  const paginated = rest.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(rest.length / PER_PAGE);
  const categories = useMemo(() => {
    const map = new Map();
    articles.forEach(a => {
      if (!a.category) return;
      map.set(a.category, (map.get(a.category) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [articles]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid', borderColor: `${ORANGE}20 ${ORANGE}20 ${ORANGE}20 ${ORANGE}`, animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section style={{
        position: 'relative', overflow: 'hidden', background: 'var(--bg-subtle)', minHeight: 280,
      }}>
        <img
          src={blogHero}
          alt={t.blogTitleA + ' ' + t.blogTitleB}
          onLoad={() => setImgLoaded(true)}
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.6s ease',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(11,27,51,0.75) 0%, rgba(11,27,51,0.35) 50%, transparent 100%)',
        }} />
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '56px 32px 40px', zIndex: 2 }}>
          <Reveal delay={0.1}>
            <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 12 }}>
              <span style={{ color: 'var(--text-main)' }}>{t.blogTitleA}</span>{' '}
              <span style={{ color: ORANGE }}>{t.blogTitleB}</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, lineHeight: 1.7, maxWidth: 600, marginBottom: 0 }}>
              {t.blogHeroDesc}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ FILTERS BAR ═══════════════════ */}
      <section style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'var(--bg-main)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-subtle)', padding: 4, borderRadius: 12 }}>
            {[
              { key: 'news', label: t.blogTabNews },
              { key: 'blog', label: t.blogTabBlog },
            ].map(item => {
              const isActive = tab === item.key || (tab === 'all' && item.key === 'blog');
              return (
              <button key={item.key} onClick={() => { setTab(item.key); setPage(1); }}
                style={{
                  padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: isActive ? 'var(--bg-main)' : 'transparent',
                  color: isActive ? NAVY : '#6b7280',
                  fontWeight: isActive ? 800 : 600, fontSize: 16,
                  boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s',
                }}
              >{item.label}</button>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                placeholder={t.blogSearchPlaceholder}
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{
                  padding: '10px 14px 10px 42px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)',
                  background: 'var(--bg-subtle)', fontSize: 16, color: NAVY, outline: 'none',
                  width: 200, fontFamily: 'inherit',
                }}
              />
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{
                padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)',
                background: 'var(--bg-subtle)', fontSize: 16, fontWeight: 600, color: NAVY,
                cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
              }}
            >
              <option value="newest">{t.blogSortNewest}</option>
              <option value="oldest">{t.blogSortOldest}</option>
            </select>
          </div>
        </div>
      </section>

      {/* ═══════════════════ MAIN CONTENT ═══════════════════ */}
      <section className="blognews-main" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px 56px' }}>
        {/* ─── LEFT COLUMN ─── */}
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${ORANGE}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>📰</div>
              <h3 style={{ color: NAVY, marginBottom: 8 }}>{t.blogEmptyTitle}</h3>
              <p style={{ color: 'var(--text-muted)' }}>{t.blogEmptyDesc}</p>
            </div>
          ) : (
            <>
              {/* Featured 2-col grid */}
              {featured.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <Reveal>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 4, height: 24, borderRadius: 2, background: ORANGE }} />
                      <h2 style={{ fontSize: 20, fontWeight: 900, color: NAVY, margin: 0 }}>{t.blogFeaturedTitle}</h2>
                    </div>
                  </Reveal>
                  <div className="blognews-featured">
                    {featured.map((article, i) => (
                      <FeatureCard key={article.id} article={article} getTitle={getTitle} getContent={getContent} getDate={getDate} lang={lang} t={t} onClick={() => setSelected(article)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Horizontal rest */}
              {paginated.length > 0 && (
                <div>
                  <Reveal>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 4, height: 24, borderRadius: 2, background: NAVY }} />
                      <h2 style={{ fontSize: 20, fontWeight: 900, color: NAVY, margin: 0 }}>{t.blogMoreTitle}</h2>
                    </div>
                  </Reveal>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {paginated.map((article, i) => (
                      <HorizontalCard key={article.id} article={article} getTitle={getTitle} getContent={getContent} getDate={getDate} lang={lang} t={t} onClick={() => setSelected(article)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 40 }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => { setPage(p); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                      style={{
                        width: 40, height: 40, borderRadius: 10, border: '1px solid',
                        borderColor: page === p ? ORANGE : 'rgba(0,0,0,0.08)',
                        background: page === p ? ORANGE : 'var(--card-bg)',
                        color: page === p ? '#fff' : NAVY,
                        fontWeight: 800, fontSize: 17, cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >{p}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ─── RIGHT SIDEBAR ─── */}
        <div className="blognews-sidebar">
          <div style={{ position: 'sticky', top: 100 }}>
            {/* Categories */}
            {categories.length > 0 && (
              <Reveal delay={0.1}>
                <div style={{
                  background: 'var(--bg-main)', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)',
                  padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                }}>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: NAVY, marginBottom: 16, margin: 0 }}>
                    {t.blogCategoriesTitle}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 16 }}>
                    {categories.slice(0, 8).map(([cat, count]) => (
                      <button key={cat} onClick={() => { setTab(cat.toLowerCase() === 'news' ? 'news' : 'blog'); setPage(1); }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 14px', borderRadius: 10, border: 'none',
                          background: 'transparent', cursor: 'pointer',
                          transition: 'all 0.2s', fontSize: 16, fontWeight: 600, color: '#4b5563',
                          fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${ORANGE}10`; e.currentTarget.style.paddingLeft = '18px'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.paddingLeft = '14px'; }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: ORANGE, display: 'inline-block' }} />
                          {cat}
                        </span>
                        <span style={{
                          minWidth: 24, height: 24, borderRadius: 8,
                          background: `${ORANGE}10`, color: ORANGE,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 17, fontWeight: 800, padding: '0 6px',
                        }}>{count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════ MODAL ═══════════════════ */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="blog-modal-backdrop"
          >
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="blog-modal-container"
            >
              {/* Modal image */}
              {articleImages(selected).length > 0 && (
                <div className="blog-modal-img-wrap">
                  <img src={articleImages(selected)[0]} alt="" />
                </div>
              )}
              <div className="blog-modal-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {selected.category && (
                      <span style={{ background: `${ORANGE}12`, color: ORANGE, padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>
                        {selected.category}
                      </span>
                    )}
                    <h2 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 900, color: NAVY, marginTop: 14, lineHeight: 1.25, overflowWrap: 'anywhere' }}>
                      {getTitle(selected)}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, color: '#94a3b8', fontSize: 14, flexWrap: 'wrap' }}>
                      <span>{getDate(selected).toLocaleDateString(localeFor(lang), { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      {selected.author && <><span>•</span><span style={{ fontWeight: 700, color: NAVY }}>{selected.author}</span></>}
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)}
                    style={{
                      background: 'var(--bg-subtle)', border: 'none', width: 40, height: 40, borderRadius: '50%',
                      fontSize: 18, cursor: 'pointer', color: NAVY, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = `${ORANGE}15`}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                    aria-label="Close"
                  >✕</button>
                </div>
                <div style={{ color: '#4b5563', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: 15, overflowWrap: 'anywhere' }}>
                  {getContent(selected)}
                </div>
                {selected.source_ref && (
                  <a href={selected.source_ref} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 24,
                      padding: '10px 20px', borderRadius: 100, border: `1px solid ${ORANGE}30`,
                      color: ORANGE, fontWeight: 700, fontSize: 14, textDecoration: 'none',
                      transition: 'all 0.2s', maxWidth: '100%', overflowWrap: 'anywhere',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${ORANGE}08`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {t.blogSourceRef}
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .blognews-main { display: flex; gap: 32px; }
        .blognews-sidebar { flex: 0 0 320px; width: 320px; }
        .blognews-featured { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .blog-modal-backdrop {
          position: fixed; inset: 0; background: rgba(11,27,51,0.85);
          backdrop-filter: blur(8px); z-index: 9999;
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .blog-modal-container {
          background: var(--bg-main); border-radius: 24px; width: 100%; max-width: 780px;
          max-height: 90vh; overflow: hidden; overflow-y: auto;
          box-shadow: 0 40px 100px rgba(0,0,0,0.2);
        }
        .blog-modal-img-wrap {
          width: 100%; height: 320px; overflow: hidden; background: var(--bg-subtle);
        }
        .blog-modal-img-wrap img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .blog-modal-body {
          padding: 36px;
        }
        .blog-horizontal-card {
          display: flex; align-items: stretch; cursor: pointer;
          border-radius: 16px; overflow: hidden;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 4px 16px rgba(0,0,0,0.03);
          transition: all 0.35s ease;
          background: var(--bg-main);
        }
        .blog-horizontal-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.08);
        }
        .blog-horizontal-img {
          position: relative; flex: 0 0 220px; overflow: hidden; background: var(--bg-subtle); min-height: 150px;
        }
        .blog-horizontal-body {
          padding: 24px; flex: 1; min-width: 0;
        }
        @media (max-width: 900px) {
          .blognews-main { flex-direction: column !important; }
          .blognews-sidebar { flex: 1 1 100% !important; width: 100% !important; }
          .blognews-featured { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          [style*="padding: 56px 32px 40px"] { padding: 48px 20px 32px !important; }
          [style*="position: sticky"][style*="top: 0"] { position: relative !important; }
          [style*="padding: 16px 32px"] { padding: 12px 16px !important; }
          [style*="padding: 32px 32px 56px"] { padding: 24px 16px 48px !important; }
          [style*="width: 200"][style*="borderRadius: 10"] { width: 120px !important; }
          [style*="display: flex"][style*="flex: 1 1 0"] { padding: 0 !important; }
        }
        @media (max-width: 640px) {
          .blog-horizontal-card {
            flex-direction: column !important;
          }
          .blog-horizontal-img {
            flex: none !important;
            width: 100% !important;
            height: 190px !important;
          }
          .blog-horizontal-body {
            padding: 18px 16px !important;
          }
          .blog-modal-backdrop {
            padding: 12px !important;
          }
          .blog-modal-container {
            border-radius: 18px !important;
            max-height: 94vh !important;
          }
          .blog-modal-img-wrap {
            height: 190px !important;
          }
          .blog-modal-body {
            padding: 20px 16px !important;
          }
        }
        @media (max-width: 480px) {
          [style*="padding: 56px 32px 40px"] { padding: 44px 16px 28px !important; }
          [style*="font-size: clamp(32px"] { font-size: 26px !important; }
        }
      `}</style>
    </div>
  );
}

function FeatureCard({ article, getTitle, getContent, getDate, lang, onClick, t }) {
  const imgs = articleImages(article);
  const hasImage = imgs.length > 0;
  const [hover, setHover] = useState(false);

  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: hover ? '0 12px 40px rgba(0,0,0,0.08)' : '0 4px 16px rgba(0,0,0,0.03)',
        transition: 'all 0.35s ease', transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        background: 'var(--bg-main)',
      }}
    >
      {hasImage && (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: 'var(--bg-subtle)' }}>
          <img src={imgs[0]} alt=""
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: hover ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.5s ease',
            }}
          />
          {article.category && (
            <span style={{
              position: 'absolute', top: 12, left: 12,
              background: ORANGE, color: '#fff',
              padding: '4px 12px', borderRadius: 100,
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
            }}>
              {article.category}
            </span>
          )}
        </div>
      )}
      <div style={{ padding: 24 }}>
        <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>
          {getDate(article).toLocaleDateString(localeFor(lang), { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: NAVY, margin: '8px 0 12px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {getTitle(article)}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {getContent(article)}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: `${ORANGE}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 800, color: ORANGE,
            }}>
              {(article.author || 'A')[0]}
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{article.author || 'AllThings'}</span>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 700, color: ORANGE, transition: 'gap 0.2s', gap: hover ? 8 : 4 }}>
            {t?.blogReadMore}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function HorizontalCard({ article, getTitle, getContent, getDate, lang, t, onClick }) {
  const imgs = articleImages(article);
  const hasImage = imgs.length > 0;
  const [hover, setHover] = useState(false);

  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="blog-horizontal-card"
    >
      {hasImage && (
        <div className="blog-horizontal-img">
          <img src={imgs[0]} alt=""
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: hover ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.5s ease',
            }}
          />
          {article.category && (
            <span style={{
              position: 'absolute', top: 12, left: 12,
              background: ORANGE, color: '#fff',
              padding: '4px 12px', borderRadius: 100,
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
            }}>
              {article.category}
            </span>
          )}
        </div>
      )}
      <div className="blog-horizontal-body">
        <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
          {getDate(article).toLocaleDateString(localeFor(lang), { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: NAVY, margin: '8px 0 12px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {getTitle(article)}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {getContent(article)}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', background: `${ORANGE}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: ORANGE,
            }}>
              {(article.author || 'A')[0]}
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{article.author || 'AllThings'}</span>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 700, color: ORANGE, transition: 'gap 0.2s', gap: hover ? 8 : 4 }}>
            {t?.blogReadMore}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
