import React, { useEffect, useState } from 'react';
import API from '../api';
import useConfirm from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { useToast } from '../components/Toast';
import Alert from '../components/Alert';

const PER_PAGE = 15;

export default function Buyers() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [viewing, setViewing] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [page, setPage] = useState(1);
  const confirm = useConfirm();
  const toast = useToast();

  const load = () => {
    setError('');
    return API.get('/buyers/admin/all')
      .then((r) => setBuyers(r.data))
      .catch((e) => {
        const msg = e.response?.data?.message || 'Could not load buyers.';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const del = async (b) => {
    if (!(await confirm.ask(`Delete buyer "${b.full_name}"? This action cannot be reversed.`, { okLabel: 'Delete Buyer' }))) return;
    setBusyId(b.id);
    setError('');
    try {
      await API.post(`/buyers/admin/${b.id}`, { _method: 'DELETE' });
      setViewing(null);
      toast.success(`Buyer "${b.full_name}" deleted.`);
      load();
    } catch (e) {
      const msg = e.response?.data?.message || 'Could not delete buyer.';
      setError(msg);
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  const needle = q.trim().toLowerCase();
  const shown = needle
    ? buyers.filter((b) => ['full_name', 'email', 'phone'].some((k) => String(b[k] ?? '').toLowerCase().includes(needle)))
    : buyers;
  const totalPages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = shown.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>🛒 Marketplace Buyers</h1>
          <p style={{ color: '#a3a3a3', marginTop: 4 }}>
            {buyers.length} registered customers who placed or inquired about orders
          </p>
        </div>
        <input
          type="text"
          placeholder="🔍 Search name, email, phone..."
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          style={{ ...inp, width: 280 }}
        />
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div style={tableWrap}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Full Name</th>
              <th style={th}>Email</th>
              <th style={th}>Phone</th>
              <th style={th}>Joined</th>
              <th style={{ ...th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((b) => (
              <tr key={b.id} style={tr}>
                <td style={{ ...td, color: '#f97316', fontWeight: 600 }}>#{b.id}</td>
                <td style={{ ...td, fontWeight: 600, color: '#fff' }}>{b.full_name}</td>
                <td style={{ ...td, color: '#a3a3a3' }}>{b.email || '—'}</td>
                <td style={td}>{b.phone}</td>
                <td style={{ ...td, color: '#a3a3a3' }}>
                  {b.created_at ? new Date(b.created_at).toLocaleDateString() : '—'}
                </td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <button onClick={() => setViewing(b)} style={btnSecondary}>
                    View
                  </button>
                  <button
                    onClick={() => del(b)}
                    disabled={busyId === b.id}
                    style={{ ...btnDanger, marginLeft: 8 }}
                  >
                    {busyId === b.id ? '...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={6} style={{ ...td, textAlign: 'center', color: '#a3a3a3', padding: 36 }}>
                  {q ? 'No buyers match your search.' : 'No buyers registered yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {shown.length > PER_PAGE && <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />}

      {viewing && (
        <div onClick={() => setViewing(null)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} style={modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#f97316', fontSize: 18, fontWeight: 700 }}>{viewing.full_name}</h3>
              <button onClick={() => setViewing(null)} style={btnSecondary}>✕ Close</button>
            </div>
            <Row k="Buyer ID" v={`#${viewing.id}`} />
            <Row k="Full Name" v={viewing.full_name} />
            <Row k="Email Address" v={viewing.email || '—'} />
            <Row k="Phone Number" v={viewing.phone} />
            <Row k="Registered Date" v={viewing.created_at ? new Date(viewing.created_at).toLocaleString() : '—'} />
            <Row k="Last Profile Update" v={viewing.updated_at ? new Date(viewing.updated_at).toLocaleString() : '—'} />
            <p style={{ color: '#666', fontSize: 12, marginTop: 16 }}>
              All customer passwords are encrypted using bcrypt.
            </p>
          </div>
        </div>
      )}
      {confirm.modal}
    </div>
  );
}

const Row = ({ k, v }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1f1f1f' }}>
    <span style={{ color: '#a3a3a3', fontSize: 13 }}>{k}</span>
    <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{v}</span>
  </div>
);

const tableWrap = { background: '#171717', border: '1px solid #262626', borderRadius: 14, overflowX: 'auto' };
const table = { width: '100%', borderCollapse: 'collapse' };
const th = { textAlign: 'left', padding: '14px 18px', fontSize: 12, color: '#a3a3a3', borderBottom: '1px solid #262626', whiteSpace: 'nowrap', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 };
const td = { padding: '14px 18px', fontSize: 14, borderBottom: '1px solid #1a1a1a' };
const tr = { borderBottom: '1px solid #1a1a1a' };
const inp = { padding: '10px 14px', background: '#171717', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none' };
const btnSecondary = { background: '#262626', color: '#fff', border: '1px solid #333', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 };
const btnDanger = { background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 100 };
const modal = { background: '#141414', border: '1px solid #2a2a2a', borderRadius: 16, padding: 28, maxWidth: 520, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' };
