import React, { useEffect, useState } from 'react';
import API from '../api';
import useConfirm from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { useToast } from '../components/Toast';

const STATUS_COLOR = { pending: '#f97316', active: '#22c55e', suspended: '#ef4444' };
const PER_PAGE = 10;

export default function Registrations() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const confirm = useConfirm();
  const toast = useToast();

  const load = () => {
    API.get('/users')
      .then((r) => setUsers(r.data))
      .catch((err) => toast.error(err.response?.data?.message || 'Could not load registered users.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/users/${id}/status`, { status });
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status } : u));
      if (selected?.id === id) setSelected((s) => ({ ...s, status }));
      toast.info(`Account status changed to ${status}.`);
    } catch (err) {
      toast.error('Failed to change status.');
    }
  };

  const del = async (id, name) => {
    if (!(await confirm.ask(`Delete user "${name}"? Their profile, bank details, and all bazaar products will be permanently removed.`, { okLabel: 'Delete User Account' }))) return;
    try {
      await API.post(`/users/${id}`, { _method: 'DELETE' });
      setSelected(null);
      toast.success(`User "${name}" removed.`);
      load();
    } catch (err) {
      toast.error('Failed to delete user.');
    }
  };

  const filtered = filter === 'all' ? users : users.filter((u) => u.status === filter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>🆕 Merchant Registrations</h1>
          <p style={{ color: '#a3a3a3', marginTop: 4 }}>
            {users.length} total · <span style={{ color: '#f97316' }}>{users.filter((u) => u.status === 'pending').length} pending review</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'pending', 'active', 'suspended'].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
                background: filter === f ? '#f97316' : '#171717',
                color: filter === f ? '#000' : '#a3a3a3',
                border: filter === f ? '1px solid #f97316' : '1px solid #333',
                cursor: 'pointer',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 20 }}>
        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {paginated.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelected(user)}
              style={{
                background: '#171717', border: `1px solid ${selected?.id === user.id ? '#f97316' : '#262626'}`,
                borderRadius: 14, padding: 18, cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{user.full_name}</div>
                  <div style={{ color: '#a3a3a3', fontSize: 13, marginTop: 2 }}>{user.company_name || 'No company listed'}</div>
                </div>
                <span style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 700,
                  background: `${STATUS_COLOR[user.status]}20`, color: STATUS_COLOR[user.status],
                  textTransform: 'uppercase',
                }}>
                  {user.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#666', marginTop: 10 }}>
                <span>📞 {user.phone || '—'}</span>
                <span>📍 {user.location || '—'}</span>
                <span style={{ marginLeft: 'auto' }}>{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p style={{ color: '#a3a3a3' }}>No registrations match the selected filter.</p>}
          <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
        </div>

        {/* Detail */}
        {selected && (
          <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: 24, height: 'fit-content', position: 'sticky', top: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>{selected.full_name}</h2>
                <span style={{ color: '#a3a3a3', fontSize: 13 }}>Joined {new Date(selected.created_at).toLocaleDateString()}</span>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: '#262626', border: '1px solid #333', color: '#a3a3a3', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {['pending', 'active', 'suspended'].map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(selected.id, s)}
                  style={{
                    padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700, textTransform: 'capitalize',
                    background: selected.status === s ? STATUS_COLOR[s] : '#262626',
                    color: selected.status === s ? '#000' : '#a3a3a3',
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  Set {s}
                </button>
              ))}
            </div>

            <Section title="Account & Business">
              <InfoRow label="📧 Email" value={selected.email} />
              <InfoRow label="📞 Phone" value={selected.phone} />
              <InfoRow label="🏢 Company" value={selected.company_name} />
              <InfoRow label="💼 Business Type" value={selected.business_type} />
              <InfoRow label="📍 Location" value={selected.location} />
              <InfoRow label="🌐 Website" value={selected.website} />
              <InfoRow label="🔢 TIN" value={selected.tin_number} />
              <InfoRow label="📋 E-LMIS" value={selected.elmis_registration} />
              <InfoRow label="📄 License" value={selected.business_license_number} />
            </Section>

            {selected.bio && (
              <Section title="Profile Bio">
                <p style={{ color: '#fff', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{selected.bio}</p>
              </Section>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              {selected.email && (
                <a href={`mailto:${selected.email}`}
                  style={{ padding: '9px 18px', background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f640', borderRadius: 8, fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
                  📧 Email User
                </a>
              )}
              {selected.phone && (
                <a href={`tel:${selected.phone}`}
                  style={{ padding: '9px 18px', background: '#22c55e20', color: '#22c55e', border: '1px solid #22c55e40', borderRadius: 8, fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
                  📞 Call
                </a>
              )}
              <button onClick={() => del(selected.id, selected.full_name)}
                style={{ marginLeft: 'auto', padding: '9px 18px', background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
      {confirm.modal}
    </div>
  );
}

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 20 }}>
    <p style={{ color: '#f97316', fontSize: 12, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
  </div>
);

const InfoRow = ({ label, value }) => value ? (
  <div style={{ display: 'flex', gap: 12, padding: '4px 0', borderBottom: '1px solid #222' }}>
    <span style={{ color: '#a3a3a3', fontSize: 13, minWidth: 140, flexShrink: 0 }}>{label}</span>
    <span style={{ color: '#fff', fontSize: 13, wordBreak: 'break-word', fontWeight: 500 }}>{value}</span>
  </div>
) : null;
