import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../LangContext';

const LANGS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'am', label: 'አማ', name: 'አማርኛ' },
  { code: 'or', label: 'OR', name: 'Oromiffa' },
];

function getCurrentUserId() {
  try {
    const user  = JSON.parse(localStorage.getItem('user')  || 'null');
    const buyer = JSON.parse(localStorage.getItem('buyer') || 'null');
    const profile = user || buyer;
    return profile?.id ? String(profile.id) : null;
  } catch { return null; }
}

function getCartKey(sellerId) {
  const uid = getCurrentUserId();
  return uid ? `bazaar_cart_${uid}_${sellerId}` : null;
}

export { getCartKey, getCurrentUserId };

const NAV_ICONS = {
  home: '🏠', clients: '🤝', bazaar: '🛍️', news: '📰',
  blog: '📝', team: '👥', about: 'ℹ️', faq: '❓', contact: '📞',
};

function LogoSection({ collapsed }) {
  return collapsed ? (
    <NavLink to="/website" style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 16px', textDecoration: 'none' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, overflow: 'hidden', border: '2px solid rgba(255, 122, 0, 0.2)' }}>
        <img src="/images/logo.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </NavLink>
  ) : (
    <NavLink to="/website" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', padding: '0 16px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: 8 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255, 122, 0, 0.2)', flexShrink: 0 }}>
        <img src="/images/logo.jpg" alt="All Things" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--secondary)', letterSpacing: '-0.5px' }}>
        All<span style={{ color: 'var(--primary)' }}>Things</span>
      </span>
    </NavLink>
  );
}

function CartIcon({ isMobile }) {
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);
  const isLoggedIn = !!(localStorage.getItem('buyerToken') || localStorage.getItem('userToken'));
  const userId = getCurrentUserId();

  const carts = isLoggedIn && userId
    ? Object.keys(localStorage)
        .filter(k => k.startsWith(`bazaar_cart_${userId}_`))
        .map(k => {
          try {
            const sellerId = k.replace(`bazaar_cart_${userId}_`, '');
            const items = JSON.parse(localStorage.getItem(k)) || [];
            if (!items.length) return null;
            const count = items.reduce((s, i) => s + i.quantity, 0);
            return { sellerId, count, sellerName: items[0]?.seller_name || 'Seller' };
          } catch { return null; }
        }).filter(Boolean)
    : [];

  const totalCount = carts.reduce((s, c) => s + c.count, 0);

  if (!isLoggedIn) return null;

  const handleClick = () => {
    if (carts.length === 0) { navigate('/bazaar'); return; }
    if (carts.length === 1) { navigate('/bazaar/cart/' + carts[0].sellerId); return; }
    setOpen(o => !o);
  };

  if (isMobile) {
    return (
      <button onClick={() => {
        if (carts.length === 1) navigate('/bazaar/cart/' + carts[0].sellerId);
        else navigate('/bazaar');
      }} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 122, 0, 0.08)', border: '1px solid rgba(255, 122, 0, 0.15)', borderRadius: 12, color: 'var(--primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
        🛒 Cart ({totalCount})
      </button>
    );
  }

  return (
    <div style={{ padding: '0 16px', marginTop: 'auto', marginBottom: 8, position: 'relative' }}>
      <button onClick={handleClick} style={{
        width: '100%', padding: '12px 16px',
        background: totalCount > 0 ? 'rgba(255, 122, 0, 0.1)' : 'transparent',
        border: totalCount > 0 ? '1px solid rgba(255, 122, 0, 0.2)' : '1px solid rgba(0,0,0,0.06)',
        borderRadius: 12, cursor: 'pointer',
        color: totalCount > 0 ? 'var(--primary)' : 'var(--text-muted)',
        fontSize: 14, fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
        transition: 'all 0.2s',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
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
              background: '#fff', border: '1px solid rgba(0,0,0,0.05)',
              borderRadius: 16, padding: 12, zIndex: 9999,
              boxShadow: '0 -20px 40px rgba(0,0,0,0.1)'
            }}
          >
            {carts.map(c => (
              <button key={c.sellerId} onClick={() => { setOpen(false); navigate('/bazaar/cart/' + c.sellerId); }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  width: '100%', padding: '12px 16px', background: 'none', border: 'none',
                  color: 'var(--text-main)', fontSize: 14, cursor: 'pointer', borderRadius: 10,
                }}>
                <span style={{ fontWeight: 500 }}>{c.sellerName}</span>
                <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 800 }}>{c.count}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar({ collapsed, onToggle }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const { lang, switchLang, t } = useLang();
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

  const navLinks = [
    { to: '/website', label: t.home, icon: NAV_ICONS.home, end: true },
    { to: '/clients', label: t.clients, icon: NAV_ICONS.clients },
    { to: '/bazaar', label: t.bazaarTitle || 'Bazaar', icon: NAV_ICONS.bazaar },
    { to: '/blog', label: t.blogsNews, icon: NAV_ICONS.blog },
    { to: '/team', label: t.team, icon: NAV_ICONS.team },
    { to: '/faq', label: t.faq, icon: NAV_ICONS.faq },
    { to: '/about', label: t.about, icon: NAV_ICONS.about },
    { to: '/contact', label: t.contact, icon: NAV_ICONS.contact },
  ];

  const W = collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';

  // Desktop sidebar
  if (!isMobile) {
    return (
      <nav className={`nav-container${collapsed ? ' collapsed' : ''}`}>
        <LogoSection collapsed={collapsed} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {navLinks.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link${collapsed ? ' collapsed' : ''}${isActive ? ' active' : ''}`} title={collapsed ? label : undefined}>
              <span style={{ fontSize: 18, width: 24, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
              {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>}
            </NavLink>
          ))}
        </div>

        {/* Language dropdown */}
        <div style={{ padding: collapsed ? '8px 0' : '8px 16px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          {collapsed ? (
            <select value={lang} onChange={e => switchLang(e.target.value)}
              style={{ width: 44, height: 36, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.04)', color: 'var(--text-muted)', fontSize: 11, fontWeight: 800, textAlign: 'center', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', padding: 0 }}>
              {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          ) : (
            <select value={lang} onChange={e => switchLang(e.target.value)}
              style={{ width: '100%', padding: '8px 28px 8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.04)', color: 'var(--text-muted)', fontSize: 13, fontWeight: 700, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 fill=%27%234B5563%27 viewBox=%270 0 16 16%27%3E%3Cpath d=%27M8 11L3 6h10z%27/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
              {LANGS.map(l => <option key={l.code} value={l.code}>{l.label} — {l.name}</option>)}
            </select>
          )}
        </div>

        {/* Collapse toggle */}
        <button onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
              background: 'var(--secondary)', color: '#fff',
              borderRadius: 12, fontWeight: 700, fontSize: collapsed ? 11 : 14,
              cursor: 'pointer', border: 'none', display: collapsed ? 'flex' : 'block', alignItems: 'center', justifyContent: 'center',
            }}>
              {collapsed ? '🚪' : t.signOut}
            </button>
          ) : (
            <button onClick={() => navigate('/login')} title={collapsed ? t.signIn : undefined} style={{
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
    );
  }

  // Mobile: top bar + slide-in drawer
  return (
    <>
      <nav className="nav-container" style={{ flexDirection: 'row', justifyContent: 'space-between', padding: '10px 16px' }}>
        <NavLink to="/website" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, overflow: 'hidden', border: '2px solid rgba(255, 122, 0, 0.2)' }}>
            <img src="/images/logo.jpg" alt="All Things" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--secondary)' }}>
            All<span style={{ color: 'var(--primary)' }}>Things</span>
          </span>
        </NavLink>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => navigate('/bazaar')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 20, cursor: 'pointer', padding: 6 }}>🛒</button>
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
                  <img src="/images/logo.jpg" alt="All Things" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--secondary)' }}>
                  All<span style={{ color: 'var(--primary)' }}>Things</span>
                </span>
              </div>

              {/* Language dropdown (mobile) */}
              <div style={{ marginBottom: 16 }}>
                <select value={lang} onChange={e => switchLang(e.target.value)}
                  style={{ width: '100%', padding: '10px 32px 10px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.04)', color: 'var(--text-main)', fontSize: 14, fontWeight: 700, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 fill=%27%234B5563%27 viewBox=%270 0 16 16%27%3E%3Cpath d=%27M8 11L3 6h10z%27/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
                  {LANGS.map(l => <option key={l.code} value={l.code}>{l.label} — {l.name}</option>)}
                </select>
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
                  <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{icon}</span>
                  {label}
                </NavLink>
              ))}

              <div style={{ height: 1, background: 'rgba(0,0,0,0.05)', margin: '16px 0' }} />

              <CartIcon isMobile={true} />

              <div style={{ marginTop: 12 }}>
                {user || buyer ? (
                  <button onClick={() => { logout(buyer ? 'buyer' : 'user'); setMobileOpen(false); }}
                    style={{ width: '100%', padding: 14, background: 'var(--secondary)', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}>
                    {t.signOut}
                  </button>
                ) : (
                  <button onClick={() => navigate('/login')}
                    style={{ width: '100%', padding: 14, background: 'var(--primary)', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255, 122, 0, 0.2)' }}>
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