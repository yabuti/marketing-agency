import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ clients: 0, news: 0, contacts: 0, users: 0, newContacts: 0, pendingUsers: 0 });
  const [pathStats, setPathStats] = useState({ totalPaths: 0, totalImages: 0, totalVideos: 0 });

  useEffect(() => {
    Promise.all([
      API.get('/clients/admin/all'),
      API.get('/news/admin/all'),
      API.get('/contact'),
      API.get('/users'),
      API.get('/clients/admin/stats'),
    ]).then(([c, n, co, u, ps]) => {
      setStats({
        clients: c.data.length,
        news: n.data.length,
        contacts: co.data.length,
        users: u.data.length,
        newContacts: co.data.filter((x) => x.status === 'new').length,
        pendingUsers: u.data.filter((x) => x.status === 'pending').length,
      });
      setPathStats(ps.data);
    }).catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Clients', value: stats.clients, icon: '🏢', color: '#f97316' },
    { label: 'News Articles', value: stats.news, icon: '📰', color: '#22c55e' },
    { label: 'Contact Messages', value: stats.contacts, icon: '📬', color: '#3b82f6', badge: stats.newContacts, badgeLabel: 'new' },
    { label: 'Registered Users', value: stats.users, icon: '👤', color: '#a855f7', badge: stats.pendingUsers, badgeLabel: 'pending' },
    { label: 'Promotion Paths', value: pathStats.totalPaths, icon: '🛣️', color: '#06b6d4' },
    { label: 'Path Images', value: pathStats.totalImages, icon: '🖼️', color: '#8b5cf6' },
    { label: 'Path Videos', value: pathStats.totalVideos, icon: '🎬', color: '#ec4899' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ color: '#a3a3a3', marginBottom: 32 }}>Welcome back, Admin</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 16, padding: 24, position: 'relative' }}>
            {c.badge > 0 && (
              <span style={{ position: 'absolute', top: 16, right: 16, background: '#ef4444', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                {c.badge} {c.badgeLabel}
              </span>
            )}
            <div style={{ fontSize: 32, marginBottom: 12 }}>{c.icon}</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ color: '#a3a3a3', marginTop: 4, fontSize: 14 }}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
