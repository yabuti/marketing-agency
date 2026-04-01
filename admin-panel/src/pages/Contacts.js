import React, { useEffect, useState } from 'react';
import API from '../api';

const STATUS_COLOR = { new: '#f97316', read: '#3b82f6', contacted: '#22c55e' };

export default function Contacts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = () => {
    API.get('/contact').then((r) => setItems(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    await API.put(`/contact/${id}/status`, { status });
    setItems((prev) => prev.map((x) => x.id === id ? { ...x, status } : x));
    if (selected?.id === id) setSelected((s) => ({ ...s, status }));
  };

  const del = async (id) => {
    if (!window.confirm('Delete this submission?')) return;
    await API.delete(`/contact/${id}`);
    setSelected(null);
    load();
  };

  const open = (item) => {
    setSelected(item);
    if (item.status === 'new') updateStatus(item.id, 'read');
  };

  const filtered = filter === 'all' ? items : items.filter((x) => x.status === filter);

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26 }}>Contact Messages</h1>
          <p style={{ color: '#a3a3a3', marginTop: 4 }}>
            {items.length} total · <span style={{ color: '#f97316' }}>{items.filter((x) => x.status === 'new').length} new</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'new', 'read', 'contacted'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #333', fontSize: 13, cursor: 'pointer',
                background: filter === f ? '#f97316' : '#262626', color: filter === f ? '#000' : '#fff', fontWeight: filter === f ? 700 : 400 }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.2fr' : '1fr', gap: 20 }}>
        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((item) => (
            <div key={item.id} onClick={() => open(item)}
              style={{ background: selected?.id === item.id ? '#1e1e1e' : '#171717',
                border: `1px solid ${selected?.id === item.id ? '#f97316' : item.status === 'new' ? '#f9731640' : '#262626'}`,
                borderRadius: 12, padding: 16, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{item.full_name}</div>
                  <div style={{ color: '#a3a3a3', fontSize: 13, marginTop: 2 }}>
                    {item.company_name || 'No company'} · {item.phone}
                  </div>
                  {item.message && (
                    <div style={{ color: '#666', fontSize: 12, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
                      {item.message}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20,
                    background: `${STATUS_COLOR[item.status]}20`, color: STATUS_COLOR[item.status], fontWeight: 600 }}>
                    {item.status}
                  </span>
                  <span style={{ fontSize: 11, color: '#555' }}>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p style={{ color: '#a3a3a3', padding: 20 }}>No submissions.</p>}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: 28, height: 'fit-content', position: 'sticky', top: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{selected.full_name}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#a3a3a3', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {['new', 'read', 'contacted'].map((s) => (
                <button key={s} onClick={() => updateStatus(selected.id, s)}
                  style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${STATUS_COLOR[s]}40`,
                    background: selected.status === s ? `${STATUS_COLOR[s]}20` : 'transparent',
                    color: STATUS_COLOR[s], fontSize: 13, cursor: 'pointer', fontWeight: selected.status === s ? 700 : 400 }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['📧 Email', selected.email],
                ['📞 Phone', selected.phone],
                ['🏢 Company', selected.company_name],
                ['💼 Business Type', selected.business_type],
                ['🔢 TIN Number', selected.tin_number],
                ['📋 E-LMIS', selected.elmis_registration],
                ['📄 License No.', selected.business_license],
                ['📅 Submitted', new Date(selected.created_at).toLocaleString()],
              ].map(([label, value]) => value && (
                <div key={label} style={{ display: 'flex', gap: 12 }}>
                  <span style={{ color: '#a3a3a3', fontSize: 13, minWidth: 140 }}>{label}</span>
                  <span style={{ color: '#fff', fontSize: 13 }}>{value}</span>
                </div>
              ))}
            </div>

            {selected.message && (
              <div style={{ marginTop: 20, padding: 16, background: '#0a0a0a', borderRadius: 10, borderLeft: '3px solid #f97316' }}>
                <p style={{ color: '#a3a3a3', fontSize: 12, marginBottom: 6 }}>Message</p>
                <p style={{ color: '#fff', fontSize: 14, lineHeight: 1.7 }}>{selected.message}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              {selected.email && (
                <a href={`mailto:${selected.email}`}
                  style={{ padding: '9px 18px', background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f640', borderRadius: 8, fontSize: 13, textDecoration: 'none' }}>
                  📧 Reply by Email
                </a>
              )}
              {selected.phone && (
                <a href={`tel:${selected.phone}`}
                  style={{ padding: '9px 18px', background: '#22c55e20', color: '#22c55e', border: '1px solid #22c55e40', borderRadius: 8, fontSize: 13, textDecoration: 'none' }}>
                  📞 Call
                </a>
              )}
              <button onClick={() => del(selected.id)}
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
