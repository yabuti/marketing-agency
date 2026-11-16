import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import Pagination from '../components/Pagination';
import useConfirm from '../components/ConfirmModal';
import { useToast } from '../components/Toast';

const PER_PAGE = 10;

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null); // full client detail modal
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();

  const load = () => {
    API.get('/clients/admin/all')
      .then((r) => setClients(r.data))
      .catch((err) => toast.error(err.response?.data?.message || 'Could not load clients.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const deleteClient = async (id, name) => {
    if (!(await confirm.ask(`Delete client "${name}" and all associated promotional paths?`, { okLabel: 'Delete Client' }))) return;
    try {
      await API.post(`/clients/${id}`, { _method: 'DELETE' });
      toast.success(`Client "${name}" deleted.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete client.');
    }
  };

  const toggleActive = async (client) => {
    const nextStatus = client.is_active ? 0 : 1;
    try {
      await API.put(`/clients/${client.id}`, { is_active: nextStatus });
      toast.info(`Client is now ${nextStatus ? 'visible' : 'hidden'}.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status change failed.');
    }
  };

  const viewClient = async (id) => {
    try {
      const { data } = await API.get(`/clients/${id}`);
      const { data: paths } = await API.get(`/clients/${id}/paths`);
      setViewing({ ...data, promotionPaths: paths });
    } catch (err) {
      toast.error('Failed to load client details.');
    }
  };

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  const totalPages = Math.max(1, Math.ceil(clients.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = clients.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>🏢 Clients & Brands</h1>
          <p style={{ color: '#a3a3a3', marginTop: 4 }}>{clients.length} registered partner companies</p>
        </div>
        <button onClick={() => navigate('/clients/new')} style={btnPrimary}>+ Add Client</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {paginated.map((c) => (
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
        {clients.length === 0 && <p style={{ color: '#a3a3a3' }}>No clients found.</p>}
      </div>

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />

      {/* Modal */}
      {viewing && <ClientDetailModal client={viewing} onClose={() => setViewing(null)} />}
      {confirm.modal}
    </div>
  );
}

function ClientDetailModal({ client, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(4px)' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 40 }}>{client.icon}</span>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>{client.name}</h2>
              <span style={{ color: '#a3a3a3', fontSize: 13 }}>{client.category}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#262626', border: '1px solid #333', color: '#a3a3a3', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            ['📍 Location', client.location],
            ['📞 Phone', client.phone],
            ['🌐 Website', client.website],
            ['📅 Established', client.established],
            ['🏷️ Business Type', client.business_type],
            ['📋 License', client.license_number],
            ['🔢 TIN', client.tin_number],
          ].filter(([, v]) => v).map(([label, val]) => (
            <div key={label} style={{ background: '#0a0a0a', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ color: '#666', fontSize: 11 }}>{label}</div>
              <div style={{ color: '#d4d4d4', fontSize: 13, marginTop: 2 }}>{val}</div>
            </div>
          ))}
        </div>

        {client.full_description && (
          <div style={{ background: '#0a0a0a', borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <div style={{ color: '#a3a3a3', fontSize: 12, marginBottom: 6 }}>Description</div>
            <p style={{ color: '#d4d4d4', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{client.full_description}</p>
          </div>
        )}

        {client.promotionPaths?.length > 0 && (
          <div>
            <h3 style={{ fontSize: 15, color: '#f97316', marginBottom: 12, fontWeight: 700 }}>🛣️ Promotion Paths</h3>
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

const btnPrimary = { background: '#f97316', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' };
const btnSecondary = { background: '#262626', color: '#fff', border: '1px solid #333', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' };
const btnDanger = { background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' };
