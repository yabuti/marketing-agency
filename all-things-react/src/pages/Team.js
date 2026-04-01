import React, { useEffect, useState } from 'react';
import API from '../api';

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

export default function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/team').then(r => setMembers(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: '#a3a3a3' }}>Loading...</div>;

  // Group by department
  const grouped = {};
  members.forEach(m => {
    if (!grouped[m.department]) grouped[m.department] = [];
    grouped[m.department].push(m);
  });

  const depts = DEPT_ORDER.filter(d => grouped[d]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(28px, 5vw, 60px) clamp(14px, 4vw, 24px)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <span style={{ background: '#f9731620', color: '#f97316', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
          Our People
        </span>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, margin: '16px 0 12px' }}>
          Meet the <span style={{ color: '#f97316' }}>Team</span>
        </h1>
        <p style={{ color: '#a3a3a3', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>
          The talented people behind All Things Solution
        </p>
      </div>

      {/* Department tree */}
      {depts.map((dept, di) => (
        <div key={dept} style={{ marginBottom: 56 }}>
          {/* Department heading */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div style={{ width: 44, height: 44, background: '#f9731620', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {DEPT_ICONS[dept] || '👥'}
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{dept}</h2>
              <span style={{ color: '#a3a3a3', fontSize: 13 }}>{grouped[dept].length} member{grouped[dept].length !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ flex: 1, height: 1, background: '#262626', marginLeft: 8 }} />
          </div>

          {/* Members grid */}
          <div className="dept-members">
            {grouped[dept].map(member => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MemberCard({ member }) {
  return (
    <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 16, padding: 20, textAlign: 'center', transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#f9731660'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#262626'}>
      {/* Photo */}
      <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 14px', overflow: 'hidden', background: '#262626', border: '3px solid #f9731630', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {member.photo_url ? (
          <img src={member.photo_url} alt={member.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 32, color: '#555' }}>👤</span>
        )}
      </div>
      {/* Name */}
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{member.full_name}</div>
      {/* Position */}
      <div style={{ color: '#f97316', fontSize: 12, fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>{member.position}</div>
      {/* Responsibilities */}
      {member.responsibilities && (
        <div style={{ color: '#666', fontSize: 11, lineHeight: 1.5 }}>{member.responsibilities}</div>
      )}
    </div>
  );
}
