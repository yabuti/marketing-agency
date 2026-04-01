import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const s = {
  wrap: { display: 'flex', minHeight: '100vh' },
  sidebar: { width: 220, background: '#111', borderRight: '1px solid #222', padding: '24px 0', display: 'flex', flexDirection: 'column' },
  logo: { padding: '0 24px 32px', fontSize: 20, fontWeight: 700 },
  logoSpan: { color: '#f97316' },
  nav: { flex: 1 },
  link: { display: 'block', padding: '12px 24px', color: '#a3a3a3', textDecoration: 'none', fontSize: 14, borderLeft: '3px solid transparent' },
  activeLink: { color: '#f97316', borderLeft: '3px solid #f97316', background: 'rgba(249,115,22,0.08)' },
  logout: { padding: '12px 24px', color: '#ef4444', background: 'none', border: 'none', fontSize: 14, textAlign: 'left', width: '100%' },
  main: { flex: 1, padding: 32, overflowY: 'auto' },
};

export default function Layout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={s.wrap}>
      <aside style={s.sidebar}>
        <div style={s.logo}>All <span style={s.logoSpan}>Things</span> Solution</div>
        <nav style={s.nav}>
          {[
            { to: '/', label: '📊 Dashboard', end: true },
            { to: '/clients', label: '🏢 Clients' },
            { to: '/news', label: '📰 News' },
            { to: '/ads', label: '📢 Ads & Promos' },
            { to: '/banners', label: '🖼️ Banners' },
            { to: '/contacts', label: '📬 Contact Messages' },
            { to: '/registrations', label: '🆕 Registrations' },
            { to: '/users', label: '👤 All Users' },
            { to: '/analytics', label: '📈 Analytics' },
            { to: '/team', label: '👥 Team' },
          ].map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({ ...s.link, ...(isActive ? s.activeLink : {}) })}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <button style={s.logout} onClick={logout}>🚪 Logout</button>
      </aside>
      <main style={s.main}>
        <Outlet />
      </main>
    </div>
  );
}
