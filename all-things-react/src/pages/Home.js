import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useLang } from '../LangContext';
import { SocialIcons } from '../components/socials';
import AdBanner from '../components/AdBanner';

// --- Components ---

const Reveal = ({ children, width = "100%", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      >
        {children}
      </motion.div>
    </div>
  );
};

const MagneticButton = ({ children, to, className, style }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  const { x, y } = position;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      <Link to={to} className={className} style={style}>
        {children}
      </Link>
    </motion.div>
  );
};

function StatCard({ value, label, delay }) {
  const [count, setCount] = useState(0);
  const numeric = parseInt(value, 10);
  const suffix = value.replace(String(numeric), '');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = numeric;
      const duration = 2000;
      if (end === 0) return;
      const stepTime = Math.abs(Math.floor(duration / end));
      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        }
      }, Math.max(stepTime, 20));
      return () => clearInterval(timer);
    }
  }, [isInView, numeric]);

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay }}
      className="creative-card"
      style={{ textAlign: 'center' }}
    >
      <div style={{ fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 900, color: 'var(--primary)', marginBottom: 8 }}>
        {count}{suffix}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
    </motion.div>
  );
}

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
          ctx.strokeStyle = `rgba(100, 180, 255, ${(limit - toMouse) / limit})`;
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
            ctx.strokeStyle = `rgba(157, 210, 255, ${0.5 * (limit - dist) / limit})`;
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

const TibebPattern = () => (
  <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, opacity: 0.04, pointerEvents: 'none' }}>
    <pattern id="tibeb" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
      <path d="M60 0 L120 60 L60 120 L0 60 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="60" cy="60" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <path d="M0 0 L120 120 M120 0 L0 120" stroke="currentColor" strokeWidth="0.2" opacity="0.5" />
    </pattern>
    <rect width="100%" height="100%" fill="url(#tibeb)" />
  </svg>
);

// --- Service Icons ---
const SvgWrap = ({ children }) => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const SocialIcon = () => <SvgWrap><path d="M17 2a2.83 2.83 0 1 1 0 5.66A2.83 2.83 0 0 1 17 2z"/><path d="M7 9.17a2.83 2.83 0 1 1 0 5.66A2.83 2.83 0 0 1 7 9.17z"/><path d="M17 16.17a2.83 2.83 0 1 1 0 5.66A2.83 2.83 0 0 1 17 16.17z"/><path d="M9.36 11.36l5.28-3.54M9.36 12.64l5.28 3.54"/></SvgWrap>;
const ContentIcon = () => <SvgWrap><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></SvgWrap>;
const GrowthIcon = () => <SvgWrap><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></SvgWrap>;
const AdsIcon = () => <SvgWrap><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v6M9 10h6"/></SvgWrap>;
const BrandIcon = () => <SvgWrap><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18"/><circle cx="12" cy="12" r="3"/></SvgWrap>;
const OutdoorIcon = () => <SvgWrap><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21V9"/></SvgWrap>;
const EcomIcon = () => <SvgWrap><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></SvgWrap>;
const ConsultIcon = () => <SvgWrap><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/><path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z"/></SvgWrap>;

function ServiceCard({ svc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="service-card" style={{
      background: '#fff', border: '2px solid rgba(30,41,59,0.15)',
      borderRadius: 40, padding: '32px 24px 32px', paddingTop: 140,
      position: 'relative', textAlign: 'center',
      boxShadow: hovered ? '0 16px 40px -8px rgba(255,122,0,0.12)' : '0 4px 20px rgba(0,0,0,0.04)',
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', height: '100%', cursor: 'pointer',
      transform: hovered ? 'translateY(-4px)' : 'none',
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        position: 'absolute', top: 30, left: '50%',
        transform: 'translateX(-50%)',
        width: 110, height: 110,
        background: 'linear-gradient(135deg, var(--primary) 0%, #ff9a44 100%)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 30px rgba(255,122,0,0.2)'
      }}>
        {svc.icon}
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 900, fontStyle: 'italic', marginBottom: 14, color: 'var(--secondary)' }}>{svc.title}</h3>
      <div style={{
        overflow: 'hidden',
        maxHeight: hovered ? 120 : 0,
        opacity: hovered ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>{svc.desc}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useLang();
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);



  return (
    <div ref={targetRef} style={{ position: 'relative' }}>
      <div className="hero-gradient" />
      <TibebPattern />
      
      <div className="page" style={{ paddingTop: 0 }}>
        {/* Immersive Hero Section */}
        <section style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <ParticleCanvas />
          <motion.div style={{ y, opacity, scale }}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="section-tag"
            >
              ✓ {t.heroTag}
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontWeight: 700, lineHeight: 1.4, marginBottom: 48 }}
            >
              <div style={{ fontSize: 'clamp(20px, 3.5vw, 30px)', color: 'var(--secondary)', fontWeight: 400, lineHeight: 1.2, marginBottom: 4 }}>
                {t.heroTitle1}
              </div>
              <div style={{ 
                fontSize: 'clamp(20px, 3.5vw, 30px)',
                color: 'var(--secondary)',
                fontWeight: 900,
                lineHeight: 1.1
              }}>
                {t.heroTitle2}
              </div>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1 }}
              style={{ fontSize: 14, maxWidth: 800, margin: '0 auto 64px', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.4 }}
            >
              {t.heroDesc}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}
            >
              {(() => {
                const isSeller = localStorage.getItem('userToken');
                const isBuyer = localStorage.getItem('buyerToken');
                if (isSeller || isBuyer) {
                  return (
                    <MagneticButton to={isSeller ? '/dashboard' : '/buyer-dashboard'} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {t.profileTab || 'View Profile'}
                    </MagneticButton>
                  );
                }
                return (
                  <MagneticButton to="/login" className="btn-primary">
                    {t.applyNow} →
                  </MagneticButton>
                );
              })()}
              <MagneticButton to="/clients" className="btn-outline">
                {t.viewClients}
              </MagneticButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{ marginTop: 64 }}
            >
              <Reveal>
                <div style={{ margin: '0 auto 48px', maxWidth: 900 }}>
                  <AdBanner />
                </div>
              </Reveal>
              <p style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 20, color: 'var(--primary)' }}>{t.connectWithUs}</p>
              <SocialIcons size={56} iconSize={24} />
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1, repeat: Infinity, repeatType: "reverse" }}
            style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)' }}
          >
            <div style={{ width: 2, height: 60, background: 'linear-gradient(to bottom, var(--primary), transparent)', margin: '0 auto' }} />
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="grid-3" style={{ margin: '100px 0' }}>
          <StatCard value="50+" label={t.totalClients} delay={0.1} />
          <StatCard value="100%" label={t.licensed} delay={0.2} />
          <StatCard value="200%" label={t.avgGrowth} delay={0.3} />
        </section>

        {/* Roots & Story Section */}
        <section style={{ padding: '100px 0' }}>
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <Reveal>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', top: -20, left: -20, right: 20, bottom: 20, 
                  border: '2px solid var(--primary)', borderRadius: 32, zIndex: -1 
                }} />
                <img src="/images/bg.jpg" alt="Our Roots" style={{ 
                  width: '100%', height: 600, objectFit: 'cover', borderRadius: 32,
                  boxShadow: '0 40px 80px rgba(0,0,0,0.15)'
                }} />
              </div>
            </Reveal>
            <div style={{ padding: '0 40px' }}>
              <Reveal delay={0.2}>
                <div className="section-tag">{t.ourRoots}</div>
                <h2 style={{ fontSize: 'clamp(20px, 3vw, 28px)', marginBottom: 32 }}>
                  {t.bridgingTitle} <span className="serif-title" style={{ color: 'var(--primary)' }}>{t.bridgingHighlight}</span>
                </h2>
                <p style={{ lineHeight: 1.6, marginBottom: 40 }}>
                  {t.rootsText}
                </p>
                <MagneticButton to="/about" className="btn-outline">
                  {t.ourStory}
                </MagneticButton>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section style={{ padding: '100px 0', overflow: 'hidden' }}>
          <Reveal>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 24 }}>
              <div>
                <div className="section-tag">{t.ourServicesTag}</div>
                <h2 style={{ fontSize: 'clamp(18px, 2.5vw, 24px)' }}>{t.whatWeDeliver} <span className="serif-title" style={{ color: 'var(--primary)' }}>{t.whatWeDeliverHighlight}</span></h2>
              </div>
              <Link to="/about" style={{ background: 'var(--primary)', color: '#fff', padding: '14px 32px', borderRadius: 100, fontWeight: 800, fontSize: 15, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {t.viewMore}
              </Link>
            </div>
          </Reveal>

          <Reveal>
            <p style={{ color: 'var(--text-muted)', marginBottom: 48 }}>
              {t.servicesBoost}
            </p>
          </Reveal>

          <div className="grid-3">
            {[
              { icon: <SocialIcon />, title: t.svcSocialMedia, desc: t.svcSocialMediaDesc },
              { icon: <ContentIcon />, title: t.svcContentCreation, desc: t.svcContentDesc },
              { icon: <GrowthIcon />, title: t.svcGrowthStrategy, desc: t.svcGrowthDesc },
              { icon: <AdsIcon />, title: t.svcPaidAds, desc: t.svcAdsDesc },
              { icon: <BrandIcon />, title: t.svcBranding, desc: t.svcBrandingDesc },
              { icon: <OutdoorIcon />, title: t.svcOutdoor, desc: t.svcOutdoorDesc },
              { icon: <EcomIcon />, title: t.svcEcommerce, desc: t.svcEcomDesc },
              { icon: <ConsultIcon />, title: t.svcConsultation, desc: t.svcConsultDesc },
            ].map((svc, idx) => (
              <Reveal key={idx} delay={idx * 0.05}>
                <ServiceCard svc={svc} />
              </Reveal>
            ))}
          </div>
        </section>


        {/* App Stores */}
        <Reveal>
          <motion.div 
            whileHover={{ scale: 1.01 }}
            style={{ 
              background: 'var(--secondary)', 
              borderRadius: 48, 
              padding: '100px 60px', 
              textAlign: 'center',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 50px 100px rgba(30, 41, 59, 0.3)'
            }}
          >
            <img src="/images/e-commerce.jpg" alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }} />
            <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.1, transform: 'translate(20%, -20%)' }}>
              <TibebPattern />
            </div>
            
            <h2 style={{ color: '#fff', fontSize: 'clamp(22px, 3.5vw, 30px)', marginBottom: 20 }}>{t.readyToScale}</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' }}>{t.joinEntrepreneurs}</p>
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" style={appBtnStyles}><AppStoreIcon /> {t.appStore}</a>
              <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" style={appBtnStyles}><PlayStoreIcon /> {t.googlePlay}</a>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </div>
  );
}

const appBtnStyles = {
  display: 'flex', 
  alignItems: 'center', 
  gap: 16, 
  padding: '20px 40px', 
  background: 'rgba(255,255,255,0.05)', 
  borderRadius: 20, 
  color: '#fff', 
  fontWeight: 700,
  fontSize: 18,
  border: '1px solid rgba(255,255,255,0.1)',
  transition: 'all 0.3s',
  textDecoration: 'none',
  backdropFilter: 'blur(10px)'
};

const AppStoreIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
);

const PlayStoreIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.64.24.99.2l12.6-7.27-2.72-2.72-10.87 9.79zM.5 1.4C.19 1.74 0 2.28 0 2.98v18.04c0 .7.19 1.24.51 1.58l.08.08 10.1-10.1v-.24L.58 1.32.5 1.4zM20.49 10.5l-2.72-1.57-3.04 3.04 3.04 3.04 2.74-1.58c.78-.45.78-1.48-.02-1.93zM4.17.24L16.77 7.5l-2.72 2.72L3.18.47c.3-.17.65-.24.99-.23z"/></svg>
);
