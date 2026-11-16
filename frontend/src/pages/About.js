import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../LangContext';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../SiteSettingsContext';
import { useSiteImage } from '../siteImages';

/* ─── Reusable ─── */
const Reveal = ({ children, delay = 0, style }) => (
  <motion.div
    style={style}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
  >
    {children}
  </motion.div>
);

/* ─── SVG Icons ─── */
const Svg = ({ children, size = 24, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const SocialIcon = () => <Svg><path d="M17 2a2.83 2.83 0 1 1 0 5.66A2.83 2.83 0 0 1 17 2z"/><path d="M7 9.17a2.83 2.83 0 1 1 0 5.66A2.83 2.83 0 0 1 7 9.17z"/><path d="M17 16.17a2.83 2.83 0 1 1 0 5.66A2.83 2.83 0 0 1 17 16.17z"/><path d="M9.36 11.36l5.28-3.54M9.36 12.64l5.28 3.54"/></Svg>;
const ContentIcon = () => <Svg><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></Svg>;
const GrowthIcon = () => <Svg><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></Svg>;
const AdsIcon = () => <Svg><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v6M9 10h6"/></Svg>;
const BrandIcon = () => <Svg><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18"/><circle cx="12" cy="12" r="3"/></Svg>;
const OutdoorIcon = () => <Svg><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21V9"/></Svg>;
const EcomIcon = () => <Svg><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></Svg>;
const ConsultIcon = () => <Svg><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/><path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z"/></Svg>;

/* ─── Stat Card ─── */
function StatCard({ num, label, icon }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: 'var(--bg-main)', borderRadius: 20, padding: '32px 24px', textAlign: 'center',
      boxShadow: h ? '0 16px 40px rgba(255,122,0,0.12)' : '0 4px 20px rgba(0,0,0,0.04)',
      transform: h ? 'translateY(-6px)' : 'none',
      transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)', cursor: 'default', border: '1px solid rgba(0,0,0,0.04)',
    }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,var(--primary),#ff9a44)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        {icon}
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--primary)', marginBottom: 4 }}>{num}</div>
      <div style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

/* ─── Service Card ─── */
function ServiceCard({ svc }) {
  const { t } = useLang();
  const [h, setH] = useState(false);
  const [isMobile] = useState(() => window.innerWidth <= 768);
  const handleTap = () => { if (isMobile) setH(p => !p); };

  return (
    <div className="about-svc-card" onClick={handleTap}
      onMouseEnter={() => setH(true)} onMouseLeave={() => { if (!isMobile) setH(false); }}
      style={{
        background: 'var(--bg-main)', border: '2px solid rgba(30,41,59,0.1)',
        borderRadius: isMobile ? 24 : 32, padding: isMobile ? '20px 16px' : '32px 24px',
        paddingTop: isMobile ? 80 : 120, position: 'relative', textAlign: 'center',
        boxShadow: h ? '0 16px 40px -8px rgba(255,122,0,0.12)' : '0 4px 20px rgba(0,0,0,0.04)',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)', height: '100%', cursor: 'pointer',
        transform: h ? 'translateY(-4px)' : 'none',
      }}
    >
      <div style={{
        position: 'absolute', top: isMobile ? 16 : 24, left: '50%', transform: 'translateX(-50%)',
        width: isMobile ? 64 : 96, height: isMobile ? 64 : 96,
        background: 'linear-gradient(135deg, var(--primary) 0%, #ff9a44 100%)',
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 30px rgba(255,122,0,0.2)',
      }}>
        <div style={{ transform: isMobile ? 'scale(0.6)' : 'none' }}>{svc.icon}</div>
      </div>
      <h3 style={{ fontSize: isMobile ? 15 : 20, fontWeight: 900, fontStyle: 'italic', marginBottom: isMobile ? 8 : 14, color: 'var(--secondary)' }}>{svc.title}</h3>
      {isMobile && !h && <p style={{ color: 'var(--primary)', fontSize: 17, fontWeight: 700, margin: 0, marginTop: 4 }}>{t.mpTapToRead}</p>}
      <div style={{ overflow: 'hidden', maxHeight: h ? 140 : 0, opacity: h ? 1 : 0, transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: isMobile ? 13 : 15, lineHeight: 1.6 }}>{svc.desc}</p>
      </div>
    </div>
  );
}

/* ─── Value Card (for Vision/Mission/Values/Commitment) ─── */
function ValueCard({ title, text, color, icon }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: 'var(--bg-main)', borderRadius: 24, padding: '40px 28px', textAlign: 'center',
      boxShadow: h ? '0 20px 50px rgba(0,0,0,0.08)' : '0 4px 20px rgba(0,0,0,0.04)',
      transform: h ? 'translateY(-6px)' : 'none',
      transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)', border: '1px solid rgba(0,0,0,0.04)',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%', background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px', boxShadow: `0 8px 24px ${color}33`,
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12, color: 'var(--secondary)' }}>{title}</h3>
      <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{text}</p>
    </div>
  );
}

/* ─── Core Value Pill ─── */
function CoreValuePill({ title, desc, img }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: 'var(--bg-main)', borderRadius: 20, padding: '32px 24px',
      boxShadow: h ? '0 16px 40px rgba(0,0,0,0.08)' : '0 4px 16px rgba(0,0,0,0.04)',
      transform: h ? 'translateY(-4px)' : 'none',
      transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)', border: '1px solid rgba(0,0,0,0.04)',
    }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
        <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <h4 style={{ fontSize: 17, fontWeight: 800, marginBottom: 10, color: 'var(--secondary)' }}>{title}</h4>
      <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

/* ─── Strategic Objective Card ─── */
function ObjectiveCard({ text, index, total }) {
  const [h, setH] = useState(false);
  const colors = ['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899'];
  const color = colors[(index - 1) % colors.length];
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: 'var(--bg-main)', borderRadius: 24, padding: '36px 28px', textAlign: 'center',
      boxShadow: h ? `0 20px 50px ${color}18` : '0 4px 20px rgba(0,0,0,0.04)',
      transform: h ? 'translateY(-6px)' : 'none',
      transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)', border: '1px solid rgba(0,0,0,0.04)',
      position: 'relative',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%', background: color,
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 900, fontSize: 20, margin: '0 auto 18px',
        boxShadow: `0 8px 24px ${color}30`,
      }}>{index}</div>
      <h4 style={{ fontSize: 17, fontWeight: 700, color: 'var(--secondary)', lineHeight: 1.5, margin: 0 }}>{text}</h4>
      {index < total && (
        <div className="obj-connector" style={{
          position: 'absolute', top: 28, right: -24, width: 48, height: 2,
          background: `linear-gradient(90deg, ${color}, ${color}40)`,
        }} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════ */
export default function About() {
  const { t } = useLang();
  const { about } = useSiteSettings();
  const aboutBanner = useSiteImage('img_about_banner');
  const rootsImg = useSiteImage('img_footer_logo');

  const statIcons = [
    <Svg size={26} key="si0"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Svg>,
    <Svg size={26} key="si1"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></Svg>,
    <Svg size={26} key="si2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Svg>,
    <Svg size={26} key="si3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Svg>,
  ];
  const aboutStats = (about.stats || []).map((s, i) => ({ ...s, icon: statIcons[i % statIcons.length] }));

  const values = [
    { title: t.vision, text: t.visionText, color: '#3B82F6', icon: <Svg size={28}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></Svg> },
    { title: t.mission, text: t.missionText, color: '#F97316', icon: <Svg size={28}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></Svg> },
    { title: t.ourCoreValues + ' ' + t.ourCoreValuesHighlight, text: t.cv1Title + '. ' + t.cv2Title + '. ' + t.cv3Title + '. ' + t.cv4Title + '. ' + t.cv5Title + '.', color: '#10B981', icon: <Svg size={28}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></Svg> },
    { title: t.aboutCommitment, text: t.aboutCatalyst, color: '#8B5CF6', icon: <Svg size={28}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Svg> },
  ];

  const coreValues = [
    { img: '/images/innovation and creativity.jpg', title: t.cv1Title, desc: t.cv1Desc },
    { img: '/images/strategy.jpg', title: t.cv2Title, desc: t.cv2Desc },
    { img: '/images/intgrety and transparency.jpg', title: t.cv3Title, desc: t.cv3Desc },
    { img: '/images/customer centered.jpg', title: t.cv4Title, desc: t.cv4Desc },
    { img: '/images/market linkage.jpg', title: t.cv5Title, desc: t.cv5Desc },
  ];

  const services = [
    { icon: <SocialIcon />, title: t.svcSocialMedia, desc: t.svcSocialMediaDesc },
    { icon: <ContentIcon />, title: t.svcContentCreation, desc: t.svcContentDesc },
    { icon: <GrowthIcon />, title: t.svcGrowthStrategy, desc: t.svcGrowthDesc },
    { icon: <AdsIcon />, title: t.svcPaidAds, desc: t.svcAdsDesc },
    { icon: <BrandIcon />, title: t.svcBranding, desc: t.svcBrandingDesc },
    { icon: <OutdoorIcon />, title: t.svcOutdoor, desc: t.svcOutdoorDesc },
    { icon: <EcomIcon />, title: t.svcEcommerce, desc: t.svcEcomDesc },
    { icon: <ConsultIcon />, title: t.svcConsultation, desc: t.svcConsultDesc },
  ];

  return (
    <div style={{ paddingTop: 0, maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* ═══ HERO ═══ */}
      <section className="about-hero" style={{
        position: 'relative', overflow: 'hidden', background: 'var(--bg-main)',
      }}>
        <div style={{
          position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '56px 32px',
          display: 'flex', alignItems: 'center', gap: 40,
        }}>
          <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 0' }}>
            <Reveal delay={0.1}>
              <h1 style={{ fontSize: 'clamp(26px, 3.8vw, 38px)', color: 'var(--secondary)', fontWeight: 900, lineHeight: 1.15, marginBottom: 16 }}>
                {t.aboutHeroTitle1} <span style={{ color: 'var(--primary)' }}>{t.aboutHeroTitle2}</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.7, maxWidth: 520 }}>
                {t.aboutSub} <span style={{ color: 'var(--primary)', fontWeight: 800 }}>All Things Solution</span> {t.aboutCatalyst}
              </p>
            </Reveal>
          </div>
          <div style={{ flex: '1 1 50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: 480, borderRadius: 32, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.12)' }}>
              <img src={aboutBanner} alt="AllThings" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </div>
        <style>{`
          @media (max-width: 1024px) {
            .about-hero > div { flex-direction: column !important; gap: 24px !important; }
            .about-hero [style*="maxWidth: 480"] { max-width: 100% !important; }
          }
        `}</style>
      </section>

      {/* ═══ MISSION / VISION / VALUES / COMMITMENT ═══ */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 32px' }}>
        <div className="about-values-top-grid" style={{ display: 'grid', gap: 20 }}>
          {values.map((v, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <ValueCard {...v} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ OUR ROOTS ═══ */}
      <section style={{ background: 'var(--bg-subtle)', padding: '56px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 48, alignItems: 'center', flexWrap: 'wrap' }}>
          <Reveal style={{ flex: '1 1 440px', minWidth: 300 }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', top: -20, left: -20, right: 20, bottom: 20,
                border: '2px solid var(--primary)', borderRadius: 32, zIndex: -1
              }} />
              <img src={rootsImg} alt={t.ourRoots} style={{
                width: '100%', height: 500, objectFit: 'cover', borderRadius: 32,
                boxShadow: '0 40px 80px rgba(0,0,0,0.15)'
              }} className="about-roots-img" />
            </div>
          </Reveal>
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <Reveal delay={0.2}>
              <div style={{ display: 'inline-block', background: 'rgba(255,122,0,0.15)', color: 'var(--primary)', padding: '6px 18px', borderRadius: 100, fontSize: 17, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
                {t.ourRoots}
              </div>
              <h2 style={{ fontSize: 'clamp(20px, 3vw, 26px)', marginBottom: 24, fontWeight: 700, color: 'var(--secondary)' }}>
                {t.bridgingTitle} <span className="serif-title" style={{ color: 'var(--primary)', fontStyle: 'italic' }}>{t.bridgingHighlight}</span>
              </h2>
              <p style={{ lineHeight: 1.8, marginBottom: 28, fontSize: 15, color: 'var(--text-muted)' }}>
                {t.rootsText}
              </p>
              <a href="#services" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', background: 'linear-gradient(135deg,var(--primary),#ff9a44)',
                color: '#fff', borderRadius: 100, fontWeight: 700, fontSize: 17,
                boxShadow: '0 6px 20px rgba(255,122,0,0.25)',
                transition: 'transform 0.3s, box-shadow 0.3s', textDecoration: 'none',
              }}>
                {t.ourStory}
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ WHO WE ARE + STATS ═══ */}
      <section style={{ background: 'var(--bg-subtle)', padding: '56px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 440px' }}>
            <Reveal>
              <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 26px)', marginBottom: 16 }}>{t.whoWeAre}</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: 16, marginBottom: 20 }}>
                {t.whoWeAreText}
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <a href="#services" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', background: 'linear-gradient(135deg,var(--primary),#ff9a44)',
                color: '#fff', borderRadius: 100, fontWeight: 700, fontSize: 17,
                boxShadow: '0 6px 20px rgba(255,122,0,0.25)',
                transition: 'transform 0.3s, box-shadow 0.3s', textDecoration: 'none',
              }}>
                {t.aboutLearnMore}
              </a>
            </Reveal>
          </div>
          <div style={{ flex: '1 1 400px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {aboutStats.map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <StatCard {...s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHY CHOOSE US / SERVICES ═══ */}
      <section id="services" style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 32px' }}>
        <Reveal>
          <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 26px)', marginBottom: 8 }}>
            {t.aboutWhyChoose} <span style={{ color: 'var(--primary)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>AllThings Solution</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 16 }}>{t.servicesBoost}</p>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {services.map((svc, idx) => (
            <Reveal key={idx} delay={idx * 0.05}>
              <ServiceCard svc={svc} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ CORE VALUES ═══ */}
      <section style={{ background: 'var(--bg-subtle)', padding: '56px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 26px)', marginBottom: 32, textAlign: 'center' }}>
              {t.ourCoreValues} <span style={{ color: 'var(--primary)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>{t.ourCoreValuesHighlight}</span>
            </h2>
          </Reveal>
          <div className="about-values-grid" style={{ display: 'grid', gap: 16 }}>
            {coreValues.map((v, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <CoreValuePill {...v} />
              </Reveal>
            ))}
          </div>
          <style>{`
            .about-values-grid { grid-template-columns: repeat(5, 1fr); }
            @media (max-width: 900px) { .about-values-grid { grid-template-columns: repeat(3, 1fr); } }
            @media (max-width: 640px) { .about-values-grid { grid-template-columns: repeat(2, 1fr); gap: 10px !important; } }
            @media (max-width: 400px) { .about-values-grid { grid-template-columns: 1fr !important; } }
          `}</style>
        </div>
      </section>

      {/* ═══ STRATEGIC OBJECTIVES ═══ */}
      <section style={{ background: 'var(--bg-subtle)', padding: '56px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontSize: 'clamp(20px, 2.8vw, 26px)', marginBottom: 32, textAlign: 'center' }}>
              {t.strategic} <span style={{ color: 'var(--primary)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>{t.strategicHighlight}</span>
            </h2>
          </Reveal>
          <div className="about-obj-grid" style={{ display: 'grid', gap: 20 }}>
            {[t.so1, t.so2, t.so3, t.so4, t.so5].map((obj, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <ObjectiveCard text={obj} index={i + 1} total={5} />
              </Reveal>
            ))}
          </div>
        </div>
        <style>{`
          .about-obj-grid { grid-template-columns: repeat(5, 1fr); }
          .obj-connector { display: block; }
          @media (max-width: 900px) {
            .about-obj-grid { grid-template-columns: repeat(3, 1fr); }
            .obj-connector { display: none; }
          }
          @media (max-width: 640px) {
            .about-obj-grid { grid-template-columns: repeat(2, 1fr); gap: 10px !important; }
          }
          @media (max-width: 400px) {
            .about-obj-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* ═══ RESPONSIVE ═══ */}
      <style>{`
        .about-values-top-grid { grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 1024px) {
          .about-hero { flex-direction: column !important; }
        }
        @media (max-width: 900px) {
          .about-values-top-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .about-values-top-grid { grid-template-columns: 1fr !important; }
          .about-roots-img { height: 300px !important; border-radius: 20px !important; }
        }
        @media (max-width: 400px) {
          .about-roots-img { height: 220px !important; }
        }
      `}</style>
    </div>
  );
}
