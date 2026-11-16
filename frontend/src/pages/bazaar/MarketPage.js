import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../../api';
import { useLang, localeFor } from '../../LangContext';
import ProductCard from '../../components/bazaar/ProductCard';
import CountdownChip from '../../components/CountdownChip';
import Pagination from '../../components/Pagination';
import { ETHIOPIAN_CITIES, CITY_TRANSLATIONS, categoryImage, CATEGORY_ICONS, PRODUCT_CATEGORIES, normalizeCategory, subcategoriesFor, categoryDisplayName, subcategoryDisplayName } from '../../constants';
import { addToCart, getCartKey } from './cartUtils';
import { effectivePrice, priceRangeToBounds } from './filterUtils';
import { useSiteImage } from '../../siteImages';

const ORANGE = '#FF6B00';

// Composite key so the same subcategory name under two different categories
// (e.g. "Home Décor" under both Handmade Crafts and Home & Living) keeps its
// own stock count and its own representative photo.
const boxKey = (category, subcategory) =>
  `${String(category || '').trim().toLowerCase()}||${String(subcategory || '').trim().toLowerCase()}`;

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

export default function MarketPage() {
  const marketHero = useSiteImage('img_market_hero');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    city: '',
    search: '',
    min_price: '',
    max_price: '',
    priceRange: '',
    inStockOnly: false,
    sellers: [],
    sortBy: 'default',
  });
  const [toast, setToast] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [managedCategories, setManagedCategories] = useState([]);
  const [dealToday, setDealToday] = useState([]);
  const [dealWeek, setDealWeek] = useState([]);
  // Admin-set image per subcategory: map of boxKey(`${cat}||${sub}`) -> URL,
  // stored as JSON under the `subcategory_images` bazaar setting.
  const [subcatAdminImages, setSubcatAdminImages] = useState({});
  const catBoxRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });
  const [catDragging, setCatDragging] = useState(false);
  const catHoverRef = useRef(false);
  const catAutoTimer = useRef(null);
  const resultsRef = useRef(null);
  const PER_PAGE = 15;
  const { t, lang } = useLang();
  const loc = localeFor(lang);

  const endOfTodayTs = useMemo(() => { const d = new Date(); d.setHours(24, 0, 0, 0); return d.getTime(); }, []);
  const endOfWeekTs = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
    d.setHours(24, 0, 0, 0);
    return d.getTime();
  }, []);

  // Initialize filters from URL (?category=&city=) so Home "Shop by Category" links land pre-filtered
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const sub = searchParams.get('subcategory') || '';
    const city = searchParams.get('city') || '';
    if (cat || sub || city) {
      setFilters(f => ({ ...f, category: cat, subcategory: sub, city }));
      setPage(1);
    }
  }, []); // eslint-disable-line

  // Always-on listing: scope=market ignores the Bazaar open/closed window
  useEffect(() => {
    setLoading(true);
    API.get('/bazaar/products', { params: { scope: 'market' } })
      .then(r => {
        setProducts(Array.isArray(r.data) ? r.data : (Array.isArray(r.data?.products) ? r.data.products : []));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));

    API.get('/bazaar/categories')
      .then(r => {
        if (Array.isArray(r.data)) {
          // `name` stays the canonical filter key (products are matched on it);
          // `label` is whatever the admin set as the public name for the tile.
          setManagedCategories(
            r.data.map(c => ({
              name: normalizeCategory(c.name || ''),
              label: (c.display_name || '').trim() || c.name,
              image: c.image || null,
            }))
          );
        }
      })
      .catch(() => {});

    // Admin-set per-subcategory images (JSON map stored in bazaar settings).
    API.get('/bazaar/settings')
      .then(r => {
        const raw = r.data?.subcategory_images;
        if (!raw) return;
        try {
          const map = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (map && typeof map === 'object' && !Array.isArray(map)) {
            const clean = {};
            Object.keys(map).forEach(k => {
              if (typeof map[k] === 'string' && map[k].trim()) clean[k] = map[k].trim();
            });
            setSubcatAdminImages(clean);
          }
        } catch (e) { /* corrupt JSON — fall back to product photos */ }
      })
      .catch(() => {});

    API.get('/bazaar/products/best-deals', { params: { period: 'today', limit: 2 } })
      .then(r => setDealToday((Array.isArray(r.data) ? r.data : []).slice(0, 2)))
      .catch(() => {});

    API.get('/bazaar/products/best-deals', { params: { period: 'week', limit: 4 } })
      .then(r => setDealWeek((Array.isArray(r.data) ? r.data : []).slice(0, 4)))
      .catch(() => {});
  }, []);

  const categories = useMemo(() => {
    // Exactly the canonical 8 — a 9th card never appears.
    const set = new Set(PRODUCT_CATEGORIES);
    managedCategories.forEach(c => set.add(normalizeCategory(c.name)));
    products.forEach(p => set.add(normalizeCategory(p.category || '')));
    return PRODUCT_CATEGORIES.filter(c => set.has(c));
  }, [products, managedCategories]);

  // Admin-set image + public label per canonical category. An admin can point
  // the tile at their own photo and call it whatever they like, while `key`
  // stays canonical so product filtering and the icon/subcategory lookups
  // keep working.
  const categoryMeta = useMemo(() => {
    const map = {};
    managedCategories.forEach(c => {
      const key = normalizeCategory(c.name);
      if (!key) return;
      // First row wins, so the admin's own sort_order decides which label shows.
      if (!map[key]) map[key] = { label: c.label || key, image: c.image || null };
    });
    return map;
  }, [managedCategories]);

  const categoryLabel = (cat) => categoryMeta[cat]?.label || cat;
  const categoryImageFor = (cat) => categoryMeta[cat]?.image || categoryImage(cat);
  // Localized tile title: translation wins, then the admin’s display name, then the canonical name.
  const catDisplay = (cat) => categoryDisplayName(t, categoryLabel(cat));

  // One box per main category, each holding a 2x2 grid of its subcategories.
  // Which four appear is driven by the products actually in the market: a
  // subcategory that already has stock is shown first (most popular first),
  // and any remaining slots fall back to the canonical taxonomy order.
  // Stock is counted per (category, subcategory) pair: the same subcategory
  // name can legitimately appear under two different categories, and stock in
  // one must not make the other category prioritise it.
  const categoryBoxes = useMemo(() => {
    const counts = new Map();
    products.forEach(p => {
      const cat = normalizeCategory(p.category || '');
      const sub = String(p.subcategory || '').trim().toLowerCase();
      if (sub) {
        const k = boxKey(cat, sub);
        counts.set(k, (counts.get(k) || 0) + 1);
      }
    });
    const stock = (cat, s) => counts.get(boxKey(cat, s)) || 0;

    return categories
      .map(cat => {
        const all = subcategoriesFor(cat);
        const inStock = all.filter(s => stock(cat, s) > 0).sort((a, b) => stock(cat, b) - stock(cat, a));
        const rest = all.filter(s => stock(cat, s) === 0);
        return {
          category: cat,
          subcategories: [...inStock, ...rest].slice(0, 4),
        };
      })
      .filter(box => box.subcategories.length > 0);
  }, [categories, products]);

  // One representative photo per (category, subcategory), taken from the
  // products that are really listed, so each tile shows genuine stock instead
  // of a hardcoded set. An image the admin set for this exact subcategory
  // always wins — the admin must be able to control every tile.
  const subcategoryImages = useMemo(() => {
    const map = {};
    products.forEach(p => {
      const cat = normalizeCategory(p.category || '');
      const key = boxKey(cat, String(p.subcategory || '').trim().toLowerCase());
      const url = p.photos?.[0]?.url;
      if (key && url && !map[key]) map[key] = url;
    });
    return { ...map, ...subcatAdminImages };
  }, [products, subcatAdminImages]);

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
      if (filters.subcategory && (p.subcategory || '').toLowerCase() !== filters.subcategory.toLowerCase()) return false;
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

  // The shop-by-category row scrolls a whole box at a time so the arrow always
  // lands on the start of the next category rather than mid-tile.
  const scrollCatBoxes = (dir) => {
    const el = catBoxRef.current;
    if (!el) return;
    const box = el.querySelector('.cat-box');
    const step = box ? box.getBoundingClientRect().width + 12 : 212;
    stopCatAuto();
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
    setTimeout(startCatAuto, 900);
  };

  // Click-drag scrolling for the category row. Touch keeps native momentum
  // scrolling, so only mouse pointers are hijacked.
  const onCatPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const el = catBoxRef.current;
    if (!el) return;
    dragRef.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: 0 };
    setCatDragging(true);
  };

  const onCatPointerMove = (e) => {
    const d = dragRef.current;
    const el = catBoxRef.current;
    if (!d.active || !el) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > Math.abs(d.moved)) d.moved = dx;
    el.scrollLeft = d.startScroll - dx;
  };

  const onCatPointerUp = () => {
    if (dragRef.current.active) setCatDragging(false);
    dragRef.current.active = false;
  };

  // Swallow the click that ends a drag so a scrolled row never navigates.
  const onCatClickCapture = (e) => {
    if (Math.abs(dragRef.current.moved) > 4) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Continuous auto-scroll like the partners marquee: the strip glides on its
  // own, loops back to the start, and pauses while hovered or being dragged.
  const stopCatAuto = () => {
    if (catAutoTimer.current) {
      clearInterval(catAutoTimer.current);
      catAutoTimer.current = null;
    }
  };
  const startCatAuto = () => {
    stopCatAuto();
    catAutoTimer.current = setInterval(() => {
      const el = catBoxRef.current;
      if (!el || catHoverRef.current || dragRef.current.active) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
        el.scrollLeft = 0; // loop back like the marquee
      } else {
        el.scrollLeft += 0.8;
      }
    }, 30);
  };
  useEffect(() => {
    startCatAuto();
    return stopCatAuto;
  }, []);

  const clearAllFilters = () => {
    setSearchParams({});
    setFilters({
      category: '', subcategory: '', city: '', search: '', min_price: '', max_price: '',
      priceRange: '', inStockOnly: false, sellers: [], sortBy: 'default',
    });
    setPage(1);
  };

  const selectCategory = (c) => {
    const nextCat = filters.category === c ? '' : c;
    setFilters(f => ({ ...f, category: nextCat, subcategory: '' }));
    setPage(1);
    setSearchParams(nextCat ? { category: nextCat } : {});
    setTimeout(() => { resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
  };

  const selectSubcategory = (s) => {
    setFilters(f => ({ ...f, subcategory: f.subcategory === s ? '' : s }));
    setPage(1);
    setSearchParams(filters.category ? { category: filters.category, subcategory: s === filters.subcategory ? '' : s } : {});
  };

  // Non-toggling jump used by the category boxes, so clicking a box always
  // lands on that category instead of clearing an already-active filter.
  const focusCategory = (cat, sub = '') => {
    setFilters(f => ({ ...f, category: cat, subcategory: sub }));
    setPage(1);
    setSearchParams(sub ? { category: cat, subcategory: sub } : { category: cat });
    setTimeout(() => { resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
  };

  const catIcon = (name) => (CATEGORY_ICONS[String(name).toLowerCase()] || { icon: '📦' }).icon;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 100, color: 'var(--primary)', fontWeight: 700 }}>{t.loading}</div>;
  }

  const activeCatKey = filters.category ? filters.category.toLowerCase() : '';

  return (
    <div style={{ paddingTop: 0, background: 'var(--bg-main)', minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* ═══════════════════ HERO (image, like Bazaar) ═══════════════════ */}
      <section className="bazaar-hero">
        <img
          src={marketHero}
          alt="Market"
          onLoad={() => setImgLoaded(true)}
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center center',
            opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.6s ease',
          }}
        />
        <div className="bazaar-hero-overlay" style={{ position: 'absolute', inset: 0 }} />
        <div className="bazaar-hero-text">
          <div className="bazaar-hero-text-inner">
            <Reveal>
              <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 900, lineHeight: 1.1, color: 'var(--secondary)', margin: 0 }}>
                {t.marketTitle} <span style={{ color: '#F58220' }}>{t.marketPlaceWord}</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.6, margin: '8px 0 0' }}>
                {t.marketSubtitle}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════ BODY ═══════════════════ */}
      <div className="bazaar-body" style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 56px' }}>
        {/* ─── Breadcrumb ─── */}
        <nav style={{ fontSize: 16, color: 'var(--text-light)', marginBottom: 16 }}>
          <Link to="/" style={{ color: 'var(--text-light)', textDecoration: 'none' }}>{t.home}</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: ORANGE, fontWeight: 700 }}>{t.marketTitle}</span>
        </nav>

        {/* ─── Header stats ─── */}
        <div className="bazaar-header">
          <div className="bazaar-stat-grid">
            <StatCard value={products.length} label={t.statProducts} icon="🛍️" gradient="linear-gradient(135deg,#FF6B00,#FFA94D)" />
            <StatCard value={sellers.length} label={t.sellers} icon="🏪" gradient="linear-gradient(135deg,#6366F1,#A5B4FC)" />
            <StatCard value={categories.length} label={t.statCategories} icon="🏷️" gradient="linear-gradient(135deg,#10B981,#6EE7B7)" />
            <StatCard value={cities.length} label={t.statCities} icon="📍" gradient="linear-gradient(135deg,#F59E0B,#FCD34D)" />
          </div>
        </div>

        {/* ─── 🗂️ Category boxes ─── */}
        {categoryBoxes.length > 0 && (
          <Reveal>
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--secondary)', margin: 0 }}>
                  {t.mpCatGridTitle}
                </h2>
                <Link to="/market" style={{ color: ORANGE, fontWeight: 800, fontSize: 17, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  {t.mpCatGridViewAll} →
                </Link>
              </div>

              {/* Every category sits in ONE horizontally scrollable row (arrows
                  either side) instead of wrapping onto a second row. */}
              <div style={{ position: 'relative' }}>
                <button aria-label={t.scrollCatLeft} onClick={() => scrollCatBoxes(-1)}
                  style={scrollBtnStyle('left')}
                >‹</button>
                <button aria-label={t.scrollCatRight} onClick={() => scrollCatBoxes(1)}
                  style={scrollBtnStyle('right')}
                >›</button>

                <div
                  ref={catBoxRef}
                  className="cat-box-grid"
                  onPointerDown={onCatPointerDown}
                  onPointerMove={onCatPointerMove}
                  onPointerUp={onCatPointerUp}
                  onPointerLeave={onCatPointerUp}
                  onPointerCancel={onCatPointerUp}
                  onClickCapture={onCatClickCapture}
                  onMouseEnter={() => { catHoverRef.current = true; stopCatAuto(); }}
                  onMouseLeave={() => { catHoverRef.current = false; startCatAuto(); }}
                >
                  {categoryBoxes.map(box => {
                    const fallbackImg = categoryImageFor(box.category);
                    return (
                      <div key={box.category} className="cat-box">
                        <Link
                          to={`/market?category=${encodeURIComponent(box.category)}`}
                          onClick={() => focusCategory(box.category)}
                          className="cat-box-head"
                        >
                          <span className="cat-box-img">
                            {fallbackImg ? (
                              <img src={fallbackImg} alt={catDisplay(box.category)} loading="lazy" />
                            ) : (
                              <span className="cat-box-img-fallback">{catIcon(box.category)}</span>
                            )}
                          </span>
                          <h3 className="cat-box-title">{catDisplay(box.category)}</h3>
                          <span className="cat-box-arrow" aria-hidden="true">→</span>
                        </Link>

                        <div className="cat-box-items">
                          {box.subcategories.map(s => {
                            const img = subcategoryImages[boxKey(box.category, s)] || fallbackImg;
                            return (
                              <Link
                                key={s}
                                to={`/market?category=${encodeURIComponent(box.category)}&subcategory=${encodeURIComponent(s)}`}
                                onClick={() => focusCategory(box.category, s)}
                                className="cat-box-item"
                              >
                                <span className="cat-box-img">
                                  {img ? <img src={img} alt={subcategoryDisplayName(t, s)} loading="lazy" /> : <span className="cat-box-img-fallback">{catIcon(box.category)}</span>}
                                </span>
                                <span className="cat-box-name">{subcategoryDisplayName(t, s)}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>
        )}

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
              {dealToday.map((deal, idx) => (
                <Reveal key={deal.id} delay={Math.min(idx * 0.05, 0.25)}>
                  <Link to={`/bazaar/product/${deal.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{
                      display: 'flex', gap: 16, alignItems: 'stretch', flexWrap: 'wrap', height: '100%',
                      background: 'var(--bg-main)', borderRadius: 16, border: '2px solid #FFE4C7',
                      boxShadow: '0 4px 16px rgba(255,107,0,0.06)', overflow: 'hidden', padding: 14,
                    }}>
                      <div style={{ position: 'relative', width: 150, minWidth: 120, flexShrink: 0, borderRadius: 10, overflow: 'hidden', background: '#F3F4F6' }}>
                        {deal.photos?.[0]?.url ? (
                          <img src={deal.photos[0].url} alt={deal.name} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block', opacity: Number(deal.stock_quantity) === 0 ? 0.45 : 1 }} />
                        ) : (
                          <div style={{ width: '100%', height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#D1D5DB' }}>📦</div>
                        )}
                        {Number(deal.stock_quantity) === 0 && <div className="sold-out-ribbon">{t.soldOut}</div>}
                      </div>
                      <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          {deal.discount_percent != null && (
                            <span style={{ background: '#ef4444', color: '#fff', fontSize: 17, fontWeight: 900, padding: '3px 10px', borderRadius: 100 }}>
                              -{deal.discount_percent}% OFF
                            </span>
                          )}
                          <span style={{ background: '#FF6B000F', color: ORANGE, fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 100 }}>
                            🏪 {deal.seller_name}
                          </span>
                        </div>
                        <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{deal.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ textDecoration: 'line-through', color: 'var(--text-light)', fontSize: 16, fontWeight: 600 }}>
                            ETB {Number(deal.price).toLocaleString()}
                          </span>
                          <span style={{ color: ORANGE, fontWeight: 900, fontSize: 20 }}>
                            ETB {Number(deal.discount_price).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 17, fontWeight: 700 }}>
                          {t.bzSaveEtb} {(Number(deal.price) - Number(deal.discount_price)).toLocaleString()}
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
              onChange={e => {
                const v = e.target.value;
                setFilters(f => ({ ...f, category: v, subcategory: '' }));
                setPage(1);
                setSearchParams(v ? { category: v } : {});
              }}
              style={filterSelect}>
              <option value="">{t.allCategories}</option>
              {categories.map(c => <option key={c} value={c}>{catDisplay(c)}</option>)}
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

        {/* ─── Toolbar ─── */}
        <div ref={resultsRef} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(127,127,127,0.35)',
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 17, fontWeight: 700 }}>
            {filtered.length === 0
              ? t.resultsNone
              : filtered.length === products.length
                ? t.resultsCount(filtered.length)
                : t.resultsCountOf(filtered.length, products.length)}
            {activeCatKey && <span> · {catDisplay(filters.category)}</span>}
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

        {/* ─── Subcategory chips (when a category is selected) ─── */}
        {(() => {
          const subs = subcategoriesFor(filters.category);
          if (subs.length === 0) return null;
          return (
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(127,127,127,0.35)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 700, marginRight: 4 }}>{t.subcategoriesLabel}</span>
              <button onClick={() => selectSubcategory('')} style={{
                padding: '7px 16px', borderRadius: 100, cursor: 'pointer', fontSize: 14, fontWeight: 700,
                background: !filters.subcategory ? ORANGE : 'var(--bg-subtle)',
                color: !filters.subcategory ? '#fff' : 'var(--text-muted)',
                border: !filters.subcategory ? `1px solid ${ORANGE}` : '1px solid rgba(127,127,127,0.35)',
                transition: 'all 0.15s',
              }}>{t.all}</button>
              {subs.map(s => {
                const active = filters.subcategory === s;
                return (
                  <button key={s} onClick={() => selectSubcategory(s)} style={{
                    padding: '7px 16px', borderRadius: 100, cursor: 'pointer', fontSize: 14, fontWeight: 700,
                    background: active ? ORANGE : 'var(--bg-subtle)',
                    color: active ? '#fff' : 'var(--text-muted)',
                    border: active ? `1px solid ${ORANGE}` : '1px solid rgba(127,127,127,0.35)',
                    transition: 'all 0.15s',
                  }}>{subcategoryDisplayName(t, s)}</button>
                );
              })}
            </div>
          );
        })()}

        {/* ─── Product grid ─── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>🔍</div>
                <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>{t.noResults}</p>
            <button onClick={clearAllFilters} style={{ color: ORANGE, background: 'none', border: 'none', fontSize: 17, fontWeight: 800, cursor: 'pointer' }}>
              {t.bzClearFilters}
            </button>
          </div>
        ) : (
          <>
            <div
              className={viewMode === 'grid' ? 'bazaar-grid market-grid' : ''}
              style={viewMode === 'list' ? listStyle : {}}
            >
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
        .bazaar-header { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
        .bazaar-stat-grid { display: grid; grid-template-columns: repeat(4, auto); gap: 12px; }
        @media (max-width: 640px) { .bazaar-stat-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        .bazaar-grid { display: grid; gap: 20px; }
        /* Market has a wide content area (no right rail), so it can carry more
           columns than the Bazaar grid. Previously locked to 2 columns at every
           breakpoint, which left huge cards on desktop. */
        .market-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
        /* Shop-by-category is a single row: a horizontally auto-scrolling strip
           (like the partners marquee), not a wrapping grid, so it never spills
           onto a second row. Snap + smooth-behavior are intentionally left off:
           they fight both the drag and the marquee-style auto-scroll. */
.cat-box-grid {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 4px;
          margin: 0 -4px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
          cursor: ${catDragging ? 'grabbing' : 'grab'};
          user-select: none;
        }
.cat-box-grid::-webkit-scrollbar { display: none; }
.cat-box {
          flex: 0 0 200px;
          background: var(--bg-main);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 14px;
          padding: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
        }
.cat-box-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; text-decoration: none; }
.cat-box-head .cat-box-img { width: 40px; height: 40px; flex: 0 0 40px; border-radius: 10px; }
.cat-box-title {
          flex: 1; font-size: 14px; font-weight: 900; color: var(--secondary);
          margin: 0; line-height: 1.25;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .cat-box-arrow {
          width: 24px; height: 24px; border-radius: 50%;
          background: #FF6B00; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 13px; flex-shrink: 0;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .cat-box-head:hover .cat-box-arrow { transform: translateX(3px); box-shadow: 0 4px 12px rgba(255,107,0,0.4); }
        .cat-box-head:hover .cat-box-title { color: #FF6B00; }
        .cat-box-items { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
        .cat-box-item { display: flex; flex-direction: column; align-items: center; gap: 5px; text-decoration: none; }
        .cat-box-img { width: 100%; aspect-ratio: 1 / 1; border-radius: 10px; overflow: hidden; background: #F3F4F6; display: flex; align-items: center; justify-content: center; }
        .cat-box-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
        .cat-box-img-fallback { font-size: 22px; }
        .cat-box-item:hover .cat-box-img img { transform: scale(1.06); }
        .cat-box-item:hover .cat-box-name { color: #FF6B00; }
        .cat-box-name { font-size: 11px; font-weight: 700; color: var(--secondary); text-align: center; line-height: 1.3; transition: color 0.2s; }
        @media (max-width: 1100px) { .cat-box { flex-basis: 190px; } }
        @media (max-width: 640px) {
          .cat-box-grid { gap: 10px !important; }
          .cat-box { flex: 0 0 62% !important; padding: 12px !important; }
          .cat-box-items { gap: 8px !important; }
          .cat-box-name { font-size: 11px !important; }
        }
        .bazaar-layout { display: flex; flex-direction: column; gap: 20px; }
        .bz-filter-bar { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .bazaar-deals-today { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .bazaar-deals-week { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
        @media (max-width: 1280px) { .market-grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; } }
        @media (max-width: 1024px) {
          .market-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
          .bz-filter-bar { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 900px) {
          .bazaar-deals-today, .bazaar-deals-week { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 760px) {
          .market-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .bz-filter-bar { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 640px) {
          .bazaar-deals-today, .bazaar-deals-week { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 480px) {
          .bazaar-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .bz-filter-bar { grid-template-columns: 1fr !important; }
          .market-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 10px !important; }
          .market-grid .jiji-card > div:first-child { height: 150px !important; }
          .market-grid .jiji-card > div:not(:first-child) { padding: 12px !important; gap: 8px !important; }
          .market-grid .jiji-card h3 { font-size: 14px !important; }
          .bazaar-deals-today, .bazaar-deals-week { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 10px !important; }
          .bazaar-body { padding: 20px 12px 60px !important; }
        }
      `}</style>
    </div>
  );
}

/* ─── Stat Card ─── */
const StatCard = ({ value, label, icon, gradient }) => (
  <div style={{
    background: 'var(--bg-main)', borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)', padding: '14px 18px',
    display: 'flex', alignItems: 'center', gap: 12, minWidth: 110,
    boxShadow: '0 2px 10px rgba(0,0,0,0.03)', transition: 'all 0.3s', cursor: 'default',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)'; }}
  >
    <div style={{
      width: 40, height: 40, borderRadius: 12, background: gradient, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--secondary)', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 17, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    </div>
  </div>
);

const listStyle = {
  display: 'flex', flexDirection: 'column', gap: 20,
};

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

const scrollBtnStyle = (side) => ({
  position: 'absolute', [side]: -6, top: 42, transform: 'translateY(-50%)', zIndex: 2,
  width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.08)',
  background: 'var(--bg-main)', color: 'var(--secondary)', fontSize: 18, fontWeight: 900, cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
});

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

const toastStyle = {
  position: 'fixed', bottom: 40, right: 40, background: 'rgba(15,23,42,0.95)', color: '#fff',
  padding: '16px 32px', borderRadius: 20, fontWeight: 800, fontSize: 17, zIndex: 9999,
  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
};
