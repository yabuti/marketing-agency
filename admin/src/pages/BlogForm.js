import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api';
import useConfirm from '../components/ConfirmModal';
import { useToast } from '../components/Toast';
import Alert from '../components/Alert';

const MAX_IMAGES = 5;

const BLOG_CATEGORIES = [
  'Marketing Tips',
  'Branding',
  'E-Commerce',
  'Business Growth',
  'Social Media',
  'Technology',
  'General',
];

const emptyForm = {
  title: '', title_am: '', title_or: '',
  content: '', content_am: '', content_or: '',
  category: 'Marketing Tips',
  is_published: 1,
  source_urls: [''],
};

export default function BlogForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();

  const [form, setForm] = useState(emptyForm);
  const [activeLang, setActiveLang] = useState('en');
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState('');
  const [savedId, setSavedId] = useState(id || null);

  useEffect(() => {
    if (isEdit) {
      API.get(`/news/${id}`)
        .then(({ data }) => {
          setForm({
            title: data.title || '',
            title_am: data.title_am || '',
            title_or: data.title_or || '',
            content: data.content || '',
            content_am: data.content_am || '',
            content_or: data.content_or || '',
            category: data.category || 'Marketing Tips',
            is_published: data.is_published !== undefined ? Number(data.is_published) : 1,
            source_urls: Array.isArray(data.source_urls) && data.source_urls.length > 0 ? data.source_urls : [''],
          });
          setImages(data.images || []);
          setSavedId(id);
        })
        .catch((err) => {
          const msg = err.response?.data?.message || 'Could not load blog post details';
          setError(msg);
          toast.error(msg);
        });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: val }));
  };

  const handleSourceUrlChange = (idx, value) => {
    const updated = [...form.source_urls];
    updated[idx] = value;
    setForm((prev) => ({ ...prev, source_urls: updated }));
  };

  const addSourceUrl = () => {
    setForm((prev) => ({ ...prev, source_urls: [...prev.source_urls, ''] }));
  };

  const removeSourceUrl = (idx) => {
    const filtered = form.source_urls.filter((_, i) => i !== idx);
    setForm((prev) => ({ ...prev, source_urls: filtered.length ? filtered : [''] }));
  };

  const handleAutoTranslate = async () => {
    let srcTitle = form.title;
    let srcContent = form.content;
    if (!srcTitle && !srcContent) {
      srcTitle = form.title_am || form.title_or;
      srcContent = form.content_am || form.content_or;
    }

    if (!srcTitle && !srcContent) {
      toast.warning('Please enter a title or content before translating.');
      return;
    }

    setTranslating(true);
    try {
      const { data } = await API.post('/news/translate', {
        title: srcTitle,
        content: srcContent,
      });

      setForm((prev) => ({
        ...prev,
        title_am: prev.title_am || data.title_am || '',
        title_or: prev.title_or || data.title_or || '',
        content_am: prev.content_am || data.content_am || '',
        content_or: prev.content_or || data.content_or || '',
      }));
      toast.success('Amharic and Afaan Oromo translations generated!');
    } catch (err) {
      toast.error('Translation service currently unavailable.');
    } finally {
      setTranslating(false);
    }
  };

  const saveArticle = async (shouldNavigateAway = false) => {
    const hasAnyTitle = form.title.trim() || form.title_am.trim() || form.title_or.trim();
    if (!hasAnyTitle) {
      setError('Please provide a title for the blog post in at least one language.');
      toast.warning('Title is required.');
      return false;
    }

    setSaving(true);
    setError('');
    const targetId = savedId || id;

    const payload = {
      ...form,
      source_urls: form.source_urls.filter((u) => u && u.trim()),
    };

    try {
      let currentBlogId = targetId;
      if (targetId) {
        await API.post(`/news/${targetId}`, { ...payload, _method: 'PUT' });
        toast.success('Blog post updated successfully!');
      } else {
        const { data } = await API.post('/news', payload);
        currentBlogId = data.id;
        setSavedId(currentBlogId);
        toast.success('Blog post created! You can now attach media.');
      }

      if (shouldNavigateAway) {
        navigate('/blogs');
      }
      return currentBlogId;
    } catch (err) {
      const msg = err.response?.data?.message || 'Save failed. Please check form fields.';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();
    await saveArticle(false);
  };

  const uploadImage = async (file) => {
    let currentId = savedId || id;
    if (!currentId) {
      toast.info('Saving draft blog post to attach image...');
      currentId = await saveArticle(false);
      if (!currentId) return;
    }

    if (images.length >= MAX_IMAGES) {
      toast.warning(`Maximum ${MAX_IMAGES} images reached.`);
      return;
    }

    setUploading(true);
    setError('');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('description', `Photo ${images.length + 1}`);
    fd.append('sort_order', images.length);

    try {
      const { data } = await API.post(`/news/${currentId}/images`, fd);
      setImages((prev) => [...prev, data]);
      toast.success('Image uploaded successfully.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Image upload failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imgId) => {
    const currentId = savedId || id;
    if (!(await confirm.ask('Delete this image permanently from this blog post?'))) return;
    try {
      await API.post(`/news/${currentId}/images/${imgId}`, { _method: 'DELETE' });
      setImages((prev) => prev.filter((x) => x.id !== imgId));
      toast.success('Image deleted.');
    } catch (err) {
      toast.error('Could not delete image.');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <button
            type="button"
            onClick={() => navigate('/blogs')}
            style={{ background: 'none', border: 'none', color: '#a3a3a3', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            ← Back to Blogs
          </button>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '-0.02em' }}>
            {isEdit ? 'Edit Blog Post' : 'Create Blog Post'}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => saveArticle(false)}
            disabled={saving}
            style={btnSecondary}
          >
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => saveArticle(true)}
            disabled={saving}
            style={btnPrimary}
          >
            {saving ? 'Saving...' : '✓ Save & Return'}
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} style={{ marginBottom: 20 }} />}

      {/* Language Tabs & Auto-translate */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 4, background: '#111', padding: 4, borderRadius: 10, border: '1px solid #262626' }}>
          {[
            ['en', '🇬🇧 English', Boolean(form.title)],
            ['am', '🇪🇹 አማርኛ', Boolean(form.title_am)],
            ['or', '🇪🇹 Afaan Oromoo', Boolean(form.title_or)],
          ].map(([lang, label, hasContent]) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang(lang)}
              style={{
                padding: '8px 16px',
                border: 'none',
                cursor: 'pointer',
                background: activeLang === lang ? '#f97316' : 'transparent',
                color: activeLang === lang ? '#000' : '#a3a3a3',
                fontWeight: activeLang === lang ? 700 : 500,
                fontSize: 13,
                borderRadius: 8,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              {label}
              {hasContent && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: activeLang === lang ? '#000' : '#22c55e',
                  }}
                />
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAutoTranslate}
          disabled={translating}
          style={{
            background: 'rgba(59, 130, 246, 0.12)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: translating ? 'wait' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {translating ? '⏳ Translating...' : '🌐 Auto-Translate Missing Languages'}
        </button>
      </div>

      <form onSubmit={onSubmitForm}>
        {/* Content Section */}
        <Section title="📝 Blog Content" subtitle="Write insights, articles, and educational content">
          {activeLang === 'en' && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Title (English) *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter headline in English"
                  style={inp}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Article Body (English)</label>
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  rows={8}
                  placeholder="Full article content in English..."
                  style={{ ...inp, resize: 'vertical' }}
                />
              </div>
            </>
          )}

          {activeLang === 'am' && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>የብሎጉ ርዕስ (አማርኛ)</label>
                <input
                  type="text"
                  name="title_am"
                  value={form.title_am}
                  onChange={handleChange}
                  placeholder="የብሎጉን ርዕስ እዚህ ያስገቡ..."
                  style={inp}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>የብሎጉ ይዘት (አማርኛ)</label>
                <textarea
                  name="content_am"
                  value={form.content_am}
                  onChange={handleChange}
                  rows={8}
                  placeholder="ሙሉውን የብሎግ ዝርዝር እዚህ ይፃፉ..."
                  style={{ ...inp, resize: 'vertical' }}
                />
              </div>
            </>
          )}

          {activeLang === 'or' && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Mata Duree Barruu (Afaan Oromoo)</label>
                <input
                  type="text"
                  name="title_or"
                  value={form.title_or}
                  onChange={handleChange}
                  placeholder="Mata duree barruu galchaa..."
                  style={inp}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Qabiyyee Barruu (Afaan Oromoo)</label>
                <textarea
                  name="content_or"
                  value={form.content_or}
                  onChange={handleChange}
                  rows={8}
                  placeholder="Qabiyyee barruu guutuu galchaa..."
                  style={{ ...inp, resize: 'vertical' }}
                />
              </div>
            </>
          )}
        </Section>

        {/* Category & Status */}
        <Section title="⚙️ Category & Publishing" subtitle="Topic classification and public visibility">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={lbl}>Blog Category</label>
              <select name="category" value={form.category} onChange={handleChange} style={inp}>
                {BLOG_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={lbl}>Publishing Status</label>
              <select
                name="is_published"
                value={form.is_published}
                onChange={handleChange}
                style={{
                  ...inp,
                  color: Number(form.is_published) === 1 ? '#22c55e' : '#ef4444',
                  fontWeight: 700,
                }}
              >
                <option value={1} style={{ color: '#22c55e' }}>
                  ✓ Published (Publicly Visible)
                </option>
                <option value={0} style={{ color: '#ef4444' }}>
                  Draft (Hidden from Public)
                </option>
              </select>
            </div>
          </div>
        </Section>

        {/* Media / Photos Section */}
        <Section
          title={`📸 Article Media & Photos (${images.length}/${MAX_IMAGES})`}
          subtitle="Add featured imagery and diagrams. Maximum 5 photos allowed."
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 16 }}>
            {images.map((img, i) => (
              <div
                key={img.id || i}
                style={{
                  position: 'relative',
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '1px solid #333',
                  background: '#0a0a0a',
                  aspectRatio: '4 / 3',
                }}
              >
                <img
                  src={img.url}
                  alt={img.description || ''}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={() => deleteImage(img.id)}
                  title="Delete image"
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    background: 'rgba(239,68,68,0.9)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: 26,
                    height: 26,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  }}
                >
                  ✕
                </button>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '4px 8px',
                    background: 'rgba(0,0,0,0.75)',
                    color: '#ddd',
                    fontSize: 10,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Photo {i + 1}
                </div>
              </div>
            ))}

            {images.length < MAX_IMAGES && (
              <label
                style={{
                  aspectRatio: '4 / 3',
                  border: '2px dashed #383838',
                  borderRadius: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: uploading ? 'wait' : 'pointer',
                  background: '#111',
                  transition: 'border-color 0.15s ease',
                  padding: 12,
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: 24, marginBottom: 4, color: '#f97316' }}>
                  {uploading ? '⏳' : '📷 +'}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
                  {uploading ? 'Uploading...' : 'Add Image'}
                </span>
                <span style={{ fontSize: 10, color: '#737373', marginTop: 2 }}>JPG, PNG, WebP up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) uploadImage(f);
                    e.target.value = '';
                  }}
                />
              </label>
            )}
          </div>
        </Section>

        {/* Source References */}
        <Section title="🔗 Reference Sources" subtitle="Add links to citations, studies, or original sources">
          {form.source_urls.map((url, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <input
                type="url"
                placeholder="https://example.com/reference"
                value={url}
                onChange={(e) => handleSourceUrlChange(i, e.target.value)}
                style={{ ...inp, flex: 1 }}
              />
              {form.source_urls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSourceUrl(i)}
                  style={{
                    background: '#ef444415',
                    color: '#ef4444',
                    border: '1px solid #ef444440',
                    borderRadius: 10,
                    padding: '0 14px',
                    fontSize: 13,
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addSourceUrl}
            style={{ ...btnSecondary, fontSize: 12, marginTop: 4 }}
          >
            + Add Another Source Link
          </button>
        </Section>

        {/* Bottom Save Bar */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button type="submit" disabled={saving} style={btnPrimary}>
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => saveArticle(true)}
            disabled={saving}
            style={btnSecondary}
          >
            Save & Exit →
          </button>
        </div>
      </form>

      {confirm.modal}
    </div>
  );
}

const Section = ({ title, subtitle, children }) => (
  <div style={{ background: '#141414', border: '1px solid #262626', borderRadius: 16, padding: 24, marginBottom: 24 }}>
    <div style={{ marginBottom: 18 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>{title}</h3>
      {subtitle && <p style={{ color: '#737373', fontSize: 13, margin: '4px 0 0' }}>{subtitle}</p>}
    </div>
    {children}
  </div>
);

const inp = {
  width: '100%',
  padding: '11px 14px',
  background: '#0a0a0a',
  border: '1px solid #2a2a2a',
  borderRadius: 10,
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.15s ease',
};

const lbl = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#a3a3a3',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};

const btnPrimary = {
  background: '#f97316',
  color: '#000',
  border: 'none',
  padding: '12px 26px',
  borderRadius: 10,
  fontWeight: 800,
  fontSize: 14,
  cursor: 'pointer',
};

const btnSecondary = {
  background: '#262626',
  color: '#fff',
  border: '1px solid #333',
  padding: '10px 20px',
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};
