import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLang, localeFor } from '../LangContext';

const Reveal = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}>
    {children}
  </motion.div>
);

const CONTENT = {
  'terms': {
    tag: 'legalTag',
    title: 'legalTermsTitle',
    intro: 'legalTermsIntro',
    sections: [
      { heading: 'legalTermsS1Heading', body: 'legalTermsS1Body' },
      { heading: 'legalTermsS2Heading', body: 'legalTermsS2Body' },
      { heading: 'legalTermsS3Heading', body: 'legalTermsS3Body' },
      { heading: 'legalTermsS4Heading', body: 'legalTermsS4Body' },
      { heading: 'legalTermsS5Heading', body: 'legalTermsS5Body' },
      { heading: 'legalTermsS6Heading', body: 'legalTermsS6Body' },
      { heading: 'legalTermsS7Heading', body: 'legalTermsS7Body' },
      { heading: 'legalTermsS8Heading', body: 'legalTermsS8Body' },
      { heading: 'legalTermsS9Heading', body: 'legalTermsS9Body' },
    ],
  },
  'privacy-policy': {
    tag: 'legalTag',
    title: 'legalPrivacyTitle',
    intro: 'legalPrivacyIntro',
    sections: [
      { heading: 'legalPrivacyS1Heading', body: 'legalPrivacyS1Body' },
      { heading: 'legalPrivacyS2Heading', body: 'legalPrivacyS2Body' },
      { heading: 'legalPrivacyS3Heading', body: 'legalPrivacyS3Body' },
      { heading: 'legalPrivacyS4Heading', body: 'legalPrivacyS4Body' },
      { heading: 'legalPrivacyS5Heading', body: 'legalPrivacyS5Body' },
      { heading: 'legalPrivacyS6Heading', body: 'legalPrivacyS6Body' },
      { heading: 'legalPrivacyS7Heading', body: 'legalPrivacyS7Body' },
    ],
  },
  'billing-policy': {
    tag: 'legalTag',
    title: 'legalBillingTitle',
    intro: 'legalBillingIntro',
    sections: [
      { heading: 'legalBillingS1Heading', body: 'legalBillingS1Body' },
      { heading: 'legalBillingS2Heading', body: 'legalBillingS2Body' },
      { heading: 'legalBillingS3Heading', body: 'legalBillingS3Body' },
      { heading: 'legalBillingS4Heading', body: 'legalBillingS4Body' },
      { heading: 'legalBillingS5Heading', body: 'legalBillingS5Body' },
    ],
  },
  'cookie-policy': {
    tag: 'legalTag',
    title: 'legalCookieTitle',
    intro: 'legalCookieIntro',
    sections: [
      { heading: 'legalCookieS1Heading', body: 'legalCookieS1Body' },
      { heading: 'legalCookieS2Heading', body: 'legalCookieS2Body' },
      { heading: 'legalCookieS3Heading', body: 'legalCookieS3Body' },
    ],
  },
  'copyright-infringement': {
    tag: 'legalTag',
    title: 'legalCopyrightTitle',
    intro: 'legalCopyrightIntro',
    sections: [
      { heading: 'legalCopyrightS1Heading', body: 'legalCopyrightS1Body' },
      { heading: 'legalCopyrightS2Heading', body: 'legalCopyrightS2Body' },
      { heading: 'legalCopyrightS3Heading', body: 'legalCopyrightS3Body' },
    ],
  },
};

export default function Legal() {
  const { t, lang } = useLang();
  const type = window.location.pathname.split('/')[1] || 'terms';
  const doc = CONTENT[type] || CONTENT.terms;

  return (
    <div style={{ paddingTop: 0, maxWidth: '100vw', overflowX: 'hidden' }}>
      <section style={{ background: 'var(--bg-subtle)', position: 'relative', overflow: 'hidden', minHeight: 320 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.55) 25%, rgba(255,255,255,0) 50%)' }} />
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '56px 32px', textAlign: 'left' }} className="legal-hero-inner">
          <Reveal>
            <div style={{ display: 'inline-block', background: 'rgba(255,122,0,0.12)', color: 'var(--primary)', padding: '6px 18px', borderRadius: 999, fontSize: 17, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
              {t[doc.tag]}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 12, color: 'var(--secondary)', maxWidth: 620 }}>
              {t[doc.title]}
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.7, maxWidth: 560 }}>
              {t[doc.intro]}
            </p>
          </Reveal>
        </div>
      </section>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 80px' }} className="legal-body">
        {/* Policy type switcher — horizontal bar above the document */}
        <nav className="legal-nav" aria-label={t.legalNavLabel}>
          {Object.keys(CONTENT).map(key => (
            <Link key={key} to={`/${key}`} className={key === type ? 'legal-nav-link is-active' : 'legal-nav-link'}>
              {t[CONTENT[key].title]}
            </Link>
          ))}
        </nav>

        <div className="legal-content">
            {doc.sections.map((s, i) => (
              <Reveal key={s.heading} delay={i * 0.05}>
                <div style={{ background: 'var(--bg-main)', borderRadius: 20, padding: '24px 28px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }} className="legal-card">
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--secondary)', marginBottom: 8 }}>{t[s.heading]}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.7, margin: 0 }}>{t[s.body]}</p>
                </div>
              </Reveal>
            ))}
            <Reveal>
              <p style={{ color: 'var(--text-light)', fontSize: 15, textAlign: 'center', paddingTop: 12 }}>
                {t.lastUpdated}: {new Date().toLocaleDateString(localeFor(lang), { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </Reveal>
        </div>
      </section>

      <style>{`
        :root.dark .privacy-hero-overlay, [data-theme="dark"] .privacy-hero-overlay {
          background: linear-gradient(90deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.55) 30%, rgba(15,23,42,0) 55%);
        }

        /* Horizontal policy switcher */
        .legal-nav {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 22px 0 26px;
          margin-bottom: 28px;
          border-bottom: 1px solid rgba(127,127,127,0.22);
        }
        .legal-nav-link {
          padding: 11px 20px;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          background: var(--bg-main);
          color: var(--text-muted);
          border: 1px solid rgba(127,127,127,0.2);
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .legal-nav-link:hover {
          color: var(--primary);
          border-color: var(--primary);
          transform: translateY(-2px);
        }
        .legal-nav-link.is-active {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary);
          box-shadow: 0 4px 16px rgba(255,122,0,0.25);
        }

        @media (max-width: 768px) {
          .legal-hero-inner { padding: 40px 20px !important; }
          .legal-body { padding: 0 16px 60px !important; }
          .legal-nav {
            flex-wrap: nowrap;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding-bottom: 20px;
          }
          .legal-nav::-webkit-scrollbar { display: none; }
          .legal-nav-link { flex: 0 0 auto; padding: 9px 16px !important; font-size: 14px !important; }
          .legal-content { gap: 16px !important; }
          .legal-card { padding: 18px 16px !important; }
        }
      `}</style>
    </div>
  );
}