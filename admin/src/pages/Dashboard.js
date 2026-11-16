import React, { useEffect, useState } from 'react';
import API from '../api';
import { useToast } from '../components/Toast';

export default function Dashboard() {
  const [stats, setStats] = useState({ clients: 0, news: 0, contacts: 0, users: 0, newContacts: 0, pendingUsers: 0, products: 0, pendingProducts: 0, orders: 0 });
  const [pathStats, setPathStats] = useState({ totalPaths: 0, totalImages: 0, totalVideos: 0 });
  const toast = useToast();

  useEffect(() => {
    Promise.allSettled([
      API.get('/clients/admin/all'),
      API.get('/news/admin/all'),
      API.get('/contact'),
      API.get('/users'),
      API.get('/clients/admin/stats'),
      API.get('/bazaar/products/admin/all'),
      API.get('/bazaar/orders/admin/all'),
    ]).then(([c, n, co, u, ps, bp, bo]) => {
      const result = (r) => (r.status === 'fulfilled' ? r.value.data : []);
      const products = Array.isArray(result(bp)) ? result(bp) : [];
      const orders = Array.isArray(result(bo)) ? result(bo) : [];
      setStats({
        clients: Array.isArray(result(c)) ? result(c).length : 0,
        news: Array.isArray(result(n)) ? result(n).length : 0,
        contacts: Array.isArray(result(co)) ? result(co).length : 0,
        users: Array.isArray(result(u)) ? result(u).length : 0,
        newContacts: Array.isArray(result(co)) ? result(co).filter((x) => x.status === 'new').length : 0,
        pendingUsers: Array.isArray(result(u)) ? result(u).filter((x) => x.status === 'pending').length : 0,
        products: products.length,
        pendingProducts: products.filter((x) => x.status === 'pending').length,
        orders: orders.length,
      });
      setPathStats(ps.status === 'fulfilled' ? ps.value.data : { totalPaths: 0, totalImages: 0, totalVideos: 0 });
    }).catch(() => {
      toast.error('Failed to load dashboard metrics.');
    });
  }, [toast]);

  const cards = [
    { label: 'Total Clients', value: stats.clients, icon: '🏢', color: '#f97316' },
    { label: 'News Articles', value: stats.news, icon: '📰', color: '#22c55e' },
    { label: 'Contact Messages', value: stats.contacts, icon: '📬', color: '#3b82f6', badge: stats.newContacts, badgeLabel: 'new' },
    { label: 'Registered Users', value: stats.users, icon: '👤', color: '#a855f7', badge: stats.pendingUsers, badgeLabel: 'pending' },
    { label: 'Bazaar Products', value: stats.products, icon: '🛍️', color: '#f97316', badge: stats.pendingProducts, badgeLabel: 'pending' },
    { label: 'Bazaar Orders', value: stats.orders, icon: '💳', color: '#22c55e' },
    { label: 'Promotion Paths', value: pathStats.totalPaths, icon: '🛣️', color: '#06b6d4' },
    { label: 'Path Images', value: pathStats.totalImages, icon: '🖼️', color: '#8b5cf6' },
    { label: 'Path Videos', value: pathStats.totalVideos, icon: '🎬', color: '#ec4899' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>📊 Executive Dashboard</h1>
      <p style={{ color: '#a3a3a3', marginBottom: 32, fontSize: 14 }}>Welcome back to All Things Solution admin center</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 16, padding: '24px 20px', position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            {c.badge > 0 && (
              <span style={{ position: 'absolute', top: 16, right: 16, background: '#ef4444', color: '#fff', fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                {c.badge} {c.badgeLabel}
              </span>
            )}
            <div style={{ fontSize: 30, marginBottom: 12 }}>{c.icon}</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: c.color, letterSpacing: -1 }}>{c.value}</div>
            <div style={{ color: '#a3a3a3', marginTop: 4, fontSize: 13, fontWeight: 600 }}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
