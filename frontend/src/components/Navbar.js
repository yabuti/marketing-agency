import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../LangContext';
import { useTheme } from '../ThemeContext';
import { cartKeyPrefix, getCartKey, getCurrentUserId } from '../pages/bazaar/cartUtils';
import { useSiteImage } from '../siteImages';

const LANGS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'am', label: 'AM', name: '\u12A0\u121B\u122D\u129B' },
  { code: 'or', label: 'OR', name: 'Oromiffa' },
];

const SunIcon = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4.4" />
    <line x1="12" y1="1.5" x2="12" y2="3.6" />
    <line x1="12" y1="20.4" x2="12" y2="22.5" />
    <line x1="1.5" y1="12" x2="3.6" y2="12" />
    <line x1="20.4" y1="12" x2="22.5" y2="12" />
    <line x1="4.57" y1="4.57" x2="6.03" y2="6.03" />
    <line x1="17.97" y1="17.97" x2="19.43" y2="19.43" />
    <line x1="4.57" y1="19.43" x2="6.03" y2="17.97" />
    <line x1="17.97" y1="6.03" x2="19.43" y2="4.57" />
  </svg>
);

const MoonIcon = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

function getLoggedInProfile() {
  try {
    const u = localStorage.getItem('user');
    const b = localStorage.getItem('buyer');
    const user = u && u !== 'undefined' ? JSON.parse(u) : null;
    const buyer = b && b !== 'undefined' ? JSON.parse(b) : null;
    return user || buyer || null;
  } catch { return null; }
}

function UserBadge({ isMobile }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLang();
  const profile = getLoggedInProfile();
  if (!profile) return null;

  const name = profile.company_name || profile.full_name || profile.email || t.navUserFallback;
  const initial = name.charAt(0).toUpperCase();

  if (isMobile) {
    return (
      <button onClick={() => navigate('/dashboard')} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
        background: 'rgba(255,122,0,0.08)', border: '1px solid rgba(255,122,0,0.15)',
        borderRadius: 20, cursor: 'pointer', color: 'var(--primary)', fontWeight: 700, fontSize: 17,
      }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, flexShrink: 0 }}>
          {initial}
        </div>
        <span>{name}</span>
      </button>
    );
  }

  return (
    <button onClick={() => navigate('/dashboard')} title={name} style={{
      position: 'fixed', top: 16, right: 20, zIndex: 1000,
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px 8px 8px',
      background: 'var(--bg-main)', border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: 24, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      transition: 'all 0.2s',
    }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, flexShrink: 0 }}>
        {initial}
      </div>
    </button>
  );
}

// The cart key format has a single definition in cartUtils. These were local
// copies of it, which meant changing the format could silently break the
// navbar badge while the cart pages kept working.
export { getCartKey, getCurrentUserId };

const NAV_ICONS = {
  home: '/images/home.jpg', clients: '/images/client.jpg', bazaar: '/images/bazzar.jpg',
  news: '/images/news.jpg', blog: '/images/news.jpg', team: '👥',
  about: '/images/about.jpg', faq: '/images/FAQ.jpg', contact: '/images/contact.jpg',
};

const NavIcon = ({ icon }) => (typeof icon === 'string' && icon.startsWith('/'))
  ? (
      <span style={{ width: 24, height: 24, borderRadius: 7, overflow: 'hidden', flexShrink: 0, display: 'inline-flex' }}>
        <img src={icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </span>
    )
  : <span style={{ fontSize: 18, width: 24, textAlign: 'center', flexShrink: 0 }}>{icon}</span>;

function LogoSection({ collapsed }) {
  const siteLogo = useSiteImage('img_logo');
  return collapsed ? (
    <NavLink to="/website" style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 16px', textDecoration: 'none' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, overflow: 'hidden', border: '2px solid rgba(255, 122, 0, 0.2)' }}>
        <img src={siteLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </NavLink>
  ) : (
    <NavLink to="/website" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', padding: '0 16px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: 8 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255, 122, 0, 0.2)', flexShrink: 0 }}>
        <img src={siteLogo} alt="All Things" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--secondary)', letterSpacing: '-0.5px' }}>
        All<span style={{ color: 'var(--primary)' }}>Things</span>
      </span>
    </NavLink>
  );
}

function CartIcon({ isMobile }) {
  const navigate  = useNavigate();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const isLoggedIn = !!(localStorage.getItem('buyerToken') || localStorage.getItem('userToken'));
  const userId = getCurrentUserId();

  const carts = isLoggedIn && userId
    ? Object.keys(localStorage)
        .filter(k => k.startsWith(cartKeyPrefix(userId)))
        .map(k => {
          try {
            const sellerId = k.replace(cartKeyPrefix(userId), '');
            const items = JSON.parse(localStorage.getItem(k)) || [];
            if (!items.length) return null;
            const count = items.reduce((s, i) => s + i.quantity, 0);
            return { sellerId, count, sellerName: items[0]?.seller_name || t.navSellerFallback };
          } catch { return null; }
        }).filter(Boolean)
    : [];

  const totalCount = carts.reduce((s, c) => s + c.count, 0);

  if (!isLoggedIn) return null;

  const handleClick = () => {
    if (carts.length === 0) { navigate('/bazaar'); return; }
    if (carts.length === 1) { navigate('/bazaar/wishlist/' + carts[0].sellerId); return; }
    setOpen(o => !o);
  };

  if (isMobile) {
    return (
      <button onClick={() => {
        if (carts.length === 1) navigate('/bazaar/wishlist/' + carts[0].sellerId);
        else navigate('/bazaar');
      }} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 122, 0, 0.08)', border: '1px solid rgba(255, 122, 0, 0.15)', borderRadius: 12, color: 'var(--primary)', fontWeight: 700, fontSize: 17, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
        <HeartSvg size={16} /> {t.navWishlistCount(totalCount)}
      </button>
    );
  }

  return (
    <div style={{ padding: '0 16px', marginTop: 'auto', marginBottom: 8, position: 'relative' }}>
      <button onClick={handleClick} title={t.navWishlist} style={{
        width: '100%', padding: '12px 16px',
        background: totalCount > 0 ? 'rgba(255, 122, 0, 0.1)' : 'transparent',
        border: totalCount > 0 ? '1px solid rgba(255, 122, 0, 0.2)' : '1px solid rgba(0,0,0,0.06)',
        borderRadius: 12, cursor: 'pointer',
        color: totalCount > 0 ? 'var(--primary)' : 'var(--text-muted)',
        fontSize: 16, fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
        transition: 'all 0.2s',
      }}>
        <HeartSvg size={18} />
        {totalCount > 0 && <span style={{ fontWeight: 800 }}>{totalCount > 9 ? '9+' : totalCount}</span>}
      </button>
      <AnimatePresence>
        {open && carts.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{
              position: 'absolute', bottom: '100%', left: 16, right: 16,
              background: 'var(--bg-main)', border: '1px solid var(--card-border)',
              borderRadius: 16, padding: 12, zIndex: 9999,
              boxShadow: '0 -20px 40px rgba(0,0,0,0.1)'
            }}
          >
            {carts.map(c => (
              <button key={c.sellerId} onClick={() => { setOpen(false); navigate('/bazaar/wishlist/' + c.sellerId); }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  width: '100%', padding: '12px 16px', background: 'none', border: 'none',
                  color: 'var(--text-main)', fontSize: 16, cursor: 'pointer', borderRadius: 10,
                }}>
                <span style={{ fontWeight: 500 }}>{c.sellerName}</span>
                <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 17, fontWeight: 800 }}>{c.count}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HeartSvg({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function MobileCartBadge({ count, onClick }) {
  const { t } = useLang();
  return (
    <button onClick={onClick} aria-label={t.navWishlistItems(count)}
      style={{ position: 'relative', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <HeartSvg />
      {count > 0 && (
        <span style={{
          position: 'absolute', top: 0, right: -2, minWidth: 18, height: 18,
          background: '#ef4444', color: '#fff', borderRadius: 10,
          fontSize: 17, fontWeight: 800, lineHeight: '18px', textAlign: 'center',
          padding: '0 4px', border: '2px solid #fff', boxSizing: 'border-box',
        }}>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}

function getTotalCartCount() {
  try {
    const userId = getCurrentUserId();
    if (!userId) return 0;
    let total = 0;
    Object.keys(localStorage)
      .filter(k => k.startsWith(cartKeyPrefix(userId)))
      .forEach(k => {
        try {
          const items = JSON.parse(localStorage.getItem(k)) || [];
          total += items.reduce((s, i) => s + i.quantity, 0);
        } catch {}
      });
    return total;
  } catch { return 0; }
}

export default function Navbar({ collapsed, onToggle }) {
  const siteLogo = useSiteImage('img_logo');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const { lang, switchLang, t } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const user  = (() => { try { const v = localStorage.getItem('user');  return v && v !== 'undefined' ? JSON.parse(v) : null; } catch { return null; } })();
  const buyer = (() => { try { const v = localStorage.getItem('buyer'); return v && v !== 'undefined' ? JSON.parse(v) : null; } catch { return null; } })();

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); };
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const logout = (type) => {
    localStorage.removeItem(type === 'buyer' ? 'buyerToken' : 'userToken');
    localStorage.removeItem(type === 'buyer' ? 'buyer' : 'user');
    navigate('/website');
    window.location.reload();
  };

  const isBuyer = !!localStorage.getItem('buyerToken');

  const navLinks = [
    { to: '/website', label: t.home, icon: NAV_ICONS.home, end: true },
    { to: '/market', label: t.navMarket, icon: '🛍️' },
    { to: '/bazaar', label: t.navBazaar, icon: NAV_ICONS.bazaar },
    { to: '/blog', label: t.blogsNews, icon: NAV_ICONS.blog },
    { to: '/team', label: t.team, icon: NAV_ICONS.team },
    { to: '/faq', label: t.faq, icon: NAV_ICONS.faq },
    { to: '/about', label: t.about, icon: NAV_ICONS.about },
    { to: '/contact', label: t.contact, icon: NAV_ICONS.contact },
    ...(isBuyer
    ? [{ to: '/buyer-dashboard', label: t.navMyPurchases, icon: '🛒' }]
    : [{ to: '/dashboard', label: t.myDashboard, icon: '📊' }]
    ),
  ];

  const W = collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';

  // Desktop sidebar
  if (!isMobile) {
    return (
      <>
      <nav className={`nav-container${collapsed ? ' collapsed' : ''}`}>
        <LogoSection collapsed={collapsed} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {navLinks.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link${collapsed ? ' collapsed' : ''}${isActive ? ' active' : ''}`} title={collapsed ? label : undefined}>
              <NavIcon icon={icon} />
              {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>}
            </NavLink>
          ))}
        </div>

        {/* Language + Theme row */}
        <div style={{ padding: collapsed ? '8px 0' : '8px 16px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 4 }}>
          {collapsed ? (
            <>
              <select value={lang} onChange={e => switchLang(e.target.value)}
                style={{ width: 44, height: 36, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.04)', color: 'var(--text-muted)', fontSize: 17, fontWeight: 800, textAlign: 'center', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', padding: 0 }}>
                {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
              <button onClick={toggleTheme} title={isDark ? t.navLightMode : t.navDarkMode} aria-label={isDark ? t.navSwitchToLight : t.navSwitchToDark} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid rgba(127,127,127,0.25)', background: 'rgba(127,127,127,0.08)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>
            </>
          ) : (
            <>
              <select value={lang} onChange={e => switchLang(e.target.value)} aria-label={t.navLanguage}
                style={{ flex: '1 1 0', minWidth: 0, height: 36, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.04)', color: 'var(--text-muted)', fontSize: 17, fontWeight: 800, cursor: 'pointer', padding: '0 8px', outline: 'none' }}>
                {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
              <button onClick={toggleTheme} title={isDark ? t.navLightMode : t.navDarkMode} aria-label={isDark ? t.navSwitchToLight : t.navSwitchToDark} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid rgba(127,127,127,0.25)', background: 'rgba(127,127,127,0.08)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>
            </>
          )}
        </div>

        {/* Collapse toggle */}
        <button onClick={onToggle} title={collapsed ? t.navExpandSidebar : t.navCollapseSidebar}
          style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: collapsed ? '8px 0' : '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'color 0.2s' }}>
          {collapsed ? '▶' : '◀'}
        </button>

        {/* Cart */}
        <CartIcon isMobile={false} />

        {/* Auth */}
        <div style={{ padding: collapsed ? '4px 0 8px' : '0 16px 8px' }}>
          {user || buyer ? (
            <button onClick={() => logout(buyer ? 'buyer' : 'user')} title={collapsed ? t.signOut : undefined} style={{
              width: collapsed ? 44 : '100%', height: collapsed ? 40 : 'auto',
              padding: collapsed ? 0 : '12px 16px',
              background: '#334155', color: '#fff',
              borderRadius: 12, fontWeight: 700, fontSize: collapsed ? 11 : 14,
              cursor: 'pointer', border: 'none', display: collapsed ? 'flex' : 'block', alignItems: 'center', justifyContent: 'center',
            }}>
              {collapsed ? '🚪' : t.signOut}
            </button>
          ) : (
            <button onClick={() => navigate('/login', { state: { from: location.pathname } })} title={collapsed ? t.signIn : undefined} style={{
              width: collapsed ? 44 : '100%', height: collapsed ? 40 : 'auto',
              padding: collapsed ? 0 : '12px 16px',
              background: 'var(--primary)', color: '#fff',
              borderRadius: 12, fontWeight: 700, fontSize: collapsed ? 11 : 14,
              cursor: 'pointer', border: 'none', display: collapsed ? 'flex' : 'block', alignItems: 'center', justifyContent: 'center',
              boxShadow: collapsed ? 'none' : '0 4px 12px rgba(255, 122, 0, 0.2)',
            }}>
              {collapsed ? '🔑' : t.signIn}
            </button>
          )}
        </div>
      </nav>
      </>
    );
  }

  // Mobile: top bar + slide-in drawer
  return (
    <>
      <nav className="nav-container" style={{ flexDirection: 'row', justifyContent: 'space-between', padding: '10px 16px' }}>
        <NavLink to="/website" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, overflow: 'hidden', border: '2px solid rgba(255, 122, 0, 0.2)' }}>
            <img src={siteLogo} alt="All Things" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--secondary)' }}>
            All<span style={{ color: 'var(--primary)' }}>Things</span>
          </span>
        </NavLink>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MobileCartBadge
            count={getTotalCartCount()}
            onClick={() => {
              const userId = getCurrentUserId();
              let cartKeys = [];
              if (userId) {
                cartKeys = Object.keys(localStorage).filter(k => k.startsWith(cartKeyPrefix(userId)));
              }
              if (cartKeys.length === 1) {
                const sellerId = cartKeys[0].replace(cartKeyPrefix(userId), '');
                navigate('/bazaar/wishlist/' + sellerId);
              } else {
                navigate('/bazaar');
              }
            }}
          />
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontSize: 22, cursor: 'pointer', padding: 6 }}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="nav-mobile-overlay"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="nav-mobile-menu"
            >
              {/* Mobile drawer content */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 0 20px', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, overflow: 'hidden', border: '2px solid rgba(255, 122, 0, 0.2)' }}>
                  <img src={siteLogo} alt="All Things" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--secondary)' }}>
                  All<span style={{ color: 'var(--primary)' }}>Things</span>
                </span>
              </div>

              {/* Language + Theme row (mobile) */}
              <div style={{ marginBottom: 16, display: 'flex', gap: 6, alignItems: 'center' }}>
                <select value={lang} onChange={e => switchLang(e.target.value)} aria-label={t.navLanguage}
                  style={{ flex: '1 1 0', minWidth: 0, height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.04)', color: 'var(--text-muted)', fontSize: 17, fontWeight: 800, cursor: 'pointer', padding: '0 10px', outline: 'none' }}>
                  {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
                <button onClick={toggleTheme} title={isDark ? t.navLightMode : t.navDarkMode} aria-label={isDark ? t.navSwitchToLight : t.navSwitchToDark} style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid rgba(127,127,127,0.25)', background: 'rgba(127,127,127,0.08)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                  {isDark ? <SunIcon size={19} /> : <MoonIcon size={19} />}
                </button>
              </div>

              {/* Nav Links */}
              {navLinks.map(({ to, label, icon, end }) => (
                <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 12px',
                    color: isActive ? 'var(--primary)' : 'var(--text-main)',
                    fontSize: 16, fontWeight: isActive ? 700 : 500,
                    textDecoration: 'none', borderRadius: 10,
                    background: isActive ? 'rgba(255, 122, 0, 0.06)' : 'transparent',
                  })}>
                  <NavIcon icon={icon} />
                  {label}
                </NavLink>
              ))}

              <div style={{ height: 1, background: 'rgba(0,0,0,0.05)', margin: '16px 0' }} />

              <CartIcon isMobile={true} />

              <div style={{ marginTop: 12 }}>
                {user || buyer ? (
                  <button onClick={() => { logout(buyer ? 'buyer' : 'user'); setMobileOpen(false); }}
                    style={{ width: '100%', padding: 14, background: '#334155', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 17, border: 'none', cursor: 'pointer' }}>
                    {t.signOut}
                  </button>
                ) : (
                  <button onClick={() => { navigate('/login', { state: { from: location.pathname } }); setMobileOpen(false); }}
                    style={{ width: '100%', padding: 14, background: 'var(--primary)', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 17, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255, 122, 0, 0.2)' }}>
                    {t.signIn}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
