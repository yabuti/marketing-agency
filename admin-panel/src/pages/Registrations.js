import React, { useEffect, useState } from 'react';
import API from '../api';

const STATUS_COLOR = { pending: '#f97316', active: '#22c55e', suspended: '#ef4444' };

export default function Registrations() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = () => {
    API.get('/users').then((r) => setUsers(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    await API.put(`/users/${id}/status`, { status });
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status } : u));
    if (selected?.id === id) setSelected((s) => ({ ...s, status }));
  };

  const del = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    await API.delete(`/users/${id}`);
    setSelected(null);
    load();
  };

  const filtered = filter === 'all' ? users : users.filter((u) => u.status === filter);

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26 }}>Registered Users</h1>
          <p style={{ color: '#a3a3a3', marginTop: 4 }}>
            {users.length} total · <span style={{ color: '#f97316' }}>{users.filter((u) => u.status === 'pending').length} pending review</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'pending', 'active', 'suspended'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #333', fontSize: 13, cursor: 'pointer',
                background: filter === f ? '#f97316' : '#262626', color: filter === f ? '#000' : '#fff', fontWeight: filter === f ? 700 : 400 }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.3fr' : '1fr', gap: 20 }}>
        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((user) => (
            <div key={user.id} onClick={() => setSelected(user)}
              style={{ background: selected?.id === user.id ? '#1e1e1e' : '#171717',
                border: `1px solid ${selected?.id === user.id ? '#f97316' : user.status === 'pending' ? '#f9731640' : '#262626'}`,
                borderRadius: 12, padding: 16, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{user.full_name}</div>
                  <div style={{ color: '#a3a3a3', fontSize: 13, marginTop: 2 }}>
                    {user.company_name || 'No company'} · {user.email}
                  </div>
                  <div style={{ color: '#666', fontSize: 12, marginTop: 2 }}>{user.business_type || 'No business type'}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20,
                    background: `${STATUS_COLOR[user.status]}20`, color: STATUS_COLOR[user.status], fontWeight: 600 }}>
                    {user.status}
                  </span>
                  <span style={{ fontSize: 11, color: '#555' }}>{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p style={{ color: '#a3a3a3', padding: 20 }}>No users found.</p>}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: 28, height: 'fit-content', position: 'sticky', top: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{selected.full_name}</h3>
                <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20,
                  background: `${STATUS_COLOR[selected.status]}20`, color: STATUS_COLOR[selected.status] }}>
                  {selected.status}
                </span>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#a3a3a3', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            {/* Status actions */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {['pending', 'active', 'suspended'].map((s) => (
                <button key={s} onClick={() => updateStatus(selected.id, s)}
                  style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${STATUS_COLOR[s]}40`,
                    background: selected.status === s ? `${STATUS_COLOR[s]}20` : 'transparent',
                    color: STATUS_COLOR[s], fontSize: 13, cursor: 'pointer', fontWeight: selected.status === s ? 700 : 400 }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Business Info */}
            <Section title="Business Information">
              {[
                ['🏢 Company', selected.company_name],
                ['💼 Business Type', selected.business_type],
                ['📍 Location', selected.location],
                ['🌐 Website', selected.website],
                ['🔢 TIN Number', selected.tin_number],
                ['📋 E-LMIS', selected.elmis_registration],
                ['📄 License No.', selected.business_license_number],
              ].map(([l, v]) => v && <InfoRow key={l} label={l} value={v} />)}
            </Section>

            {/* Contact Info */}
            <Section title="Contact Information">
              {[
                ['📧 Email', selected.email],
                ['📞 Phone', selected.phone],
                ['📅 Registered', new Date(selected.created_at).toLocaleString()],
              ].map(([l, v]) => v && <InfoRow key={l} label={l} value={v} />)}
            </Section>

            {/* Profile extras */}
            {(selected.bio || selected.instagram || selected.services_needed) && (
              <Section title="Profile Details">
                {selected.bio && <InfoRow label="Bio" value={selected.bio} />}
                {selected.instagram && <InfoRow label="📸 Instagram" value={selected.instagram} />}
                {selected.tiktok && <InfoRow label="🎵 TikTok" value={selected.tiktok} />}
                {selected.telegram && <InfoRow label="✈️ Telegram" value={selected.telegram} />}
                {selected.employees && <InfoRow label="👥 Employees" value={selected.employees} />}
                {selected.established && <InfoRow label="📅 Established" value={selected.established} />}
                {selected.services_needed && <InfoRow label="🎯 Services Needed" value={selected.services_needed} />}
                {selected.notes && <InfoRow label="📝 Notes" value={selected.notes} />}
              </Section>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              {selected.email && (
                <a href={`mailto:${selected.email}`}
                  style={{ padding: '9px 18px', background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f640', borderRadius: 8, fontSize: 13, textDecoration: 'none' }}>
                  📧 Email User
                </a>
              )}
              {selected.phone && (
                <a href={`tel:${selected.phone}`}
                  style={{ padding: '9px 18px', background: '#22c55e20', color: '#22c55e', border: '1px solid #22c55e40', borderRadius: 8, fontSize: 13, textDecoration: 'none' }}>
                  📞 Call
                </a>
              )}
              <button onClick={() => del(selected.id, selected.full_name)}
                style={{ marginLeft: 'auto', padding: '9px 18px', background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 20 }}>
    <p style={{ color: '#f97316', fontSize: 12, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', gap: 12 }}>
    <span style={{ color: '#a3a3a3', fontSize: 13, minWidth: 150, flexShrink: 0 }}>{label}</span>
    <span style={{ color: '#fff', fontSize: 13, wordBreak: 'break-word' }}>{value}</span>
  </div>
);
