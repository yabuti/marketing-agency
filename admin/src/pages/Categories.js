import React, { useEffect, useRef, useState } from 'react';
import API from '../api';
import { useToast } from '../components/Toast';
import Alert from '../components/Alert';

const btnPrimary = { background: '#f97316', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' };
const btnSecondary = { background: '#262626', color: '#fff', border: '1px solid #333', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' };
const btnDanger = { background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' };
const inputStyle = { width: '100%', padding: '10px 14px', background: '#1e1e1e', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: 12, color: '#a3a3a3', marginBottom: 4, fontWeight: 600 };
const card = { background: '#171717', border: '1px solid #262626', borderRadius: 12, padding: '16px 20px' };

const ACCEPTED = 'jpg,jpeg,png,gif,webp,avif,svg';

function Thumb({ src, name }) {
  if (!src) {
    return (
      <div style={{ width: 56, height: 56, borderRadius: 8, background: '#262626', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 11, flexShrink: 0 }}>
        No img
      </div>
    );
  }
  return (
    <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#fff' }}>
      <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
}

function CategoryRow({ cat, onSaved, onError, onReload }) {
  const [name, setName] = useState(cat.name);
  const [displayName, setDisplayName] = useState(cat.display_name === cat.name ? '' : cat.display_name || '');
  const [imageUrl, setImageUrl] = useState(cat.image || '');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    setName(cat.name);
    setDisplayName(cat.display_name === cat.name ? '' : cat.display_name || '');
    setImageUrl(cat.image || '');
  }, [cat.id, cat.name, cat.display_name, cat.image]);

  const save = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.warning('Category name cannot be empty.');
      return onError('Category name cannot be empty.');
    }
    setBusy(true);
    try {
      await API.put(`/bazaar/categories/${cat.id}`, {
        name: trimmedName,
        display_name: displayName.trim(),
        image: imageUrl.trim() || null,
      });
      toast.success(`Category "${trimmedName}" updated.`);
      onSaved();
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to save category.';
      toast.error(msg);
      onError(msg);
    } finally {
      setBusy(false);
    }
  };

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await API.post(`/bazaar/categories/${cat.id}/image`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(res.data?.image || '');
      toast.success('Category image uploaded.');
      onReload();
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to upload image.';
      toast.error(msg);
      onError(msg);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const clearImage = async () => {
    setBusy(true);
    try {
      await API.post(`/bazaar/categories/${cat.id}/image`, { _method: 'DELETE' });
      setImageUrl('');
      toast.info('Category image removed.');
      onReload();
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to remove image.';
      toast.error(msg);
      onError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ ...card, display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
        <Thumb src={cat.image} name={cat.display_name || cat.name} />
        <input ref={fileRef} type="file" accept={ACCEPTED} disabled={busy}
          onChange={(e) => upload(e.target.files?.[0])}
          style={{ width: 130, fontSize: 11, color: '#a3a3a3' }} />
        {cat.image && <button onClick={clearImage} disabled={busy} style={{ ...btnDanger, padding: '4px 10px', fontSize: 12 }}>Remove</button>}
      </div>

      <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <label style={labelStyle}>Filter key (canonical, used by product matching)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} disabled={busy} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Website label (display_name — blank falls back to the filter key)</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={busy}
            placeholder={name} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Image URL (overridden by file upload above)</label>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} disabled={busy}
            placeholder="/images/bazaar-fashion.jpg" style={inputStyle} />
        </div>
      </div>

      <div style={{ alignSelf: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={save} disabled={busy} style={btnPrimary}>
          {busy ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function NewCategory({ onAdded, onError }) {
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const add = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.warning('Category name cannot be empty.');
      return onError('Category name cannot be empty.');
    }
    setBusy(true);
    try {
      await API.post('/bazaar/categories', {
        name: trimmed,
        display_name: displayName.trim(),
        image: imageUrl.trim() || null,
      });
      toast.success(`Category "${trimmed}" added.`);
      setName('');
      setDisplayName('');
      setImageUrl('');
      onAdded();
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to add category.';
      toast.error(msg);
      onError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ ...card, marginBottom: 20 }}>
      <h2 style={{ fontSize: 16, margin: '0 0 12px', fontWeight: 700 }}>Add category</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={labelStyle}>Filter key</label>
          <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="fashion" style={inputStyle} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={labelStyle}>Website label (optional)</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="Fashion & Apparel" style={inputStyle} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={labelStyle}>Image URL (optional)</label>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="/images/bazaar-fashion.jpg" style={inputStyle} />
        </div>
        <button onClick={add} disabled={busy} style={btnPrimary}>+ Add</button>
      </div>
    </div>
  );
}

const SUBCATEGORY_TAXONOMY = {
  'Handmade Crafts': ['Pottery & Ceramics', 'Weaving & Textiles', 'Jewelry & Accessories', 'Leather Goods', 'Woodwork', 'Home Décor'],
  'Fashion': ['Women\'s Clothing', 'Men\'s Clothing', 'Children\'s Clothing', 'Shoes & Bags', 'Traditional Clothing', 'Accessories'],
  'Food & Beverage': ['Coffee & Tea', 'Spices & Grains', 'Honey & Sweets', 'Traditional Food', 'Cold Drinks', 'Kitchen Staples'],
  'Beauty & Health': ['Skincare', 'Haircare', 'Perfume & Fragrance', 'Cosmetics', 'Wellness & Supplements', 'Natural Remedies'],
  'Home & Living': ['Furniture', 'Home Décor', 'Kitchen & Dining', 'Bedding & Linens', 'Lighting', 'Storage'],
  'Sports & Outdoors': ['Sports Equipment', 'Fitness & Exercise', 'Outdoor & Camping', 'Team Sports', 'Cycling', 'Athletic Wear'],
  'Books & Media': ['Books & Literature', 'Stationery & Journals', 'Music & Film', 'Art & Collectibles', 'Magazines'],
  'Services': ['Photography', 'Design & Printing', 'Repair & Maintenance', 'Cleaning', 'Personal Care', 'Classes & Training'],
};

const subKey = (category, sub) =>
  `${String(category).trim().toLowerCase()}||${String(sub).trim().toLowerCase()}`;

function SubcategoryImages({ onError }) {
  const [images, setImages] = useState({});
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const load = () => {
    API.get('/bazaar/settings')
      .then((r) => {
        let raw = r.data?.subcategory_images;
        if (typeof raw === 'string') {
          try { raw = JSON.parse(raw); } catch { raw = {}; }
        }
        setImages(raw && typeof raw === 'object' ? raw : {});
      })
      .catch(() => {});
  };

  useEffect(load, []);

  const uploadImage = async (key, file) => {
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append('key', key);
      form.append('file', file);
      const res = await API.post('/bazaar/subcategories/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImages(res.data?.subcategory_images || {});
      toast.success('Subcategory image uploaded.');
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to upload subcategory image.';
      toast.error(msg);
      onError(msg);
    } finally {
      setBusy(false);
    }
  };

  const removeImage = async (key) => {
    setBusy(true);
    try {
      const res = await API.post('/bazaar/subcategories/image', { key, _method: 'DELETE' });
      setImages(res.data?.subcategory_images || {});
      toast.info('Subcategory image removed.');
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to remove subcategory image.';
      toast.error(msg);
      onError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginTop: 36 }}>
      <h2 style={{ fontSize: 20, marginBottom: 6, fontWeight: 700 }}>Subcategory Tile Images</h2>
      <p style={{ color: '#a3a3a3', fontSize: 13, marginBottom: 20 }}>
        Images shown when a shopper filters into one of the 8 main categories on the website.
      </p>

      {Object.entries(SUBCATEGORY_TAXONOMY).map(([category, subs]) => (
        <div key={category} style={{ ...card, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, color: '#f97316', margin: '0 0 14px', fontWeight: 700 }}>{category}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {subs.map((sub) => {
              const key = subKey(category, sub);
              const url = images[key];
              return (
                <div key={sub} style={{ background: '#111', border: '1px solid #222', borderRadius: 8, padding: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Thumb src={url} name={sub} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#e5e5e5', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sub}
                    </div>
                    <input type="file" accept={ACCEPTED} disabled={busy}
                      onChange={(e) => { uploadImage(key, e.target.files?.[0]); e.target.value = ''; }}
                      style={{ fontSize: 10, color: '#a3a3a3', width: '100%' }} />
                  </div>
                  {url && (
                    <button onClick={() => removeImage(key)} disabled={busy}
                      style={{ ...btnDanger, padding: '4px 8px', fontSize: 11, alignSelf: 'flex-start', flexShrink: 0 }}>
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    API.get('/bazaar/categories')
      .then((r) => setCategories(Array.isArray(r.data) ? r.data : []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800 }}>🏷️ Bazaar Categories</h1>
      <p style={{ color: '#a3a3a3', marginTop: 4, marginBottom: 24 }}>
        The filter key is the canonical name products are matched against. The website label is free text.
      </p>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <NewCategory onAdded={() => { setError(''); load(); }} onError={setError} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {categories.length === 0 && <p style={{ color: '#a3a3a3' }}>No categories yet. Add one above.</p>}
        {categories.map((cat) => (
          <CategoryRow key={cat.id} cat={cat}
            onSaved={() => { setError(''); load(); }}
            onError={setError}
            onReload={load} />
        ))}
      </div>

      <SubcategoryImages onError={setError} />
    </div>
  );
}
