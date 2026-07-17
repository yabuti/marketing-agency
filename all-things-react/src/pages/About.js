import React from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../LangContext';

const Reveal = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
  >
    {children}
  </motion.div>
);

const IconImg = ({ src, alt }) => (
  <img src={src} alt={alt}
    style={{ width: 60, height: 60, borderRadius: 16, objectFit: 'cover', marginBottom: 24 }} />
);

export default function About() {
  const { t } = useLang();
  
  return (
    <div className="page" style={{ paddingTop: 160 }}>
      <div className="hero-gradient" style={{ height: '60vh' }} />
      
      <Reveal>
        <div className="section-tag">{t.aboutTag}</div>
        <h1 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', marginBottom: 24 }}>
          {t.aboutHeroTitle1} <br />
          <span className="serif-title" style={{ color: 'var(--primary)' }}>{t.aboutHeroTitle2}</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 80, maxWidth: 700, lineHeight: 1.4 }}>
          {t.aboutSub} <span style={{ color: 'var(--secondary)', fontWeight: 800 }}>All Things Solution</span>. 
          {t.aboutCatalyst}
        </p>
      </Reveal>

      {/* Who We Are */}
      <Reveal delay={0.2}>
        <div 
          className="creative-card"
          style={{ 
            background: 'var(--bg-subtle)', 
            padding: '80px 60px', 
            marginBottom: 100,
            border: 'none'
          }}
        >
          <h2 style={{ fontSize: 22, marginBottom: 32 }}>{t.whoWeAre}</h2>
          <p style={{ lineHeight: 1.8, color: 'var(--text-muted)', maxWidth: 900 }}>
            {t.whoWeAreText}
          </p>
        </div>
      </Reveal>

      {/* Vision & Mission */}
      <div className="grid-2" style={{ marginBottom: 100 }}>
        {[
          { img: '/images/vision.jpg', title: t.vision, text: t.visionText },
          { img: '/images/mission.jpg', title: t.mission, text: t.missionText },
        ].map((item, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div className="creative-card" style={{ textAlign: 'center', height: '100%' }}>
              <IconImg src={item.img} alt={item.title} />
              <h3 className="serif-title" style={{ fontSize: 24, marginBottom: 24, color: 'var(--primary)' }}>{item.title}</h3>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--text-muted)' }}>{item.text}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Core Values */}
      <section style={{ marginBottom: 120 }}>
        <Reveal>
          <h2 style={{ fontSize: 24, marginBottom: 48, textAlign: 'center' }}>{t.ourCoreValues} <span className="serif-title" style={{ color: 'var(--primary)' }}>{t.ourCoreValuesHighlight}</span></h2>
        </Reveal>
        <div className="grid-3">
          {[
            { img: '/images/innovation and creativity.jpg', title: t.cv1Title, desc: t.cv1Desc },
            { img: '/images/strategy.jpg', title: t.cv2Title, desc: t.cv2Desc },
            { img: '/images/intgrety and transparency.jpg', title: t.cv3Title, desc: t.cv3Desc },
            { img: '/images/customer centered.jpg', title: t.cv4Title, desc: t.cv4Desc },
            { img: '/images/market linkage.jpg', title: t.cv5Title, desc: t.cv5Desc },
          ].map((v, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="creative-card" style={{ padding: 40, height: '100%' }}>
                <div style={{ 
                  width: 60, height: 60, 
                  borderRadius: 16, 
                  overflow: 'hidden',
                  marginBottom: 24
                }}>
                  <img src={v.img} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h4 style={{ fontSize: 18, marginBottom: 16 }}>{v.title}</h4>
                <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>{v.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Strategic Objectives */}
      <section style={{ marginBottom: 120 }}>
        <Reveal>
          <h2 style={{ fontSize: 24, marginBottom: 48 }}>{t.strategic} <span className="serif-title" style={{ color: 'var(--primary)' }}>{t.strategicHighlight}</span></h2>
        </Reveal>
        <div style={{ display: 'grid', gap: 20 }}>
          {[t.so1, t.so2, t.so3, t.so4, t.so5].map((obj, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div 
                style={{ 
                  background: '#fff', 
                  padding: '32px 40px', 
                  borderRadius: 24, 
                  border: '1px solid rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 32,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ 
                  width: 40, height: 40, 
                  background: 'var(--primary)', 
                  color: '#fff', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 18,
                  flexShrink: 0,
                  fontFamily: 'var(--serif)'
                }}>{i + 1}</div>
                <p style={{ color: 'var(--text-main)', margin: 0, fontWeight: 500 }}>{obj}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
