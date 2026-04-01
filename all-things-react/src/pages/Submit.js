import React, { useState, useRef } from 'react';
import API from '../api';

export default function Submit() {
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
      updateField(i, 'imageErrors', 'Select between 3 and 5 images.');
      updateField(i, 'images', []);
    } else {
      updateField(i, 'imageErrors', '');
      updateField(i, 'images', arr);
    }
  };

  const handleVideos = (i, files) => {
    const arr = Array.from(files);
    if (arr.length < 3 || arr.length > 5) {
      updateField(i, 'videoErrors', 'Select between 3 and 5 videos.');
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
            updateField(i, 'videoErrors', 'Each video must be under 1 minute.');
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
      if (!p.path_name) return setError('Each path must have a name.');
      if (p.images.length < 3) return setError(`"${p.path_name}": select 3–5 images.`);
      if (p.videos.length < 3) return setError(`"${p.path_name}": select 3–5 videos.`);
      if (p.imageErrors || p.videoErrors) return setError('Please fix file errors before submitting.');
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
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return (
    <div className="page" style={{ maxWidth: 600, textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Submitted Successfully!</h2>
      <p style={{ color: '#a3a3a3', marginBottom: 24 }}>Our team will review your content and get back to you.</p>
      <button onClick={() => { setDone(false); setPaths([newPath()]); }} style={btnPrimary}>Submit Another</button>
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, marginBottom: 8 }}>Submit Your Content</h1>
      <p style={{ color: '#a3a3a3', marginBottom: 8 }}>Upload your marketing content for each path.</p>
      <div style={{ background: '#f9731615', border: '1px solid #f9731640', borderRadius: 10, padding: '10px 16px', marginBottom: 32, fontSize: 13, color: '#f97316' }}>
        📋 Rules: Each path requires 3–5 images and 3–5 videos. Each video must be under 1 minute.
      </div>

      {error && <div style={errBox}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {paths.map((p, i) => (
          <div key={i} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 16, padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: '#f97316', fontWeight: 700 }}>Path {i + 1}</h3>
              {paths.length > 1 && (
                <button type="button" onClick={() => removePath(i)} style={{ background: '#ef444420', border: '1px solid #ef444440', color: '#ef4444', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontSize: 13 }}>Remove</button>
              )}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Path Name *</label>
              <input value={p.path_name} onChange={e => updateField(i, 'path_name', e.target.value)} required style={inp} placeholder="e.g. Summer Campaign" />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Description (optional)</label>
              <textarea value={p.description} onChange={e => updateField(i, 'description', e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} placeholder="Brief description of this content..." />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Images (3–5) *</label>
              <input type="file" accept="image/*" multiple onChange={e => handleImages(i, e.target.files)} style={fileInp} />
              {p.imageErrors && <div style={errText}>{p.imageErrors}</div>}
              {p.images.length > 0 && <div style={okText}>✓ {p.images.length} image{p.images.length > 1 ? 's' : ''} selected</div>}
            </div>

            <div>
              <label style={lbl}>Videos (3–5, max 1 min each) *</label>
              <input type="file" accept="video/*" multiple onChange={e => handleVideos(i, e.target.files)} style={fileInp} />
              {p.videoErrors && <div style={errText}>{p.videoErrors}</div>}
              {p.videos.length > 0 && <div style={okText}>✓ {p.videos.length} video{p.videos.length > 1 ? 's' : ''} selected</div>}
            </div>
          </div>
        ))}

        <button type="button" onClick={addPath} style={btnSecondary}>+ Add Another Path</button>

        <button type="submit" disabled={submitting} style={{ ...btnPrimary, width: '100%', marginTop: 16 }}>
          {submitting ? 'Submitting...' : `Submit ${paths.length} Path${paths.length > 1 ? 's' : ''} →`}
        </button>
      </form>
    </div>
  );
}

const inp = { width: '100%', padding: '10px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 };
const fileInp = { width: '100%', padding: '8px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#a3a3a3', fontSize: 13, cursor: 'pointer' };
const lbl = { display: 'block', fontSize: 13, color: '#a3a3a3', marginBottom: 6 };
const btnPrimary = { padding: '13px 28px', background: '#f97316', color: '#000', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' };
const btnSecondary = { padding: '11px 20px', background: '#262626', color: '#fff', border: '1px solid #333', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' };
const errBox = { background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 };
const errText = { color: '#ef4444', fontSize: 12, marginTop: 4 };
const okText = { color: '#22c55e', fontSize: 12, marginTop: 4 };
