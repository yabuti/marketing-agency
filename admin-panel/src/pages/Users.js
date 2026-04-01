import React, { useEffect, useState } from 'react';
import API from '../api';

// This page shows all registered users with their full profile info
// (same data as Registrations but focused on profile completeness)

const STATUS_COLOR = { pending: '#f97316', active: '#22c55e', suspended: '#ef4444' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    API.get('/users').then((r) => setUsers(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    await API.put(`/users/${id}/status`, { status });
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status } : u));
  };

  const profileComplete = (u) => {
    const fields = [u.company_name, u.phone, u.tin_number, u.business_license_number, u.location];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const filtered = users.filter((u) =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26 }}>All Users</h1>
          <p style={{ color: '#a3a3a3', marginTop: 4 }}>{users.length} registered accounts</p>
        </div>
        <input
          type="text"
          placeholder="Search by name, email, company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '10px 16px', background: '#171717', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 14, width: 280 }}
        />
      </div>

      <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1fr', gap: 0, padding: '12px 20px', borderBottom: '1px solid #262626', background: '#111' }}>
          {['Name / Company', 'Email', 'Business Type', 'Profile', 'Status', 'Actions'].map((h) => (
            <span key={h} style={{ color: '#a3a3a3', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</span>
          ))}
        </div>

        {filtered.map((user, i) => {
          const pct = profileComplete(user);
          return (
            <div key={user.id}
              style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1fr', gap: 0, padding: '16px 20px',
                borderBottom: i < filtered.length - 1 ? '1px solid #1a1a1a' : 'none', alignItems: 'center' }}>
              {/* Name */}
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{user.full_name}</div>
                <div style={{ color: '#a3a3a3', fontSize: 12, marginTop: 2 }}>{user.company_name || '—'}</div>
              </div>
              {/* Email */}
              <div>
                <div style={{ fontSize: 13, color: '#d4d4d4' }}>{user.email}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{user.phone || '—'}</div>
              </div>
              {/* Business type */}
              <div style={{ fontSize: 12, color: '#a3a3a3', lineHeight: 1.4 }}>
                {user.business_type ? user.business_type.slice(0, 40) + (user.business_type.length > 40 ? '...' : '') : '—'}
              </div>
              {/* Profile completeness */}
              <div>
                <div style={{ fontSize: 12, color: pct === 100 ? '#22c55e' : pct >= 60 ? '#f97316' : '#ef4444', fontWeight: 600 }}>{pct}%</div>
                <div style={{ height: 4, background: '#262626', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#22c55e' : pct >= 60 ? '#f97316' : '#ef4444', borderRadius: 2 }} />
                </div>
              </div>
              {/* Status */}
              <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 20, width: 'fit-content',
                background: `${STATUS_COLOR[user.status]}20`, color: STATUS_COLOR[user.status], fontWeight: 600 }}>
                {user.status}
              </span>
              {/* Actions */}
              <div style={{ display: 'flex', gap: 6 }}>
                {user.status !== 'active' && (
                  <button onClick={() => updateStatus(user.id, 'active')}
                    style={{ padding: '5px 10px', background: '#22c55e20', color: '#22c55e', border: '1px solid #22c55e40', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                    Activate
                  </button>
                )}
                {user.status !== 'suspended' && (
                  <button onClick={() => updateStatus(user.id, 'suspended')}
                    style={{ padding: '5px 10px', background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                    Suspend
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#a3a3a3' }}>
            {search ? 'No users match your search.' : 'No registered users yet.'}
          </div>
        )}
      </div>
    </div>
  );
}
