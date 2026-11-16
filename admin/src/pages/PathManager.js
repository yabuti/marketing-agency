import React, { useEffect, useState } from 'react';
import API from '../api';
import useConfirm from '../components/ConfirmModal';
import { useToast } from '../components/Toast';
import Alert from '../components/Alert';

// Must match the server-side limits in php-backend/routes/clients.php
const MAX_IMAGES = 5;
const MAX_VIDEOS = 3;

export default function PathManager({ clientId }) {
  const [paths, setPaths] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newPath, setNewPath] = useState({ title: '', path_date: '' });
  const [editing, setEditing] = useState(null); // { id, title, path_date }
  const [uploading, setUploading] = useState(null);
  const [prices, setPrices] = useState({}); // { `${pathId}-${type}-${slotIdx}`: price }
  const [error, setError] = useState('');
  const confirm = useConfirm();
  const toast = useToast();

  const load = () =>
    API.get(`/clients/${clientId}/paths`).then(r => setPaths(r.data)).catch(() => {});

  useEffect(() => { if (clientId) load(); }, [clientId]);

  const createPath = async () => {
    if (!newPath.title.trim()) { 
      toast.warning('Please enter a campaign title.');
      return; 
    }
    setError('');
    try {
      const { data } = await API.post(`/clients/${clientId}/paths`, newPath);
      setPaths(prev => [data, ...prev]);
      setNewPath({ title: '', path_date: '' });
      setCreating(false);
      toast.success(`Campaign path "${data.title}" created successfully`);
    } catch (err) { 
      const msg = err.response?.data?.message || 'Failed to create campaign path.';
      setError(msg);
      toast.error(msg);
    }
  };

  const savEdit = async () => {
    if (!editing.title.trim()) { 
      toast.warning('Title is required.');
      return; 
    }
    setError('');
    try {
      await API.post(`/clients/${clientId}/paths/${editing.id}`, { title: editing.title, path_date: editing.path_date, _method: 'PUT' });
      setPaths(prev => prev.map(p => p.id === editing.id ? { ...p, title: editing.title, path_date: editing.path_date } : p));
      setEditing(null);
      toast.success('Campaign path updated successfully');
    } catch (err) { 
      const msg = err.response?.data?.message || 'Failed to update campaign path.';
      setError(msg);
      toast.error(msg);
    }
  };

  const deletePath = async (pathId) => {
    if (!(await confirm.ask('Delete this promotion path and all its associated media? This cannot be undone.'))) return;
    try {
      await API.post(`/clients/${clientId}/paths/${pathId}`, { _method: 'DELETE' });
      setPaths(prev => prev.filter(p => p.id !== pathId));
      if (expanded === pathId) setExpanded(null);
      toast.success('Campaign path and media deleted');
    } catch (err) { 
      const msg = err.response?.data?.message || 'Failed to delete campaign path.';
      setError(msg);
      toast.error(msg);
    }
  };

  const uploadMedia = async (pathId, file, type, slotIdx) => {
    setUploading(`${pathId}-${type}-${slotIdx}`);
    setError('');
    const priceKey = `${pathId}-${type}-${slotIdx}`;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('description', `${type === 'image' ? 'Image' : 'Video'} ${slotIdx + 1}`);
    fd.append('sort_order', slotIdx);
    if (prices[priceKey]) fd.append('price', prices[priceKey]);
    try {
      const { data } = await API.post(`/clients/${clientId}/paths/${pathId}/media`, fd);
      setPaths(prev => prev.map(p => {
        if (p.id !== pathId) return p;
        return type === 'image'
          ? { ...p, images: [...p.images, data] }
          : { ...p, videos: [...p.videos, data] };
      }));
      toast.success(`${type === 'image' ? 'Image' : 'Video'} ${slotIdx + 1} uploaded`);
    } catch (err) { 
      const msg = err.response?.data?.message || 'Upload failed.';
      setError(msg);
      toast.error(msg);
    }
    finally { setUploading(null); }
  };

  const deleteMedia = async (pathId, mediaId, type) => {
    if (!(await confirm.ask('Delete this media file?'))) return;
    try {
      await API.post(`/clients/${clientId}/paths/${pathId}/media/${mediaId}`, { _method: 'DELETE' });
      setPaths(prev => prev.map(p => {
        if (p.id !== pathId) return p;
        return type === 'image'
          ? { ...p, images: p.images.filter(m => m.id !== mediaId) }
          : { ...p, videos: p.videos.filter(m => m.id !== mediaId) };
      }));
      toast.success(`${type === 'image' ? 'Image' : 'Video'} deleted`);
    } catch (err) { 
      const msg = err.response?.data?.message || 'Delete failed.';
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div>
      {error && <Alert variant="error" message={error} onClose={() => setError('')} style={{ marginBottom: 16 }} />}

      {/* New path button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ color: '#a3a3a3', fontSize: 13, fontWeight: 600 }}>{paths.length} promotion track{paths.length !== 1 ? 's' : ''} configured</span>
        <button onClick={() => { setCreating(!creating); setError(''); }} style={btnSecondary}>
          {creating ? '✕ Cancel' : '+ New Campaign Path'}
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div style={{ background: '#0a0a0a', border: '1px solid #f9731640', borderRadius: 12, padding: 18, marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#f97316', marginBottom: 12 }}>Create New Campaign Track</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input placeholder="Campaign title (e.g. Summer Promo, Launch Deal) *" value={newPath.title}
              onChange={e => setNewPath({ ...newPath, title: e.target.value })}
              style={{ ...inp, flex: 2, minWidth: 200 }} />
            <input type="date" value={newPath.path_date}
              onChange={e => setNewPath({ ...newPath, path_date: e.target.value })}
              style={{ ...inp, flex: 1, minWidth: 150 }} />
            <button onClick={createPath} style={btnPrimary}>Save Campaign</button>
          </div>
        </div>
      )}

      {/* Path list */}
      {paths.length === 0 && !creating && (
        <div style={{ color: '#666', fontSize: 13, padding: '24px 0', textAlign: 'center', fontStyle: 'italic', background: '#0a0a0a', borderRadius: 10, border: '1px dashed #262626' }}>
          No additional promotion paths configured. Click "+ New Campaign Path" to add one.
        </div>
      )}

      {paths.map(path => (
        <div key={path.id} style={{ background: '#0a0a0a', border: '1px solid #262626', borderRadius: 14, marginBottom: 14, overflow: 'hidden' }}>
          {/* Path header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}>
            <button onClick={() => setExpanded(expanded === path.id ? null : path.id)}
              style={{ background: 'none', border: 'none', color: '#f97316', fontSize: 16, cursor: 'pointer', flexShrink: 0, padding: 4 }}>
              {expanded === path.id ? '▼' : '▶'}
            </button>

            {editing?.id === path.id ? (
              <div style={{ display: 'flex', gap: 10, flex: 1, flexWrap: 'wrap' }}>
                <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })}
                  style={{ ...inp, flex: 2, minWidth: 160, padding: '8px 12px' }} />
                <input type="date" value={editing.path_date || ''}
                  onChange={e => setEditing({ ...editing, path_date: e.target.value })}
                  style={{ ...inp, flex: 1, minWidth: 140, padding: '8px 12px' }} />
                <button onClick={savEdit} style={{ ...btnPrimary, padding: '8px 16px', fontSize: 13 }}>Save</button>
                <button onClick={() => setEditing(null)} style={{ ...btnSecondary, padding: '8px 14px', fontSize: 13 }}>Cancel</button>
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{path.title}</div>
                <div style={{ color: '#a3a3a3', fontSize: 12, marginTop: 3 }}>
                  {path.path_date ? new Date(path.path_date).toLocaleDateString() : 'No date'} ·{' '}
                  <span style={{ color: path.images.length >= MAX_IMAGES ? '#22c55e' : '#f97316', fontWeight: 600 }}>{path.images.length}/{MAX_IMAGES} images</span>
                  {' · '}
                  <span style={{ color: path.videos.length >= MAX_VIDEOS ? '#22c55e' : '#f97316', fontWeight: 600 }}>{path.videos.length}/{MAX_VIDEOS} videos</span>
                </div>
              </div>
            )}

            {editing?.id !== path.id && (
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => setEditing({ id: path.id, title: path.title, path_date: path.path_date || '' })}
                  style={{ ...btnSecondary, padding: '6px 14px', fontSize: 12 }}>Edit</button>
                <button onClick={() => deletePath(path.id)}
                  style={{ padding: '6px 14px', background: '#ef444415', color: '#ef4444', border: '1px solid #ef444440', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Delete</button>
              </div>
            )}
          </div>

          {/* Expanded media panel */}
          {expanded === path.id && (
            <div style={{ borderTop: '1px solid #1f1f1f', padding: 18, background: '#111' }}>
              {/* Images */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: '#fff', marginBottom: 12, fontWeight: 700 }}>
                  📸 Campaign Images ({path.images.length}/{MAX_IMAGES})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                  {Array.from({ length: MAX_IMAGES }).map((_, i) => {
                    const img = path.images[i];
                    const isUploading = uploading === `${path.id}-image-${i}`;
                    return (
                      <div key={i} style={{ aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: `2px solid ${img ? '#22c55e40' : '#262626'}`, background: '#0a0a0a', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {img ? (
                          <>
                            <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                            {img.price && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.75)', padding: '4px 6px', fontSize: 10, color: '#f97316', fontWeight: 700, textAlign: 'center' }}>ETB {img.price}</div>}
                            <button onClick={() => deleteMedia(path.id, img.id, 'image')}
                              style={{ position: 'absolute', top: 4, right: 4, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, fontSize: 10, cursor: 'pointer', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                          </>
                        ) : (
                          <label style={{ cursor: isUploading ? 'wait' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, width: '100%', padding: 6 }}>
                            <input
                              type="text"
                              placeholder="Price (ETB)"
                              value={prices[`${path.id}-image-${i}`] || ''}
                              onChange={e => setPrices(p => ({ ...p, [`${path.id}-image-${i}`]: e.target.value }))}
                              onClick={e => e.preventDefault()}
                              style={{ width: '100%', padding: '4px 6px', background: '#1c1c1c', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 10, marginBottom: 2, outline: 'none' }}
                            />
                            <span style={{ fontSize: 18 }}>{isUploading ? '⏳' : '📸'}</span>
                            <span style={{ color: '#f97316', fontSize: 10, fontWeight: 700 }}>{isUploading ? '...' : `Slot ${i + 1}`}</span>
                            <input type="file" accept="image/*" hidden disabled={!!uploading || path.images.length >= MAX_IMAGES}
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
                <div style={{ fontSize: 13, color: '#fff', marginBottom: 12, fontWeight: 700 }}>
                  🎬 Campaign Videos ({path.videos.length}/{MAX_VIDEOS})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Array.from({ length: MAX_VIDEOS }).map((_, i) => {
                    const vid = path.videos[i];
                    const isUploading = uploading === `${path.id}-video-${i}`;
                    return (
                      <div key={i} style={{ background: '#141414', border: `1px solid ${vid ? '#22c55e40' : '#262626'}`, borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, background: vid ? '#22c55e15' : '#f9731615', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                          {vid ? '✅' : '🎬'}
                        </div>
                        <div style={{ flex: 1, fontSize: 13 }}>
                          {vid ? (
                            <>
                              <span style={{ color: '#22c55e', fontWeight: 700 }}>Video Slot {i + 1}</span>
                              {vid.price && <span style={{ marginLeft: 8, background: '#f9731620', color: '#f97316', fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>ETB {vid.price}</span>}
                              {' — '}<span style={{ color: '#a3a3a3' }}>{vid.description}</span>
                            </>
                          ) : (
                            <div>
                              <span style={{ color: '#737373', fontSize: 12 }}>Video slot {i + 1} — empty</span>
                              <input
                                type="text"
                                placeholder="Price in ETB (optional)"
                                value={prices[`${path.id}-video-${i}`] || ''}
                                onChange={e => setPrices(p => ({ ...p, [`${path.id}-video-${i}`]: e.target.value }))}
                                style={{ display: 'block', marginTop: 6, width: '100%', padding: '6px 10px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 12, outline: 'none' }}
                              />
                            </div>
                          )}
                        </div>
                        {vid ? (
                          <button onClick={() => deleteMedia(path.id, vid.id, 'video')}
                            style={{ padding: '6px 14px', background: '#ef444415', color: '#ef4444', border: '1px solid #ef444440', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                        ) : (
                          <label style={{ padding: '8px 16px', background: '#f9731615', color: '#f97316', border: '1px solid #f9731640', borderRadius: 8, fontSize: 12, cursor: isUploading ? 'wait' : 'pointer', flexShrink: 0, fontWeight: 700 }}>
                            {isUploading ? 'Uploading...' : '📤 Upload'}
                            <input type="file" accept="video/*" hidden disabled={!!uploading || path.videos.length >= MAX_VIDEOS}
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
      {confirm.modal}
    </div>
  );
}

const inp = { width: '100%', padding: '10px 14px', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none' };
const btnPrimary = { background: '#f97316', color: '#000', border: 'none', padding: '10px 22px', borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: 'pointer' };
const btnSecondary = { background: '#262626', color: '#fff', border: '1px solid #333', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' };
