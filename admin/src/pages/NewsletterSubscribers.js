import React, { useEffect, useState } from 'react';
import API from '../api';
import useConfirm from '../components/ConfirmModal';
import { useToast } from '../components/Toast';

export default function NewsletterSubscribers() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const confirm = useConfirm();
  const toast = useToast();

  const load = () => {
    API.get('/newsletter')
      .then((r) => setData(r.data))
      .catch((e) => toast.error(e.response?.data?.message || 'Could not load subscribers.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id, email) => {
    if (!(await confirm.ask(`Remove "${email}" from subscriber list?`, { okLabel: 'Remove Subscriber' }))) return;
    setDeleting(id);
    try {
      await API.post(`/newsletter/${id}`, { _method: 'DELETE' });
      toast.success(`"${email}" removed.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>📧 Newsletter Subscribers</h1>
      <p style={{ color: '#a3a3a3', marginBottom: 28, fontSize: 14 }}>
        Emails collected from the public website newsletter subscription form.
      </p>

      <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: '14px 20px', marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#f97316' }}>{data?.total ?? 0}</span>
        <span style={{ color: '#a3a3a3', fontSize: 13 }}>total verified subscribers</span>
      </div>

      {data?.subscribers?.length === 0 && (
        <div style={{ background: '#171717', border: '2px dashed #333', borderRadius: 16, padding: 48, textAlign: 'center' }}>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>No subscribers yet</h3>
          <p style={{ color: '#a3a3a3', fontSize: 14 }}>Newsletter signups from the website will appear here.</p>
        </div>
      )}

      {data?.subscribers?.length > 0 && (
        <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, overflow: 'hidden' }}>
          {data.subscribers.map((s, i) => (
            <div key={s.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', borderTop: i === 0 ? 'none' : '1px solid #262626',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f3f4f6' }}>{s.email}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                  Subscribed on {new Date(s.subscribed_at.replace(' ', 'T')).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <button onClick={() => remove(s.id, s.email)} disabled={deleting === s.id}
                style={{ background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', padding: '7px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                {deleting === s.id ? 'Removing...' : 'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}
      {confirm.modal}
    </div>
  );
}
