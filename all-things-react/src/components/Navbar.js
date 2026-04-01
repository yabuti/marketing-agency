import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLang } from '../LangContext';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'am', label: 'አማ' },
  { code: 'or', label: 'OR' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const { lang, switchLang, t } = useLang();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const handle = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setOpen(false);
    };
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const links = [
    { to: '/', label: t.home, end: true },
    { to: '/clients', label: t.clients },
    { to: '/news', label: t.news },
    { to: '/team', label: t.team },
    { to: '/about', label: t.about },
    { to: '/contact', label: t.contact },
  ];

  const LangPicker = ({ inline }) => (
    <div style={{ display: 'flex', gap: 4, ...(inline ? { marginTop: 16, paddingTop: 16, borderTop: '1px solid #1a1a1a' } : {}) }}>
      {LANGS.map(l => (
        <button key={l.code} onClick={() => switchLang(l.code)} style={{
          padding: inline ? '8px 16px' : '5px 10px',
          borderRadius: 6,
          border: `1px solid ${lang === l.code ? '#f97316' : '#333'}`,
          background: lang === l.code ? '#f97316' : 'transparent',
          color: lang === l.code ? '#000' : '#a3a3a3',
          fontSize: inline ? 14 : 12,
          fontWeight: 600, cursor: 'pointer',
          flex: inline ? 1 : 'none',
        }}>{l.label}</button>
      ))}
    </div>
  );

  return (
    <nav style={{
      background: 'rgba(10,10,10,0.97)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #1a1a1a',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      {/* Main bar */}
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 16px', height: 60,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}>
        {/* Logo */}
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0, minWidth: 0 }}>
          <img
            src="/logo.jpg"
            alt="All Things Solution"
            style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
            onError={e => { e.target.style.display = 'none'; }}
          />
          <span style={{ fontSize: isMobile ? 16 : 20, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            All <span style={{ color: '#f97316' }}>Things</span>{!isMobile && ' Solution'}
          </span>
        </NavLink>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center', flexWrap: 'nowrap', overflow: 'hidden' }}>
            {links.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
                padding: '8px 10px', color: isActive ? '#f97316' : '#a3a3a3',
                fontSize: 13, borderRadius: 8, textDecoration: 'none',
                fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap',
              })}>{label}</NavLink>
            ))}
          </div>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* Lang picker — desktop only in top bar */}
          {!isMobile && <LangPicker />}

          {!isMobile && (
            <>
              {user ? (
                <>
                  <NavLink to="/dashboard" style={({ isActive }) => ({
                    padding: '8px 12px', color: isActive ? '#f97316' : '#a3a3a3',
                    fontSize: 13, borderRadius: 8, textDecoration: 'none',
                  })}>👤 {user.full_name?.split(' ')[0]}</NavLink>
                  <button onClick={logout} style={{
                    padding: '8px 12px', background: 'none', border: 'none',
                    color: '#ef4444', fontSize: 13, cursor: 'pointer',
                  }}>{t.signOut}</button>
                </>
              ) : (
                <>
                  <NavLink to="/login" style={({ isActive }) => ({
                    padding: '8px 12px', color: isActive ? '#f97316' : '#a3a3a3',
                    fontSize: 13, borderRadius: 8, textDecoration: 'none',
                  })}>{t.signIn}</NavLink>
                  <NavLink to="/register" style={{
                    padding: '8px 16px', background: '#f97316', color: '#000',
                    borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: 'none',
                  }}>{t.register}</NavLink>
                </>
              )}
            </>
          )}

          {/* Burger — mobile only */}
          {isMobile && (
            <button onClick={() => setOpen(!open)} style={{
              background: open ? '#f9731620' : 'none',
              border: open ? '1px solid #f9731640' : 'none',
              color: open ? '#f97316' : '#fff',
              fontSize: 22, cursor: 'pointer',
              padding: '6px 10px', borderRadius: 8,
              lineHeight: 1, transition: 'all 0.2s',
            }}>
              {open ? '✕' : '☰'}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {isMobile && open && (
        <div style={{
          background: '#111', borderTop: '1px solid #1a1a1a',
          padding: '4px 20px 20px',
        }}>
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display: 'block', padding: '14px 4px',
                color: isActive ? '#f97316' : '#d4d4d4',
                fontSize: 16, borderBottom: '1px solid #1a1a1a',
                textDecoration: 'none', fontWeight: isActive ? 600 : 400,
              })}>{label}</NavLink>
          ))}

          {user ? (
            <>
              <NavLink to="/dashboard" onClick={() => setOpen(false)} style={{
                display: 'block', padding: '14px 4px',
                color: '#d4d4d4', fontSize: 16,
                borderBottom: '1px solid #1a1a1a', textDecoration: 'none',
              }}>👤 {t.myDashboard}</NavLink>
              <button onClick={logout} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '14px 4px', background: 'none', border: 'none',
                borderBottom: '1px solid #1a1a1a',
                color: '#ef4444', fontSize: 16, cursor: 'pointer',
              }}>{t.signOut}</button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <NavLink to="/login" onClick={() => setOpen(false)} style={{
                flex: 1, textAlign: 'center', padding: '13px',
                background: '#171717', color: '#fff',
                borderRadius: 8, border: '1px solid #262626',
                fontWeight: 600, fontSize: 15, textDecoration: 'none',
              }}>{t.signIn}</NavLink>
              <NavLink to="/register" onClick={() => setOpen(false)} style={{
                flex: 1, textAlign: 'center', padding: '13px',
                background: '#f97316', color: '#000',
                borderRadius: 8, fontWeight: 700,
                fontSize: 15, textDecoration: 'none',
              }}>{t.register}</NavLink>
            </div>
          )}

          {/* Language picker inside mobile menu */}
          <LangPicker inline />
        </div>
      )}
    </nav>
  );
}
