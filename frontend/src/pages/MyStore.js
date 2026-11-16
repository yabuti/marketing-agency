import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useLang } from '../LangContext';
import { PRODUCT_CATEGORIES as CATEGORIES_8, normalizeCategory, subcategoriesFor, COLOR_PALETTE } from '../constants';

export default function MyStore() {
  const navigate = useNavigate();
  const { t } = useLang();

  const userToken = localStorage.getItem('userToken');
  const user = (() => { try { const v = localStorage.getItem('user'); return v && v !== 'undefined' ? JSON.parse(v) : null; } catch { return null; } })();

  const [categories, setCategories] = useState(CATEGORIES_8);

  useEffect(() => {
    if (!userToken) navigate('/login');
  }, [userToken, navigate]);

  useEffect(() => {
    API.get('/bazaar/categories')
      .then(r => {
        if (Array.isArray(r.data) && r.data.length) {
          // Keep only the canonical 8 (normalized) so the dropdown never grows.
          setCategories(CATEGORIES_8.filter(c => r.data.map(x => normalizeCategory(x.name || x)).includes(c)));
        }
      })
      .catch(() => {});
  }, []);

  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', discount_price: '', category: '', subcategory: '', stock_quantity: '', colors: '', in_bazaar: true });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [isPackage, setIsPackage] = useState(false);
  const [packageItems, setPackageItems] = useState([{ name: '', quantity: 1 }]);

  useEffect(() => {
    if (!userToken) return;
    API.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    API.get('/users/me')
      .then(r => setProfile(r.data))
      .catch(() => navigate('/login'));
  }, [userToken, navigate]);

  useEffect(() => {
    if (!profile) return;
    API.get('/bazaar/products', { params: { seller_id: profile.id, include_inactive: 1 } })
      .then(r => setProducts(Array.isArray(r.data) ? r.data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [profile]);

  const handleSave = async () => {
    setFormError('');
    if (!form.name) { setFormError(t.storeErrNameRequired); return; }
    if (!form.category) { setFormError(t.storeErrCategoryRequired); return; }
    const price = parseFloat(form.price);
    if (!price || price <= 0) { setFormError(t.storeErrPriceInvalid); return; }
    const stock = parseInt(form.stock_quantity, 10);
    if (isNaN(stock) || stock < 0) { setFormError(t.storeErrStockInvalid); return; }
    if (!editingProduct && photos.length === 0) { setFormError(t.storeErrImageRequired); return; }
    if (photos.length > 5) { setFormError(t.storeErrMaxPhotos); return; }

    setSaving(true);
    try {
      const discountPrice = form.discount_price ? parseFloat(form.discount_price) : null;
      const payload = {
        name: form.name, description: form.description, price, category: form.category,
        subcategory: form.subcategory || null,
        stock_quantity: stock, colors: form.colors || null,
        discount_price: discountPrice,
        is_package: isPackage,
        package_items: isPackage ? packageItems.filter(i => i.name.trim()) : null,
        in_bazaar: form.in_bazaar,
      };
      let productId;
      if (editingProduct) {
        await API.put('/bazaar/products/' + editingProduct.id, payload);
        productId = editingProduct.id;
      } else {
        const res = await API.post('/bazaar/products', payload);
        productId = res.data.id;
      }
      // Upload photos
      if (photos.length > 0) {
        setUploadingPhotos(true);
        for (let i = 0; i < photos.length; i++) {
          const fd = new FormData();
          fd.append('file', photos[i]);
          fd.append('sort_order', i);
          await API.post(`/bazaar/products/${productId}/photos`, fd).catch(() => {});
        }
        setUploadingPhotos(false);
      }
      setShowForm(false);
      setEditingProduct(null);
      setPhotos([]);
      setIsPackage(false);
      setPackageItems([{ name: '', quantity: 1 }]);
      setForm({ name: '', description: '', price: '', discount_price: '', category: '', subcategory: '', stock_quantity: '', colors: '', in_bazaar: true });
      // Reload all seller products including inactive ones
      const r = await API.get('/bazaar/products', { params: { seller_id: profile.id, include_inactive: 1 } });
      setProducts(Array.isArray(r.data) ? r.data : []);
    } catch (err) {
      setFormError(err.response?.data?.message || t.storeSaveFailed);
    } finally {
      setSaving(false);
      setUploadingPhotos(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteProduct + '?')) return;
    try {
      await API.delete('/bazaar/products/' + id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || t.storeDeleteFailed);
    }
  };

  const handleMarkSoldOut = async (product) => {
    if (!window.confirm(`${t.storeMarkSoldOut}?`)) return;
    try {
      await API.put('/bazaar/products/' + product.id, { stock_quantity: 0 });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock_quantity: 0 } : p));
    } catch (err) {
      setError(err.response?.data?.message || t.storeSaveFailed);
    }
  };

  if (!profile) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-main)' }}>{t.loading}</div>;

  if (profile.status !== 'active') {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', padding: 24, textAlign: 'center' }}>
        <div style={{ background: '#f9731615', border: '1px solid #f9731640', borderRadius: 16, padding: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          <h2 style={{ color: '#f97316', marginBottom: 8 }}>{t.underReview}</h2>
          <p style={{ color: 'var(--text-main)' }}>{t.underReviewMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--primary)', padding: 0 }}>←</button>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--secondary)' }}>{t.myStoreTab}</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingProduct(null); setForm({ name: '', description: '', price: '', discount_price: '', category: '', subcategory: '', stock_quantity: '', colors: '', in_bazaar: true }); setFormError(''); setPhotos([]); setIsPackage(false); setPackageItems([{ name: '', quantity: 1 }]); }}
          style={{ padding: '10px 20px', background: '#f97316', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 17, cursor: 'pointer' }}
        >
          + {t.addProduct}
        </button>
      </div>

      {error && <div style={{ background: '#ef444415', border: '1px solid #ef444440', color: '#ef4444', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>{error}</div>}

      {/* Add/Edit form */}
      {showForm && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#f97316', marginTop: 0, marginBottom: 20 }}>{editingProduct ? t.editProduct : t.addProduct}</h3>
          {[
            { label: t.productName, key: 'name', type: 'text' },
            { label: t.productPrice + ' (ETB)', key: 'price', type: 'number' },
            { label: t.storeSalePrice, key: 'discount_price', type: 'number' },
            { label: t.productStock, key: 'stock_quantity', type: 'number' },
          ].map(({ label, key, type }) => (            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 16, color: 'var(--text-main)', marginBottom: 5 }}>{label}</label>
              <input
                type={type}
                min={key === 'stock_quantity' ? '0' : key === 'price' ? '0.01' : undefined}
                step={key === 'price' ? '0.01' : key === 'stock_quantity' ? '1' : undefined}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 8, color: 'var(--text-main)', fontSize: 16, boxSizing: 'border-box' }}
              />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 16, color: 'var(--text-main)', marginBottom: 5 }}>{t.productCategory}</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, subcategory: '' }))}
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 8, color: form.category ? 'var(--text-main)' : 'var(--text-muted)', fontSize: 16, boxSizing: 'border-box' }}>
              <option value="">{t.storeSelectCategory}</option>
              {[...new Set([...categories, form.category].filter(Boolean))].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {/* Subcategory */}
          {(() => {
            const subs = subcategoriesFor(form.category);
            if (subs.length === 0) return null;
            return (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 16, color: 'var(--text-main)', marginBottom: 5 }}>{t.storeSubcategory}</label>
                <select value={form.subcategory || ''} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 8, color: form.subcategory ? 'var(--text-main)' : 'var(--text-muted)', fontSize: 16, boxSizing: 'border-box' }}>
                  <option value="">{t.storeSelectSubcategory}</option>
                  {subs.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            );
          })()}
          {/* Package toggle */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <input type="checkbox" id="isPackage" checked={isPackage}
                onChange={e => setIsPackage(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#f97316', cursor: 'pointer' }} />
              <label htmlFor="isPackage" style={{ color: '#f97316', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
                {t.storeIsPackage}
              </label>
            </div>
            {isPackage && (
              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 10, padding: 16, marginTop: 8 }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 12 }}>{t.storePackageIntro}</p>
                {packageItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input placeholder={t.storePackageItemName} value={item.name}
                      onChange={e => { const items = [...packageItems]; items[i].name = e.target.value; setPackageItems(items); }}
                      style={{ flex: '1 1 140px', minWidth: 0, boxSizing: 'border-box', padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--card-border)', borderRadius: 6, color: 'var(--text-main)', fontSize: 16 }} />
                    <input type="number" min="1" value={item.quantity}
                      onChange={e => { const items = [...packageItems]; items[i].quantity = Math.max(1, parseInt(e.target.value) || 1); setPackageItems(items); }}
                      style={{ width: 60, padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--card-border)', borderRadius: 6, color: 'var(--text-main)', fontSize: 16, textAlign: 'center' }} />
                    {packageItems.length > 1 && (
                      <button onClick={() => setPackageItems(items => items.filter((_, idx) => idx !== i))}
                        style={{ background: '#ef444420', border: '1px solid #ef444440', color: '#ef4444', borderRadius: 6, width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setPackageItems(items => [...items, { name: '', quantity: 1 }])}
                  style={{ padding: '6px 14px', background: 'transparent', border: '1px dashed #555', color: '#f97316', borderRadius: 6, fontSize: 16, cursor: 'pointer', marginTop: 4 }}>
                  {t.storePackageAddItem}
                </button>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 16, color: 'var(--text-main)', marginBottom: 5 }}>
              {t.storeAvailableColors} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{t.storeTapCircles}</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <input
                type="checkbox"
                id="allColors"
                checked={form.colors === 'Available in all colors'}
                onChange={e => setForm(f => ({ ...f, colors: e.target.checked ? 'Available in all colors' : '' }))}
                style={{ width: 18, height: 18, accentColor: '#f97316', cursor: 'pointer' }}
              />
              <label htmlFor="allColors" style={{ color: '#f97316', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
                {t.storeAllColors}
              </label>
            </div>
            {form.colors !== 'Available in all colors' && (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {COLOR_PALETTE.map(c => {
                    const selected = (form.colors || '').split(',').map(x => x.trim().toLowerCase()).includes(c.name.toLowerCase());
                    return (
                      <button type="button" key={c.name} title={c.name}
                        onClick={() => {
                          const cur = (form.colors || '').split(',').map(x => x.trim()).filter(Boolean);
                          const idx = cur.findIndex(x => x.toLowerCase() === c.name.toLowerCase());
                          let next;
                          if (idx >= 0) next = cur.filter((_, i) => i !== idx);
                          else next = [...cur, c.name];
                          setForm(f => ({ ...f, colors: next.join(', ') }));
                        }}
                        style={{
                          width: 34, height: 34, borderRadius: '50%', background: c.hex, cursor: 'pointer',
                          border: selected ? '3px solid #f97316' : `1.5px solid ${c.hex === '#FFFFFF' || c.hex === '#EDE0C8' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.08)'}`,
                          boxShadow: selected ? '0 0 0 3px rgba(249,115,22,0.15), 0 2px 6px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.15)',
                          transform: selected ? 'scale(1.08)' : 'scale(1)',
                          transition: 'all 0.15s',
                        }} />
                    );
                  })}
                </div>
                {form.colors && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    {form.colors.split(',').map(c => c.trim()).filter(Boolean).map(color => (
                      <span key={color} style={{ fontSize: 16, padding: '3px 10px', borderRadius: 20, background: '#f9731615', border: '1px solid #f9731640', color: '#f97316', fontWeight: 600 }}>{color}</span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          {/* Bazaar listing toggle */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="inBazaar" checked={!!form.in_bazaar}
                onChange={e => setForm(f => ({ ...f, in_bazaar: e.target.checked }))}
                style={{ width: 18, height: 18, accentColor: '#f97316', cursor: 'pointer' }} />
              <label htmlFor="inBazaar" style={{ color: '#f97316', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
                {t.storeShowInBazaar} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{t.storeBazaarNote}</span>
              </label>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 16, color: 'var(--text-main)', marginBottom: 5 }}>
              {t.storeProductImages} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{t.storeUpToPhotos}</span>
            </label>
            <input type="file" accept="image/*" multiple onChange={e => {
              const files = Array.from(e.target.files).slice(0, 5);
              setPhotos(files);
            }}
              style={{ width: '100%', padding: '8px', background: 'var(--bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 8, color: 'var(--text-main)', fontSize: 16, cursor: 'pointer', boxSizing: 'border-box' }} />
            {photos.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {photos.map((f, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={URL.createObjectURL(f)} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--card-border)' }} />
                    <button type="button" onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                      style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            {editingProduct?.photos?.length > 0 && photos.length === 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 6 }}>{t.storeCurrentPhotos}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {editingProduct.photos.map(p => (
                    <img key={p.id} src={p.url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--card-border)' }} />
                  ))}
                </div>
              </div>
            )}
          </div>
          {formError && <p style={{ color: '#ef4444', fontSize: 16, marginBottom: 12 }}>{formError}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSave} disabled={saving || uploadingPhotos}
              style={{ padding: '10px 20px', background: '#f97316', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 17, cursor: 'pointer' }}>
              {uploadingPhotos ? t.storeUploadingPhotos : saving ? t.saving : t.saveChanges}
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ padding: '10px 20px', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--card-border)', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>
              {t.back}
            </button>
          </div>
        </div>
      )}

      {/* Product list */}
      {loading ? <p style={{ color: 'var(--text-main)' }}>{t.loading}</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {products.length === 0 && <p style={{ color: 'var(--text-main)', textAlign: 'center', padding: 40 }}>{t.noResults}</p>}
          {products.map(product => (
            <div key={product.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              {product.photos?.[0]?.url && (
                <img src={product.photos[0].url} alt={product.name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: 17 }}>
                  {product.name}
                  {Number(product.is_package) === 1 && <span style={{ fontSize: 10, fontWeight: 700, color: '#8b5cf6', marginLeft: 8, background: 'rgba(139, 92, 246, 0.2)', padding: '2px 8px', borderRadius: 6 }}>{t.storePackageBadge}</span>}
                </div>
                <div style={{ color: 'var(--text-main)', fontSize: 16, marginTop: 2 }}>
                  ETB {Number(product.price).toLocaleString()} · {product.category} · {t.storeStockLabel}: {product.stock_quantity}
                </div>
              </div>
              {product.status === 'removed' ? (
                <div style={{ background: '#ef444415', border: '1px solid #ef444440', color: '#ef4444', padding: '4px 10px', borderRadius: 8, fontSize: 16, fontWeight: 600 }}>
                  {t.removedByAdmin}: {product.removal_reason}
                </div>
              ) : product.status === 'pending' ? (
                <div style={{ background: '#f9731615', border: '1px solid #f9731640', color: '#f97316', padding: '4px 10px', borderRadius: 8, fontSize: 16, fontWeight: 600 }}>
                  {t.storeAwaitingApproval}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {Number(product.stock_quantity) === 0 ? (
                    <span style={{ padding: '6px 14px', background: '#ef444415', color: '#ef4444', border: '1px solid #ef444440', borderRadius: 8, fontSize: 16, fontWeight: 700 }}>
                      {t.storeSoldOut}
                    </span>
                  ) : (
                    <button onClick={() => handleMarkSoldOut(product)}
                      style={{ padding: '6px 14px', background: '#f59e0b20', color: '#f59e0b', border: '1px solid #f59e0b40', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>
                      {t.storeMarkSoldOut}
                    </button>
                  )}
                  <button onClick={() => {
                    const pkgItems = product.is_package && product.package_items
                      ? (typeof product.package_items === 'string' ? JSON.parse(product.package_items) : product.package_items)
                      : [{ name: '', quantity: 1 }];
                    setEditingProduct(product);
                    setForm({ name: product.name, description: product.description || '', price: product.price, discount_price: product.discount_price || '', category: product.category, subcategory: product.subcategory || '', stock_quantity: product.stock_quantity, colors: product.colors || '', in_bazaar: Number(product.in_bazaar ?? 1) === 1 });
                    setIsPackage(Number(product.is_package) === 1);
                    setPackageItems(pkgItems);
                    setShowForm(true);
                    setFormError('');
                  }}
                    style={{ padding: '6px 14px', background: '#f9731620', color: '#f97316', border: '1px solid #f9731640', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>
                    {t.editProduct}
                  </button>
                  <button onClick={() => handleDelete(product.id)}
                    style={{ padding: '6px 14px', background: '#ef444415', color: '#ef4444', border: '1px solid #ef444440', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>
                    {t.deleteProduct}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
