import React, { useEffect, useState } from 'react';
import API from '../api';
import useConfirm from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { useToast } from '../components/Toast';

const STATUS_COLOR = { new: '#f97316', read: '#3b82f6', contacted: '#22c55e' };
const PER_PAGE = 10;

export default function Contacts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const confirm = useConfirm();
  const toast = useToast();

  const load = () => {
    API.get('/contact')
      .then((r) => setItems(r.data))
      .catch((err) => toast.error(err.response?.data?.message || 'Could not load inquiries.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/contact/${id}/status`, { status });
      setItems((prev) => prev.map((x) => x.id === id ? { ...x, status } : x));
      if (selected?.id === id) setSelected((s) => ({ ...s, status }));
      toast.info(`Status updated to ${status}.`);
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const del = async (id) => {
    if (!(await confirm.ask('Delete this contact inquiry permanently?', { okLabel: 'Delete Inquiry' }))) return;
    try {
      await API.post(`/contact/${id}`, { _method: 'DELETE' });
      setSelected(null);
      toast.success('Inquiry deleted.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  const open = (item) => {
    setSelected(item);
    if (item.status === 'new') updateStatus(item.id, 'read');
  };

  const filtered = filter === 'all' ? items : items.filter((x) => x.status === filter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>📬 Contact Inquiries</h1>
          <p style={{ color: '#a3a3a3', marginTop: 4 }}>
            {items.length} total messages · <span style={{ color: '#f97316' }}>{items.filter(x => x.status === 'new').length} unread</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'new', 'read', 'contacted'].map((f) => (
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
          {paginated.map((item) => (
            <div
              key={item.id}
              onClick={() => open(item)}
              style={{
                background: '#171717', border: `1px solid ${selected?.id === item.id ? '#f97316' : '#262626'}`,
                borderRadius: 14, padding: 18, cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{item.full_name}</span>
                <span style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 700,
                  background: `${STATUS_COLOR[item.status]}20`, color: STATUS_COLOR[item.status],
                  textTransform: 'uppercase',
                }}>
                  {item.status}
                </span>
              </div>
              <p style={{ color: '#a3a3a3', fontSize: 13, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.message || 'No message body'}
              </p>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#666' }}>
                <span>{item.phone}</span>
                <span>{item.company_name}</span>
                <span style={{ marginLeft: 'auto' }}>{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p style={{ color: '#a3a3a3' }}>No inquiries matching filter.</p>}
          <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
        </div>

        {/* Detail */}
        {selected && (
          <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: 24, height: 'fit-content', position: 'sticky', top: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>{selected.full_name}</h2>
                <span style={{ color: '#a3a3a3', fontSize: 13 }}>Submitted on {new Date(selected.created_at).toLocaleString()}</span>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: '#262626', border: '1px solid #333', color: '#a3a3a3', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {['new', 'read', 'contacted'].map((s) => (
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
                  Mark {s}
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
              ].map(([label, value]) => value && (
                <div key={label} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #222' }}>
                  <span style={{ color: '#a3a3a3', fontSize: 13, minWidth: 140 }}>{label}</span>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>

            {selected.message && (
              <div style={{ marginTop: 20, padding: 16, background: '#0a0a0a', borderRadius: 10, borderLeft: '3px solid #f97316' }}>
                <p style={{ color: '#a3a3a3', fontSize: 12, marginBottom: 6, fontWeight: 700 }}>Inquiry Message</p>
                <p style={{ color: '#fff', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{selected.message}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              {selected.email && (
                <a href={`mailto:${selected.email}`}
                  style={{ padding: '9px 18px', background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f640', borderRadius: 8, fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
                  📧 Reply by Email
                </a>
              )}
              {selected.phone && (
                <a href={`tel:${selected.phone}`}
                  style={{ padding: '9px 18px', background: '#22c55e20', color: '#22c55e', border: '1px solid #22c55e40', borderRadius: 8, fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
                  📞 Call
                </a>
              )}
              <button onClick={() => del(selected.id)}
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
