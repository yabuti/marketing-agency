import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null); // full client detail modal
  const navigate = useNavigate();

  const load = () => {
    API.get('/clients/admin/all')
      .then((r) => setClients(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const deleteClient = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    await API.delete(`/clients/${id}`);
    load();
  };

  const toggleActive = async (client) => {
    await API.put(`/clients/${client.id}`, { ...client, is_active: client.is_active ? 0 : 1 });
    load();
  };

  const viewClient = async (id) => {
    const { data } = await API.get(`/clients/${id}`);
    // Also get paths
    const { data: paths } = await API.get(`/clients/${id}/paths`);
    setViewing({ ...data, promotionPaths: paths });
  };

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26 }}>Clients</h1>
          <p style={{ color: '#a3a3a3', marginTop: 4 }}>{clients.length} total</p>
        </div>
        <button onClick={() => navigate('/clients/new')} style={btnPrimary}>+ Add Client</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {clients.map((c) => (
          <div key={c.id} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 36 }}>{c.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{c.name}</div>
              <div style={{ color: '#a3a3a3', fontSize: 13, marginTop: 2 }}>{c.category}</div>
              <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: '#a3a3a3' }}>📸 {c.images?.length || 0} images</span>
                <span style={{ fontSize: 12, color: '#a3a3a3' }}>🎬 {c.videos?.length || 0} videos</span>
                <span style={{ fontSize: 12, color: '#a3a3a3' }}>🛣️ {c.promotionPaths?.length || 0} paths</span>
              </div>
            </div>
            <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: c.is_active ? '#22c55e20' : '#ef444420', color: c.is_active ? '#22c55e' : '#ef4444' }}>
              {c.is_active ? 'Active' : 'Hidden'}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => viewClient(c.id)} style={{ ...btnSecondary, color: '#06b6d4', borderColor: '#06b6d440' }}>View</button>
              <button onClick={() => toggleActive(c)} style={btnSecondary}>{c.is_active ? 'Hide' : 'Show'}</button>
              <button onClick={() => navigate(`/clients/${c.id}/edit`)} style={btnSecondary}>Edit</button>
              <button onClick={() => deleteClient(c.id, c.name)} style={btnDanger}>Delete</button>
            </div>
          </div>
        ))}
        {clients.length === 0 && <p style={{ color: '#a3a3a3' }}>No clients yet. Add your first one.</p>}
      </div>

      {/* View Modal */}
      {viewing && <ClientModal client={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function ClientModal({ client, onClose }) {
  const totalPathImages = client.promotionPaths?.reduce((sum, p) => sum + (p.images?.length || 0), 0) || 0;
  const totalPathVideos = client.promotionPaths?.reduce((sum, p) => sum + (p.videos?.length || 0), 0) || 0;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 20, width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontSize: 48 }}>{client.icon}</span>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>{client.name}</h2>
              <span style={{ background: '#f9731620', color: '#f97316', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>{client.category}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#a3a3a3', fontSize: 24, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Media summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { icon: '📸', label: 'Main Images', val: client.images?.length || 0, color: '#8b5cf6' },
            { icon: '🎬', label: 'Main Videos', val: client.videos?.length || 0, color: '#ec4899' },
            { icon: '🛣️', label: 'Promo Paths', val: client.promotionPaths?.length || 0, color: '#06b6d4' },
            { icon: '🖼️', label: 'Path Media', val: totalPathImages + totalPathVideos, color: '#22c55e' },
          ].map(s => (
            <div key={s.label} style={{ background: '#0a0a0a', border: `1px solid ${s.color}30`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ color: '#666', fontSize: 11 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            ['📍 Location', client.location],
            ['📅 Established', client.established],
            ['📞 Phone', client.phone],
            ['🌐 Website', client.website],
            ['🏷️ Business Type', client.business_type],
            ['📋 License', client.license_number],
            ['🔢 TIN', client.tin_number],
            ['👥 Followers', client.followers],
            ['📈 Growth', client.growth],
            ['💬 Engagement', client.engagement],
          ].filter(([, v]) => v).map(([label, val]) => (
            <div key={label} style={{ background: '#0a0a0a', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ color: '#666', fontSize: 11 }}>{label}</div>
              <div style={{ color: '#d4d4d4', fontSize: 13, marginTop: 2 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        {client.full_description && (
          <div style={{ background: '#0a0a0a', borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <div style={{ color: '#a3a3a3', fontSize: 12, marginBottom: 6 }}>Description</div>
            <p style={{ color: '#d4d4d4', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{client.full_description}</p>
          </div>
        )}

        {/* Promotion paths summary */}
        {client.promotionPaths?.length > 0 && (
          <div>
            <h3 style={{ fontSize: 15, color: '#f97316', marginBottom: 12 }}>🛣️ Promotion Paths</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {client.promotionPaths.map(p => (
                <div key={p.id} style={{ background: '#0a0a0a', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.title}</div>
                    {p.path_date && <div style={{ color: '#666', fontSize: 12 }}>{new Date(p.path_date).toLocaleDateString()}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ color: '#8b5cf6', fontSize: 13 }}>📸 {p.images?.length || 0}/5</span>
                    <span style={{ color: '#ec4899', fontSize: 13 }}>🎬 {p.videos?.length || 0}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const btnPrimary = { background: '#f97316', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' };
const btnSecondary = { background: '#262626', color: '#fff', border: '1px solid #333', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' };
const btnDanger = { background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' };
