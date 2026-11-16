import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useLang } from '../LangContext';
import { useSiteSettings } from '../SiteSettingsContext';
// SocialIcons removed — using old global Footer
import AdBanner from '../components/AdBanner';
import API from '../api';
import { categoryImage, PRODUCT_CATEGORIES, CATEGORY_ICONS, normalizeCategory, categoryDisplayName } from '../constants';
import { useSiteImage } from '../siteImages';

const Reveal = ({ children, width = "100%", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }}>
      <motion.div
        variants={{ hidden: { opacity: 0, y: 75 }, visible: { opacity: 1, y: 0 } }}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      >
        {children}
      </motion.div>
    </div>
  );
};

const MagneticBtn = ({ children, to, className, style }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handle = (e) => {
    const b = ref.current.getBoundingClientRect();
    setPos({ x: (e.clientX - (b.left + b.width / 2)) * 0.3, y: (e.clientY - (b.top + b.height / 2)) * 0.3 });
  };
  const reset = () => setPos({ x: 0, y: 0 });
  return (
    <motion.div ref={ref} onMouseMove={handle} onMouseLeave={reset} animate={{ x: pos.x, y: pos.y }} transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}>
      <Link to={to} className={className} style={style}>{children}</Link>
    </motion.div>
  );
};

function StatCard({ value, label, delay }) {
  const [count, setCount] = useState(0);
  const numeric = parseInt(value, 10);
  const suffix = value.replace(String(numeric), '');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (inView && numeric > 0) {
      const step = Math.max(Math.floor(2000 / numeric), 20);
      const t = setInterval(() => { setCount(c => { const n = c + 1; return n >= numeric ? (clearInterval(t), numeric) : n; }); }, step);
      return () => clearInterval(t);
    }
  }, [inView, numeric]);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay }}
      style={{ textAlign: 'center', background: 'var(--bg-main)', border: '1px solid #000', borderRadius: 12, padding: '8px 14px', flex: '1 1 0', minWidth: 0 }}>
      <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary)', lineHeight: 1.2 }}>{count}{suffix}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, lineHeight: 1.25, overflowWrap: 'break-word' }}>{label}</div>
    </motion.div>
  );
}

// ─── Icons ───
const Icon = ({ children, w = 22 }) => <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
const Hi = () => <Icon><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Icon>;
const Bi = () => <Icon><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></Icon>;
const Si = () => <Icon><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></Icon>;
const Ai = () => <Icon><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></Icon>;
const Ci = () => <Icon><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Icon>;
const Ni = () => <Icon><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></Icon>;
const Ti = () => <Icon><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>;
const SearchIcon = () => <Icon w={20}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Icon>;
const BellIcon = () => <Icon><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></Icon>;
const ChevronDown = () => <Icon><polyline points="6 9 12 15 18 9"/></Icon>;

// ─── Styles ───
const s = {
  section: { padding: '40px 0' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '0 32px' },
  tag: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,122,0,0.08)', color: 'var(--primary)', padding: '6px 14px', borderRadius: 100, fontWeight: 800, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 },
  h2: { fontSize: 22, fontWeight: 700, color: 'var(--secondary)', marginBottom: 10 },
  h3: { fontSize: 18, fontWeight: 700, color: 'var(--secondary)', marginBottom: 8 },
};

// ─── Section Components ───

const TopHeader = () => {
  const { t } = useLang();
  const isSeller = !!localStorage.getItem('userToken');
  const isBuyer = !!localStorage.getItem('buyerToken');
  const isLogged = isSeller || isBuyer;

  let initial = '?';
  if (isLogged) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const buyer = JSON.parse(localStorage.getItem('buyer') || 'null');
      const profile = user || buyer;
      const fullName = profile?.full_name || profile?.company_name || '';
      initial = fullName.trim().charAt(0).toUpperCase() || (isSeller ? 'S' : 'B');
    } catch { initial = isSeller ? 'S' : 'B'; }
  }

  return (
    <header style={{
      position: 'sticky', top: 0, left: 0, right: 0, zIndex: 999,
      background: 'var(--bg-main)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <a href={isLogged ? '/dashboard' : '/register'} style={{ whiteSpace: 'nowrap', padding: '8px 20px', background: 'var(--primary)', color: '#fff', borderRadius: 100, fontWeight: 700, fontSize: 17, textDecoration: 'none' }}>
          {isLogged ? t.mpTopDashboard : t.mpTopRegister}
        </a>

        <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
          <BellIcon />
          <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#EF4444', borderRadius: '50%' }} />
        </button>

        <Link to={isSeller ? '/dashboard' : isBuyer ? '/buyer-dashboard' : '/login'} style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 17, textDecoration: 'none' }}>
          {initial}
        </Link>
      </div>
      </header>
  );
};

const HeroSection = ({ productCount = 0, businessCount = 0, cityCount = 0, satisfaction = '98' }) => {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const homeBanner = useSiteImage('img_home_banner');

  return (
    <section ref={ref} className="hero-section" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, var(--bg-subtle) 0%, var(--bg-main) 50%, var(--bg-subtle) 100%)' }}>
      <div className="hm-container" style={s.container}>
        <div className="hero-row" style={{ display: 'flex', alignItems: 'center', gap: 40, minHeight: 'auto', padding: '48px 0 24px' }}>
          <div className="hero-text" style={{ flex: '1 1 55%' }}>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15, duration: 0.8 }} style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.15, color: 'var(--secondary)', marginBottom: 16 }}>
              {t.mpHeroTitle} <span style={{ color: 'var(--primary)' }}>{t.mpHeroTitleHighlight}</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3, duration: 0.8 }} style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 32, maxWidth: 540 }}>
              {t.mpHeroDesc}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.45, duration: 0.8 }} className="hero-buttons" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
              <MagneticBtn to="/bazaar" className="btn-primary" style={{ fontSize: 16 }}>
                {t.mpStartShopping}
              </MagneticBtn>
              <MagneticBtn to="/register" className="btn-outline" style={{ fontSize: 16 }}>
                {t.mpRegisterBusiness}
              </MagneticBtn>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.6, duration: 0.8 }} className="hero-stats" style={{ display: 'flex', gap: 8 }}>
              <StatCard value={String(businessCount || 5)} label={t.mpStatBusinesses} delay={0.7} />
              <StatCard value={String(productCount || 50)} label={t.mpStatProducts} delay={0.8} />
              <StatCard value={String(cityCount || 5)} label={t.mpStatCities} delay={0.9} />
              <StatCard value={`${satisfaction}%`} label={t.mpStatSatisfaction} delay={1.0} />
            </motion.div>
          </div>

          <motion.div className="hero-image" initial={{ opacity: 0, scale: 0.9 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 0.3, duration: 1 }} style={{ flex: '1 1 45%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="hero-img-box" style={{ width: '100%', maxWidth: 420, aspectRatio: '4/3', borderRadius: 40, overflow: 'hidden', position: 'relative', boxShadow: '0 40px 80px rgba(255,122,0,0.1)' }}>
              <img src={homeBanner} alt="Marketplace" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,122,0,0.1) 0%, transparent 50%)' }} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const SearchBox = ({ categories = [], locations = [] }) => {
  const { t } = useLang();
  return (
    <section className="search-box-section" style={{ marginTop: -30, position: 'relative', zIndex: 5 }}>
      <div className="hm-container" style={s.container}>
        <div className="search-box-card" style={{ background: 'var(--bg-main)', borderRadius: 20, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
          <div className="search-box-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, display: 'block' }}>{t.mpSearchCategory}</label>
              <select style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', background: 'var(--bg-subtle)', fontSize: 16, color: 'var(--text-muted)' }}>
                <option>{t.mpSearchAllCategories}</option>
                {categories.map(c => <option key={c.name}>{categoryDisplayName(t, c.name)}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, display: 'block' }}>{t.mpSearchLocation}</label>
              <select style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', background: 'var(--bg-subtle)', fontSize: 16, color: 'var(--text-muted)' }}>
                <option>{t.mpSearchAllCities}</option>
                {locations.map(loc => <option key={loc}>{loc}</option>)}
              </select>
            </div>
            <div style={{ flex: '2 1 300px' }}>
              <label style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, display: 'block' }}>{t.mpSearchBtn}</label>
              <div style={{ position: 'relative' }}>
                <input placeholder={t.mpSearchKeyword} style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', background: 'var(--bg-subtle)', fontSize: 16, outline: 'none' }} />
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}><SearchIcon /></span>
              </div>
            </div>
            <button style={{ padding: '12px 32px', background: 'var(--primary)', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 17, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {t.mpSearchBtn}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const TrustBadges = () => {
  const { t } = useLang();
  const badges = [
    { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>, title: t.mpTrustVerified, desc: t.mpTrustVerifiedDesc },
    { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, title: t.mpTrustSecure, desc: t.mpTrustSecureDesc },
    { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>, title: t.mpTrustReturns, desc: t.mpTrustReturnsDesc },
    { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, title: t.mpTrust247, desc: t.mpTrust247Desc },
  ];
  return (
    <section className="trust-badges" style={{ padding: '16px 0' }}>
      <div className="hm-container" style={s.container}>
        <div className="trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {badges.map((b, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'var(--bg-main)', borderRadius: 12, border: '1px solid rgba(255,122,0,0.25)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ width: 40, height: 40, background: 'rgba(255,122,0,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{b.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--secondary)', marginBottom: 1 }}>{b.title}</div>
                  <div style={{ fontSize: 16, color: 'var(--text-light)' }}>{b.desc}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const CategoriesSection = ({ categories = [] }) => {
  const { t } = useLang();
  const displayCategories = categories.length > 0 ? categories : PRODUCT_CATEGORIES.map(name => {
    const iconInfo = CATEGORY_ICONS[name.toLowerCase()] || { icon: '📦', color: '#F3F4F6' };
    return { name, icon: iconInfo.icon, color: iconInfo.color, count: 0 };
  });
  return (
    <section style={{ padding: '16px 0 24px' }}>
      <div className="hm-container" style={s.container}>
        <Reveal>
          <h2 style={{ ...s.h2, textAlign: 'center', fontSize: 22, marginBottom: 6 }}>{t.mpCatTitle} <span style={{ color: 'var(--primary)' }}>{t.mpCatTitleHighlight}</span></h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, textAlign: 'center', marginBottom: 16 }}>{t.mpCatDesc}</p>
        </Reveal>
        <div className="cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {displayCategories.map((c, i) => {
            const img = c.image || categoryImage(c.name);
            return (
              <Reveal key={i} delay={Math.min(i * 0.05, 0.3)}>
                <Link to={`/market?category=${encodeURIComponent(c.name)}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, boxSizing: 'border-box', padding: '18px 18px', background: c.color, borderRadius: 16, textDecoration: 'none', transition: 'all 0.3s', border: '2px solid transparent', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#EA580C'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'; }}
                >
                  {img ? (
                    <div style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                      <img src={img} alt={categoryDisplayName(t, c.name)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{c.icon}</div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{categoryDisplayName(t, c.name)}</div>
                    <div style={{ fontSize: 16, color: 'var(--text-light)', fontWeight: 600 }}>{c.count} {t.mpProducts}</div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const ClientsSection = () => {
  const { t } = useLang();
  const [clients, setClients] = useState([]);
  useEffect(() => {
    API.get('/clients')
      .then(r => setClients(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, []);
  if (!clients.length) return null;

  return (
    <section style={{ padding: '16px 0 24px' }}>
      <style>{`
        .clients-marquee { overflow: hidden; width: 100%; }
        .clients-track {
          display: flex;
          width: max-content;
          animation: clientsScroll 60s linear infinite;
        }
        .client-slide-card { flex: 0 0 auto; width: 330px; margin-right: 18px; }
        @media (max-width: 480px) { .client-slide-card { width: 260px; margin-right: 14px; } }
        @keyframes clientsScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div className="hm-container" style={s.container}>
        <Reveal>
          <h2 style={{ ...s.h2, textAlign: 'center', fontSize: 22, marginBottom: 6 }}>{t.ourPartners} <span style={{ color: 'var(--primary)' }}>{t.ourPartnersHighlight}</span></h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, textAlign: 'center', marginBottom: 14 }}>{t.partnersDesc}</p>
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <Link to="/all-clients" className="btn-outline" style={{ padding: '10px 22px', fontSize: 16, textDecoration: 'none' }}>
              {t.allClientsLabel || 'Customers'}
            </Link>
          </div>
        </Reveal>
        <div className="clients-marquee">
          <div className="clients-track">
            {[0, 1].map(group =>
              clients.map((c, i) => (
                <Link key={`${group}-${c.id}-${i}`} to={`/clients/${c.id}`} className="client-slide-card"
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg-main)', border: '1px solid #000', borderRadius: 16, padding: '16px 22px', boxSizing: 'border-box' }}
                >
                  <div style={{ width: 64, height: 64, borderRadius: 14, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(127,127,127,0.15)' }}>
                    {c.logo_url ? <img src={c.logo_url} alt={c.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 30 }}>🏢</span>}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                    <div style={{ color: 'var(--primary)', fontSize: 17, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.category || c.business_type || ''}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const PaymentsSection = () => {
  const { t } = useLang();
  const methods = [
    { img: '/logos/awash.png', name: 'Awash Bank' },
    { img: '/logos/dashn.jfif', name: 'Dashen Bank' },
    { img: '/logos/abisnya.jfif', name: 'Bank of Abyssinia' },
    { img: '/logos/abay.png', name: 'Abay Bank' },
    { img: '/logos/hbret.png', name: 'Hibret Bank' },
    { img: '/logos/zemen.jfif', name: 'Zemen Bank' },
  ];
  return (
    <section style={{ padding: '16px 0' }}>
      <div className="hm-container" style={s.container}>
        <Reveal>
          <h2 style={{ ...s.h2, textAlign: 'center', fontSize: 22, marginBottom: 6 }}>{t.mpPaymentsTitle} <span style={{ color: 'var(--primary)' }}>{t.mpPaymentsTitleHighlight}</span></h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, textAlign: 'center', marginBottom: 20 }}>{t.mpPaymentsDesc}</p>
        </Reveal>
        <Reveal>
          <div className="payments-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {methods.map((m, i) => (
              <div key={i} className="payments-pill" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, width: '100%', boxSizing: 'border-box', background: 'var(--bg-main)', border: '2px solid var(--primary)', borderRadius: 100, padding: '12px 22px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', overflow: 'hidden', background: '#fff', border: '1px solid rgba(255,122,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
                  <img src={m.img} alt={m.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="payments-pill-name" style={{ fontWeight: 800, fontSize: 17, color: 'var(--secondary)' }}>{m.name}</div>
                  <div className="payments-pill-desc" style={{ fontSize: 16, color: 'var(--primary)', fontWeight: 600 }}>{t.mpTrustSecureDesc}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const { t } = useLang();
  const { home } = useSiteSettings();
  const testimonials = (home.testimonials || []).map(tm => ({ ...tm, initial: ((tm.name || 'A').trim().charAt(0) || 'A').toUpperCase() }));
  return (
    <section style={{ padding: '16px 0' }}>
      <div className="hm-container" style={s.container}>
        <Reveal>
          <h2 style={{ ...s.h2, textAlign: 'center', fontSize: 22, marginBottom: 6 }}>{t.mpTestimonialTitle} <span style={{ color: 'var(--primary)' }}>{t.mpTestimonialTitleHighlight}</span></h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, textAlign: 'center', marginBottom: 20 }}>{t.mpTestimonialDesc}</p>
        </Reveal>
        <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {testimonials.map((tm, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div style={{ background: 'var(--bg-main)', border: '1px solid #000', borderRadius: 14, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ color: 'var(--primary)', fontSize: 16, letterSpacing: 3, marginBottom: 8 }}>★★★★★</div>
                <p style={{ color: 'var(--secondary)', fontSize: 16, lineHeight: 1.6, marginBottom: 14 }}>"{tm.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,122,0,0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 17 }}>{tm.initial}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--secondary)' }}>{tm.name}</div>
                    <div style={{ fontSize: 16, color: 'var(--text-light)' }}>{tm.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const Newsletter = () => {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true); setError('');
    try {
      await API.post('/newsletter/subscribe', { email: email.trim() });
      setSubscribed(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not subscribe. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ padding: '24px 0', background: 'var(--secondary)' }}>
      <div className="hm-container" style={s.container}>
        <Reveal>
          <div style={{ textAlign: 'center', color: 'var(--text-main)', maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ color: 'var(--text-main)', fontSize: 24, fontWeight: 700, marginBottom: 10 }}>{t.mpNewsletterTitle}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 20, lineHeight: 1.5 }}>{t.mpNewsletterDesc}</p>
            {!subscribed ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, maxWidth: 480, margin: '0 auto', flexWrap: 'wrap' }}>
                <input type="email" required placeholder={t.mpNewsletterPlaceholder} value={email} onChange={e => setEmail(e.target.value)} style={{ flex: '1 1 180px', minWidth: 0, boxSizing: 'border-box', padding: '14px 20px', borderRadius: 12, border: 'none', fontSize: 16, outline: 'none' }} />
                <button type="submit" disabled={loading} style={{ padding: '14px 28px', background: 'var(--primary)', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 17, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', opacity: loading ? 0.7 : 1 }}>
                  {loading ? '...' : t.mpNewsletterBtn}
                </button>
              </form>
            ) : (
              <div style={{ fontSize: 16, color: '#4ADE80', fontWeight: 600 }}>{t.mpNewsletterSuccess}</div>
            )}
            {error && <div style={{ fontSize: 16, color: '#FCA5A5', marginTop: 8 }}>{error}</div>}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// ─── Main Export ───

export default function Home() {
  const { home: homeSettings } = useSiteSettings();
  const [products, setProducts] = useState([]);
  const [managedCategories, setManagedCategories] = useState([]);
  useEffect(() => {
    API.get('/bazaar/products', { params: { scope: 'market' } })
      .then(r => {
        const data = r.data;
        setProducts(Array.isArray(data) ? data : (Array.isArray(data?.products) ? data.products : []));
      })
      .catch(() => {});
    API.get('/bazaar/categories')
      .then(r => {
        if (Array.isArray(r.data)) setManagedCategories(r.data);
      })
      .catch(() => {});
  }, []);

  const categories = useMemo(() => {
    // Exactly the canonical 8, in a fixed order — a 9th card never appears.
    const base = PRODUCT_CATEGORIES.map(name => {
      const iconInfo = CATEGORY_ICONS[name.toLowerCase()] || { icon: '📦', color: '#F3F4F6' };
      return { name, icon: iconInfo.icon, color: iconInfo.color, count: 0 };
    });
    const byName = new Map(base.map(c => [c.name.toLowerCase(), c]));

    products.forEach(p => {
      const canonical = normalizeCategory(p.category || '');
      if (!canonical) return;
      const key = canonical.toLowerCase();
      if (byName.has(key)) byName.get(key).count++;
    });

    // Merge admin-managed images onto the canonical cards.
    managedCategories.forEach(c => {
      const name = typeof c === 'string' ? c : (c.name || '');
      const canonical = normalizeCategory(name);
      if (!canonical) return;
      const key = canonical.toLowerCase();
      if (byName.has(key)) byName.get(key).image = typeof c === 'string' ? undefined : c.image;
    });

    return base;
  }, [products, managedCategories]);

  const locations = useMemo(() => {
    const seen = new Set();
    products.forEach(p => {
      const loc = (p.seller_location || '').trim();
      if (loc) seen.add(loc);
    });
    return Array.from(seen).sort();
  }, [products]);

  const stats = useMemo(() => {
    const sellerIds = new Set();
    const citySet = new Set();
    products.forEach(p => {
      if (p.seller_id) sellerIds.add(p.seller_id);
      if (p.seller_location) citySet.add(p.seller_location);
    });
    return {
      businessCount: sellerIds.size || Number(homeSettings.businessFallback) || 5,
      productCount: products.length || Number(homeSettings.productFallback) || 50,
      cityCount: citySet.size || Number(homeSettings.cityFallback) || 5,
    };
  }, [products, homeSettings]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden' }} className="home-marketplace">
      <TopHeader />
      <section className="home-ad" style={{ padding: '0', margin: 0 }}>
        <AdBanner />
      </section>
      <HeroSection productCount={stats.productCount} businessCount={stats.businessCount} cityCount={stats.cityCount} satisfaction={homeSettings.satisfaction || '98'} />
      <TrustBadges />
      <CategoriesSection categories={categories} />
      <ClientsSection />
      <PaymentsSection />
      <TestimonialsSection />

      <style>{`

        /* ─── Shop by Category cards (dark mode) ─── */
        :root.dark .cat-grid a, [data-theme="dark"] .cat-grid a {
          background: var(--bg-subtle) !important;
          border-color: var(--card-border) !important;
        }
        :root.dark .cat-grid a:hover, [data-theme="dark"] .cat-grid a:hover {
          box-shadow: 0 10px 24px rgba(0,0,0,0.35) !important;
        }
        :root.dark .cat-grid a > div > div, [data-theme="dark"] .cat-grid a > div > div {
          background: rgba(255,255,255,0.08) !important;
        }

        /* ─── Hero ─── */
        .hero-row { display: flex; align-items: center; gap: 32px; padding: 0; }
        .hero-text { flex: 1 1 55%; }
        .hero-image { flex: 1 1 45%; position: relative; display: flex; justify-content: center; align-items: center; }
        .hero-img-box { width: 100%; max-width: 420px; aspect-ratio: 4/3; border-radius: 40px; overflow: hidden; position: relative; box-shadow: 0 40px 80px rgba(255,122,0,0.1); }
        .hero-buttons { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
        .hero-stats { display: flex; gap: 8; }
        .search-box-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end; }
        .hm-container { padding: 0 32px; }
        .cat-grid, .trust-grid, .payments-grid, .testimonials-grid { display: grid; }
        .cat-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .trust-grid { grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .payments-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .payments-pill { transition: all 0.3s; }
        .payments-pill:hover { border-color: var(--primary-dark) !important; box-shadow: 0 8px 20px rgba(255,122,0,0.18) !important; transform: translateY(-2px); }
        .testimonials-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }

        /* ─── ≤1024px ─── */
        @media (max-width: 1024px) {
          .hero-row { flex-wrap: wrap; }
          .hero-text, .hero-image { flex: 1 1 100% !important; }
          .cat-grid, .trust-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        /* ─── ≤768px ─── */
        @media (max-width: 768px) {
          .home-marketplace > header { display: none !important; }
          .hero-row { flex-direction: column !important; min-height: auto !important; gap: 20px !important; padding: 16px 0 !important; }
          .hero-text { text-align: center; }
          .hero-text p { margin-left: auto; margin-right: auto; }
          .hm-container { padding: 0 20px !important; }
          .hero-buttons { justify-content: center; }
          .hero-stats { flex-wrap: wrap !important; }
          .hero-stats > div { flex: 1 1 45% !important; }
          .hero-img-box { max-width: 360px !important; margin: 0 auto; }
          .cat-grid, .trust-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .payments-grid, .testimonials-grid { grid-template-columns: 1fr !important; }
          .home-marketplace .home-ad img { max-height: 200px !important; }
        }

        /* ─── ≤480px (phone) ─── */
        @media (max-width: 480px) {
          .hm-container { padding: 0 14px !important; }
          .home-marketplace h1 { font-size: 24px !important; line-height: 1.2 !important; }
          .home-marketplace h2 { font-size: 18px !important; }
          .hero-row { gap: 16px !important; }
          .hero-text h1 { font-size: 26px !important; }
          .hero-text p { font-size: 16px !important; line-height: 1.6 !important; max-width: 100% !important; }
          .hero-buttons { flex-direction: column !important; gap: 8px !important; }
          .hero-buttons .btn-primary,
          .hero-buttons .btn-outline { width: 100% !important; justify-content: center !important; padding: 12px 16px !important; }
          .hero-stats { gap: 8px !important; }
          .hero-stats > div { flex: 1 1 46% !important; padding: 8px 6px !important; }
          .hero-stats > div > div { white-space: normal !important; }
          .hero-img-box { max-width: 280px !important; border-radius: 24px !important; }
          .cat-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
          .cat-grid a { padding: 12px !important; gap: 10px !important; }
          .cat-grid a > div:first-child { width: 40px !important; height: 40px !important; }
          .trust-grid { grid-template-columns: 1fr !important; }
          .payments-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .search-box-row { flex-direction: column !important; }
          .search-box-row > div { flex: 1 1 100% !important; min-width: 100% !important; }
          .search-box-card { padding: 14px !important; }
          .home-marketplace .home-ad img { max-height: 140px !important; }
        }

        /* ─── ≤400px (small phones) ─── */
        @media (max-width: 400px) {
          .cat-grid { grid-template-columns: 1fr !important; }
        }

        /* ─── Paragraphs: a touch smaller site-wide on home ─── */
        .home-marketplace p { font-size: 15px !important; }
      `}</style>
    </div>
  );
}
