import React, { useEffect, useState } from 'react';
import API from '../api';
import { useLang } from '../LangContext';

const DEPT_ORDER = [
  'Executive Management',
  'Creative & Digital Marketing',
  'Technology & Platform Support',
  'Finance & Administration',
  'Customer & Sales',
];

const DEPT_ICONS = {
  'Executive Management': '👔',
  'Creative & Digital Marketing': '🎨',
  'Technology & Platform Support': '💻',
  'Finance & Administration': '📊',
  'Customer & Sales': '🤝',
};

const DEPT_IMAGES = {
  'Executive Management': '/images/executive managment team.jpg',
  'Creative & Digital Marketing': '/images/creative&digital marketing team.jpg',
  'Technology & Platform Support': '/images/technology&platform support.jpg',
  'Finance & Administration': '/images/finance&administration.jpg',
  'Customer & Sales': '/images/customer&sales.jpg',
};

export default function Team() {
  const { t, lang } = useLang();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    API.get(`/team?lang=${lang}`).then(r => setMembers(r.data)).finally(() => setLoading(false));
  }, [lang]);

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>{t.loading}</div>;

  const grouped = {};
  members.forEach(m => {
    if (!grouped[m.department]) grouped[m.department] = [];
    grouped[m.department].push(m);
  });

  const depts = DEPT_ORDER.filter(d => grouped[d]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(16px, 3vw, 28px) clamp(14px, 4vw, 24px)' }}>
      {/* Profile Modal */}
      {selectedMember && (
        <div
          onClick={() => setSelectedMember(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 28,
              padding: 40,
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedMember(null)}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'rgba(0,0,0,0.06)', border: 'none',
                borderRadius: '50%', width: 36, height: 36,
                fontSize: 16, cursor: 'pointer', color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>

            {/* Department badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255, 122, 0, 0.08)', color: 'var(--primary)',
              padding: '6px 14px', borderRadius: 100,
              fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 24,
            }}>
              {DEPT_ICONS[selectedMember.department] || '👥'} {selectedMember.department}
            </div>

            {/* Photo */}
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              margin: '0 auto 20px', overflow: 'hidden',
              background: 'var(--bg-subtle)',
              border: '4px solid rgba(255, 122, 0, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {selectedMember.photo_url ? (
                <img src={selectedMember.photo_url} alt={selectedMember.full_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 48, color: '#ccc' }}>👤</span>
              )}
            </div>

            {/* Name */}
            <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 6, color: 'var(--secondary)' }}>
              {selectedMember.full_name}
            </h2>

            {/* Position */}
            <div style={{ color: 'var(--primary)', fontSize: 15, fontWeight: 700, marginBottom: 20 }}>
              {selectedMember.position}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', marginBottom: 20 }} />

            {/* Responsibilities */}
            {selectedMember.responsibilities && (
              <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, textAlign: 'left' }}>
                {selectedMember.responsibilities}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255, 122, 0, 0.08)', color: 'var(--primary)',
          padding: '8px 18px', borderRadius: 100,
          fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
          marginBottom: 20,
        }}>
          {t.teamOurPeople}
        </span>
        <h1 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 900, margin: '0 0 16px' }}>
          {t.teamTitle} <span style={{ color: 'var(--primary)' }}>{t.teamTitleHighlight}</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>
          {t.teamSubtitle}
        </p>
      </div>

      {/* Department tree */}
      {depts.map((dept) => (
        <div key={dept} style={{ marginBottom: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div style={{
              width: 48, height: 48,
              borderRadius: 14, overflow: 'hidden', flexShrink: 0,
            }}>
              {DEPT_IMAGES[dept] ? (
                <img src={DEPT_IMAGES[dept]} alt={dept} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'rgba(255, 122, 0, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {DEPT_ICONS[dept] || '👥'}
                </div>
              )}
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: 'var(--secondary)' }}>
                {t.depts?.[dept] || dept}
              </h2>

            </div>
            <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)', marginLeft: 8 }} />
          </div>

          <div className="dept-members">
            {grouped[dept].filter((_, i) =>
              !(dept === 'Technology & Platform Support' && i === 1) &&
              !(dept === 'Customer & Sales' && i === 1)
            ).map(member => (
              <MemberCard key={member.id} member={member} onViewProfile={() => setSelectedMember(member)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MemberCard({ member, onViewProfile }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: `2px solid ${hovered ? 'rgba(255,122,0,0.3)' : 'rgba(30,41,59,0.15)'}`,
        borderRadius: 40,
        padding: '28px 24px 24px',
        paddingTop: 72,
        textAlign: 'center',
        position: 'relative',
        boxShadow: hovered ? '0 20px 40px -10px rgba(255,122,0,0.12)' : '0 4px 20px rgba(0,0,0,0.04)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}
    >
      {/* Photo - overlapping circle */}
      <div style={{
        position: 'absolute', top: -40, left: '50%',
        transform: 'translateX(-50%)',
        width: 100, height: 100, borderRadius: '50%',
        overflow: 'hidden',
        background: 'var(--bg-subtle)',
        border: '6px solid #fff',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {member.photo_url ? (
          <img src={member.photo_url} alt={member.full_name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        ) : null}
        <span style={{ fontSize: 40, color: '#ccc', display: member.photo_url ? 'none' : 'flex' }}>👤</span>
      </div>

      {/* Name */}
      <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6, color: 'var(--secondary)' }}>
        {member.full_name}
      </div>

      {/* Position */}
      <div style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 700, marginBottom: 12, lineHeight: 1.4 }}>
        {member.position}
      </div>

      {/* Responsibilities */}
      {member.responsibilities && (
        <div style={{
          color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginBottom: 16,
        }}>
          {member.responsibilities}
        </div>
      )}

      {/* View Profile button */}
      <button
        onClick={onViewProfile}
        style={{
          marginTop: 'auto',
          padding: '9px 24px',
          background: hovered ? 'var(--primary)' : 'rgba(255,122,0,0.06)',
          color: hovered ? '#fff' : 'var(--primary)',
          border: '1.5px solid rgba(255,122,0,0.2)',
          borderRadius: 100,
          fontWeight: 700, fontSize: 13,
          cursor: 'pointer',
          transition: 'all 0.25s',
          width: '100%',
        }}
      >
        {t.viewProfile}
      </button>
    </div>
  );
}
