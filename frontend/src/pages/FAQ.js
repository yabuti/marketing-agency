import React, { useState, useMemo, useEffect } from 'react';
import { useLang } from '../LangContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../SiteSettingsContext';
import { useSiteImage } from '../siteImages';

const Reveal = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}>
    {children}
  </motion.div>
);

const FAQ_KEYS = [
  { q: 'faq1q', a: 'faq1a', cat: 'account' },
  { q: 'faq2q', a: 'faq2a', cat: 'selling' },
  { q: 'faq3q', a: 'faq3a', cat: 'buying' },
  { q: 'faq4q', a: 'faq4a', cat: 'payments' },
  { q: 'faq5q', a: 'faq5a', cat: 'delivery' },
  { q: 'faq6q', a: 'faq6a', cat: 'buying' },
  { q: 'faq7q', a: 'faq7a', cat: 'account' },
  { q: 'faq8q', a: 'faq8a', cat: 'account' },
];

const CATEGORIES = [
  { key: 'all', labelKey: 'faqCatAll' },
  { key: 'account', labelKey: 'faqCatAccount' },
  { key: 'buying', labelKey: 'faqCatBuying' },
  { key: 'selling', labelKey: 'faqCatSelling' },
  { key: 'payments', labelKey: 'faqCatPayments' },
  { key: 'delivery', labelKey: 'faqCatDelivery' },
];

export default function FAQ() {
  const { t } = useLang();
  const { contact } = useSiteSettings();
  const faqHero = useSiteImage('img_faq_hero');
  const phones = (contact.phones || []).filter(Boolean);
  const supportLinks = [
    ...phones.map((p, i) => ({ icon: i === 0 ? '📞' : '📱', label: t.faqPhoneLabel(i + 1), value: p })),
    { icon: '🕐', label: t.faqSupportHours, value: contact.hours },
  ];
  const [openIndex, setOpenIndex] = useState(null);
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = FAQ_KEYS;
    if (activeCat !== 'all') list = list.filter(f => f.cat === activeCat);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(f => t[f.q].toLowerCase().includes(s) || t[f.a].toLowerCase().includes(s));
    }
    return list;
  }, [activeCat, search, t]);

  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div style={{ paddingTop: 0, maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* ═══ HERO ═══ */}
      <section style={{ background: 'var(--bg-subtle)', position: 'relative', overflow: 'hidden', minHeight: 320 }}>
        <img
          src={faqHero}
          alt="FAQ"
          onLoad={() => setImgLoaded(true)}
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.5s ease',
          }}
        />
        <div className="faq-hero-overlay" style={{
          position: 'absolute', inset: 0,
        }} />
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '56px 32px', textAlign: 'left' }}>
          <Reveal delay={0.1}>
            <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 12, color: 'var(--secondary)', maxWidth: 520 }}>
              {t.faqHeroA} <span style={{ color: 'var(--primary)' }}>{t.faqHeroB}</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.7, maxWidth: 480 }}>
              {t.faqSubtitle}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ SEARCH + FILTERS ═══ */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px 0' }}>
        <Reveal>
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder={t.faqSearchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '16px 20px 16px 52px', borderRadius: 16,
                border: '2px solid rgba(127,127,127,0.25)', fontSize: 16, outline: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)', background: 'var(--bg-main)', color: 'var(--secondary)',
                transition: 'border-color 0.3s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'rgba(127,127,127,0.25)'}
            />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 48 }}>
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setActiveCat(c.key)} style={{
                padding: '10px 22px', borderRadius: 100, fontSize: 17, fontWeight: 700,
                border: activeCat === c.key ? 'none' : '1px solid rgba(127,127,127,0.35)',
                background: activeCat === c.key ? 'var(--primary)' : 'var(--bg-main)',
                color: activeCat === c.key ? '#fff' : 'var(--text-muted)',
                boxShadow: activeCat === c.key ? '0 4px 16px rgba(255,122,0,0.25)' : '0 2px 8px rgba(0,0,0,0.03)',
                transition: 'all 0.3s', cursor: 'pointer',
              }}>{t[c.labelKey]}</button>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ═══ FAQ CONTENT ═══ */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 80px', display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Accordion */}
        <div style={{ flex: '1 1 560px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.length === 0 && (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-light)', fontSize: 16 }}>
              {t.faqNoMatch}
            </div>
          )}
          {filtered.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.04}>
              <div style={{
                background: 'var(--bg-main)', borderRadius: 20,
                border: openIndex === i ? '2px solid rgba(255,122,0,0.2)' : '1px solid rgba(0,0,0,0.05)',
                boxShadow: openIndex === i ? '0 8px 30px rgba(255,122,0,0.08)' : '0 2px 12px rgba(0,0,0,0.03)',
                transition: 'all 0.3s',
              }}>
                <button onClick={() => setOpenIndex(openIndex === i ? null : i)} style={{
                  width: '100%', padding: '20px 24px', background: 'none', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 12, fontSize: 17, fontWeight: 700, color: 'var(--secondary)', textAlign: 'left',
                }}>
                  <span>{t[item.q]}</span>
                  <span style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: openIndex === i ? 'var(--primary)' : 'var(--bg-subtle)',
                    color: openIndex === i ? '#fff' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 800,
                    transition: 'all 0.3s',
                  }}>
                    {openIndex === i ? '−' : '+'}
                  </span>
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p style={{
                        padding: '0 24px 20px', margin: 0, color: 'var(--text-muted)',
                        fontSize: 16, lineHeight: 1.7,
                        borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: 16,
                      }}>
                        {t[item.a]}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Sidebar */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 100 }}>
          {/* Support Card */}
          <Reveal delay={0.2}>
            <div style={{
              background: 'linear-gradient(135deg, #1E293B, #0F172A)',
              borderRadius: 24, padding: '32px 28px', color: '#fff',
            }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8, color: '#fff' }}>{t.faqStillTitle}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>
                {t.faqStillDesc}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                {supportLinks.map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 18, width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{l.icon}</span>
                    <div>
                      <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{l.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{l.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/contact" style={{
                display: 'block', textAlign: 'center', padding: '12px 0', borderRadius: 12,
                background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: 17,
                textDecoration: 'none', boxShadow: '0 4px 16px rgba(255,122,0,0.3)',
}}>{t.faqContactSupport}</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ CAN'T FIND CTA ═══ */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 80px' }}>
        <Reveal>
          <div className="faq-cta-card" style={{
            background: 'linear-gradient(135deg, var(--bg-subtle) 0%, #FFF8F0 100%)',
            borderRadius: 24, padding: '40px 32px', textAlign: 'center',
            border: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap',
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, var(--primary), #ff9a44)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(255,122,0,0.2)', flexShrink: 0 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div style={{ textAlign: 'left', flex: '1 1 300px' }}>
              <h4 style={{ fontSize: 18, fontWeight: 900, marginBottom: 4, color: 'var(--secondary)' }}>{t.faqCtaTitle}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>{t.faqCtaDesc}</p>
            </div>
            <Link to="/contact" style={{
              display: 'inline-block', padding: '12px 32px', borderRadius: 12,
              background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: 17,
              textDecoration: 'none', boxShadow: '0 4px 16px rgba(255,122,0,0.25)',
              flexShrink: 0,
            }}>{t.faqContactSupport}</Link>
          </div>
        </Reveal>
      </section>

      {/* ═══ RESPONSIVE ═══ */}
      <style>{`
        .faq-hero-overlay { background: linear-gradient(90deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.55) 25%, rgba(255,255,255,0) 50%); }
        @media (max-width: 768px) {
          .faq-sidebar-row { flex-direction: column !important; }
          .faq-hero-overlay { background: linear-gradient(90deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.42) 50%, rgba(255,255,255,0.12) 100%) !important; }
        }
        :root.dark .faq-hero-overlay, [data-theme="dark"] .faq-hero-overlay {
          background: linear-gradient(90deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.55) 30%, rgba(15,23,42,0) 55%);
        }
        :root.dark .faq-cta-card, [data-theme="dark"] .faq-cta-card {
          background: linear-gradient(135deg, var(--bg-subtle) 0%, #241D14 100%) !important;
          border-color: rgba(255,255,255,0.06) !important;
        }
      `}</style>
    </div>
  );
}
