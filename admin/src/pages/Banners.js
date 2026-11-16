import React, { useEffect, useState, useRef } from 'react';
import API from '../api';
import useConfirm from '../components/ConfirmModal';
import { useToast } from '../components/Toast';

export default function Banners() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState('');
  const fileRef = useRef();
  const confirm = useConfirm();
  const toast = useToast();

  const load = () => {
    API.get('/banners/all')
      .then((r) => setData(r.data))
      .catch((e) => toast.error(e.response?.data?.message || 'Could not load banners.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const upload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    let ok = 0;
    let fail = '';
    for (const file of files) {
      const fd = new FormData();
      fd.append('banner', file);
      try {
        await API.post('/banners/upload', fd);
        ok++;
      } catch (err) {
        fail = err.response?.data?.message || err.message || 'Upload failed.';
        break;
      }
    }
    setUploading(false);
    fileRef.current.value = '';
    if (fail && !ok) toast.error(fail);
    else if (fail) toast.warning(`${ok} uploaded, then failed: ${fail}`);
    else toast.success(`${ok} banner${ok > 1 ? 's' : ''} uploaded.`);
    load();
  };

  const deleteBanner = async (filename) => {
    if (!(await confirm.ask(`Delete banner image "${filename}"?`, { okLabel: 'Delete Banner' }))) return;
    setDeleting(filename);
    try {
      await API.post('/banners/delete', { filename });
      toast.success(`"${filename}" deleted.`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Delete failed.');
    }
    setDeleting('');
    load();
  };

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  const sets = data
    ? Array.from({ length: data.total_sets }, (_, i) =>
        data.banners.filter((b) => b.set === i)
      )
    : [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>🖼️ Banner Images</h1>
        <label style={{ background: '#f97316', color: '#000', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          {uploading ? 'Uploading...' : '+ Upload Banners'}
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={upload} style={{ display: 'none' }} disabled={uploading} />
        </label>
      </div>
      <p style={{ color: '#a3a3a3', marginBottom: 28, fontSize: 14 }}>
        Upload rotating promo banners. Every {data?.window_hours || 4} hours, the next set of {data?.images_per_slot || 3} is displayed automatically.
      </p>

      {/* Stats */}
      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total Banners', val: data.total_banners, icon: '🖼️' },
            { label: 'Total Sets', val: data.total_sets, icon: '📁' },
            { label: 'Active Set Now', val: `Set #${(data.active_set ?? 0) + 1}`, icon: '🟢' },
            { label: 'Rotate Interval', val: `${data.window_hours} hrs`, icon: '⏱️' },
          ].map(s => (
            <div key={s.label} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: '#a3a3a3', marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Banner Sets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {sets.map((setBanners, setIdx) => {
          const isActive = data.active_set === setIdx;
          return (
            <div key={setIdx} style={{
              background: '#171717',
              border: `1px solid ${isActive ? 'rgba(34, 197, 94, 0.4)' : '#262626'}`,
              borderRadius: 14,
              padding: 20
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Set #{setIdx + 1}</span>
                {isActive && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    CURRENTLY DISPLAYING ON LIVE SITE
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {setBanners.map(b => (
                  <div key={b.filename} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid #333', background: '#0a0a0a' }}>
                    <img src={b.url} alt="" style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                    <button
                      onClick={() => deleteBanner(b.filename)}
                      disabled={deleting === b.filename}
                      style={{
                        position: 'absolute', top: 8, right: 8,
                        background: 'rgba(0,0,0,0.75)', color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 6,
                        padding: '4px 8px', fontSize: 12, cursor: 'pointer',
                        fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4
                      }}
                    >
                      {deleting === b.filename ? '...' : '✕ Delete'}
                    </button>
                    <div style={{ padding: '8px 10px', fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.filename}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {sets.length === 0 && <p style={{ color: '#a3a3a3' }}>No banners uploaded yet.</p>}
      </div>

      {confirm.modal}
    </div>
  );
}
