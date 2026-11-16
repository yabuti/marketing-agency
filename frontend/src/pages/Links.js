import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { buildSocials } from '../components/socials';
import { useLang } from '../LangContext';
import { useSiteSettings } from '../SiteSettingsContext';
import { useSiteImage } from '../siteImages';

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const linkStyle = {
  display: 'flex', alignItems: 'center', gap: 14,
  padding: '16px 24px', borderRadius: 14,
  background: 'var(--card-bg)', border: '1px solid var(--card-border)',
  color: 'var(--secondary)', fontWeight: 700, fontSize: 17,
  textDecoration: 'none',
};

const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let animFrameId, running = true;
    let mouseX = -9999, mouseY = -9999;
    let dots = [];
    let w = 0, h = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      w = parent.offsetWidth;
      h = parent.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    };

    const init = () => {
      dots = [];
      const count = w < 640 ? 25 : 60;
      const cols = w < 640 ? 8 : 20;
      for (let i = 0; i < count; i++) {
        const col = Math.floor(i / (count / cols));
        dots.push({
          x: Math.random() * w / cols + col * (w / cols),
          y: Math.random() * h,
          dx: (Math.random() + 0.2) * (i % 2 === 0 ? 1 : -1),
          dy: (Math.random() + 0.2) * (i % 2 === 0 ? 1 : -1),
        });
      }
    };

    resize();
    init();

    const onPointer = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      mouseX = cx - rect.left;
      mouseY = cy - rect.top;
    };

    window.addEventListener('mousemove', onPointer);
    window.addEventListener('touchmove', onPointer, { passive: false });
    window.addEventListener('resize', () => { resize(); init(); });

    const anim = () => {
      if (!running) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, w, h);

      const limit = w < 640 ? 80 : 150;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.x += d.dx;
        d.y += d.dy;
        if (d.x > w || d.x < 0) d.dx *= -1;
        if (d.y > h || d.y < 0) d.dy *= -1;

        const toMouse = Math.hypot(d.x - mouseX, d.y - mouseY);
        if (toMouse < limit) {
          ctx.strokeStyle = `rgba(249, 115, 22, ${(limit - toMouse) / limit})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.stroke();
        }

        for (let j = i + 1; j < dots.length; j++) {
          const o = dots[j];
          const dist = Math.hypot(o.x - d.x, o.y - d.y);
          if (dist < limit) {
            ctx.strokeStyle = `rgba(11, 27, 51, ${0.5 * (limit - dist) / limit})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(o.x, o.y);
            ctx.lineTo(d.x, d.y);
            ctx.stroke();
          }
        }
      }

      animFrameId = requestAnimationFrame(anim);
    };

    anim();

    return () => {
      running = false;
      window.removeEventListener('mousemove', onPointer);
      window.removeEventListener('touchmove', onPointer);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0
    }} />
  );
};

export default function Links() {
  const { t } = useLang();
  const { social, footer } = useSiteSettings();
  const siteLogo = useSiteImage('img_logo');
  const SOCIALS = buildSocials(social);
  const copyright = (footer.copyright && footer.copyright.trim()) || t.copyright;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--card-bg)',
    }}>
      <ParticleCanvas />

      <div style={{ width: '100%', maxWidth: 480, textAlign: 'center', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <img
          src={siteLogo}
          alt="All Things"
          style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid #f97316', marginBottom: 16 }}
          onError={e => { e.target.style.display = 'none'; }}
        />

        {/* Name */}
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6, color: 'var(--secondary)' }}>
          All <span style={{ color: '#f97316' }}>Things</span>
        </h1>

        {/* Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* External social links */}
          {SOCIALS.filter(s => s.label !== 'WhatsApp').map(({ label, href, icon, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = `0 4px 20px ${color}33`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color }}>
                {React.cloneElement(icon, { width: 22, height: 22 })}
              </span>
              <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
              <ArrowIcon />
            </a>
          ))}

          {/* Website — React Router Link to avoid full page reload + re-running ad splash */}
          <Link
            to="/website"
            style={linkStyle}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 4px 20px #f9731633'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: '#f97316' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </span>
            <span style={{ flex: 1, textAlign: 'left' }}>{t.linksWebsite}</span>
            <ArrowIcon />
          </Link>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: 16, marginTop: 40 }}>{copyright}</p>
      </div>
    </div>
  );
}
