import React, { useState, useRef } from 'react';
import API from '../api';
import { useLang } from '../LangContext';

export default function Submit() {
  const { t } = useLang();
  const [paths, setPaths] = useState([newPath()]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  function newPath() {
    return { path_name: '', description: '', images: [], videos: [], imageErrors: '', videoErrors: '' };
  }

  const addPath = () => setPaths(p => [...p, newPath()]);
  const removePath = (i) => setPaths(p => p.filter((_, idx) => idx !== i));

  const updateField = (i, field, val) => {
    setPaths(p => p.map((path, idx) => idx === i ? { ...path, [field]: val } : path));
  };

  const handleImages = (i, files) => {
    const arr = Array.from(files);
    if (arr.length < 3 || arr.length > 5) {
      updateField(i, 'imageErrors', t.subImgCountErr);
      updateField(i, 'images', []);
    } else {
      updateField(i, 'imageErrors', '');
      updateField(i, 'images', arr);
    }
  };

  const handleVideos = (i, files) => {
    const arr = Array.from(files);
    if (arr.length < 3 || arr.length > 5) {
      updateField(i, 'videoErrors', t.subVidCountErr);
      updateField(i, 'videos', []);
      return;
    }
    // Check duration client-side
    let checked = 0;
    let hasError = false;
    arr.forEach(file => {
      const url = URL.createObjectURL(file);
      const vid = document.createElement('video');
      vid.preload = 'metadata';
      vid.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        if (vid.duration > 60) hasError = true;
        checked++;
        if (checked === arr.length) {
          if (hasError) {
            updateField(i, 'videoErrors', t.subVidDurationErr);
            updateField(i, 'videos', []);
          } else {
            updateField(i, 'videoErrors', '');
            updateField(i, 'videos', arr);
          }
        }
      };
      vid.src = url;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    for (const p of paths) {
      if (!p.path_name) return setError(t.subNameRequired);
      if (p.images.length < 3) return setError(t.subPathImages(p.path_name));
      if (p.videos.length < 3) return setError(t.subPathVideos(p.path_name));
      if (p.imageErrors || p.videoErrors) return setError(t.subFixErrors);
    }

    setSubmitting(true);
    try {
      for (const p of paths) {
        const fd = new FormData();
        fd.append('path_name', p.path_name);
        fd.append('description', p.description);
        p.images.forEach(f => fd.append('images', f));
        p.videos.forEach(f => fd.append('videos', f));
        await API.post('/submissions', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || t.subFailed);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return (
    <div className="page" style={{ maxWidth: 600, textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{t.subSuccessTitle}</h2>
      <p style={{ color: 'var(--text-main)', marginBottom: 24 }}>{t.subSuccessMsg}</p>
      <button onClick={() => { setDone(false); setPaths([newPath()]); }} style={btnPrimary}>{t.subSubmitAnother}</button>
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 900, marginBottom: 8 }}>{t.subPageTitle}</h1>
      <p style={{ color: 'var(--text-main)', marginBottom: 8 }}>{t.subPageIntro}</p>
      <div style={{ background: '#f9731615', border: '1px solid #f9731640', borderRadius: 10, padding: '10px 16px', marginBottom: 32, fontSize: 16, color: '#f97316' }}>
        {t.subRules}
      </div>

      {error && <div style={errBox}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {paths.map((p, i) => (
          <div key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: '#f97316', fontWeight: 700 }}>{t.subPathHeading(i + 1)}</h3>
              {paths.length > 1 && (
                <button type="button" onClick={() => removePath(i)} style={{ background: '#ef444420', border: '1px solid #ef444440', color: '#ef4444', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontSize: 16 }}>{t.subRemove}</button>
              )}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>{t.subPathName}</label>
              <input value={p.path_name} onChange={e => updateField(i, 'path_name', e.target.value)} required style={inp} placeholder={t.subPathNamePlaceholder} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>{t.subDescription}</label>
              <textarea value={p.description} onChange={e => updateField(i, 'description', e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} placeholder={t.subDescPlaceholder} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>{t.subImagesLabel}</label>
              <input type="file" accept="image/*" multiple onChange={e => handleImages(i, e.target.files)} style={fileInp} />
              {p.imageErrors && <div style={errText}>{p.imageErrors}</div>}
              {p.images.length > 0 && <div style={okText}>{t.subImagesSelected(p.images.length)}</div>}
            </div>

            <div>
              <label style={lbl}>{t.subVideosLabel}</label>
              <input type="file" accept="video/*" multiple onChange={e => handleVideos(i, e.target.files)} style={fileInp} />
              {p.videoErrors && <div style={errText}>{p.videoErrors}</div>}
              {p.videos.length > 0 && <div style={okText}>{t.subVideosSelected(p.videos.length)}</div>}
            </div>
          </div>
        ))}

        <button type="button" onClick={addPath} style={btnSecondary}>{t.subAddPath}</button>

        <button type="submit" disabled={submitting} style={{ ...btnPrimary, width: '100%', marginTop: 16 }}>
          {submitting ? t.subSubmitting : t.subSubmitPaths(paths.length)}
        </button>
      </form>
    </div>
  );
}

const inp = { width: '100%', padding: '10px 12px', background: 'var(--bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 8, color: 'var(--text-main)', fontSize: 16 };
const fileInp = { width: '100%', padding: '8px', background: 'var(--bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 8, color: 'var(--text-main)', fontSize: 16, cursor: 'pointer' };
const lbl = { display: 'block', fontSize: 16, color: 'var(--text-main)', marginBottom: 6 };
const btnPrimary = { padding: '13px 28px', background: '#f97316', color: '#000', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 17, cursor: 'pointer' };
const btnSecondary = { padding: '11px 20px', background: 'var(--bg-subtle)', color: 'var(--text-main)', border: '1px solid var(--card-border)', borderRadius: 10, fontWeight: 600, fontSize: 16, cursor: 'pointer' };
const errBox = { background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 16 };
const errText = { color: '#ef4444', fontSize: 16, marginTop: 4 };
const okText = { color: '#22c55e', fontSize: 16, marginTop: 4 };
