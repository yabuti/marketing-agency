import React, { useEffect, useState } from 'react';
import API from '../api';

const MAX = 5;

export default function PathManager({ clientId }) {
  const [paths, setPaths] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newPath, setNewPath] = useState({ title: '', path_date: '' });
  const [editing, setEditing] = useState(null); // { id, title, path_date }
  const [uploading, setUploading] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    API.get(`/clients/${clientId}/paths`).then(r => setPaths(r.data)).catch(() => {});

  useEffect(() => { if (clientId) load(); }, [clientId]);

  const createPath = async () => {
    if (!newPath.title.trim()) { setError('Title is required.'); return; }
    setError('');
    try {
      const { data } = await API.post(`/clients/${clientId}/paths`, newPath);
      setPaths(prev => [data, ...prev]);
      setNewPath({ title: '', path_date: '' });
      setCreating(false);
    } catch (err) { setError(err.response?.data?.message || 'Failed to create path.'); }
  };

  const savEdit = async () => {
    if (!editing.title.trim()) { setError('Title is required.'); return; }
    setError('');
    try {
      await API.put(`/clients/${clientId}/paths/${editing.id}`, { title: editing.title, path_date: editing.path_date });
      setPaths(prev => prev.map(p => p.id === editing.id ? { ...p, title: editing.title, path_date: editing.path_date } : p));
      setEditing(null);
    } catch (err) { setError(err.response?.data?.message || 'Failed to update path.'); }
  };

  const deletePath = async (pathId) => {
    if (!window.confirm('Delete this promotion path and all its media?')) return;
    try {
      await API.delete(`/clients/${clientId}/paths/${pathId}`);
      setPaths(prev => prev.filter(p => p.id !== pathId));
      if (expanded === pathId) setExpanded(null);
    } catch (err) { setError(err.response?.data?.message || 'Failed to delete path.'); }
  };

  const uploadMedia = async (pathId, file, type, slotIdx) => {
    setUploading(`${pathId}-${type}-${slotIdx}`);
    setError('');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('description', `${type === 'image' ? 'Image' : 'Video'} ${slotIdx + 1}`);
    fd.append('sort_order', slotIdx);
    try {
      const { data } = await API.post(`/clients/${clientId}/paths/${pathId}/media`, fd);
      setPaths(prev => prev.map(p => {
        if (p.id !== pathId) return p;
        return type === 'image'
          ? { ...p, images: [...p.images, data] }
          : { ...p, videos: [...p.videos, data] };
      }));
    } catch (err) { setError(err.response?.data?.message || 'Upload failed.'); }
    finally { setUploading(null); }
  };

  const deleteMedia = async (pathId, mediaId, type) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await API.delete(`/clients/${clientId}/paths/${pathId}/media/${mediaId}`);
      setPaths(prev => prev.map(p => {
        if (p.id !== pathId) return p;
        return type === 'image'
          ? { ...p, images: p.images.filter(m => m.id !== mediaId) }
          : { ...p, videos: p.videos.filter(m => m.id !== mediaId) };
      }));
    } catch (err) { setError(err.response?.data?.message || 'Delete failed.'); }
  };

  return (
    <div>
      {error && <div style={errBox}>{error}</div>}

      {/* New path button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ color: '#a3a3a3', fontSize: 13 }}>{paths.length} path{paths.length !== 1 ? 's' : ''}</span>
        <button onClick={() => { setCreating(!creating); setError(''); }} style={btnSecondary}>
          {creating ? '✕ Cancel' : '+ New Path'}
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div style={{ background: '#0a0a0a', border: '1px solid #f9731640', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input placeholder="Path title *" value={newPath.title}
              onChange={e => setNewPath({ ...newPath, title: e.target.value })}
              style={{ ...inp, flex: 2, minWidth: 160 }} />
            <input type="date" value={newPath.path_date}
              onChange={e => setNewPath({ ...newPath, path_date: e.target.value })}
              style={{ ...inp, flex: 1, minWidth: 140 }} />
            <button onClick={createPath} style={btnPrimary}>Save Path</button>
          </div>
        </div>
      )}

      {/* Path list */}
      {paths.length === 0 && !creating && (
        <div style={{ color: '#555', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
          No promotion paths yet. Click "+ New Path" to add one.
        </div>
      )}

      {paths.map(path => (
        <div key={path.id} style={{ background: '#0a0a0a', border: '1px solid #262626', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
          {/* Path header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
            <button onClick={() => setExpanded(expanded === path.id ? null : path.id)}
              style={{ background: 'none', border: 'none', color: '#f97316', fontSize: 18, cursor: 'pointer', flexShrink: 0 }}>
              {expanded === path.id ? '▼' : '▶'}
            </button>

            {editing?.id === path.id ? (
              <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
                <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })}
                  style={{ ...inp, flex: 2, minWidth: 140, padding: '6px 10px' }} />
                <input type="date" value={editing.path_date || ''}
                  onChange={e => setEditing({ ...editing, path_date: e.target.value })}
                  style={{ ...inp, flex: 1, minWidth: 130, padding: '6px 10px' }} />
                <button onClick={savEdit} style={{ ...btnPrimary, padding: '6px 14px', fontSize: 13 }}>Save</button>
                <button onClick={() => setEditing(null)} style={{ ...btnSecondary, padding: '6px 12px', fontSize: 13 }}>Cancel</button>
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{path.title}</div>
                <div style={{ color: '#a3a3a3', fontSize: 12, marginTop: 2 }}>
                  {path.path_date ? new Date(path.path_date).toLocaleDateString() : 'No date'} ·{' '}
                  <span style={{ color: path.images.length >= MAX ? '#22c55e' : '#f97316' }}>{path.images.length}/{MAX} images</span>
                  {' · '}
                  <span style={{ color: path.videos.length >= MAX ? '#22c55e' : '#f97316' }}>{path.videos.length}/{MAX} videos</span>
                </div>
              </div>
            )}

            {editing?.id !== path.id && (
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => setEditing({ id: path.id, title: path.title, path_date: path.path_date || '' })}
                  style={{ ...btnSecondary, padding: '5px 10px', fontSize: 12 }}>Edit</button>
                <button onClick={() => deletePath(path.id)}
                  style={{ padding: '5px 10px', background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Delete</button>
              </div>
            )}
          </div>

          {/* Expanded media panel */}
          {expanded === path.id && (
            <div style={{ borderTop: '1px solid #1a1a1a', padding: 16 }}>
              {/* Images */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: '#a3a3a3', marginBottom: 10, fontWeight: 600 }}>
                  📸 Images ({path.images.length}/{MAX})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {Array.from({ length: MAX }).map((_, i) => {
                    const img = path.images[i];
                    const isUploading = uploading === `${path.id}-image-${i}`;
                    return (
                      <div key={i} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: `2px solid ${img ? '#22c55e40' : '#333'}`, background: '#111', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {img ? (
                          <>
                            <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                            <button onClick={() => deleteMedia(path.id, img.id, 'image')}
                              style={{ position: 'absolute', top: 3, right: 3, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, fontSize: 10, cursor: 'pointer', zIndex: 2 }}>✕</button>
                          </>
                        ) : (
                          <label style={{ cursor: isUploading ? 'wait' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <span style={{ fontSize: 18 }}>{isUploading ? '⏳' : '📸'}</span>
                            <span style={{ color: '#555', fontSize: 9 }}>{isUploading ? '...' : `Img ${i + 1}`}</span>
                            <input type="file" accept="image/*" hidden disabled={!!uploading || path.images.length >= MAX}
                              onChange={e => e.target.files[0] && uploadMedia(path.id, e.target.files[0], 'image', i)} />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Videos */}
              <div>
                <div style={{ fontSize: 13, color: '#a3a3a3', marginBottom: 10, fontWeight: 600 }}>
                  🎬 Videos ({path.videos.length}/{MAX})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Array.from({ length: MAX }).map((_, i) => {
                    const vid = path.videos[i];
                    const isUploading = uploading === `${path.id}-video-${i}`;
                    return (
                      <div key={i} style={{ background: '#171717', border: `1px solid ${vid ? '#22c55e40' : '#333'}`, borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, background: vid ? '#22c55e20' : '#f9731620', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                          {vid ? '✅' : '🎬'}
                        </div>
                        <div style={{ flex: 1, fontSize: 13 }}>
                          {vid ? (
                            <><span style={{ color: '#22c55e', fontWeight: 600 }}>Video {i + 1}</span> — <span style={{ color: '#a3a3a3' }}>{vid.description}</span></>
                          ) : (
                            <span style={{ color: '#555' }}>Video slot {i + 1} — empty</span>
                          )}
                        </div>
                        {vid ? (
                          <button onClick={() => deleteMedia(path.id, vid.id, 'video')}
                            style={{ padding: '5px 10px', background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Delete</button>
                        ) : (
                          <label style={{ padding: '6px 12px', background: '#f9731620', color: '#f97316', border: '1px solid #f9731640', borderRadius: 6, fontSize: 12, cursor: isUploading ? 'wait' : 'pointer', flexShrink: 0 }}>
                            {isUploading ? 'Uploading...' : '📤 Upload'}
                            <input type="file" accept="video/*" hidden disabled={!!uploading || path.videos.length >= MAX}
                              onChange={e => e.target.files[0] && uploadMedia(path.id, e.target.files[0], 'video', i)} />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const inp = { width: '100%', padding: '10px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 };
const btnPrimary = { background: '#f97316', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' };
const btnSecondary = { background: '#262626', color: '#fff', border: '1px solid #333', padding: '9px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer' };
const errBox = { background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 };
