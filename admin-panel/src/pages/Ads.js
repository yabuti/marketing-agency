import React, { useEffect, useState } from 'react';
import API from '../api';

const TYPE_LABELS = { general: '🎉 General', holiday: '🎄 Holiday', company: '🏢 Company Ad' };
const TYPE_COLORS = { general: '#f97316', holiday: '#22c55e', company: '#3b82f6' };

export default function Ads() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    API.get('/ads').then((r) => setAds(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const deleteAd = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    await API.delete(`/ads/${id}`);
    load();
  };

  const toggleActive = async (ad) => {
    await API.put(`/ads/${ad.id}`, { ...ad, is_active: ad.is_active ? 0 : 1 });
    load();
  };

  const moveOrder = async (ad, direction) => {
    const sorted = [...ads].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((a) => a.id === ad.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const items = sorted.map((a, i) => {
      if (i === idx) return { id: a.id, sort_order: sorted[swapIdx].sort_order };
      if (i === swapIdx) return { id: a.id, sort_order: sorted[idx].sort_order };
      return { id: a.id, sort_order: a.sort_order };
    });
    await API.put('/ads/reorder/batch', { items });
    load();
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26 }}>Ads & Promotions</h1>
          <p style={{ color: '#a3a3a3', marginTop: 4 }}>
            {ads.filter((a) => a.is_active && a.show_from <= today && a.show_until >= today).length} currently showing
          </p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} style={btnPrimary}>+ New Ad</button>
      </div>

      {showForm && (
        <AdForm
          initial={editing}
          onSave={() => { setShowForm(false); setEditing(null); load(); }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {ads.sort((a, b) => a.sort_order - b.sort_order).map((ad, idx) => {
          const isLive = ad.is_active && ad.show_from <= today && ad.show_until >= today;
          return (
            <div key={ad.id} style={{ background: '#171717', border: `1px solid ${isLive ? '#f9731640' : '#262626'}`, borderRadius: 14, padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
              {/* Thumbnail */}
              <div style={{ width: 90, height: 70, borderRadius: 10, overflow: 'hidden', background: '#262626', flexShrink: 0 }}>
                {ad.image_url
                  ? <img src={ad.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🖼️</div>
                }
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{ad.title}</span>
                  {isLive && <span style={{ fontSize: 11, background: '#f9731620', color: '#f97316', padding: '2px 8px', borderRadius: 20 }}>● LIVE</span>}
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 20, background: `${TYPE_COLORS[ad.type]}20`, color: TYPE_COLORS[ad.type] }}>
                    {TYPE_LABELS[ad.type]}
                  </span>
                  {ad.holiday_name && <span style={{ fontSize: 12, color: '#a3a3a3' }}>🎄 {ad.holiday_name}</span>}
                  {ad.company_name && <span style={{ fontSize: 12, color: '#a3a3a3' }}>🏢 {ad.company_name}</span>}
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
                  📅 {ad.show_from} → {ad.show_until} &nbsp;·&nbsp; ⏱ {ad.duration_sec}s
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => moveOrder(ad, 'up')} style={btnIcon} title="Move up">↑</button>
                  <button onClick={() => moveOrder(ad, 'down')} style={btnIcon} title="Move down">↓</button>
                  <button onClick={() => toggleActive(ad)} style={btnSecondary}>{ad.is_active ? 'Pause' : 'Activate'}</button>
                  <button onClick={() => { setEditing(ad); setShowForm(true); }} style={btnSecondary}>Edit</button>
                  <button onClick={() => deleteAd(ad.id, ad.title)} style={btnDanger}>Delete</button>
                </div>
                <ImageUpload adId={ad.id} onDone={load} />
              </div>
            </div>
          );
        })}
        {ads.length === 0 && <p style={{ color: '#a3a3a3' }}>No ads yet.</p>}
      </div>
    </div>
  );
}

function ImageUpload({ adId, onDone }) {
  const [uploading, setUploading] = useState(false);
  const upload = async (file) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      await API.post(`/ads/${adId}/image`, fd);
      onDone();
    } catch (e) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };
  return (
    <label style={{ ...btnSecondary, fontSize: 12, cursor: 'pointer' }}>
      {uploading ? 'Uploading...' : '📸 Upload Image'}
      <input type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && upload(e.target.files[0])} />
    </label>
  );
}

function AdForm({ initial, onSave, onCancel }) {
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState({
    title: initial?.title || '',
    type: initial?.type || 'general',
    holiday_name: initial?.holiday_name || '',
    holiday_date: initial?.holiday_date?.split('T')[0] || '',
    show_from: initial?.show_from?.split('T')[0] || '',
    show_until: initial?.show_until?.split('T')[0] || '',
    link_url: initial?.link_url || '',
    duration_sec: initial?.duration_sec || 15,
    sort_order: initial?.sort_order || 0,
    is_active: initial?.is_active ?? 1,
    company_name: initial?.company_name || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await API.put(`/ads/${initial.id}`, form);
      } else {
        await API.post('/ads', form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const isHoliday = form.type === 'holiday';

  return (
    <div style={{ background: '#171717', border: '1px solid #f97316', borderRadius: 14, padding: 24, marginBottom: 24 }}>
      <h3 style={{ fontSize: 16, color: '#f97316', marginBottom: 20 }}>{isEdit ? 'Edit Ad' : 'Create New Ad'}</h3>
      {error && <div style={errorBox}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Ad Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required style={inputStyle} placeholder="e.g. Happy Easter 2026" />
          </div>
          <div>
            <label style={labelStyle}>Type *</label>
            <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>
              <option value="general">🎉 General Promotion</option>
              <option value="holiday">🎄 Holiday Ad</option>
              <option value="company">🏢 Company Ad</option>
            </select>
          </div>
        </div>

        {isHoliday && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Holiday Name</label>
              <input name="holiday_name" value={form.holiday_name} onChange={handleChange} style={inputStyle} placeholder="e.g. Easter, Christmas" />
            </div>
            <div>
              <label style={labelStyle}>Holiday Date</label>
              <input name="holiday_date" type="date" value={form.holiday_date} onChange={handleChange} style={inputStyle} />
              <p style={{ fontSize: 11, color: '#a3a3a3', marginTop: 4 }}>
                Auto-shows: 7 days before → 3 days after
              </p>
            </div>
          </div>
        )}

        {form.type === 'company' && (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Company Name</label>
            <input name="company_name" value={form.company_name} onChange={handleChange} style={inputStyle} placeholder="e.g. Acme Corp" />
          </div>
        )}

        {!isHoliday && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Show From *</label>
              <input name="show_from" type="date" value={form.show_from} onChange={handleChange} required={!isHoliday} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Show Until *</label>
              <input name="show_until" type="date" value={form.show_until} onChange={handleChange} required={!isHoliday} style={inputStyle} />
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Duration (seconds)</label>
            <input name="duration_sec" type="number" min="5" max="60" value={form.duration_sec} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Rotation Order</label>
            <input name="sort_order" type="number" min="0" value={form.sort_order} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Link URL (optional)</label>
            <input name="link_url" value={form.link_url} onChange={handleChange} style={inputStyle} placeholder="https://..." />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <input type="checkbox" id="ad_active" name="is_active" checked={form.is_active === 1} onChange={handleChange} style={{ width: 16, height: 16 }} />
          <label htmlFor="ad_active" style={{ fontSize: 14 }}>Active</label>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" disabled={saving} style={btnPrimary}>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Ad'}</button>
          <button type="button" onClick={onCancel} style={btnSecondary}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

const btnPrimary = { background: '#f97316', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14 };
const btnSecondary = { background: '#262626', color: '#fff', border: '1px solid #333', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' };
const btnDanger = { background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' };
const btnIcon = { background: '#262626', color: '#fff', border: '1px solid #333', padding: '4px 10px', borderRadius: 6, fontSize: 14, cursor: 'pointer' };
const inputStyle = { width: '100%', padding: '10px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 };
const labelStyle = { display: 'block', fontSize: 13, color: '#a3a3a3', marginBottom: 6 };
const errorBox = { background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 };
