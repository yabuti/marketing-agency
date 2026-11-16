import React, { useEffect, useState } from 'react';
import API from '../api';
import useConfirm from '../components/ConfirmModal';
import { useToast } from '../components/Toast';
import Alert from '../components/Alert';

const TYPE_LABELS = { general: '🎉 General', holiday: '🎄 Holiday', company: '🏢 Company Ad' };
const TYPE_COLORS = { general: '#f97316', holiday: '#22c55e', company: '#3b82f6' };

export default function Ads() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const confirm = useConfirm();
  const toast = useToast();

  const load = () => {
    API.get('/ads')
      .then((r) => setAds(r.data))
      .catch((err) => toast.error(err.response?.data?.message || 'Could not load ads.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const deleteAd = async (id, title) => {
    if (!(await confirm.ask(`Delete ad "${title}"?`, { okLabel: 'Delete Ad' }))) return;
    try {
      await API.post(`/ads/${id}`, { _method: 'DELETE' });
      toast.success(`"${title}" deleted.`);
      load();
    } catch (err) {
      toast.error('Failed to delete ad.');
    }
  };

  const toggleActive = async (ad) => {
    const nextStatus = ad.is_active ? 0 : 1;
    try {
      await API.put(`/ads/${ad.id}`, { is_active: nextStatus });
      toast.info(`Ad ${nextStatus ? 'activated' : 'paused'}.`);
      load();
    } catch (err) {
      toast.error('Status change failed.');
    }
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
    try {
      await API.put('/ads/reorder/batch', { items });
      load();
    } catch (err) {
      toast.error('Reorder failed.');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const isAdActive = (ad) => {
    if (!ad.is_active) return false;
    if (ad.type === 'holiday' && ad.holiday_date) {
      const hDate = new Date(ad.holiday_date);
      const start = new Date(hDate);
      start.setDate(start.getDate() - 7);
      const end = new Date(hDate);
      end.setDate(end.getDate() + 3);
      const now = new Date(today);
      return now >= start && now <= end;
    }
    return ad.show_from <= today && ad.show_until >= today;
  };

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>📢 Ads & Promos</h1>
          <p style={{ color: '#a3a3a3', marginTop: 4 }}>
            {ads.length} ads · {ads.filter(isAdActive).length} currently active on live website
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          style={btnPrimary}
        >
          + Create Ad
        </button>
      </div>

      {showForm && (
        <AdForm
          ad={editing}
          onSave={() => { setShowForm(false); setEditing(null); load(); }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {ads.map((ad) => {
          const live = isAdActive(ad);
          return (
            <div
              key={ad.id}
              style={{
                background: '#171717',
                border: `1px solid ${live ? 'rgba(249, 115, 22, 0.4)' : '#262626'}`,
                borderRadius: 14,
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              {ad.image_url && (
                <img
                  src={ad.image_url}
                  alt=""
                  style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, background: '#262626' }}
                />
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{ad.title}</span>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
                    background: `${TYPE_COLORS[ad.type]}20`, color: TYPE_COLORS[ad.type],
                  }}>
                    {TYPE_LABELS[ad.type]}
                  </span>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
                    background: live ? '#22c55e20' : '#ef444420', color: live ? '#22c55e' : '#ef4444',
                  }}>
                    {live ? '● LIVE NOW' : '○ INACTIVE'}
                  </span>
                </div>

                {ad.company_name && (
                  <div style={{ fontSize: 13, color: '#f97316', marginBottom: 2 }}>
                    🏢 {ad.company_name}
                  </div>
                )}

                <div style={{ color: '#a3a3a3', fontSize: 12 }}>
                  📅 {ad.show_from} → {ad.show_until} &nbsp;·&nbsp; ⏱ {ad.duration_sec}s duration
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => moveOrder(ad, 'up')} style={btnIcon} title="Move up">↑</button>
                  <button onClick={() => moveOrder(ad, 'down')} style={btnIcon} title="Move down">↓</button>
                  <button onClick={() => toggleActive(ad)} style={btnSecondary}>{ad.is_active ? 'Pause' : 'Activate'}</button>
                  <button onClick={() => { setEditing(ad); setShowForm(true); }} style={btnSecondary}>Edit</button>
                  <button onClick={() => deleteAd(ad.id, ad.title)} style={btnDanger}>Delete</button>
                </div>
                <ImageUpload adId={ad.id} onDone={load} hasImage={Boolean(ad.image_url)} />
              </div>
            </div>
          );
        })}
        {ads.length === 0 && <p style={{ color: '#a3a3a3' }}>No advertisements configured.</p>}
      </div>
      {confirm.modal}
    </div>
  );
}

function ImageUpload({ adId, onDone, hasImage }) {
  const [uploading, setUploading] = useState(false);
  const confirm = useConfirm();
  const toast = useToast();

  const upload = async (file) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      await API.post(`/ads/${adId}/image`, fd);
      toast.success('Ad banner image uploaded.');
      onDone();
    } catch (e) {
      toast.error('Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const remove = async () => {
    if (!(await confirm.ask('Remove this ad banner image?', { okLabel: 'Remove Image' }))) return;
    setUploading(true);
    try {
      await API.post(`/ads/${adId}/image`, { _method: 'DELETE' });
      toast.info('Ad banner image removed.');
      onDone();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not remove image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <label style={{ ...btnSecondary, fontSize: 12, cursor: 'pointer' }}>
        {uploading ? 'Uploading...' : '📸 Upload Image'}
        <input type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && upload(e.target.files[0])} />
      </label>
      {hasImage && (
        <button
          onClick={remove}
          disabled={uploading}
          style={{ ...btnSecondary, fontSize: 12, cursor: 'pointer', background: '#ef444415', color: '#ef4444', border: '1px solid #ef444440' }}
        >
          🗑️ Remove Image
        </button>
      )}
    </div>
  );
}

function AdForm({ ad, onSave, onCancel }) {
  const isEdit = Boolean(ad);
  const [form, setForm] = useState(
    ad
      ? { ...ad }
      : {
          title: '', title_am: '', title_or: '',
          description: '', description_am: '', description_or: '',
          type: 'general', holiday_name: '', holiday_date: '',
          show_from: '', show_until: '', duration_sec: 15, sort_order: 0,
          is_active: 1, company_name: '', link_url: '',
        }
  );
  const [activeLang, setActiveLang] = useState('en');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

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
        await API.put(`/ads/${ad.id}`, form);
        toast.success('Ad updated successfully.');
      } else {
        await API.post('/ads', form);
        toast.success('Ad created successfully.');
      }
      onSave();
    } catch (err) {
      const msg = err.response?.data?.message || 'Save failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const isHoliday = form.type === 'holiday';

  return (
    <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: 24, marginBottom: 28 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#f97316' }}>
        {isEdit ? 'Edit Ad' : 'New Advertisement'}
      </h2>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Ad Type *</label>
            <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>
              <option value="general">🎉 General Promo</option>
              <option value="holiday">🎄 Holiday Special</option>
              <option value="company">🏢 Company Ad</option>
            </select>
          </div>
        </div>

        {/* Language Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 14 }}>
          {[['en', 'English'], ['am', 'አማርኛ'], ['or', 'Afaan Oromo']].map(([lang, label]) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang(lang)}
              style={{
                flex: 1, padding: '8px 12px', border: '1px solid #333', cursor: 'pointer',
                background: activeLang === lang ? '#f97316' : '#171717',
                color: activeLang === lang ? '#000' : '#a3a3a3',
                fontWeight: activeLang === lang ? 700 : 400, fontSize: 13,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {activeLang === 'en' && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Title (English) *</label>
              <input name="title" value={form.title} onChange={handleChange} required style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Description (English)</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </>
        )}
        {activeLang === 'am' && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>ርዕስ (አማርኛ)</label>
              <input name="title_am" value={form.title_am} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>መግለጫ (አማርኛ)</label>
              <textarea name="description_am" value={form.description_am} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </>
        )}
        {activeLang === 'or' && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Mata Duree (Afaan Oromo)</label>
              <input name="title_or" value={form.title_or} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Ibsa (Afaan Oromo)</label>
              <textarea name="description_or" value={form.description_or} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </>
        )}

        {isHoliday && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Holiday Name</label>
              <input name="holiday_name" value={form.holiday_name} onChange={handleChange} style={inputStyle} placeholder="e.g. Easter, Meskel" />
            </div>
            <div>
              <label style={labelStyle}>Holiday Date</label>
              <input name="holiday_date" type="date" value={form.holiday_date} onChange={handleChange} style={inputStyle} />
              <p style={{ fontSize: 11, color: '#a3a3a3', marginTop: 4 }}>
                Auto-rotates: 7 days before → 3 days after holiday
              </p>
            </div>
          </div>
        )}

        {form.type === 'company' && (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Company Name</label>
            <input name="company_name" value={form.company_name} onChange={handleChange} style={inputStyle} placeholder="e.g. Habesha Breweries" />
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
            <label style={labelStyle}>Rotation Priority</label>
            <input name="sort_order" type="number" min="0" value={form.sort_order} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Destination URL</label>
            <input name="link_url" value={form.link_url} onChange={handleChange} style={inputStyle} placeholder="https://..." />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <input type="checkbox" id="ad_active" name="is_active" checked={form.is_active === 1} onChange={handleChange} style={{ width: 16, height: 16, accentColor: '#f97316' }} />
          <label htmlFor="ad_active" style={{ fontSize: 14, cursor: 'pointer' }}>Active on website</label>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" disabled={saving} style={btnPrimary}>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Ad'}</button>
          <button type="button" onClick={onCancel} style={btnSecondary}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

const btnPrimary = { background: '#f97316', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' };
const btnSecondary = { background: '#262626', color: '#fff', border: '1px solid #333', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 };
const btnDanger = { background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 };
const btnIcon = { background: '#262626', color: '#fff', border: '1px solid #333', padding: '4px 10px', borderRadius: 6, fontSize: 14, cursor: 'pointer' };
const inputStyle = { width: '100%', padding: '10px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: 13, color: '#a3a3a3', marginBottom: 6, fontWeight: 600 };
