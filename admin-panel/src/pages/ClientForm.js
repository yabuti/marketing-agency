import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api';
import PathManager from './PathManager';

const MAX_IMAGES = 5;
const MAX_VIDEOS = 3;

const ETHIOPIAN_CITIES = [
  'Addis Ababa','Dire Dawa','Gondar',"Mek'ele",'Adama / Nazret',
  'Bahir Dar','Dessie','Hawassa','Jimma','Bishoftu',
  'Harar','Sodo','Shashamene','Arba Minch','Adigrat','Debre Birhan',
];

const BUSINESS_TYPES = [
  'Tech startups (apps, software, IT services)','E-commerce businesses',
  'Digital service startups','Creative startups (design, media, photography)',
  'Shops and minimarkets','Clothing and fashion stores','Shoe and accessories shops',
  'Electronics and mobile phone shops','Cosmetics and beauty product shops',
  'Bookshops and stationery shops','Furniture and home appliance shops',
  'Food and beverage wholesalers','Construction material suppliers',
  'Agricultural input suppliers','Textile and garment wholesalers',
  'Restaurants and cafes','Traditional food houses','Event and conference venues','Car rental services',
  'Private schools (KG–Grade 12)','Training centers','Language schools',
  'Computer and IT training centers','Tutorial and exam preparation centers',
  'Online learning platforms','Educational consultancy services',
  'Advertising and marketing agencies','Printing and publishing services',
  'Graphic design and branding services','Accounting and auditing firms',
  'Legal and consultancy services','Cleaning and maintenance services',
  'Security service providers','Beauty salons and barber shops','Transportation and logistics services',
  'Food and beverage processing enterprises','Garment and textile manufacturers',
  'Shoe and leather product manufacturers','Plastic product manufacturers',
  'Metal and wood furniture manufacturers','Building material manufacturers',
  'Packaging and labeling manufacturers','Other',
];

const emptyForm = {
  name: '', category: '', business_type: '', icon: '🏢',
  description: '', full_description: '',
  established: '', location: '', license_number: '', phone: '',
  tin_number: '', business_license_number: '', website: '',
  facebook: '', instagram: '', tiktok: '', telegram: '',
  followers: '', growth: '', engagement: '',
};

export default function ClientForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null); // 'image' | 'video' | null
  const [error, setError] = useState('');
  const [savedId, setSavedId] = useState(null);
  const [imgDescs, setImgDescs] = useState(['', '', '', '', '']);
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
          license_number: data.license_number || '', phone: data.phone || '',
          tin_number: data.tin_number || '', business_license_number: data.business_license_number || '',
          website: data.website || '',
          facebook: data.facebook || '', instagram: data.instagram || '',
          tiktok: data.tiktok || '', telegram: data.telegram || '',
          followers: data.followers || '', growth: data.growth || '', engagement: data.engagement || '',
        });
        setImages(data.images || []);
        setVideos(data.videos || []);
        setSavedId(id);
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
        await API.put(`/clients/${id}`, form);
        clientId = id;
      } else {
        const { data } = await API.post('/clients', form);
        clientId = data.id;
        setSavedId(clientId);
      }
      if (images.length >= MAX_IMAGES && videos.length >= MAX_VIDEOS) {
        navigate('/clients');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (file, type, slotIdx) => {
    const clientId = savedId || id;
    if (!clientId) { setError('Save the client first, then upload media.'); return; }

    const limit = type === 'image' ? MAX_IMAGES : MAX_VIDEOS;
    const current = type === 'image' ? images : videos;
    if (current.length >= limit) { setError(`Maximum ${limit} ${type}s allowed.`); return; }

    setUploading(type);
    const desc = type === 'image' ? imgDescs[slotIdx] : vidDescs[slotIdx];
    const fd = new FormData();
    fd.append('file', file);
    fd.append('description', desc || `${type === 'image' ? 'Image' : 'Video'} ${slotIdx + 1}`);
    fd.append('sort_order', slotIdx);
    try {
      const { data } = await API.post(`/clients/${clientId}/media`, fd);
      if (type === 'video') setVideos(v => [...v, data]);
      else setImages(img => [...img, data]);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(null);
    }
  };

  const deleteMedia = async (mediaId, type) => {
    const clientId = savedId || id;
    if (!window.confirm('Delete this file?')) return;
    await API.delete(`/clients/${clientId}/media/${mediaId}`);
    if (type === 'video') setVideos(v => v.filter(x => x.id !== mediaId));
    else setImages(img => img.filter(x => x.id !== mediaId));
  };

  const allMediaDone = images.length >= MAX_IMAGES && videos.length >= MAX_VIDEOS;

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: 24 }}>{isEdit ? 'Edit Client' : 'Add New Client'}</h1>
        <button onClick={() => navigate('/clients')} style={btnSecondary}>← Back</button>
      </div>

      {error && <div style={errBox}>{error}</div>}

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28 }}>
        {['1. Client Info', `2. Upload 5 Images`, `3. Upload 3 Videos`, '4. Done'].map((step, i) => {
          const done = i === 0 ? Boolean(savedId) : i === 1 ? images.length >= MAX_IMAGES : i === 2 ? videos.length >= MAX_VIDEOS : allMediaDone;
          const active = i === 0 ? !savedId : i === 1 ? savedId && images.length < MAX_IMAGES : i === 2 ? images.length >= MAX_IMAGES && videos.length < MAX_VIDEOS : allMediaDone;
          return (
            <div key={step} style={{ flex: 1, padding: '10px 8px', background: done ? '#22c55e20' : active ? '#f9731620' : '#171717',
              border: `1px solid ${done ? '#22c55e40' : active ? '#f9731640' : '#262626'}`,
              borderRadius: i === 0 ? '10px 0 0 10px' : i === 3 ? '0 10px 10px 0' : 0, textAlign: 'center' }}>
              <span style={{ fontSize: 12, color: done ? '#22c55e' : active ? '#f97316' : '#666', fontWeight: active || done ? 700 : 400 }}>
                {done ? '✓ ' : ''}{step}
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSave}>
        <Section title="🏢 Basic Information">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Business Name *" name="name" value={form.name} onChange={handleChange} required />
            <Field label="Category *" name="category" value={form.category} onChange={handleChange} required />
            <Field label="Icon (emoji)" name="icon" value={form.icon} onChange={handleChange} />
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Phone (+251 format)</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+251 9XX XXX XXX" style={inp} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Business Type</label>
            <select name="business_type" value={form.business_type} onChange={handleChange} style={inp}>
              <option value="">Select type...</option>
              {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Field label="Short Description" name="description" value={form.description} onChange={handleChange} />
          <Field label="Full Description" name="full_description" value={form.full_description} onChange={handleChange} textarea />
        </Section>

        <Section title="📋 Business Details">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Established Year" name="established" value={form.established} onChange={handleChange} />
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Location (City)</label>
              <select name="location" value={form.location} onChange={handleChange} style={inp}>
                <option value="">Select city...</option>
                {ETHIOPIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Field label="License Number" name="license_number" value={form.license_number} onChange={handleChange} />
            <Field label="TIN Number" name="tin_number" value={form.tin_number} onChange={handleChange} />
            <Field label="Business License No." name="business_license_number" value={form.business_license_number} onChange={handleChange} />
            <Field label="Website" name="website" value={form.website} onChange={handleChange} />
          </div>
        </Section>

        <Section title="📱 Social Media Links">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Facebook URL" name="facebook" value={form.facebook} onChange={handleChange} placeholder="https://facebook.com/..." />
            <Field label="Instagram URL" name="instagram" value={form.instagram} onChange={handleChange} placeholder="https://instagram.com/..." />
            <Field label="TikTok URL" name="tiktok" value={form.tiktok} onChange={handleChange} placeholder="https://tiktok.com/@..." />
            <Field label="Telegram URL / Username" name="telegram" value={form.telegram} onChange={handleChange} placeholder="https://t.me/..." />
          </div>
        </Section>

        <Section title="📊 Social Media Stats">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <Field label="Followers (e.g. 25K+)" name="followers" value={form.followers} onChange={handleChange} />
            <Field label="Growth (e.g. +180%)" name="growth" value={form.growth} onChange={handleChange} />
            <Field label="Engagement (e.g. 8.5%)" name="engagement" value={form.engagement} onChange={handleChange} />
          </div>
        </Section>

        <button type="submit" disabled={saving} style={btnPrimary}>
          {saving ? 'Saving...' : savedId ? 'Save Changes' : 'Save & Continue to Media →'}
        </button>
      </form>

      {/* ── 5 Image Slots ── */}
      {savedId && (
        <Section title={`📸 Client Images (${images.length}/${MAX_IMAGES} required)`}>
          <p style={{ color: '#a3a3a3', fontSize: 13, marginBottom: 16 }}>
            Upload exactly <strong style={{ color: '#f97316' }}>5 images</strong> showcasing the client's business and your marketing work.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {Array.from({ length: MAX_IMAGES }).map((_, i) => {
              const img = images[i];
              return (
                <div key={i} style={{ borderRadius: 10, overflow: 'hidden', border: `2px solid ${img ? '#22c55e40' : '#f9731640'}`, background: '#0a0a0a', aspectRatio: '1', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  {img ? (
                    <>
                      <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                      <button onClick={() => deleteMedia(img.id, 'image')}
                        style={{ position: 'absolute', top: 4, right: 4, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, fontSize: 11, cursor: 'pointer', zIndex: 2 }}>✕</button>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.65)', padding: '4px 6px', zIndex: 2 }}>
                        <span style={{ color: '#22c55e', fontSize: 10, fontWeight: 700 }}>✓ Img {i + 1}</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 8, width: '100%' }}>
                      <input type="text" placeholder={`Caption ${i + 1}`} value={imgDescs[i]}
                        onChange={e => { const d = [...imgDescs]; d[i] = e.target.value; setImgDescs(d); }}
                        style={{ width: '100%', padding: '4px 6px', background: '#111', border: '1px solid #333', borderRadius: 4, color: '#fff', fontSize: 10, marginBottom: 4 }} />
                      <label style={{ cursor: uploading ? 'wait' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 22 }}>📸</span>
                        <span style={{ color: '#f97316', fontSize: 10, fontWeight: 600 }}>Img {i + 1}</span>
                        <span style={{ color: '#555', fontSize: 9 }}>{uploading === 'image' ? '...' : 'Upload'}</span>
                        <input type="file" accept="image/*" hidden disabled={!!uploading || images.length >= MAX_IMAGES}
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

      {/* ── 3 Video Slots ── */}
      {savedId && (
        <Section title={`🎬 Client Videos (${videos.length}/${MAX_VIDEOS} required)`}>
          <p style={{ color: '#a3a3a3', fontSize: 13, marginBottom: 16 }}>
            Upload exactly <strong style={{ color: '#f97316' }}>3 videos</strong> — showroom tour, customer review, product showcase, etc.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: MAX_VIDEOS }).map((_, i) => {
              const vid = videos[i];
              return (
                <div key={i} style={{ background: '#0a0a0a', border: `2px solid ${vid ? '#22c55e40' : '#f9731640'}`, borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 56, height: 56, background: vid ? '#22c55e20' : '#f9731620', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                    {vid ? '✅' : '🎬'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: vid ? '#22c55e' : '#f97316' }}>
                      Video {i + 1} {vid ? '— Uploaded' : '— Required'}
                    </div>
                    {vid ? (
                      <div style={{ fontSize: 12, color: '#a3a3a3', marginTop: 2 }}>{vid.description}</div>
                    ) : (
                      <input type="text" placeholder={`Video ${i + 1} description (e.g. Showroom Tour)`}
                        value={vidDescs[i]}
                        onChange={e => { const d = [...vidDescs]; d[i] = e.target.value; setVidDescs(d); }}
                        style={{ width: '100%', padding: '7px 10px', background: '#111', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 13, marginTop: 6 }} />
                    )}
                  </div>
                  {vid ? (
                    <button onClick={() => deleteMedia(vid.id, 'video')}
                      style={{ padding: '7px 14px', background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                      Delete
                    </button>
                  ) : (
                    <label style={{ padding: '9px 16px', background: '#f9731620', color: '#f97316', border: '1px solid #f9731640', borderRadius: 8, fontSize: 13, cursor: uploading ? 'wait' : 'pointer', flexShrink: 0 }}>
                      {uploading === 'video' ? 'Uploading...' : '📤 Upload'}
                      <input type="file" accept="video/*" hidden disabled={!!uploading || videos.length >= MAX_VIDEOS}
                        onChange={e => e.target.files[0] && uploadFile(e.target.files[0], 'video', i)} />
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Promotion Paths ── */}
      {savedId && (
        <Section title="🛣️ Promotion Paths">
          <p style={{ color: '#a3a3a3', fontSize: 13, marginBottom: 16 }}>
            Add named promotion campaigns for this client. Each path can hold up to <strong style={{ color: '#f97316' }}>5 images</strong> and <strong style={{ color: '#f97316' }}>5 videos</strong>.
          </p>
          <PathManager clientId={savedId} />
        </Section>
      )}

      {/* Finish button */}
      {allMediaDone && (
        <div style={{ background: '#22c55e20', border: '1px solid #22c55e40', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 16 }}>✓ All media uploaded!</div>
            <div style={{ color: '#a3a3a3', fontSize: 13, marginTop: 2 }}>5 images and 3 videos are ready.</div>
          </div>
          <button onClick={() => navigate('/clients')} style={btnPrimary}>Finish →</button>
        </div>
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
      ? <textarea name={name} value={value} onChange={onChange} required={required} rows={4} style={{ ...inp, resize: 'vertical' }} />
      : <input type="text" name={name} value={value} onChange={onChange} required={required} style={inp} />}
  </div>
);

const inp = { width: '100%', padding: '10px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 };
const lbl = { display: 'block', fontSize: 13, color: '#a3a3a3', marginBottom: 6 };
const btnPrimary = { background: '#f97316', color: '#000', border: 'none', padding: '12px 28px', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' };
const btnSecondary = { background: '#262626', color: '#fff', border: '1px solid #333', padding: '9px 18px', borderRadius: 8, fontSize: 14, cursor: 'pointer' };
const errBox = { background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: 8, marginBottom: 20, fontSize: 14 };
