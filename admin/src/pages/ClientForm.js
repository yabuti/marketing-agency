import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api';
import useConfirm from '../components/ConfirmModal';
import { useToast } from '../components/Toast';
import Alert from '../components/Alert';
import PathManager from './PathManager';

const MAX_IMAGES = 5;
const MAX_VIDEOS = 3;

const ETHIOPIAN_CITIES = [
  'Addis Ababa','Dire Dawa','Gondar',"Mek'ele",'Adama / Nazret',
  'Bahir Dar','Dessie','Hawassa','Jimma','Bishoftu',
  'Harar','Sodo','Shashamene','Arba Minch','Adigrat','Debre Birhan',
];

const BUSINESS_TYPE_GROUPS = [
  { group: 'Manufacturers', items: [
    'Food and beverage processing enterprises',
    'Garment and textile manufacturers',
    'Shoe and leather product manufacturers',
    'Plastic product manufacturers',
    'Metal and wood furniture manufacturers',
    'Building material manufacturers',
    'Packaging and labeling manufacturers',
  ]},
  { group: 'Retail & Wholesale', items: [
    'Retail and Wholesale Businesses',
    'Clothing and fashion stores',
    'Furniture and home appliance shops',
    'Food and beverage wholesalers',
    'Construction material suppliers',
    'Agricultural input suppliers',
  ]},
  { group: 'Hospitality & Tourism', items: [
    'Restaurants and cafes',
    'Hotels and guesthouses',
    'Tour and travel agencies',
    'Event and hospitality services',
  ]},
  { group: 'Other', items: ['Other'] },
];

const emptyForm = {
  name: '', category: '', business_type: '', icon: '🏢',
  description: '', full_description: '',
  established: '', location: '', phone: '',
  tin_number: '', business_license_number: '', elmis_registration: '', website: '',
  facebook: '', instagram: '', tiktok: '', telegram: '',
  is_active: 1,
};

export default function ClientForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoBusy, setLogoBusy] = useState(false);
  const [error, setError] = useState('');
  const [savedId, setSavedId] = useState(null);
  const [categories, setCategories] = useState([]);

  // Main client gallery
  const [gallery, setGallery] = useState([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryDesc, setGalleryDesc] = useState('');

  // Work images — max 3 samples
  const [workImages, setWorkImages] = useState([]);
  const [workUploading, setWorkUploading] = useState(false);

  const mergeGallery = (data) => [
    ...(Array.isArray(data.images) ? data.images : []),
    ...(Array.isArray(data.videos) ? data.videos : []),
  ];

  const loadGallery = (clientId) => {
    if (!clientId) { setGallery([]); return; }
    API.get(`/clients/${clientId}`)
      .then(({ data }) => setGallery(mergeGallery(data)))
      .catch(() => setGallery([]));
  };

  const uploadGalleryFile = async (file) => {
    if (!savedId) { 
      toast.warning('Please save the client before uploading gallery media.');
      return; 
    }
    setGalleryUploading(true);
    setError('');
    const fd = new FormData();
    fd.append('file', file);
    if (galleryDesc.trim()) fd.append('description', galleryDesc.trim());
    fd.append('sort_order', gallery.length);
    try {
      await API.post(`/clients/${savedId}/media`, fd);
      setGalleryDesc('');
      loadGallery(savedId);
      toast.success('Gallery media uploaded successfully');
    } catch (err) {
      const msg = err.response?.data?.message || 'Gallery upload failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setGalleryUploading(false);
    }
  };

  const deleteGalleryItem = async (mediaId) => {
    if (!(await confirm.ask('Delete this media file permanently?'))) return;
    try {
      await API.post(`/clients/${savedId}/media/${mediaId}`, { _method: 'DELETE' });
      loadGallery(savedId);
      toast.success('Media removed from gallery');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not delete file.';
      setError(msg);
      toast.error(msg);
    }
  };

  const removeLogo = async () => {
    if (!(await confirm.ask('Remove the company logo?'))) return;
    setLogoBusy(true);
    setError('');
    try {
      await API.post(`/clients/${savedId}/logo`, { _method: 'DELETE' });
      setLogoUrl(null);
      toast.success('Company logo removed');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not remove logo.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLogoBusy(false);
    }
  };

  const uploadWorkImage = async (file, index) => {
    if (!savedId) { 
      toast.warning('Please save the client before uploading work samples.');
      return; 
    }
    setWorkUploading(true);
    setError('');
    const fd = new FormData();
    fd.append('file', file);
    if (typeof index === 'number') fd.append('index', index);
    try {
      const { data } = await API.post(`/clients/${savedId}/work-images`, fd);
      setWorkImages(Array.isArray(data.work_images) ? data.work_images : []);
      toast.success('Work image updated successfully');
    } catch (err) {
      const msg = err.response?.data?.message || 'Work image upload failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setWorkUploading(false);
    }
  };

  const removeWorkImage = async (index) => {
    if (!(await confirm.ask('Remove this work sample image?'))) return;
    setError('');
    try {
      const { data } = await API.post(`/clients/${savedId}/work-images`, { _method: 'DELETE', index });
      setWorkImages(Array.isArray(data.work_images) ? data.work_images : []);
      toast.success('Work image removed');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not remove work image.';
      setError(msg);
      toast.error(msg);
    }
  };

  useEffect(() => {
    API.get('/bazaar/categories')
      .then(({ data }) => setCategories(Array.isArray(data) ? data.map(c => c.name) : []))
      .catch(() => {});
  }, []);

  // Path 1 state
  const [pathId, setPathId] = useState(null);
  const [pathTitle, setPathTitle] = useState('');
  const [pathDate, setPathDate] = useState('');
  const [pathImages, setPathImages] = useState([]);
  const [pathVideos, setPathVideos] = useState([]);
  const [imgDescs, setImgDescs] = useState(['', '', '', '', '']);
  const [imgPrices, setImgPrices] = useState(['', '', '', '', '']);
  const [vidDescs, setVidDescs] = useState(['', '', '']);

  useEffect(() => {
    if (isEdit) {
      API.get(`/clients/${id}`).then(({ data }) => {
        setForm({
          name: data.name || '', category: data.category || '',
          business_type: data.business_type || '',
          icon: data.icon || '🏢',
          description: data.description || '', full_description: data.full_description || '',
          established: data.established || '', location: data.location || '',
          phone: data.phone || '',
          tin_number: data.tin_number || '', business_license_number: data.business_license_number || '',
          elmis_registration: data.elmis_registration || '', website: data.website || '',
          facebook: data.facebook || '', instagram: data.instagram || '',
          tiktok: data.tiktok || '', telegram: data.telegram || '',
          is_active: Number(data.is_active ?? 1),
        });
        setSavedId(id);
        setLogoUrl(data.logo_url || null);
        setGallery(mergeGallery(data));
        setWorkImages(Array.isArray(data.work_images) ? data.work_images : []);
        const firstPath = data.promotionPaths?.[0];
        if (firstPath) {
          setPathId(firstPath.id);
          setPathTitle(firstPath.title || '');
          setPathDate(firstPath.path_date ? firstPath.path_date.split('T')[0] : '');
          setPathImages(firstPath.images || []);
          setPathVideos(firstPath.videos || []);
        }
      }).catch(err => {
        toast.error('Failed to load client details.');
      });
    }
  }, [id, isEdit]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      let clientId = savedId;
      if (isEdit) {
        await API.post(`/clients/${id}`, { ...form, _method: 'PUT' });
        clientId = id;
      } else {
        const { data } = await API.post('/clients', form);
        clientId = data.id;
        setSavedId(clientId);
        loadGallery(clientId);
      }
      toast.success(isEdit ? 'Client updated successfully!' : 'Client profile created successfully!');

      // Auto-upload logo if a file was selected
      if (logoFile) {
        const fd = new FormData();
        fd.append('file', logoFile);
        try {
          const { data: logoData } = await API.post(`/clients/${clientId}/logo`, fd);
          setLogoUrl(logoData.logo_url);
          setLogoFile(null);
          setLogoPreview(null);
          toast.success('Company logo uploaded successfully');
        } catch {
          toast.warning('Client saved, but logo upload failed.');
        }
      }

      // Auto-create Path 1 if filled
      if (!pathId && (pathTitle.trim() || pathDate)) {
        const { data: p } = await API.post(`/clients/${clientId}/paths`, {
          title: pathTitle.trim() || `${form.name || 'Client'} — Path 1`,
          path_date: pathDate || new Date().toISOString().split('T')[0],
        });
        setPathId(p.id);
        setPathTitle(p.title);
        toast.success(`Campaign path created: "${p.title}"`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Save failed. Please check form fields.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (file, type, slotIdx) => {
    if (!pathId) { 
      toast.warning('Please save client and path first.');
      return; 
    }
    const current = type === 'image' ? pathImages : pathVideos;
    const limit = type === 'image' ? MAX_IMAGES : MAX_VIDEOS;
    if (current.length >= limit) { 
      toast.warning(`Maximum ${limit} ${type}s allowed.`);
      return; 
    }

    setUploading(`${type}-${slotIdx}`);
    const desc = type === 'image' ? imgDescs[slotIdx] : vidDescs[slotIdx];
    const fd = new FormData();
    fd.append('file', file);
    fd.append('description', desc || `${type === 'image' ? 'Image' : 'Video'} ${slotIdx + 1}`);
    fd.append('sort_order', slotIdx);
    if (type === 'image' && imgPrices[slotIdx]) fd.append('price', imgPrices[slotIdx]);
    try {
      const { data } = await API.post(`/clients/${savedId}/paths/${pathId}/media`, fd);
      if (type === 'video') setPathVideos(v => [...v, data]);
      else setPathImages(img => [...img, data]);
      toast.success(`${type === 'image' ? 'Image' : 'Video'} ${slotIdx + 1} uploaded`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(null);
    }
  };

  const deleteMedia = async (mediaId, type) => {
    if (!(await confirm.ask(`Delete this ${type}?`))) return;
    try {
      await API.post(`/clients/${savedId}/paths/${pathId}/media/${mediaId}`, { _method: 'DELETE' });
      if (type === 'video') setPathVideos(v => v.filter(x => x.id !== mediaId));
      else setPathImages(img => img.filter(x => x.id !== mediaId));
      const { data: paths } = await API.get(`/clients/${savedId}/paths`);
      const currentPath = paths.find(p => p.id === pathId);
      if (currentPath) {
        setPathImages(currentPath.images || []);
        setPathVideos(currentPath.videos || []);
      }
      toast.success(`${type === 'image' ? 'Image' : 'Video'} deleted`);
    } catch (err) {
      const msg = 'Delete failed: ' + (err.response?.data?.message || 'Unknown error');
      setError(msg);
      toast.error(msg);
    }
  };

  const allMediaDone = pathImages.length >= MAX_IMAGES && pathVideos.length >= MAX_VIDEOS;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <button 
            type="button" 
            onClick={() => navigate('/clients')} 
            style={{ background: 'none', border: 'none', color: '#a3a3a3', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            ← Back to Clients
          </button>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '-0.02em' }}>
            {isEdit ? 'Edit Client Profile' : 'Add New Client'}
          </h1>
        </div>
      </div>

      {error && <Alert variant="error" message={error} onClose={() => setError('')} style={{ marginBottom: 24 }} />}

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, overflowX: 'auto', borderRadius: 12, border: '1px solid #262626' }}>
        {['1. Client Info', '2. Campaign Path', `3. 5 Images (${pathImages.length}/${MAX_IMAGES})`, `4. 3 Videos (${pathVideos.length}/${MAX_VIDEOS})`, '5. Done'].map((step, i) => {
          const done = i === 0 ? Boolean(savedId) : i === 1 ? Boolean(pathId) : i === 2 ? pathImages.length >= MAX_IMAGES : i === 3 ? pathVideos.length >= MAX_VIDEOS : allMediaDone;
          const active = i === 0 ? !savedId : i === 1 ? savedId && !pathId : i === 2 ? pathId && pathImages.length < MAX_IMAGES : i === 3 ? pathImages.length >= MAX_IMAGES && pathVideos.length < MAX_VIDEOS : allMediaDone;
          return (
            <div key={step} style={{ 
              flex: 1, 
              padding: '12px 10px', 
              background: done ? '#22c55e10' : active ? '#f9731615' : '#141414',
              borderRight: i < 4 ? '1px solid #262626' : 'none',
              textAlign: 'center',
              minWidth: 120
            }}>
              <span style={{ 
                fontSize: 12, 
                color: done ? '#22c55e' : active ? '#f97316' : '#666', 
                fontWeight: active || done ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5
              }}>
                {done ? '✓' : ''} {step}
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSave}>
        <Section title="🏢 Basic Information" subtitle="Client profile identity and category">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Business Name *" name="name" value={form.name} onChange={handleChange} required placeholder="Enter company name" />
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required style={inp}>
                <option value="">Select category...</option>
                {[...new Set([...categories, form.category].filter(Boolean))].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Phone (+251 format)</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+251 9XX XXX XXX" style={inp} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Business Type</label>
              <select name="business_type" value={form.business_type} onChange={handleChange} style={inp}>
                <option value="">Select type...</option>
                {BUSINESS_TYPE_GROUPS.map(g => (
                  <optgroup key={g.group} label={g.group}>
                    {g.items.map(t => <option key={t} value={t}>{t}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
          <Field label="Short Tagline / Summary" name="description" value={form.description} onChange={handleChange} placeholder="Brief summary of what this business does" />
          <Field label="Full Description / Overview" name="full_description" value={form.full_description} onChange={handleChange} textarea placeholder="Detailed background story, offerings, and value proposition" />
          
          {isEdit && (
            <label
              style={{
                display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, cursor: 'pointer',
                padding: '14px 16px', background: Number(form.is_active) === 1 ? '#22c55e0d' : '#ef44440d',
                border: `1px solid ${Number(form.is_active) === 1 ? '#22c55e30' : '#ef444430'}`, borderRadius: 10,
              }}
            >
              <input
                type="checkbox"
                checked={Number(form.is_active) === 1}
                onChange={e => setForm(f => ({ ...f, is_active: e.target.checked ? 1 : 0 }))}
                style={{ width: 18, height: 18, accentColor: '#22c55e' }}
              />
              <span>
                <span style={{ display: 'block', color: '#fff', fontSize: 13, fontWeight: 700 }}>Published on Website</span>
                <span style={{ display: 'block', color: '#a3a3a3', fontSize: 12 }}>When unchecked, this client is hidden from public discovery pages.</span>
              </span>
            </label>
          )}
        </Section>

        <Section title="📋 Business & Compliance Details" subtitle="Registration, location, and legal credentials">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Established Year" name="established" value={form.established} onChange={handleChange} placeholder="e.g. 2018" />
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Location (City)</label>
              <select name="location" value={form.location} onChange={handleChange} style={inp}>
                <option value="">Select city...</option>
                {ETHIOPIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Field label="TIN Number *" name="tin_number" value={form.tin_number} onChange={handleChange} required placeholder="Tax Identification Number" />
            <Field label="Business License Number *" name="business_license_number" value={form.business_license_number} onChange={handleChange} required placeholder="Official License Number" />
            <Field label="E-LMIS Registration *" name="elmis_registration" value={form.elmis_registration} onChange={handleChange} required placeholder="E-LMIS Reg No" />
            <Field label="Official Website" name="website" value={form.website} onChange={handleChange} placeholder="https://..." />
          </div>
        </Section>

        <Section title="📱 Social Channels" subtitle="Direct social profile connections">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Facebook" name="facebook" value={form.facebook} onChange={handleChange} placeholder="https://facebook.com/..." />
            <Field label="Instagram" name="instagram" value={form.instagram} onChange={handleChange} placeholder="https://instagram.com/..." />
            <Field label="TikTok" name="tiktok" value={form.tiktok} onChange={handleChange} placeholder="https://tiktok.com/@..." />
            <Field label="Telegram Channel / Handle" name="telegram" value={form.telegram} onChange={handleChange} placeholder="https://t.me/..." />
          </div>
        </Section>

        <Section title="🏷️ Brand Logo" subtitle="Square or landscape transparent PNG or SVG recommended">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 88, height: 88, borderRadius: 14, overflow: 'hidden', background: '#0a0a0a', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 6 }}>
              {logoPreview
                ? <img src={logoPreview} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : logoUrl
                  ? <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <span style={{ fontSize: 36, opacity: 0.5 }}>🏢</span>}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#f9731615', color: '#f97316', border: '1px solid #f9731640', borderRadius: 10, fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>
                  {logoUrl || logoFile ? '🔄 Replace Logo' : '📤 Upload Logo'}
                  <input type="file" accept="image/*" hidden onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setLogoFile(file);
                    setLogoPreview(URL.createObjectURL(file));
                  }} />
                </label>
                {logoUrl && !logoFile && savedId && (
                  <button
                    type="button"
                    onClick={removeLogo}
                    disabled={logoBusy}
                    style={{ padding: '9px 16px', background: '#ef444415', color: '#ef4444', border: '1px solid #ef444440', borderRadius: 10, fontSize: 13, cursor: logoBusy ? 'not-allowed' : 'pointer', fontWeight: 600 }}
                  >
                    {logoBusy ? 'Removing...' : '🗑️ Remove Logo'}
                  </button>
                )}
              </div>
              {logoFile && (
                <div style={{ marginTop: 8, color: '#22c55e', fontSize: 12, fontWeight: 600 }}>✓ {logoFile.name} (will commit upon saving)</div>
              )}
              <p style={{ color: '#737373', fontSize: 12, marginTop: 6, margin: '6px 0 0' }}>PNG, JPG or WebP up to 5MB. Rendered in client cards and hero banners.</p>
            </div>
          </div>
        </Section>

        <Section title="🛠️ Portfolio Samples (max 3)" subtitle="Showcase work featured directly above contact info on client profile">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 12 }}>
            {[0, 1, 2].map(i => {
              const url = workImages[i];
              return (
                <div key={i} style={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 12, overflow: 'hidden', background: '#0a0a0a', border: '1px solid #262626' }}>
                  {url ? (
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 12, gap: 4 }}>
                      <span style={{ fontSize: 20, opacity: 0.4 }}>📷</span>
                      Slot {i + 1}
                    </div>
                  )}
                  {url && (
                    <button
                      type="button"
                      onClick={() => removeWorkImage(i)}
                      title="Remove"
                      style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(239,68,68,0.9)', border: 'none', color: '#fff', width: 24, height: 24, borderRadius: 6, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >✕</button>
                  )}
                  <label style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', color: '#f97316', fontSize: 11, fontWeight: 700, textAlign: 'center', padding: '7px 0', cursor: savedId && !workUploading ? 'pointer' : 'not-allowed', backdropFilter: 'blur(4px)' }}>
                    {workUploading ? 'Uploading...' : url ? '🔄 Replace' : '📤 Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={!savedId || workUploading}
                      onChange={e => { const f = e.target.files[0]; if (f) uploadWorkImage(f, url ? i : undefined); e.target.value = ''; }}
                    />
                  </label>
                </div>
              );
            })}
          </div>
          <p style={{ color: '#737373', fontSize: 12 }}>{workImages.length}/3 slots occupied. {!savedId && 'Save client profile to enable uploads.'}</p>
        </Section>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, marginBottom: 30 }}>
          <button type="submit" disabled={saving} style={btnPrimary}>
            {saving ? 'Saving...' : savedId ? 'Save Changes' : 'Save & Continue to Media →'}
          </button>
          <button type="button" onClick={() => navigate('/clients')} style={btnSecondary}>
            Cancel
          </button>
        </div>
      </form>

      {/* ── Main client gallery (client_media) ── */}
      {savedId && (
        <Section title={`🖼️ Client Gallery (${gallery.length})`} subtitle="Full portfolio photos and videos displayed on the public profile">
          {gallery.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
              {gallery.map(m => (
                <div key={m.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', background: '#0a0a0a', border: '1px solid #262626' }}>
                  {m.type === 'video' ? (
                    <video src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                  ) : (
                    <img src={m.url} alt={m.description || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  {m.type === 'video' && (
                    <span style={{ position: 'absolute', left: 6, top: 6, background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>VIDEO</span>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteGalleryItem(m.id)}
                    title="Delete"
                    style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(239,68,68,0.9)', border: 'none', color: '#fff', width: 24, height: 24, borderRadius: 6, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >✕</button>
                  {m.description && (
                    <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', color: '#ddd', fontSize: 10, padding: '4px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.description}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#737373', fontSize: 13, marginBottom: 18, fontStyle: 'italic' }}>No gallery media uploaded yet.</div>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', background: '#0a0a0a', padding: 14, borderRadius: 12, border: '1px solid #262626' }}>
            <input
              type="text"
              value={galleryDesc}
              onChange={e => setGalleryDesc(e.target.value)}
              placeholder="Media caption or title (optional)"
              style={{ ...inp, maxWidth: 300 }}
            />
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#f9731615', color: '#f97316', border: '1px solid #f9731640', borderRadius: 10, fontSize: 13, cursor: galleryUploading ? 'wait' : 'pointer', fontWeight: 700 }}>
              {galleryUploading ? 'Uploading...' : '📤 Add File to Gallery'}
              <input
                type="file"
                accept="image/*,video/*"
                hidden
                disabled={galleryUploading}
                onChange={e => { const f = e.target.files[0]; if (f) uploadGalleryFile(f); e.target.value = ''; }}
              />
            </label>
          </div>
        </Section>
      )}

      {/* ── Path 1 Details ── */}
      {savedId && !pathId && (
        <Section title="🛣️ Primary Campaign Path" subtitle="Setup initial promotional track with required 5 photos and 3 videos">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={lbl}>Campaign Title *</label>
              <input value={pathTitle} onChange={e => setPathTitle(e.target.value)}
                placeholder="e.g. Grand Launch, Spring Promotion..."
                style={inp} />
            </div>
            <div>
              <label style={lbl}>Launch Date</label>
              <input type="date" value={pathDate} onChange={e => setPathDate(e.target.value)} style={inp} />
            </div>
          </div>
          <button onClick={async () => {
            if (!pathTitle.trim()) { 
              toast.warning('Please enter a campaign title.');
              return; 
            }
            setError('');
            try {
              const { data: p } = await API.post(`/clients/${savedId}/paths`, {
                title: pathTitle,
                path_date: pathDate || new Date().toISOString().split('T')[0],
              });
              setPathId(p.id);
              setPathTitle(p.title);
              toast.success(`Campaign "${p.title}" initialized!`);
            } catch (err) { 
              const msg = err.response?.data?.message || 'Failed to create path.';
              setError(msg);
              toast.error(msg);
            }
          }} style={btnPrimary}>Initialize Campaign Media Slots →</button>
        </Section>
      )}

      {/* ── 5 Image Slots (inside path) ── */}
      {pathId && (
        <Section title={`📸 Campaign Images (${pathImages.length}/${MAX_IMAGES})`} subtitle={`Uploaded under "${pathTitle}". Required: 5 images.`}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {Array.from({ length: MAX_IMAGES }).map((_, i) => {
              const img = pathImages[i];
              return (
                <div key={i} style={{ borderRadius: 12, overflow: 'hidden', border: `2px solid ${img ? '#22c55e40' : '#f9731640'}`, background: '#0a0a0a', aspectRatio: '1', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  {img ? (
                    <>
                      <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                      <button onClick={() => deleteMedia(img.id, 'image')}
                        style={{ position: 'absolute', top: 6, right: 6, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, fontSize: 11, cursor: 'pointer', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.75)', padding: '5px 8px', zIndex: 2 }}>
                        <span style={{ color: '#22c55e', fontSize: 11, fontWeight: 700 }}>✓ Slot {i + 1}</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 10, width: '100%' }}>
                      <input type="text" placeholder={`Caption ${i + 1}`} value={imgDescs[i]}
                        onChange={e => { const d = [...imgDescs]; d[i] = e.target.value; setImgDescs(d); }}
                        style={{ width: '100%', padding: '5px 8px', background: '#141414', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 11, outline: 'none' }} />
                      <input type="number" placeholder={`Price (ETB)`} value={imgPrices[i]}
                        onChange={e => { const p = [...imgPrices]; p[i] = e.target.value; setImgPrices(p); }}
                        style={{ width: '100%', padding: '5px 8px', background: '#141414', border: '1px solid #f9731640', borderRadius: 6, color: '#f97316', fontSize: 11, outline: 'none' }} />
                      <label style={{ cursor: uploading ? 'wait' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, marginTop: 4 }}>
                        <span style={{ fontSize: 20 }}>📸</span>
                        <span style={{ color: '#f97316', fontSize: 11, fontWeight: 700 }}>Upload #{i + 1}</span>
                        <input type="file" accept="image/*" hidden disabled={!!uploading}
                          onChange={e => e.target.files[0] && uploadFile(e.target.files[0], 'image', i)} />
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── 3 Video Slots (inside path) ── */}
      {pathId && (
        <Section title={`🎬 Campaign Videos (${pathVideos.length}/${MAX_VIDEOS})`} subtitle={`Uploaded under "${pathTitle}". Required: 3 videos.`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: MAX_VIDEOS }).map((_, i) => {
              const vid = pathVideos[i];
              return (
                <div key={i} style={{ background: '#0a0a0a', border: `1px solid ${vid ? '#22c55e40' : '#262626'}`, borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, background: vid ? '#22c55e15' : '#f9731615', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {vid ? '✅' : '🎬'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: vid ? '#22c55e' : '#f97316' }}>
                      Video Slot {i + 1} {vid ? '— Active' : '— Pending Upload'}
                    </div>
                    {vid ? (
                      <div style={{ fontSize: 12, color: '#a3a3a3', marginTop: 4 }}>{vid.description}</div>
                    ) : (
                      <input type="text" placeholder={`Video ${i + 1} caption or summary`}
                        value={vidDescs[i]}
                        onChange={e => { const d = [...vidDescs]; d[i] = e.target.value; setVidDescs(d); }}
                        style={{ width: '100%', padding: '8px 12px', background: '#141414', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 13, marginTop: 8 }} />
                    )}
                  </div>
                  {vid ? (
                    <button onClick={() => deleteMedia(vid.id, 'video')}
                      style={{ padding: '8px 16px', background: '#ef444415', color: '#ef4444', border: '1px solid #ef444440', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                      Delete
                    </button>
                  ) : (
                    <label style={{ padding: '10px 18px', background: '#f9731615', color: '#f97316', border: '1px solid #f9731640', borderRadius: 8, fontSize: 13, cursor: uploading ? 'wait' : 'pointer', flexShrink: 0, fontWeight: 700 }}>
                      {uploading === `video-${i}` ? 'Uploading...' : '📤 Upload Video'}
                      <input type="file" accept="video/*" hidden disabled={!!uploading}
                        onChange={e => e.target.files[0] && uploadFile(e.target.files[0], 'video', i)} />
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── More Promotion Paths ── */}
      {pathId && (
        <Section title="🛣️ Additional Campaign Paths" subtitle="Add seasonal tracks, discounts, or recurring promos">
          <PathManager clientId={savedId} />
        </Section>
      )}

      {/* Finish button */}
      {allMediaDone && (
        <div style={{ background: '#22c55e10', border: '1px solid #22c55e40', borderRadius: 14, padding: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
          <div>
            <div style={{ color: '#22c55e', fontWeight: 800, fontSize: 16 }}>✓ Primary campaign completed!</div>
            <div style={{ color: '#a3a3a3', fontSize: 13, marginTop: 4 }}>5 images and 3 videos uploaded under "{pathTitle}".</div>
          </div>
          <button onClick={() => navigate('/clients')} style={btnPrimary}>Finish & Return to Clients →</button>
        </div>
      )}
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

const Field = ({ label, name, value, onChange, required, textarea, placeholder }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={lbl}>{label}</label>
    {textarea
      ? <textarea name={name} value={value} onChange={onChange} required={required} rows={4} placeholder={placeholder} style={{ ...inp, resize: 'vertical' }} />
      : <input type="text" name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} style={inp} />}
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
  transition: 'border-color 0.15s ease'
};

const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#a3a3a3', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.03em' };
const btnPrimary = { background: '#f97316', color: '#000', border: 'none', padding: '12px 26px', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: 'pointer', transition: 'opacity 0.15s' };
const btnSecondary = { background: '#262626', color: '#fff', border: '1px solid #333', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' };
