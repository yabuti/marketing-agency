import React, { useEffect, useState } from 'react';
import API from '../api';
import { useToast } from '../components/Toast';
import Alert from '../components/Alert';

const btnPrimary = { background: '#f97316', color: '#000', border: 'none', padding: '12px 28px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' };
const inputStyle = { width: '100%', padding: '10px 14px', background: '#1e1e1e', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: 13, color: '#a3a3a3', marginBottom: 6, fontWeight: 600 };

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const toLocalInput = (val) => {
  if (!val) return '';
  const s = String(val).replace(' ', 'T');
  return s.slice(0, 16);
};

const pad = n => String(n).padStart(2, '0');

const ADDIS_TZ = { timeZone: 'Africa/Addis_Ababa' };
const fmtAddis = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', {
    ...ADDIS_TZ, weekday: 'short', day: 'numeric', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const IMAGE_SLOTS = [
  { key: 'img_market_hero',   label: 'Market page header',     hint: '1920×320 (6:1), subject center-right' },
  { key: 'img_bazaar_hero',   label: 'Bazaar page header',     hint: '1920×320 (6:1), subject center-right' },
  { key: 'img_blog_hero',     label: 'Blog / News header',     hint: 'wide banner' },
  { key: 'img_home_banner',   label: 'Home hero image',        hint: '4:3, shown in rounded card' },
  { key: 'img_about_banner',  label: 'About page image',       hint: 'shown in rounded card' },
  { key: 'img_faq_hero',      label: 'FAQ page header',        hint: 'wide banner' },
  { key: 'img_logo',          label: 'Site logo (navbar/footer)', hint: 'square, small' },
  { key: 'img_footer_logo',   label: 'Footer brand image',     hint: 'square' },
];

const DEFAULT_THUMBS = {
  img_market_hero: '/images/market.jpg',
  img_bazaar_hero: '/images/bazzar.png',
  img_blog_hero: '/images/blogs.png',
  img_home_banner: '/images/home-background.png',
  img_about_banner: '/images/about-background.png',
  img_faq_hero: '/images/faq.png',
  img_logo: '/images/logo.jpg',
  img_footer_logo: '/images/footer-logo.jpg',
};

export default function BazaarSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null);

  const [mode, setMode] = useState('schedule');
  const [enabled, setEnabled] = useState(true);
  const [openDay, setOpenDay] = useState(0);
  const [openTime, setOpenTime] = useState('09:00');
  const [closeDay, setCloseDay] = useState(0);
  const [closeTime, setCloseTime] = useState('17:00');
  const [isOpen, setIsOpen] = useState(true);
  const [openDate, setOpenDate] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [images, setImages] = useState({});
  const [uploadingKey, setUploadingKey] = useState('');
  const toast = useToast();

  const load = () => {
    setLoading(true);
    API.get('/bazaar/settings')
      .then((r) => {
        const d = r.data || {};
        setStatus(d);
        const schedEnabled = (d.schedule_enabled || '0') === '1';
        setMode(schedEnabled ? 'schedule' : 'manual');
        setEnabled(schedEnabled);
        setOpenDay(Number(d.open_day ?? 0));
        setOpenTime(d.open_time || '09:00');
        setCloseDay(Number(d.close_day ?? 0));
        setCloseTime(d.close_time || '17:00');
        setIsOpen((d.is_open || '0') === '1');
        setOpenDate(toLocalInput(d.open_date || ''));
        setCloseDate(toLocalInput(d.close_date || ''));
        const imgOverrides = {};
        Object.keys(d).forEach(k => {
          if (k.startsWith('img_') && d[k]) imgOverrides[k] = d[k];
        });
        setImages(imgOverrides);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Failed to load settings.';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const uploadImage = async (key, file) => {
    if (!file) return;
    setUploadingKey(key);
    setError('');
    try {
      const fd = new FormData();
      fd.append('key', key);
      fd.append('file', file);
      const r = await API.post('/bazaar/site-images/upload', fd);
      setImages(prev => ({ ...prev, [key]: r.data.url }));
      toast.success('Image uploaded. It is live on the website now.');
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to upload image.';
      setError(msg);
      toast.error(msg);
    } finally {
      setUploadingKey('');
    }
  };

  const removeImage = async (key) => {
    setUploadingKey(key);
    setError('');
    try {
      await API.post('/bazaar/site-images/remove', { key });
      setImages(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      toast.info('Custom image removed. Restored site default.');
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to remove image.';
      setError(msg);
      toast.error(msg);
    } finally {
      setUploadingKey('');
    }
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = mode === 'schedule'
        ? {
            schedule_enabled: '1',
            open_day: String(openDay),
            open_time: openTime,
            close_day: String(closeDay),
            close_time: closeTime,
          }
        : {
            schedule_enabled: '0',
            is_open: isOpen ? '1' : '0',
            open_date: openDate ? openDate.replace('T', ' ') : '',
            close_date: closeDate ? closeDate.replace('T', ' ') : '',
          };
      await API.put('/bazaar/settings', payload);
      const r2 = await API.get('/bazaar/settings');
      setStatus(r2.data || {});
      toast.success('Bazaar schedule saved successfully.');
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to save settings.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const formatCountdown = (iso) => {
    if (!iso) return null;
    const target = new Date(iso).getTime();
    const diff = target - Date.now();
    if (diff <= 0) return 'now';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  };

  if (loading) return <div style={{ color: '#a3a3a3' }}>Loading…</div>;

  const isOpenNow = (status?.is_open || '0') === '1';

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>🕐 Bazaar Schedule & Media</h1>
      <p style={{ color: '#a3a3a3', fontSize: 14, marginBottom: 24 }}>
        Control Bazaar opening hours, automated countdowns, and override hero images across the site.
      </p>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Live status */}
      <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: '18px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: isOpenNow ? '#22c55e' : '#ef4444', boxShadow: `0 0 10px ${isOpenNow ? '#22c55e' : '#ef4444'}` }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
            Bazaar is currently {isOpenNow ? 'OPEN' : 'CLOSED'}
          </span>
        </div>
        {isOpenNow && status?.next_close && (
          <div style={{ color: '#a3a3a3', fontSize: 14 }}>Closes in: <b style={{ color: '#f97316' }}>{formatCountdown(status.next_close)}</b> · {fmtAddis(status.next_close)} <span style={{ color: '#666' }}>(Addis Ababa time)</span></div>
        )}
        {isOpenNow && !status?.next_close && (
          <div style={{ color: '#a3a3a3', fontSize: 14 }}>Open now — no closing time set, stays open until closed manually.</div>
        )}
        {!isOpenNow && status?.next_open && (
          <div style={{ color: '#a3a3a3', fontSize: 14 }}>Opens in: <b style={{ color: '#f97316' }}>{formatCountdown(status.next_open)}</b> · {fmtAddis(status.next_open)} <span style={{ color: '#666' }}>(Addis Ababa time)</span></div>
        )}
        {!isOpenNow && !status?.next_open && (
          <div style={{ color: '#a3a3a3', fontSize: 14 }}>Closed now — no reopening date scheduled.</div>
        )}
      </div>

      {/* Mode picker */}
      <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => setMode('schedule')}
            style={{
              padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: mode === 'schedule' ? '#f97316' : '#262626',
              color: mode === 'schedule' ? '#000' : '#d4d4d4',
              border: mode === 'schedule' ? '1px solid #f97316' : '1px solid #333'
            }}
          >
            Weekly Recurring Schedule
          </button>
          <button
            onClick={() => setMode('manual')}
            style={{
              padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: mode === 'manual' ? '#f97316' : '#262626',
              color: mode === 'manual' ? '#000' : '#d4d4d4',
              border: mode === 'manual' ? '1px solid #f97316' : '1px solid #333'
            }}
          >
            Manual / Specific Dates
          </button>
        </div>

        {mode === 'schedule' ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <label style={labelStyle}>Opens Every</label>
                <select value={openDay} onChange={e => setOpenDay(Number(e.target.value))} style={inputStyle}>
                  {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Open Time (Addis Time)</label>
                <input type="time" value={openTime} onChange={e => setOpenTime(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Closes Every</label>
                <select value={closeDay} onChange={e => setCloseDay(Number(e.target.value))} style={inputStyle}>
                  {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Close Time (Addis Time)</label>
                <input type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <label style={labelStyle}>Current Status</label>
                <select value={isOpen ? '1' : '0'} onChange={e => setIsOpen(e.target.value === '1')} style={inputStyle}>
                  <option value="1">Open</option>
                  <option value="0">Closed</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Opens At (Optional Countdown)</label>
                <input type="datetime-local" value={openDate} onChange={e => setOpenDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Closes At (Optional Countdown)</label>
                <input type="datetime-local" value={closeDate} onChange={e => setCloseDate(e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <button onClick={save} disabled={saving} style={btnPrimary}>
            {saving ? 'Saving...' : '💾 Save Schedule'}
          </button>
        </div>
      </div>

      {/* ── Site Images ── */}
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: '40px 0 8px' }}>🖼️ Site Images & Headers</h2>
      <p style={{ color: '#a3a3a3', fontSize: 14, marginBottom: 24 }}>
        Replace the website's built-in images by uploading new files directly. Changes reflect immediately on live site.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
        {IMAGE_SLOTS.map(slot => {
          const current = images[slot.key] || '';
          const src = current || DEFAULT_THUMBS[slot.key];
          return (
            <div key={slot.key} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{slot.label}</span>
                {current
                  ? <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, background: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: 6 }}>CUSTOM</span>
                  : <span style={{ fontSize: 11, color: '#666', background: '#202020', padding: '2px 8px', borderRadius: 6 }}>default</span>}
              </div>
              <div style={{
                height: 110, borderRadius: 10, overflow: 'hidden', marginBottom: 10,
                background: '#111', border: '1px solid #2a2a2a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <img src={src} alt={slot.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontSize: 12, color: '#777', marginBottom: 12 }}>Suggested: {slot.hint}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <label style={{ ...btnPrimary, padding: '8px 16px', fontSize: 13, flex: 1, textAlign: 'center', cursor: uploadingKey === slot.key ? 'wait' : 'pointer', opacity: uploadingKey === slot.key ? 0.6 : 1 }}>
                  {uploadingKey === slot.key ? 'Uploading…' : current ? 'Replace' : 'Upload'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    style={{ display: 'none' }}
                    disabled={uploadingKey === slot.key}
                    onChange={e => {
                      const file = e.target.files && e.target.files[0];
                      e.target.value = '';
                      if (file) uploadImage(slot.key, file);
                    }}
                  />
                </label>
                {current && (
                  <button
                    onClick={() => removeImage(slot.key)}
                    disabled={uploadingKey === slot.key}
                    style={{ background: '#262626', color: '#ef4444', border: '1px solid #333', padding: '8px 14px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
