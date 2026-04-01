import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api';

const MAX_IMAGES = 3;
const MIN_IMAGES = 0; // images are optional
const emptyForm = {
  title: '', content: '',
  category: 'General', is_published: 1, source_url: '',
};
const CATEGORIES = ['General', 'Technology', 'Investment', 'Business', 'Economy', 'Health', 'Education'];

export default function NewsForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]); // uploaded images from server
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [savedId, setSavedId] = useState(null); // id after first save

  useEffect(() => {
    if (isEdit) {
      API.get(`/news/${id}`).then(({ data }) => {
        setForm({
          title: data.title || '',
          content: data.content || '',
          category: data.category || 'General',
          is_published: data.is_published ?? 1,
          source_url: data.source_url || '',
        });
        setImages(data.images || []);
        setSavedId(id);
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      let newsId = savedId;
      if (isEdit) {
        await API.put(`/news/${id}`, form);
        newsId = id;
      } else {
        const { data } = await API.post('/news', form);
        newsId = data.id;
        setSavedId(newsId);
      }
      // Stay on page so admin can optionally upload images
      if (isEdit) navigate('/news');
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };
  const uploadImage = async (file, slotIndex) => {
    const newsId = savedId || id;
    if (!newsId) { setError('Save the article first, then upload images.'); return; }
    if (images.length >= MAX_IMAGES) { setError(`Maximum ${MAX_IMAGES} images allowed.`); return; }

    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('description', `Image ${slotIndex + 1}`);
    fd.append('sort_order', slotIndex);
    try {
      const { data } = await API.post(`/news/${newsId}/images`, fd);
      setImages(prev => [...prev, data]);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imgId) => {
    const newsId = savedId || id;
    if (!window.confirm('Delete this image?')) return;
    await API.delete(`/news/${newsId}/images/${imgId}`);
    setImages(prev => prev.filter(x => x.id !== imgId));
  };

  const canFinish = images.length >= MAX_IMAGES;

  return (
    <div style={{ maxWidth: 820 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: 24 }}>{isEdit ? 'Edit Article' : 'Add News Article'}</h1>
        <button onClick={() => navigate('/news')} style={btnSecondary}>← Back</button>
      </div>

      {error && <div style={errBox}>{error}</div>}

      {/* ── Step indicator ── */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28 }}>
        {['1. Write Article', '2. Upload Images (optional)', '3. Done'].map((step, i) => {
          const done = i === 0 ? Boolean(savedId) : i === 1 ? images.length > 0 : false;
          const active = i === 0 ? !savedId : i === 1 ? Boolean(savedId) : false;
          return (
            <div key={step} style={{ flex: 1, padding: '10px 14px', background: done ? '#22c55e20' : active ? '#f9731620' : '#171717',
              border: `1px solid ${done ? '#22c55e40' : active ? '#f9731640' : '#262626'}`,
              borderRadius: i === 0 ? '10px 0 0 10px' : i === 2 ? '0 10px 10px 0' : 0, textAlign: 'center' }}>
              <span style={{ fontSize: 13, color: done ? '#22c55e' : active ? '#f97316' : '#666', fontWeight: active || done ? 700 : 400 }}>
                {done ? '✓ ' : ''}{step}
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSave}>
        {/* English only — auto-translated to AM + OR */}
        <Section title="🇬🇧 English Content (Auto-translated to Amharic & Oromo)">
          <div style={{ background: '#22c55e15', border: '1px solid #22c55e30', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#22c55e' }}>
            🌐 Write in English only. The website will automatically translate to Amharic (አማርኛ) and Afaan Oromo when users switch language.
          </div>
          <Field label="Title (English) *" name="title" value={form.title} onChange={handleChange} required />
          <Field label="Content (English) *" name="content" value={form.content} onChange={handleChange} textarea required />
          <Field label="Source URL (optional)" name="source_url" value={form.source_url} onChange={handleChange} placeholder="https://example.com/article" />
        </Section>

        {/* Settings */}
        <Section title="⚙️ Settings">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={lbl}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} style={inp}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 22 }}>
              <input type="checkbox" id="pub" name="is_published" checked={form.is_published === 1} onChange={handleChange} style={{ width: 16, height: 16 }} />
              <label htmlFor="pub" style={{ fontSize: 14 }}>Publish immediately</label>
            </div>
          </div>
        </Section>

        <button type="submit" disabled={saving} style={btnPrimary}>
          {saving ? 'Saving...' : savedId ? 'Save Changes' : 'Save & Continue to Images →'}
        </button>
      </form>

      {/* ── Image Upload Section (3 slots) ── */}
      {savedId && (
        <Section title={`📸 News Images (${images.length}/${MAX_IMAGES} — optional)`}>
          <p style={{ color: '#a3a3a3', fontSize: 13, marginBottom: 16 }}>
            Upload <strong style={{ color: '#f97316' }}>1 to 3 images</strong> (optional). Images are not required to publish.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {Array.from({ length: MAX_IMAGES }).map((_, slotIdx) => {
              const img = images[slotIdx];
              return (
                <div key={slotIdx} style={{ borderRadius: 12, overflow: 'hidden', border: `2px solid ${img ? '#22c55e40' : '#f9731640'}`, background: '#0a0a0a', aspectRatio: '4/3', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {img ? (
                    <>
                      <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 8 }}>
                        <button onClick={() => deleteImage(img.id)}
                          style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 26, height: 26, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      </div>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '6px 10px' }}>
                        <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 700 }}>✓ Image {slotIdx + 1}</span>
                      </div>
                    </>
                  ) : (
                    <label style={{ cursor: uploading ? 'wait' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 16 }}>
                      <span style={{ fontSize: 32 }}>📸</span>
                      <span style={{ color: '#f97316', fontSize: 13, fontWeight: 600 }}>Image {slotIdx + 1}</span>
                      <span style={{ color: '#666', fontSize: 11 }}>{uploading ? 'Uploading...' : 'Click to upload'}</span>
                      <input type="file" accept="image/*" hidden
                        disabled={uploading || images.length >= MAX_IMAGES}
                        onChange={e => e.target.files[0] && uploadImage(e.target.files[0], slotIdx)} />
                    </label>
                  )}
                </div>
              );
            })}
          </div>

          {savedId && (
            <div style={{ marginTop: 20 }}>
              <button onClick={() => navigate('/news')} style={btnPrimary}>Finish & Go to News List →</button>
            </div>
          )}
        </Section>
      )}
    </div>
  );
}

const Section = ({ title, children }) => (
  <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: 24, marginBottom: 20 }}>
    <h3 style={{ fontSize: 15, marginBottom: 18, color: '#f97316' }}>{title}</h3>
    {children}
  </div>
);

const Field = ({ label, name, value, onChange, required, textarea }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={lbl}>{label}</label>
    {textarea
      ? <textarea name={name} value={value} onChange={onChange} required={required} rows={5} style={{ ...inp, resize: 'vertical' }} />
      : <input type="text" name={name} value={value} onChange={onChange} required={required} style={inp} />}
  </div>
);

const inp = { width: '100%', padding: '10px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 };
const lbl = { display: 'block', fontSize: 13, color: '#a3a3a3', marginBottom: 6 };
const btnPrimary = { background: '#f97316', color: '#000', border: 'none', padding: '12px 28px', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 8 };
const btnSecondary = { background: '#262626', color: '#fff', border: '1px solid #333', padding: '9px 18px', borderRadius: 8, fontSize: 14, cursor: 'pointer' };
const errBox = { background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: 8, marginBottom: 20, fontSize: 14 };
