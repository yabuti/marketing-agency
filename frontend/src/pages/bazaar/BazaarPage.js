import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import API from '../../api';
import { useLang, localeFor } from '../../LangContext';
import ProductCard from '../../components/bazaar/ProductCard';
import CountdownChip from '../../components/CountdownChip';
import Pagination from '../../components/Pagination';
import { ETHIOPIAN_CITIES, CITY_TRANSLATIONS, CATEGORY_ICONS, PRODUCT_CATEGORIES, normalizeCategory, categoryDisplayName } from '../../constants';
import { addToCart, getCartKey } from './cartUtils';
import { effectivePrice, priceRangeToBounds } from './filterUtils';
import { useSiteImage } from '../../siteImages';

const ORANGE = '#FF6B00';
const DEFAULT_CATEGORY_ICON = { icon: '📦', color: '#F3F4F6' };

// Self-contained schedule countdown: owns its 1-second tick so the 743-line
// BazaarPage does not re-render every second while a bazaar session is open.
function calcParts(target) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function ScheduleCountdown({ target, children }) {
  const [parts, setParts] = useState(() => calcParts(target));

  useEffect(() => {
    setParts(calcParts(target));
    const id = setInterval(() => setParts(calcParts(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return children(parts);
}

const Reveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      style={{ height: '100%' }}
    >
      {children}
    </motion.div>
  );
};

// ─── Category icon/color map (shared from constants) ───

export default function BazaarPage() {
  const bazaarHero = useSiteImage('img_bazaar_hero');
  const [products, setProducts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    seller_id: '',
    min_price: '',
    max_price: '',
    priceRange: '',
    search: '',
    city: '',
    inStockOnly: false,
    sellers: [],
    sortBy: 'default',
  });
  const [toast, setToast] = useState('');
  const [bazaarClosed, setBazaarClosed] = useState(false);
  const [schedule, setSchedule] = useState({ isOpen: null, nextOpen: null, nextClose: null });
  const [viewMode, setViewMode] = useState('grid');
  const [trendingPeriod, setTrendingPeriod] = useState('week');
  const [page, setPage] = useState(1);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [managedCategories, setManagedCategories] = useState([]);
  const [dealToday, setDealToday] = useState([]);
  const [dealWeek, setDealWeek] = useState([]);
  const PER_PAGE = 15;
  const { t, lang } = useLang();
  const loc = localeFor(lang);

  // ─── Deal countdown helpers (hooks MUST stay above early returns) ───
  const endOfTodayTs = useMemo(() => { const d = new Date(); d.setHours(24, 0, 0, 0); return d.getTime(); }, []);
  const endOfWeekTs = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
    d.setHours(24, 0, 0, 0);
    return d.getTime();
  }, []);

  const loadSettings = useCallback(() => {
    API.get('/bazaar/settings').then(r => {
      const d = r.data || {};
      setSchedule({
        isOpen: d.is_open === '1',
        nextOpen: d.next_open || null,
        nextClose: d.next_close || null,
      });
      if (d.is_open === '1') setBazaarClosed(false);
      if (d.is_open === '0') setBazaarClosed(true);
    }).catch(() => {});
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const loadProducts = useCallback(({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    return API.get('/bazaar/products')
      .then(r => {
        if (r.data?.bazaar_closed) {
          setProducts([]);
          setBazaarClosed(true);
        } else {
          setProducts(Array.isArray(r.data) ? r.data : (Array.isArray(r.data?.products) ? r.data.products : []));
          setBazaarClosed(false);
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  // Countdown to the next open (when closed) or next close (when open).
  // Expiry watcher only: it never writes state each tick (display lives in
  // ScheduleCountdown below), so the page re-renders only when the session
  // boundary is actually crossed.
  useEffect(() => {
    if (schedule.isOpen === null) return;
    const targetStr = schedule.isOpen ? schedule.nextClose : schedule.nextOpen;
    if (!targetStr) return;
    const target = new Date(targetStr).getTime();
    let fired = false;
    const tick = () => {
      if (target - Date.now() <= 0 && !fired) {
        fired = true;
        loadSettings();
        loadProducts({ silent: true });
      }
    };
    tick();
    if (fired) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [schedule, loadSettings, loadProducts]);

  useEffect(() => {
    loadProducts();

    API.get('/bazaar/products/trending', { params: { period: 'week', limit: 6 } })
      .then(r => setTrending(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});

    API.get('/bazaar/products/best-deals', { params: { period: 'today', limit: 2 } })
      .then(r => setDealToday((Array.isArray(r.data) ? r.data : []).slice(0, 2)))
      .catch(() => {});

    API.get('/bazaar/products/best-deals', { params: { period: 'week', limit: 4 } })
      .then(r => setDealWeek((Array.isArray(r.data) ? r.data : []).slice(0, 4)))
      .catch(() => {});

    API.get('/bazaar/categories')
      .then(r => {
        if (Array.isArray(r.data)) {
          setManagedCategories(r.data.map(c => c.name));
        }
      })
      .catch(() => {});
  }, [loadProducts]);

  const [promoProducts, setPromoProducts] = useState([]);
  useEffect(() => {
    if (!bazaarClosed) return;
    API.get('/bazaar/products', { params: { scope: 'market' } })
      .then(r => {
        const d = r.data;
        setPromoProducts(Array.isArray(d) ? d : (Array.isArray(d?.products) ? d.products : []));
      })
      .catch(() => setPromoProducts([]));
  }, [bazaarClosed]);

  const promoStats = useMemo(() => {
    const sellerIds = new Set();
    const citySet = new Set();
    const catSet = new Set();
    promoProducts.forEach(p => {
      if (p.seller_id) sellerIds.add(p.seller_id);
      const city = (p.seller_location || '').trim();
      if (city) citySet.add(city);
      if (p.category) catSet.add(normalizeCategory(p.category));
    });
    managedCategories.forEach(n => { if (n) catSet.add(normalizeCategory(n)); });
    return {
      products: promoProducts.length,
      sellers: sellerIds.size,
      categories: catSet.size || PRODUCT_CATEGORIES.length,
      cities: citySet.size,
    };
  }, [promoProducts, managedCategories]);

  const categories = useMemo(() => {
    // Exactly the canonical 8 — a 9th card never appears.
    const set = new Set(PRODUCT_CATEGORIES);
    managedCategories.forEach(n => set.add(normalizeCategory(n)));
    products.forEach(p => set.add(normalizeCategory(p.category || '')));
    return PRODUCT_CATEGORIES.filter(c => set.has(c));
  }, [products, managedCategories]);

  const sellers = useMemo(() => {
    const seen = new Set();
    return products
      .filter(p => p.seller_id && !seen.has(p.seller_id) && seen.add(p.seller_id))
      .map(p => ({ id: p.seller_id, name: p.seller_name }));
  }, [products]);

  const cities = useMemo(() => {
    const seen = new Set();
    products.forEach(p => {
      const loc = (p.seller_location || '').trim();
      if (loc) seen.add(loc);
    });
    return Array.from(seen).sort();
  }, [products]);

  const allCities = useMemo(() => {
    const seen = new Set([...ETHIOPIAN_CITIES, ...cities]);
    return Array.from(seen).sort();
  }, [cities]);

  const filtered = useMemo(() => {
    let result = products.filter(p => {
      if (filters.category && normalizeCategory(p.category || '') !== filters.category) return false;
      if (filters.seller_id && String(p.seller_id) !== String(filters.seller_id)) return false;
      if (filters.sellers?.length && !filters.sellers.some(s => String(s) === String(p.seller_id))) return false;
      if (filters.city && (p.seller_location || '').toLowerCase() !== filters.city.toLowerCase()) return false;
      if (filters.min_price !== '' && effectivePrice(p) < Number(filters.min_price)) return false;
      if (filters.max_price !== '' && effectivePrice(p) > Number(filters.max_price)) return false;
      if (filters.inStockOnly && Number(p.stock_quantity) === 0) return false;
      if (filters.search) {
        const term = filters.search.toLowerCase();
        if (!(p.name || '').toLowerCase().includes(term) && !(p.description || '').toLowerCase().includes(term)) return false;
      }
      return true;
    });

    if (filters.sortBy === 'price_asc') result = [...result].sort((a, b) => effectivePrice(a) - effectivePrice(b));
    else if (filters.sortBy === 'price_desc') result = [...result].sort((a, b) => effectivePrice(b) - effectivePrice(a));
    else if (filters.sortBy === 'name_asc') result = [...result].sort((a, b) => (a.name || '').localeCompare(b.name || '', loc));
    else if (filters.sortBy === 'newest') result = [...result].sort((a, b) => (b.id || 0) - (a.id || 0));

    return result;
  }, [products, filters]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleAddToCart = (product) => {
    const key = getCartKey(product.seller_id);
    if (!key) {
      // getCartKey returns null when there is no signed-in user profile. Say so
      // instead of silently dropping the click.
      showToast(t.signInToAdd);
      return false;
    }
    let cart = [];
    try { cart = JSON.parse(localStorage.getItem(key)) || []; } catch { cart = []; }
    if (!Array.isArray(cart)) cart = [];
    cart = addToCart(cart, product, 1);
    localStorage.setItem(key, JSON.stringify(cart));
    showToast(t.addedToWishlist(product.name));
    return true;
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 100, color: 'var(--primary)', fontWeight: 700 }}>{t.loading}</div>;
  }

  if (bazaarClosed) {
    const pad = n => String(n).padStart(2, '0');
    const nextOpenStr = schedule.nextOpen;
    const nextOpenDate = nextOpenStr ? new Date(nextOpenStr) : null;
    // Always show the bazaar's own timezone (Africa/Addis_Ababa) so the date and
    // time match exactly what the admin typed, regardless of the visitor's locale.
    const bazaarTz = { timeZone: 'Africa/Addis_Ababa' };
    const nextOpenDateLabel = nextOpenDate
      ? nextOpenDate.toLocaleDateString(loc, { ...bazaarTz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : null;
    const nextOpenTimeLabel = nextOpenDate
      ? nextOpenDate.toLocaleTimeString([], { ...bazaarTz, hour: '2-digit', minute: '2-digit' })
      : null;

    // One-tap "remind me" — adds the reopening to the visitor's Google Calendar.
    let calendarUrl = '';
    if (nextOpenDate) {
      const toCal = d => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
      calendarUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
        + '&text=' + encodeURIComponent(t.bazaarTitle + ' ' + t.bazaarMarketplaceWord)
        + '&dates=' + toCal(nextOpenDate) + '/' + toCal(new Date(nextOpenDate.getTime() + 3600000))
        + '&details=' + encodeURIComponent(t.closedReminderDesc);
    }

    const features = [
      { icon: '🎁', title: t.closedFeature1Title, desc: t.closedFeature1Desc },
      { icon: '🏪', title: t.closedFeature2Title, desc: t.closedFeature2Desc },
      { icon: '🚚', title: t.closedFeature3Title, desc: t.closedFeature3Desc },
      { icon: '💬', title: t.closedFeature4Title, desc: t.closedFeature4Desc },
    ];

    return (
      <div className="bz-closed-page">
        {/* ─── HERO ─── */}
        <section className="bz-closed-hero">
          <span className="bz-closed-orb bz-closed-orb-1" />
          <span className="bz-closed-orb bz-closed-orb-2" />
          <div className="bz-closed-hero-inner">
            <Reveal>
              <span className="bz-closed-badge">🛍️ {t.bazaarClosedBadge}</span>
              <h1 className="bz-closed-title">
                {t.bazaarTitle} <span style={{ color: 'var(--primary)' }}>{t.comingSoon}</span>
              </h1>
              <p className="bz-closed-sub">{t.bazaarClosedDesc}</p>
            </Reveal>

            {nextOpenStr && (
              <Reveal delay={0.15}>
                <div className="bz-closed-count-label">⏳ {t.opensIn}</div>
                <ScheduleCountdown target={nextOpenStr}>
                  {({ days, hours, minutes, seconds }) => (
                    <div className="bz-closed-countdown">
                      {[[t.days, days], [t.hours, hours], [t.minutes, minutes], [t.seconds, seconds]].map(([label, val]) => (
                        <div key={label} className="creative-card bz-closed-count-tile">
                          <div className="bz-closed-count-val">{pad(val)}</div>
                          <div className="bz-closed-count-lbl">{label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScheduleCountdown>
              </Reveal>
            )}

            <Reveal delay={0.25}>
              <div className="bz-closed-date-card">
                <div className="bz-closed-date-info">
                  <div className="bz-closed-date-kicker">📅 {t.nextBazaar}</div>
                  <div className="bz-closed-date-main">{nextOpenDateLabel || t.scheduledByAdmin}</div>
                  {nextOpenTimeLabel && (
                    <div className="bz-closed-date-sub">{t.reopensAt(nextOpenTimeLabel)}</div>
                  )}
                </div>
                {calendarUrl && (
                  <a className="bz-closed-remind" href={calendarUrl} target="_blank" rel="noreferrer">
                    🔔 {t.closedReminder}
                  </a>
                )}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─── WHY VISIT ─── */}
        <section className="bz-closed-section">
          <Reveal>
            <h2 className="bz-closed-h2">{t.closedWhyTitle}</h2>
            <p className="bz-closed-lead">{t.closedWhyDesc}</p>
            <div className="bz-closed-features">
              {features.map(f => (
                <div key={f.title} className="creative-card bz-closed-feature">
                  <div className="bz-closed-feature-icon">{f.icon}</div>
                  <div className="bz-closed-feature-title">{f.title}</div>
                  <div className="bz-closed-feature-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ─── STATS ─── */}
        <section className="bz-closed-section">
          <Reveal>
            <h2 className="bz-closed-h2">{t.closedPromoTitle}</h2>
            <p className="bz-closed-lead">{t.closedPromoDesc}</p>
            <div className="bz-closed-stats">
              {[
                { icon: '🛍️', value: promoStats.products, label: t.statProducts },
                { icon: '🏪', value: promoStats.sellers, label: t.sellers },
                { icon: '🏷️', value: promoStats.categories, label: t.statCategories },
                { icon: '📍', value: promoStats.cities, label: t.statCities },
              ].map(tile => (
                <div key={tile.label} className="creative-card bz-closed-stat">
                  <div className="bz-closed-stat-icon">{tile.icon}</div>
                  <div className="bz-closed-stat-val">{tile.value}</div>
                  <div className="bz-closed-stat-lbl">{tile.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ─── CATEGORY PREVIEW ─── */}
        <section className="bz-closed-section">
          <Reveal>
            <h2 className="bz-closed-h2">{t.closedCatsTitle}</h2>
            <div className="bz-closed-cats">
              {PRODUCT_CATEGORIES.map(c => {
                const info = CATEGORY_ICONS[c.toLowerCase()] || DEFAULT_CATEGORY_ICON;
                return (
                  <div key={c} className="bz-closed-cat">
                    <span className="bz-closed-cat-icon" style={{ background: info.color || 'var(--bg-subtle)' }}>{info.icon}</span>
                    <span className="bz-closed-cat-name">{categoryDisplayName(t, c)}</span>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </section>

        <style>{`
          .bz-closed-page { padding-top: 96px; background: var(--bg-main); overflow: hidden; }
          .bz-closed-hero { position: relative; padding: 48px 20px 8px; text-align: center; }
          .bz-closed-hero-inner { position: relative; z-index: 1; max-width: 960px; margin: 0 auto; }
          .bz-closed-orb { position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none; z-index: 0; }
          .bz-closed-orb-1 { width: 300px; height: 300px; background: rgba(255,122,0,0.28); top: -60px; left: -60px; animation: bzFloat 9s ease-in-out infinite; }
          .bz-closed-orb-2 { width: 260px; height: 260px; background: rgba(255,180,80,0.24); top: 40px; right: -50px; animation: bzFloat 12s ease-in-out infinite reverse; }
          @keyframes bzFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(26px); } }
          .bz-closed-badge { display: inline-block; background: var(--primary); color: #fff; font-weight: 800; font-size: 15px; padding: 9px 22px; border-radius: 100px; margin-bottom: 20px; box-shadow: 0 12px 30px rgba(255,122,0,0.3); }
          .bz-closed-title { font-size: clamp(26px, 4.4vw, 42px); font-weight: 900; line-height: 1.1; margin: 0 0 14px; color: var(--secondary); }
          .bz-closed-sub { color: var(--text-muted); line-height: 1.7; max-width: 620px; margin: 0 auto 36px; font-size: 17px; }
          .bz-closed-count-label { color: var(--primary); font-weight: 800; font-size: 15px; margin-bottom: 18px; text-transform: uppercase; letter-spacing: 0.12em; }
          .bz-closed-countdown { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; margin-bottom: 40px; }
          .bz-closed-count-tile { padding: 22px 30px; min-width: 96px; text-align: center; }
          .bz-closed-count-val { font-size: 34px; font-weight: 900; color: var(--primary); line-height: 1; }
          .bz-closed-count-lbl { color: var(--text-muted); font-size: 13px; margin-top: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; }
          .bz-closed-date-card { display: flex; align-items: center; justify-content: center; gap: 28px; flex-wrap: wrap; background: linear-gradient(135deg, rgba(255,122,0,0.1), rgba(255,122,0,0.02)); border: 1px solid rgba(255,122,0,0.25); border-radius: 20px; padding: 26px 34px; }
          .bz-closed-date-info { text-align: left; }
          .bz-closed-date-kicker { color: var(--primary); font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
          .bz-closed-date-main { color: var(--secondary); font-size: clamp(18px, 2.6vw, 24px); font-weight: 900; }
          .bz-closed-date-sub { color: var(--text-muted); font-size: 15px; margin-top: 4px; font-weight: 600; }
          .bz-closed-remind { display: inline-flex; align-items: center; gap: 8px; background: var(--primary); color: #fff; text-decoration: none; font-weight: 800; font-size: 15px; padding: 13px 26px; border-radius: 100px; box-shadow: 0 12px 28px rgba(255,122,0,0.28); transition: transform 0.2s ease; }
          .bz-closed-remind:hover { transform: translateY(-2px); }
          .bz-closed-section { max-width: 1000px; margin: 0 auto; padding: 52px 20px 0; text-align: center; }
          .bz-closed-h2 { font-size: clamp(20px, 3vw, 27px); font-weight: 900; color: var(--secondary); margin: 0 0 10px; }
          .bz-closed-lead { color: var(--text-muted); font-size: 16px; line-height: 1.7; max-width: 620px; margin: 0 auto 28px; }
          .bz-closed-features { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
          .bz-closed-feature { padding: 26px 18px; text-align: center; height: 100%; }
          .bz-closed-feature-icon { font-size: 34px; margin-bottom: 12px; }
          .bz-closed-feature-title { font-weight: 900; color: var(--secondary); font-size: 16px; margin-bottom: 8px; }
          .bz-closed-feature-desc { color: var(--text-muted); font-size: 14px; line-height: 1.6; }
          .bz-closed-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
          .bz-closed-stat { padding: 22px 12px; }
          .bz-closed-stat-icon { font-size: 30px; margin-bottom: 8px; }
          .bz-closed-stat-val { font-size: 30px; font-weight: 900; color: var(--primary); line-height: 1.1; }
          .bz-closed-stat-lbl { font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 6px; }
          .bz-closed-cats { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
          .bz-closed-cat { display: inline-flex; align-items: center; gap: 10px; background: var(--bg-subtle); border: 1px solid rgba(0,0,0,0.06); border-radius: 100px; padding: 10px 20px 10px 10px; font-weight: 800; color: var(--secondary); font-size: 15px; }
          .bz-closed-cat-icon { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; }
          @media (max-width: 760px) {
            .bz-closed-features { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .bz-closed-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .bz-closed-count-tile { padding: 18px 20px; min-width: 74px; }
            .bz-closed-count-val { font-size: 26px; }
            .bz-closed-date-info { text-align: center; }
          }
        `}</style>
      </div>
    );
  }

  const activeCatKey = filters.category ? filters.category.toLowerCase() : '';
  const activeCatInfo = activeCatKey ? (CATEGORY_ICONS[activeCatKey] || DEFAULT_CATEGORY_ICON) : null;

  const clearAllFilters = () => setFilters({
    category: '', seller_id: '', min_price: '', max_price: '', priceRange: '', search: '',
    city: '', inStockOnly: false, sellers: [], sortBy: 'default',
  });

  return (
    <div style={{ paddingTop: 0, background: 'var(--bg-main)', minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* ═══════════════════ HERO (1920×280) ═══════════════════ */}
      <section className="bazaar-hero">
        <img
          src={bazaarHero}
          alt="Bazaar"
          onLoad={() => setImgLoaded(true)}
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center center',
            opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.6s ease',
          }}
        />
        <div className="bazaar-hero-overlay" style={{
          position: 'absolute', inset: 0,
        }} />
        <div className="bazaar-hero-text">
          <div className="bazaar-hero-text-inner">
            <Reveal>
              <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 900, lineHeight: 1.1, color: 'var(--secondary)', marginBottom: 10, margin: 0 }}>
                {t.bazaarTitle} <span style={{ color: '#F58220' }}>{t.bazaarMarketplaceWord}</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.6, margin: '10px 0 20px' }}>
                {t.bazaarSubtitle}
              </p>
            </Reveal>

            {/* ─── Countdown in hero ─── */}
            {schedule.isOpen === true && schedule.nextClose && (
              <Reveal delay={0.3}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: 10, padding: '10px 16px',
                }}>
                  <span style={{ fontSize: 16 }}>🟢</span>
                  <span style={{ fontWeight: 800, color: '#16a34a', fontSize: 17 }}>{t.openNow}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>{t.closesIn}</span>
                  <ScheduleCountdown target={schedule.nextClose}>
                    {({ days, hours, minutes }) => (
                      <span style={{ fontWeight: 900, color: '#16a34a', fontSize: 17 }}>{days}d {hours}h {minutes}m</span>
                    )}
                  </ScheduleCountdown>
                </div>
              </Reveal>
            )}
            {schedule.isOpen === false && schedule.nextOpen && (
              <Reveal delay={0.3}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 10, padding: '10px 16px',
                }}>
                  <span style={{ fontSize: 16 }}>🔴</span>
                  <span style={{ fontWeight: 800, color: '#ef4444', fontSize: 17 }}>{t.closedNow}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>· {t.bzOpensIn}</span>
                  <ScheduleCountdown target={schedule.nextOpen}>
                    {({ days, hours, minutes }) => (
                      <span style={{ fontWeight: 900, color: '#ef4444', fontSize: 17 }}>{days}d {hours}h {minutes}m</span>
                    )}
                  </ScheduleCountdown>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════ BODY ═══════════════════ */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 56px' }} className="bazaar-body">
        {/* ─── Breadcrumb ─── */}
        <nav style={{ fontSize: 16, color: 'var(--text-light)', marginBottom: 16 }}>
          <Link to="/" style={{ color: 'var(--text-light)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = ORANGE} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-light)'}>{t.home}</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: ORANGE, fontWeight: 700 }}>{t.bazaarTitle}</span>
        </nav>



        {/* ─── ⚡ Best Deal Today ─── */}
        {dealToday.length > 0 && (
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--secondary)', margin: 0 }}>
                ⚡ {t.bestDealToday}
              </h2>
              <CountdownChip target={endOfTodayTs} label={t.endsIn} />
            </div>
            <div className="bazaar-deals-today" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 20, marginBottom: 28 }}>
              {dealToday.map((dealToday, idx) => (
                <Reveal key={dealToday.id} delay={Math.min(idx * 0.05, 0.25)}>
                  <Link to={`/bazaar/product/${dealToday.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{
                      display: 'flex', gap: 16, alignItems: 'stretch', flexWrap: 'wrap', height: '100%',
                      background: 'var(--bg-main)', borderRadius: 16, border: '2px solid #FFE4C7',
                      boxShadow: '0 4px 16px rgba(255,107,0,0.06)', overflow: 'hidden', padding: 14,
                    }}>
                      <div style={{ position: 'relative', width: 150, minWidth: 120, flexShrink: 0, borderRadius: 10, overflow: 'hidden', background: '#F3F4F6' }}>
                        {dealToday.photos?.[0]?.url ? (
                          <img src={dealToday.photos[0].url} alt={dealToday.name} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block', opacity: Number(dealToday.stock_quantity) === 0 ? 0.45 : 1 }} />
                        ) : (
                          <div style={{ width: '100%', height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#D1D5DB' }}>📦</div>
                        )}
                        {Number(dealToday.stock_quantity) === 0 && <div className="sold-out-ribbon">{t.soldOut}</div>}
                      </div>
                      <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          {dealToday.discount_percent != null && (
                            <span style={{ background: '#ef4444', color: '#fff', fontSize: 17, fontWeight: 900, padding: '3px 10px', borderRadius: 100 }}>
                              -{dealToday.discount_percent}% OFF
                            </span>
                          )}
                          <span style={{ background: '#FF6B000F', color: ORANGE, fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 100 }}>
                            🏪 {dealToday.seller_name}
                          </span>
                        </div>
                        <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dealToday.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ textDecoration: 'line-through', color: 'var(--text-light)', fontSize: 16, fontWeight: 600 }}>
                            ETB {Number(dealToday.price).toLocaleString()}
                          </span>
                          <span style={{ color: ORANGE, fontWeight: 900, fontSize: 20 }}>
                            ETB {Number(dealToday.discount_price).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 17, fontWeight: 700 }}>
                          {t.bzSaveEtb} {(Number(dealToday.price) - Number(dealToday.discount_price)).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Reveal>
        )}

        {/* ─── 🏆 Best Deals This Week ─── */}
        {dealWeek.length > 0 && (
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--secondary)', margin: 0 }}>
                🏆 {t.bestDealsWeek}
              </h2>
              <CountdownChip target={endOfWeekTs} label={t.endsIn} />
            </div>
            <div className="bazaar-deals-week" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 20, marginBottom: 28 }}>
              {dealWeek.map((product, idx) => (
                <Reveal key={product.id} delay={Math.min(idx * 0.05, 0.25)}>
                  <ProductCard product={product} onAddToCart={handleAddToCart} />
                </Reveal>
              ))}
            </div>
          </Reveal>
        )}

        {/* ─── Filters + products ─── */}
        <div className="bazaar-layout">
          {/* Horizontal filter bar: one row of dropdowns above the products */}
          <div className="bz-filter-bar" style={filterBarStyle}>
            <select value={filters.category} aria-label={t.category}
              onChange={e => { setFilters(f => ({ ...f, category: e.target.value })); setPage(1); }}
              style={filterSelect}>
              <option value="">{t.allCategories}</option>
              {categories.map(c => <option key={c} value={c}>{categoryDisplayName(t, c)}</option>)}
            </select>

            <select value={filters.priceRange} aria-label={t.priceRangeEtb}
              onChange={e => {
                const { min_price, max_price } = priceRangeToBounds(e.target.value);
                setFilters(f => ({ ...f, priceRange: e.target.value, min_price, max_price }));
                setPage(1);
              }}
              style={filterSelect}>
              <option value="">{t.anyPrice}</option>
              <option value="under-500">{t.priceUnder('500')}</option>
              <option value="500-1000">{t.priceBand('500', '1,000')}</option>
              <option value="1000-5000">{t.priceBand('1,000', '5,000')}</option>
              <option value="5000-20000">{t.priceBand('5,000', '20,000')}</option>
              <option value="over-20000">{t.priceOver('20,000')}</option>
            </select>

            <select value={filters.city} aria-label={t.location}
              onChange={e => { setFilters(f => ({ ...f, city: e.target.value })); setPage(1); }}
              style={filterSelect}>
              <option value="">{t.allLocations}</option>
              {allCities.map(c => (
                <option key={c} value={c}>{CITY_TRANSLATIONS[lang]?.[c] || c}</option>
              ))}
            </select>

            <select value={filters.seller_id} aria-label={t.sellers}
              onChange={e => { setFilters(f => ({ ...f, seller_id: e.target.value })); setPage(1); }}
              style={filterSelect}>
              <option value="">{t.allSellers}</option>
              {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Product area */}
          <div className="bazaar-products">
            {/* Toolbar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(127,127,127,0.35)',
            }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 17, fontWeight: 700 }}>
                {filtered.length === 0
                  ? t.resultsNone
                  : filtered.length === products.length
                    ? t.resultsCount(filtered.length)
                    : t.resultsCountOf(filtered.length, products.length)}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <select value={filters.sortBy}
                  onChange={e => { setFilters(f => ({ ...f, sortBy: e.target.value })); setPage(1); }}
                  style={selectStyle}>
                  <option value="default">{t.sortDefault}</option>
                  <option value="newest">{t.sortNewest}</option>
                  <option value="price_asc">{t.sortPriceAsc}</option>
                  <option value="price_desc">{t.sortPriceDesc}</option>
                  <option value="name_asc">{t.sortNameAsc}</option>
                </select>
                <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: 10, padding: 4, border: '1px solid rgba(127,127,127,0.35)' }}>
                  <button onClick={() => setViewMode('grid')} aria-label={t.gridView}
                    style={{ ...viewBtnStyle, background: viewMode === 'grid' ? 'var(--bg-main)' : 'transparent', boxShadow: viewMode === 'grid' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                  </button>
                  <button onClick={() => setViewMode('list')} aria-label={t.listView}
                    style={{ ...viewBtnStyle, background: viewMode === 'list' ? 'var(--bg-main)' : 'transparent', boxShadow: viewMode === 'list' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
                  </button>
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <div style={{ fontSize: 64, marginBottom: 24 }}>🔍</div>
                <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>{t.noResults}</p>
                <button onClick={clearAllFilters} style={{ color: ORANGE, background: 'none', border: 'none', fontSize: 17, fontWeight: 800, cursor: 'pointer' }}>
                  {t.clearAll}
                </button>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' ? 'bazaar-grid' : ''} style={viewMode === 'list' ? listStyle : {}}>
                  {filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((product, idx) => (
                    <Reveal key={product.id} delay={Math.min(idx * 0.03, 0.3)}>
                      <ProductCard product={product} onAddToCart={handleAddToCart} viewMode={viewMode} />
                    </Reveal>
                  ))}
                </div>
                <Pagination currentPage={page} totalPages={Math.ceil(filtered.length / PER_PAGE)} onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
              </>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={toastStyle} role="status">
          {toast}
        </motion.div>
      )}

      <style>{`
        .bazaar-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px; }
        :root.dark .cat-nav-scroll button > span, [data-theme="dark"] .cat-nav-scroll button > span {
          background: #1E293B !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
        }
        .bazaar-header { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
        .bazaar-stat-grid { display: grid; grid-template-columns: repeat(4, auto); gap: 12px; }
        .bazaar-layout { display: flex; flex-direction: column; gap: 20px; }
        .bz-filter-bar { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }

        @media (max-width: 1280px) {
          .bazaar-grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 1024px) {
          .bazaar-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
          .bz-filter-bar { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 900px) {
          .bazaar-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .bazaar-deals-week { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .bazaar-deals-today { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 640px) {
          .bazaar-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .bazaar-header { flex-direction: column !important; align-items: flex-start !important; }
          .bazaar-deals-today { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .bz-filter-bar { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 480px) {
          .bazaar-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 10px !important; }
          .bazaar-deals-week { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 10px !important; }
          .bazaar-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .bz-filter-bar { grid-template-columns: 1fr !important; }
          .bazaar-body { padding: 20px 12px 60px !important; }
          .bazaar-grid .jiji-card > div:first-child { height: 150px !important; }
          .bazaar-grid .jiji-card > div:not(:first-child) { padding: 12px !important; gap: 8px !important; }
          .bazaar-grid .jiji-card h3 { font-size: 14px !important; }
        }
      `}</style>
    </div>
  );
}

const barInput = {
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid rgba(0,0,0,0.08)',
  background: 'var(--bg-subtle)',
  color: 'var(--secondary)',
  fontSize: 16,
  fontWeight: 600,
  outline: 'none',
  fontFamily: 'inherit',
  minWidth: 120,
};

const checkLabel = {
  display: 'flex', alignItems: 'center', gap: 8,
  fontSize: 16, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer',
};

const checkbox = { accentColor: ORANGE, width: 16, height: 16, cursor: 'pointer' };

const selectStyle = {
  padding: '10px 16px',
  borderRadius: 10,
  background: 'var(--bg-main)',
  border: '1px solid rgba(0,0,0,0.08)',
  color: 'var(--secondary)',
  fontSize: 16,
  fontWeight: 700,
  cursor: 'pointer',
  outline: 'none',
  fontFamily: 'inherit',
};

const filterBarStyle = {
  background: 'var(--bg-main)',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 14,
  padding: 12,
  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
};

const filterSelect = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  background: 'var(--bg-subtle)',
  border: '1px solid rgba(0,0,0,0.08)',
  color: 'var(--secondary)',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  outline: 'none',
  fontFamily: 'inherit',
  minWidth: 0,
};

const viewBtnStyle = {
  width: 36, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 18,
  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', color: 'var(--secondary)',
};

const listStyle = {
  display: 'flex', flexDirection: 'column', gap: 20,
};

const toastStyle = {
  position: 'fixed', bottom: 40, right: 40, background: 'rgba(15,23,42,0.95)', color: '#fff',
  padding: '16px 32px', borderRadius: 20, fontWeight: 800, fontSize: 17, zIndex: 9999,
  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
};
