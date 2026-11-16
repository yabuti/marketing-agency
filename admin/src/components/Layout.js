import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const s = {
  wrap: { display: 'flex', minHeight: '100vh', background: '#0a0a0a' },
  sidebar: {
    width: 240,
    background: '#111111',
    borderRight: '1px solid #222222',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    position: 'sticky',
    top: 0,
    height: '100vh',
    zIndex: 10,
  },
  logoContainer: {
    padding: '24px 20px 20px',
    borderBottom: '1px solid #1c1c1c',
  },
  logo: {
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: -0.5,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logoSpan: { color: '#f97316' },
  badge: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 6,
    background: 'rgba(249, 115, 22, 0.15)',
    color: '#f97316',
    border: '1px solid rgba(249, 115, 22, 0.3)',
  },
  nav: {
    flex: 1,
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  groupLabel: {
    padding: '16px 12px 6px',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#525252',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    color: '#a3a3a3',
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 8,
    transition: 'all 0.15s ease',
  },
  activeLink: {
    color: '#fff',
    fontWeight: 600,
    background: 'rgba(249, 115, 22, 0.12)',
    borderLeft: '3px solid #f97316',
  },
  footer: {
    padding: '16px 12px',
    borderTop: '1px solid #1c1c1c',
  },
  logout: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    color: '#ef4444',
    background: 'transparent',
    border: 'none',
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 8,
    width: '100%',
    textAlign: 'left',
  },
  main: {
    flex: 1,
    padding: '36px 40px',
    overflowY: 'auto',
    maxWidth: 1400,
    margin: '0 auto',
    width: '100%',
  },
};

export default function Layout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { group: 'Overview' },
    { to: '/', label: '📊 Dashboard', end: true },
    { to: '/analytics', label: '📈 Analytics' },

    { group: 'Bazaar Hub' },
    { to: '/bazaar-products', label: '🛍️ Products' },
    { to: '/bazaar-schedule', label: '🕐 Schedule & Media' },
    { to: '/bazaar-categories', label: '🏷️ Categories' },
    { to: '/bazaar-transactions', label: '💳 Transactions' },

    { group: 'Content' },
    { to: '/blogs', label: '📝 Blogs' },
    { to: '/news', label: '📰 News' },
    { to: '/ads', label: '📢 Ads & Promos' },
    { to: '/banners', label: '🖼️ Banners' },
    { to: '/newsletter', label: '📧 Newsletter' },

    { group: 'Users & Community' },
    { to: '/registrations', label: '🆕 Registrations' },
    { to: '/users', label: '👤 All Users' },
    { to: '/buyers', label: '🛒 Buyers' },
    { to: '/chat', label: '💬 Live Chat' },
    { to: '/contacts', label: '📬 Inquiries' },
    { to: '/submissions', label: '📥 Submissions' },

    { group: 'System & Company' },
    { to: '/clients', label: '🏢 Clients' },
    { to: '/team', label: '👥 Team' },
    { to: '/settings', label: '⚙️ Site Settings' },
  ];

  return (
    <div style={s.wrap}>
      <aside style={s.sidebar}>
        <div style={s.logoContainer}>
          <div style={s.logo}>
            <span>All <span style={s.logoSpan}>Things</span></span>
            <span style={s.badge}>Admin</span>
          </div>
        </div>

        <nav style={s.nav}>
          {navItems.map((item, i) =>
            item.group ? (
              <div key={`g-${i}`} style={s.groupLabel}>{item.group}</div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                style={({ isActive }) => ({
                  ...s.link,
                  ...(isActive ? s.activeLink : {}),
                })}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.background = '#1a1a1a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.color = '#a3a3a3';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        <div style={s.footer}>
          <button
            style={s.logout}
            onClick={logout}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main style={s.main}>
        <Outlet />
      </main>
    </div>
  );
}
