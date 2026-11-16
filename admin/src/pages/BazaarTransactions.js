import React, { useEffect, useState } from 'react';
import API from '../api';
import Pagination from '../components/Pagination';
import { useToast } from '../components/Toast';

const BASE_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : '';

const PER_PAGE = 10;

export default function BazaarTransactions() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', dateFrom: '', dateTo: '' });
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(1);
  const [acting, setActing] = useState(null);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    API.get('/bazaar/orders/admin/all')
      .then((r) => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch((err) => {
        setOrders([]);
        toast.error(err.response?.data?.message || 'Failed to load transactions');
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = orders.filter((o) => {
    if (filters.status && o.payment_status !== filters.status) return false;
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      if (new Date(o.created_at) < from) return false;
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(o.created_at) > to) return false;
    }
    return true;
  });

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const confirmOrder = async (id) => {
    setActing(id);
    try {
      await API.put(`/bazaar/orders/admin/${id}/confirm`);
      toast.success(`Order #${id} confirmed.`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Confirm failed.');
    } finally {
      setActing(null);
    }
  };

  const rejectOrder = async (id) => {
    setActing(id);
    try {
      await API.put(`/bazaar/orders/admin/${id}/reject`);
      toast.warning(`Order #${id} marked as rejected.`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Reject failed.');
    } finally {
      setActing(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const paymentBadge = (status) => {
    const map = {
      pending: { bg: '#f9731620', color: '#f97316' },
      confirmed: { bg: '#22c55e20', color: '#22c55e' },
      rejected: { bg: '#ef444420', color: '#ef4444' },
    };
    const s = map[status] || { bg: '#26262620', color: '#a3a3a3' };
    return (
      <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, fontWeight: 600 }}>
        {status || 'unknown'}
      </span>
    );
  };

  const formatDate = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-ET', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>💳 Bazaar Transactions</h1>
        <p style={{ color: '#a3a3a3', marginTop: 4 }}>{filtered.length} of {orders.length} orders</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={filters.status}
          onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); setPage(1); }}
          style={selectStyle}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ color: '#a3a3a3', fontSize: 13 }}>From:</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => { setFilters((f) => ({ ...f, dateFrom: e.target.value })); setPage(1); }}
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ color: '#a3a3a3', fontSize: 13 }}>To:</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => { setFilters((f) => ({ ...f, dateTo: e.target.value })); setPage(1); }}
            style={inputStyle}
          />
        </div>
        {(filters.status || filters.dateFrom || filters.dateTo) && (
          <button
            onClick={() => { setFilters({ status: '', dateFrom: '', dateTo: '' }); setPage(1); }}
            style={{ background: 'none', border: '1px solid #333', color: '#a3a3a3', padding: '7px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #262626' }}>
              {['Order ID', 'Customer', 'Seller', 'Total (ETB)', 'Payment Method', 'Payment Status', 'Date', ''].map((h) => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#a3a3a3', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((o) => (
              <React.Fragment key={o.id}>
                <tr
                  onClick={() => toggleExpand(o.id)}
                  style={{ borderBottom: expandedId === o.id ? 'none' : '1px solid #1a1a1a', cursor: 'pointer', background: expandedId === o.id ? '#1a1a1a' : 'transparent' }}
                >
                  <td style={{ padding: '14px 16px', color: '#f97316', fontWeight: 600 }}>#{o.id}</td>
                  <td style={{ padding: '14px 16px' }}>{o.customer_name || '—'}</td>
                  <td style={{ padding: '14px 16px', color: '#a3a3a3' }}>{o.seller_name || '—'}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                    {Number(o.total_amount).toLocaleString('en-ET', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#a3a3a3', textTransform: 'capitalize' }}>{o.payment_method || '—'}</td>
                  <td style={{ padding: '14px 16px' }}>{paymentBadge(o.payment_status)}</td>
                  <td style={{ padding: '14px 16px', color: '#a3a3a3' }}>{formatDate(o.created_at)}</td>
                  <td style={{ padding: '14px 16px', color: '#a3a3a3', fontSize: 12 }}>
                    {expandedId === o.id ? '▲ Hide' : '▼ Proof'}
                  </td>
                </tr>
                {expandedId === o.id && (
                  <tr style={{ borderBottom: '1px solid #1a1a1a', background: '#111' }}>
                    <td colSpan={8} style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: 13, color: '#a3a3a3', marginBottom: 10, fontWeight: 600 }}>Payment Proof</div>
                      {!o.proof_type ? (
                        <p style={{ color: '#666', fontSize: 13 }}>No payment proof available.</p>
                      ) : o.proof_type === 'screenshot' ? (
                        <div>
                          <p style={{ color: '#a3a3a3', fontSize: 12, marginBottom: 8 }}>Screenshot uploaded by customer:</p>
                          <img
                            src={`${BASE_URL}/${o.proof_value}`}
                            alt="Payment proof screenshot"
                            style={{ maxWidth: 320, maxHeight: 240, borderRadius: 10, border: '1px solid #333', objectFit: 'contain', background: '#0a0a0a' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      ) : o.proof_type === 'reference' ? (
                        <div>
                          <p style={{ color: '#a3a3a3', fontSize: 12, marginBottom: 4 }}>Reference number:</p>
                          <span style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, padding: '6px 14px', fontSize: 14, color: '#d4d4d4', fontFamily: 'monospace' }}>
                            {o.proof_value}
                          </span>
                        </div>
                      ) : (
                        <p style={{ color: '#666', fontSize: 13 }}>Unknown proof type: {o.proof_type}</p>
                      )}
                      {o.payment_status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <button
                            onClick={() => confirmOrder(o.id)}
                            disabled={acting === o.id}
                            style={{ padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: acting === o.id ? 'not-allowed' : 'pointer' }}
                          >
                            {acting === o.id ? 'Working...' : 'Confirm Order'}
                          </button>
                          <button
                            onClick={() => rejectOrder(o.id)}
                            disabled={acting === o.id}
                            style={{ padding: '8px 16px', background: '#ef444420', color: '#ef4444', border: '1px solid #ef444455', borderRadius: 8, fontSize: 13, cursor: acting === o.id ? 'not-allowed' : 'pointer' }}
                          >
                            {acting === o.id ? 'Working...' : 'Reject Order'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#a3a3a3' }}>No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

const selectStyle = {
  background: '#171717', border: '1px solid #333', color: '#d4d4d4',
  padding: '8px 12px', borderRadius: 8, fontSize: 13, outline: 'none', cursor: 'pointer',
};
const inputStyle = {
  background: '#171717', border: '1px solid #333', color: '#d4d4d4',
  padding: '7px 10px', borderRadius: 8, fontSize: 13, outline: 'none',
  colorScheme: 'dark',
};
