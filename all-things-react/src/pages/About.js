import React from 'react';
import { useLang } from '../LangContext';

export default function About() {
  const { t } = useLang();
  return (
    <div className="page">
      <h1 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, marginBottom: 8 }}>{t.aboutTitle}</h1>
      <p style={{ color: '#a3a3a3', fontSize: 16, marginBottom: 40 }}>
        {t.aboutSub} <span style={{ color: '#f97316', fontWeight: 700 }}>All Things Solution</span>
      </p>

      <div className="grid-2" style={{ marginBottom: 48 }}>
        {[
          ['🎯', t.vision, t.visionText],
          ['🚀', t.mission, t.missionText],
        ].map(([icon, title, text]) => (
          <div key={title} style={{ background: '#171717', border: '2px solid #f97316', borderRadius: 20, padding: 'clamp(20px, 3vw, 28px)', textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>{icon}</div>
            <h3 style={{ color: '#f97316', fontSize: 20, fontWeight: 800, marginBottom: 12 }}>{title}</h3>
            <p style={{ color: '#a3a3a3', lineHeight: 1.7, fontSize: 14 }}>{text}</p>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 800, marginBottom: 20 }}>{t.strategicObjectives}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 48 }}>
        {[
          ['🌍', t.so1],
          ['📈', t.so2],
          ['💻', t.so3],
          ['🤝', t.so4],
          ['👨‍💼', t.so5],
        ].map(([icon, obj], i) => (
          <div key={i} style={{
            background: 'linear-gradient(135deg, #171717, #1a1a1a)',
            border: '1px solid #f9731630',
            borderLeft: '4px solid #f97316',
            borderRadius: 12, padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
            transition: 'transform 0.2s',
          }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>{icon}</span>
            <span style={{ color: '#e0e0e0', fontSize: 14, lineHeight: 1.6 }}>{obj}</span>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 800, marginBottom: 20 }}>{t.coreValues}</h2>
      <div className="grid-2" style={{ marginBottom: 48 }}>
        {[
          ['💡', t.cv1Title, t.cv1Desc],
          ['🎯', t.cv2Title, t.cv2Desc],
          ['🛡️', t.cv3Title, t.cv3Desc],
          ['💻', t.cv4Title, t.cv4Desc],
          ['📊', t.cv5Title, t.cv5Desc],
        ].map(([icon, title, desc]) => (
          <div key={title} style={{
            background: 'linear-gradient(135deg, #171717, #1c1c1c)',
            border: '1px solid #262626',
            borderRadius: 16, padding: '22px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: '#f9731620', border: '1px solid #f9731640',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>{icon}</div>
            <div style={{ color: '#f97316', fontWeight: 700, fontSize: 15 }}>{title}</div>
            <div style={{ color: '#a3a3a3', fontSize: 13, lineHeight: 1.6 }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
