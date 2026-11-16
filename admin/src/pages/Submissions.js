import React, { useEffect, useState } from 'react';
import API from '../api';
import useConfirm from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { useToast } from '../components/Toast';
import Alert from '../components/Alert';

const PER_PAGE = 10;
const STATUSES = ['pending', 'approved', 'rejected'];

export default function Submissions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [viewing, setViewing] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [page, setPage] = useState(1);
  const confirm = useConfirm();
  const toast = useToast();

  const load = () => {
    setError('');
    return API.get('/submissions/admin/all')
      .then((r) => setSubs(r.data))
      .catch((e) => {
        const msg = e.response?.data?.message || 'Could not load submissions.';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (sub, status) => {
    setBusyId(sub.id);
    setError('');
    try {
      await API.put(`/submissions/admin/${sub.id}`, { status });
      toast.info(`Submission "${sub.path_name}" marked as ${status}.`);
      load();
    } catch (e) {
      const msg = e.response?.data?.message || 'Could not update status.';
      setError(msg);
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  };

  const del = async (sub) => {
    if (!(await confirm.ask(`Delete campaign submission "${sub.path_name}" and its uploaded files?`, { okLabel: 'Delete Submission' }))) return;
    setBusyId(sub.id);
    setError('');
    try {
      await API.post(`/submissions/admin/${sub.id}`, { _method: 'DELETE' });
      if (viewing?.id === sub.id) setViewing(null);
      toast.success(`Submission "${sub.path_name}" deleted.`);
      load();
    } catch (e) {
      const msg = e.response?.data?.message || 'Could not delete submission.';
      setError(msg);
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  const filtered = filter ? subs.filter((s) => s.status === filter) : subs;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>📥 Campaign Submissions</h1>
          <p style={{ color: '#a3a3a3', marginTop: 4 }}>
            {subs.length} total marketing submissions from registered businesses
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setFilter(''); setPage(1); }} style={{ ...filterBtn, ...(!filter ? filterBtnOn : {}) }}>All</button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setFilter(s); setPage(1); }}
              style={{ ...filterBtn, ...(filter === s ? filterBtnOn : {}), textTransform: 'capitalize' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {paginated.map((s) => (
          <div key={s.id} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{s.path_name}</span>
                <span style={statusBadge[s.status] || statusBadge.pending}>{s.status}</span>
              </div>
              <div style={{ color: '#a3a3a3', fontSize: 13, marginTop: 4 }}>
                👤 {s.submitter_name || `User #${s.user_id}`} · {s.submitter_company || 'No company'} · {s.submitter_phone || 'No phone'}
              </div>
              <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                {new Date(s.created_at).toLocaleString()} · 📸 {s.images?.length || 0} images · 🎬 {s.videos?.length || 0} videos
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setViewing(s)} style={btnSecondary}>Review</button>
              {s.status !== 'approved' && (
                <button
                  onClick={() => setStatus(s, 'approved')}
                  disabled={busyId === s.id}
                  style={{ ...btnSecondary, color: '#22c55e', borderColor: '#22c55e40' }}
                >
                  Approve
                </button>
              )}
              {s.status !== 'rejected' && (
                <button
                  onClick={() => setStatus(s, 'rejected')}
                  disabled={busyId === s.id}
                  style={{ ...btnSecondary, color: '#ef4444', borderColor: '#ef444440' }}
                >
                  Reject
                </button>
              )}
              <button
                onClick={() => del(s)}
                disabled={busyId === s.id}
                style={btnDanger}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {paginated.length === 0 && <p style={{ color: '#a3a3a3' }}>No submissions matching filter.</p>}
      </div>

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />

      {viewing && (
        <div onClick={() => setViewing(null)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} style={modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ color: '#f97316', fontSize: 18, fontWeight: 700 }}>{viewing.path_name}</h3>
                <span style={{ color: '#a3a3a3', fontSize: 13 }}>Submitted by {viewing.submitter_name}</span>
              </div>
              <button onClick={() => setViewing(null)} style={btnSecondary}>✕ Close</button>
            </div>

            <div style={{ background: '#0a0a0a', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ color: '#a3a3a3', fontSize: 12, marginBottom: 4, fontWeight: 600 }}>Description</div>
              <p style={{ color: '#fff', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{viewing.description || 'No description provided.'}</p>
            </div>

            <MediaGrid files={[...(viewing.images || []), ...(viewing.videos || [])]} />
          </div>
        </div>
      )}
      {confirm.modal}
    </div>
  );
}

const MediaGrid = ({ files }) => {
  if (!files.length) return <p style={{ color: '#666', fontSize: 13 }}>No files uploaded.</p>;
  const imgs = files.filter((f) => f.type === 'image');
  const vids = files.filter((f) => f.type === 'video');
  return (
    <div>
      {imgs.length > 0 && (
        <>
          <h4 style={{ margin: '16px 0 8px', fontSize: 14, fontWeight: 700, color: '#f97316' }}>📸 Images</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
            {imgs.map((f) => (
              <a key={f.id} href={f.url} target="_blank" rel="noreferrer">
                <img src={f.url} alt="" style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 8, background: '#262626' }} />
              </a>
            ))}
          </div>
        </>
      )}
      {vids.length > 0 && (
        <>
          <h4 style={{ margin: '18px 0 8px', fontSize: 14, fontWeight: 700, color: '#f97316' }}>🎬 Videos</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {vids.map((f) => (
              <video key={f.id} src={f.url} controls style={{ width: '100%', borderRadius: 8, background: '#000' }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const filterBtn = { background: '#262626', color: '#a3a3a3', border: '1px solid #333', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 };
const filterBtnOn = { background: '#f97316', color: '#000', border: '1px solid #f97316', fontWeight: 700 };
const btnSecondary = { background: '#262626', color: '#fff', border: '1px solid #333', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 };
const btnDanger = { background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 };
const statusBadge = {
  pending: { fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#f59e0b20', color: '#f59e0b', textTransform: 'capitalize', fontWeight: 700 },
  approved: { fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#22c55e20', color: '#22c55e', textTransform: 'capitalize', fontWeight: 700 },
  rejected: { fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#ef444420', color: '#ef4444', textTransform: 'capitalize', fontWeight: 700 },
};
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 100 };
const modal = { background: '#141414', border: '1px solid #2a2a2a', borderRadius: 16, padding: 28, maxWidth: 840, width: '100%', maxHeight: '86vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' };
