import React, { useEffect, useState } from 'react';
import API from '../api';
import Pagination from '../components/Pagination';
import { useToast } from '../components/Toast';

const STATUS_COLOR = { pending: '#f97316', active: '#22c55e', suspended: '#ef4444' };
const PER_PAGE = 10;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const toast = useToast();

  const load = () => {
    API.get('/users')
      .then((r) => setUsers(r.data))
      .catch((err) => toast.error(err.response?.data?.message || 'Could not load users.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/users/${id}/status`, { status });
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status } : u));
      toast.info(`Account status changed to ${status}.`);
    } catch (err) {
      toast.error('Failed to change user status.');
    }
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>👤 All Registered Merchants</h1>
          <p style={{ color: '#a3a3a3', marginTop: 4 }}>{users.length} total users across all account stages</p>
        </div>
        <input
          type="text"
          placeholder="🔍 Search name, email, company..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{
            background: '#171717', border: '1px solid #333', borderRadius: 8,
            color: '#fff', padding: '10px 16px', fontSize: 13, width: 280, outline: 'none'
          }}
        />
      </div>

      <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1.2fr', padding: '14px 20px', background: '#111', borderBottom: '1px solid #262626', fontSize: 11, fontWeight: 700, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <span>Name & Email</span>
          <span>Company & Location</span>
          <span>Contact</span>
          <span>Profile</span>
          <span>Status</span>
          <span style={{ textAlign: 'right' }}>Actions</span>
        </div>

        {paginated.map((user) => {
          const comp = profileComplete(user);
          return (
            <div key={user.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1.2fr', padding: '14px 20px', borderBottom: '1px solid #1a1a1a', alignItems: 'center', fontSize: 13 }}>
              <div>
                <div style={{ fontWeight: 600, color: '#fff' }}>{user.full_name}</div>
                <div style={{ color: '#a3a3a3', fontSize: 12, marginTop: 2 }}>{user.email}</div>
              </div>
              <div>
                <div style={{ color: '#fff' }}>{user.company_name || '—'}</div>
                <div style={{ color: '#666', fontSize: 12 }}>{user.location || '—'}</div>
              </div>
              <div>
                <div style={{ color: '#d4d4d4' }}>{user.phone || '—'}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, background: '#262626', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${comp}%`, height: '100%', background: comp === 100 ? '#22c55e' : '#f97316' }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#a3a3a3' }}>{comp}%</span>
                </div>
              </div>
              <div>
                <span style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 20,
                  background: `${STATUS_COLOR[user.status]}20`, color: STATUS_COLOR[user.status], fontWeight: 700, textTransform: 'uppercase'
                }}>
                  {user.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                {user.status !== 'active' && (
                  <button onClick={() => updateStatus(user.id, 'active')}
                    style={{ padding: '5px 12px', background: '#22c55e20', color: '#22c55e', border: '1px solid #22c55e40', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                    Activate
                  </button>
                )}
                {user.status !== 'suspended' && (
                  <button onClick={() => updateStatus(user.id, 'suspended')}
                    style={{ padding: '5px 12px', background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                    Suspend
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#a3a3a3' }}>
            {search ? 'No users match your search query.' : 'No registered users yet.'}
          </div>
        )}
      </div>

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
