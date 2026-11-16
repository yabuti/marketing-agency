import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useLang } from '../LangContext';
import { subcategoriesFor, COLOR_PALETTE } from '../constants';
import PasswordInput from '../components/PasswordInput';

// Sentinel stored in productForm.colors to mean "no specific colour list".
// It's data, not display copy - the label shown to the user is t.dashAllColors.
const ALL_COLORS_VALUE = 'Available in all colors';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [tab, setTab] = useState('business');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const [storeProducts, setStoreProducts] = useState([]);
  const [storeLoading, setStoreLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', category: '', subcategory: '', stock_quantity: '', colors: '' });
  const [productFormError, setProductFormError] = useState('');
  const [productSaving, setProductSaving] = useState(false);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [uploadingProductId, setUploadingProductId] = useState(null);
  const [categories, setCategories] = useState([]);

  const [sellerOrders, setSellerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [purchases, setPurchases] = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);

  const [bankAccounts, setBankAccounts] = useState([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankForm, setBankForm] = useState({ bank: 'cbe', account_number: '', account_name: '' });
  const [bankSaving, setBankSaving] = useState(false);
  const [bankError, setBankError] = useState('');
  const [bankSuccess, setBankSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) { navigate('/login'); return; }
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    API.get('/users/me')
      .then(({ data }) => { setProfile(data); setForm(data); })
      .catch(() => { navigate('/login'); });
  }, [navigate]);

  const set = (e) => {
    let { name, value } = e.target;
    if (name === 'phone') value = value.replace(/\D/g, '').slice(0, 9);
    if (['tin_number', 'elmis_registration', 'business_license_number'].includes(name))
      value = value.replace(/[^a-zA-Z0-9/\-]/g, '');
    if (name === 'email' && value && !/^[^\s@]*@?[^\s@]*$/.test(value)) return;
    setForm({ ...form, [name]: value });
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError(t.dashEmailInvalid); return; }
    const phone = form.phone?.replace(/\D/g, '');
    if (phone && phone.length !== 9) { setError(t.dashPhoneInvalid); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      await API.put('/users/me', { ...form, phone: phone ? '+251' + phone : form.phone });
      setSuccess(t.profileUpdated);
      setProfile({ ...profile, ...form });
    } catch (err) { setError(err.response?.data?.message || t.dashUpdateFailed); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return setError(t.passwordMismatch);
    setSaving(true); setError(''); setSuccess('');
    try {
      await API.post('/users/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setSuccess(t.passwordChanged);
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { setError(err.response?.data?.message || t.dashPasswordChangeFailed); }
    finally { setSaving(false); }
  };

  useEffect(() => {
    if (!profile) return;
    if (tab === 'store' && profile.status === 'active') {
      setStoreLoading(true);
      API.get('/bazaar/products', { params: { seller_id: profile.id } })
        .then(r => setStoreProducts(r.data || []))
        .finally(() => setStoreLoading(false));
      if (categories.length === 0) {
        API.get('/bazaar/categories')
          .then(r => { if (Array.isArray(r.data)) setCategories(r.data.map(c => c.name)); })
          .catch(() => {});
      }
    }
    if (tab === 'orders' && profile.status === 'active') {
      setOrdersLoading(true);
      API.get('/bazaar/orders', { params: { seller_id: profile.id } })
        .then(r => setSellerOrders(r.data || []))
        .finally(() => setOrdersLoading(false));
    }
    if (tab === 'purchases') {
      setPurchasesLoading(true);
      API.get('/bazaar/orders', { params: { customer_id: profile.id } })
        .then(r => setPurchases(r.data || []))
        .finally(() => setPurchasesLoading(false));
    }
    if (tab === 'payments') {
      setBankLoading(true);
      API.get('/bazaar/sellers/' + profile.id + '/banks')
        .then(r => setBankAccounts(r.data || []))
        .finally(() => setBankLoading(false));
    }
  }, [tab, profile]);

  const handleSaveProduct = async () => {
    setProductFormError('');
    if (!productForm.name) { setProductFormError(t.dashFieldRequired(t.productName)); return; }
    if (!productForm.category) { setProductFormError(t.dashFieldRequired(t.productCategory)); return; }
    const price = parseFloat(productForm.price);
    if (!price || price <= 0) { setProductFormError(t.dashPriceInvalid(t.productPrice)); return; }
    const stock = parseInt(productForm.stock_quantity, 10);
    if (isNaN(stock) || stock < 0) { setProductFormError(t.dashStockInvalid(t.productStock)); return; }
    setProductSaving(true);
    try {
      const payload = {
        name: productForm.name,
        description: productForm.description || '',
        price,
        category: productForm.category,
        subcategory: productForm.subcategory || null,
        stock_quantity: stock,
        colors: productForm.colors || null,
      };
      let productId;
      if (editingProduct) {
        await API.put('/bazaar/products/' + editingProduct.id, payload);
        productId = editingProduct.id;
      } else {
        const res = await API.post('/bazaar/products', payload);
        productId = res.data?.id;
      }
      if (photoFiles.length > 0 && productId) {
        setPhotoUploading(true);
        setUploadingProductId(productId);
        for (let i = 0; i < photoFiles.length; i++) {
          const fd = new FormData();
          fd.append('file', photoFiles[i]);
          fd.append('sort_order', i);
          await API.post('/bazaar/products/' + productId + '/photos', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
        setPhotoFiles([]);
        setPhotoUploading(false);
        setUploadingProductId(null);
      }
      setShowProductForm(false); setEditingProduct(null);
      const r = await API.get('/bazaar/products', { params: { seller_id: profile.id } });
      setStoreProducts(r.data || []);
    } catch (err) { setProductFormError(err.response?.data?.message || t.dashSaveProductFailed); }
    finally { setProductSaving(false); }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm(t.deleteProduct + '?')) return;
    try { await API.delete('/bazaar/products/' + productId); setStoreProducts(prev => prev.filter(p => p.id !== productId)); }
    catch (err) { setError(err.response?.data?.message || t.dashDeleteFailed); }
  };

  const handleMarkSoldOutProduct = async (productId) => {
    if (!window.confirm(`${t.storeMarkSoldOut}?`)) return;
    try {
      await API.put('/bazaar/products/' + productId, { stock_quantity: 0 });
      setStoreProducts(prev => prev.map(p => p.id === productId ? { ...p, stock_quantity: 0 } : p));
    } catch (err) { setError(err.response?.data?.message || t.storeSaveFailed); }
  };

  const handleDeletePhoto = async (productId, photoId) => {
    try {
      await API.delete('/bazaar/products/' + productId + '/photos/' + photoId);
      setStoreProducts(prev => prev.map(p => p.id === productId ? { ...p, photos: p.photos.filter(ph => ph.id !== photoId) } : p));
    } catch (err) { setError(err.response?.data?.message || t.dashDeletePhotoFailed); }
  };

  const handleConfirmOrder = async (orderId) => {
    try { await API.put('/bazaar/orders/' + orderId + '/confirm'); setSellerOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'confirmed' } : o)); }
    catch (err) { setError(err.response?.data?.message || t.dashConfirmFailed); }
  };

  const handleRejectOrder = async (orderId) => {
    try { await API.put('/bazaar/orders/' + orderId + '/reject'); setSellerOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'rejected' } : o)); }
    catch (err) { setError(err.response?.data?.message || t.dashRejectFailed); }
  };

  const handleAddBank = async () => {
    setBankError(''); setBankSuccess('');
    if (!bankForm.account_number) { setBankError(t.dashBankAccountRequired); return; }
    setBankSaving(true);
    try {
      await API.put('/bazaar/sellers/banks', bankForm);
      setBankSuccess(t.dashBankAdded);
      setBankForm({ bank: 'cbe', account_number: '', account_name: '' });
      const r = await API.get('/bazaar/sellers/' + profile.id + '/banks');
      setBankAccounts(r.data || []);
    } catch (err) { setBankError(err.response?.data?.message || t.dashBankAddFailed); }
    finally { setBankSaving(false); }
  };

  if (!profile) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>{t.loading}</div>;

  const statusColor = { pending: '#f97316', active: '#22c55e', suspended: '#ef4444' };
  const BANKS = [
    { value: 'cbe', label: 'CBE' },
    { value: 'awash', label: 'Awash Bank' },
    { value: 'dashen', label: 'Dashen Bank' },
    { value: 'abyssinia', label: 'Bank of Abyssinia' },
    { value: 'telebirr', label: 'Telebirr' },
  ];

  const stripEmoji = s => s ? s.replace(/^[^\w\s]+\s*/, '') : s;

  // Raw DB values ('pending', 'active', 'confirmed'...) are never shown as-is:
  // an unknown value still falls back to itself rather than rendering blank.
  const accountStatusLabel = (s) => ({
    pending: t.dashStatusPending,
    active: t.dashStatusActive,
    suspended: t.dashStatusSuspended,
  }[s] || t.dashStatusUnknown(s));

  const orderStatusLabel = (s) => ({
    pending: t.dashOrderStatusPending,
    confirmed: t.dashOrderStatusConfirmed,
    rejected: t.dashOrderStatusRejected,
  }[s] || t.dashStatusUnknown(s));

  const allTabs = [
    ['business', stripEmoji(t.businessTab)],
    ['social', stripEmoji(t.socialTab)],
    ['password', stripEmoji(t.passwordTab)],
    ...(profile.status === 'active' ? [
      ['store', stripEmoji(t.myStoreTab)],
      ['orders', stripEmoji(t.myOrdersTab)],
      ['payments', stripEmoji(t.dashPaymentTab)],
    ] : []),
    ['purchases', stripEmoji(t.myPurchasesTab)],
  ];

  return (
    <div className="page" style={{ paddingTop: 100, maxWidth: 800, margin: '0 auto' }}>
      <div className="hero-gradient" style={{ height: '30vh' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--primary)', padding: 0 }}>←</button>
          <div>
            <h1 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 900 }}>{t.myDashboardTitle}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <span style={{ color: 'var(--secondary)', fontSize: 17, fontWeight: 700 }}>{profile.company_name || profile.full_name}</span>
              <span style={{ fontSize: 16, padding: '3px 10px', borderRadius: 20, background: `${statusColor[profile.status]}20`, color: statusColor[profile.status], fontWeight: 600 }}>{accountStatusLabel(profile.status)}</span>
            </div>
          </div>
        </div>
      </div>

      {profile.status === 'pending' && (
        <div style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 12, padding: 16, marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 24 }}>⏳</span>
          <div>
            <div style={{ color: 'var(--primary)', fontWeight: 600 }}>{t.underReview}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 16, marginTop: 2 }}>{t.underReviewMsg}</div>
          </div>
        </div>
      )}

      {/* Horizontal tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
        {allTabs.map(([key, label]) => (
          <button key={key} onClick={() => { setTab(key); setSuccess(''); setError(''); setProductFormError(''); }}
            style={{
              padding: '10px 22px', borderRadius: 100, border: '1px solid',
              borderColor: tab === key ? 'var(--primary)' : 'rgba(0,0,0,0.1)',
              background: tab === key ? 'rgba(255, 122, 0, 0.08)' : 'transparent',
              color: tab === key ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700, fontSize: 17, cursor: 'pointer', transition: 'all 0.2s',
            }}>
            {label}
          </button>
        ))}
      </div>

      {(success || error) && (
        <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 16,
          background: success ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${success ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
          color: success ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
          {success || error}
        </div>
      )}

      <div style={{ background: 'var(--bg-subtle)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 16, padding: 28, position: 'relative', zIndex: 1 }}>
        {tab === 'business' && (
          <form onSubmit={saveProfile}>
            <h3 style={{ color: 'var(--primary)', fontSize: 16, marginBottom: 20 }}>{t.businessInformation}</h3>
            <Field label={t.companyNameLabel} name="company_name" value={form.company_name || ''} onChange={set} />
            <Field label={t.businessTypeLabel2} name="business_type" value={form.business_type || ''} onChange={set} />
            <Field label={t.locationLabel} name="location" value={form.location || ''} onChange={set} />
            <Field label={t.websiteLabel} name="website" value={form.website || ''} onChange={set} />
            <Field label={t.tinLabel} name="tin_number" value={form.tin_number || ''} onChange={set} />
            <Field label={t.elmisLabel} name="elmis_registration" value={form.elmis_registration || ''} onChange={set} />
            <Field label={t.businessLicenseLabel} name="business_license_number" value={form.business_license_number || ''} onChange={set} />
            <Field label={t.yearEstablished} name="established" value={form.established || ''} onChange={set} />
            <Field label={t.numberOfEmployees} name="employees" value={form.employees || ''} onChange={set} />
            <SaveBtn saving={saving} label={saving ? t.saving : t.saveChanges} />
          </form>
        )}

        {tab === 'social' && (
          <form onSubmit={saveProfile}>
            <h3 style={{ color: 'var(--primary)', fontSize: 16, marginBottom: 20 }}>{t.socialMediaExtra}</h3>
            <Field label={t.instagramHandle} name="instagram" value={form.instagram || ''} onChange={set} placeholder="@yourbusiness" />
            <Field label={t.tiktokHandle} name="tiktok" value={form.tiktok || ''} onChange={set} placeholder="@yourbusiness" />
            <Field label={t.telegramLabel} name="telegram" value={form.telegram || ''} onChange={set} placeholder="@yourbusiness" />
            <Field label={t.facebookPage} name="facebook" value={form.facebook || ''} onChange={set} />
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t.servicesNeeded}</label>
              <textarea name="services_needed" value={form.services_needed || ''} onChange={set} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder={t.servicesNeededPlaceholder} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t.aboutYourBusiness}</label>
              <textarea name="bio" value={form.bio || ''} onChange={set} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder={t.aboutYourBusinessPlaceholder} />
            </div>
            <SaveBtn saving={saving} label={saving ? t.saving : t.saveChanges} />
          </form>
        )}

        {tab === 'password' && (
          <form onSubmit={changePassword}>
            <h3 style={{ color: 'var(--primary)', fontSize: 16, marginBottom: 20 }}>{t.changePassword}</h3>
            <Field label={t.currentPassword} name="currentPassword" type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
            <Field label={t.newPassword} name="newPassword" type="password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder={t.minPassword} />
            <Field label={t.confirmNewPassword} name="confirm" type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
            <SaveBtn saving={saving} label={saving ? t.saving : t.changePassword} />
          </form>
        )}

        {tab === 'store' && profile.status === 'active' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: 'var(--primary)', fontSize: 16, margin: 0 }}>{t.myStoreTab}</h3>
              <button onClick={() => { setShowProductForm(true); setEditingProduct(null); setProductForm({ name: '', description: '', price: '', category: '', subcategory: '', stock_quantity: '', colors: '' }); setPhotoFiles([]); setProductFormError(''); }}
                style={{ padding: '8px 16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 17, cursor: 'pointer' }}>
                + {t.addProduct}
              </button>
            </div>
            {showProductForm && (
              <div style={{ background: 'var(--bg-main)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <h4 style={{ color: 'var(--secondary)', marginTop: 0, marginBottom: 16 }}>{editingProduct ? t.editProduct : t.addProduct}</h4>
                <Field label={t.productName} name="name" value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} />
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>{t.productDescription}</label>
                  <textarea name="description" value={productForm.description || ''} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <Field label={t.productPrice + ' (ETB)'} name="price" type="number" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} />
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>{t.productCategory}</label>
                  <select name="category" value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value, subcategory: '' }))} style={inputStyle}>
                    <option value="">{t.dashSelectCategory}</option>
                    {[...new Set([...categories, productForm.category].filter(Boolean))].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {(() => {
                  const subs = subcategoriesFor(productForm.category);
                  if (subs.length === 0) return null;
                  return (
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>{t.dashSubcategory}</label>
                      <select value={productForm.subcategory || ''} onChange={e => setProductForm(p => ({ ...p, subcategory: e.target.value }))} style={inputStyle}>
                        <option value="">{t.dashSelectSubcategory}</option>
                        {subs.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  );
                })()}
                <Field label={t.productStock} name="stock_quantity" type="number" value={productForm.stock_quantity} onChange={e => setProductForm(p => ({ ...p, stock_quantity: e.target.value }))} />
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>{t.dashAvailableColors}</label>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: -4, marginBottom: 10 }}>{t.dashColorsHint}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <input type="checkbox" id="udAllColors" checked={productForm.colors === ALL_COLORS_VALUE}
                      onChange={e => setProductForm(p => ({ ...p, colors: e.target.checked ? ALL_COLORS_VALUE : '' }))}
                      style={{ width: 18, height: 18, accentColor: '#f97316', cursor: 'pointer' }} />
                    <label htmlFor="udAllColors" style={{ color: '#f97316', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>🎨 {t.dashAllColors}</label>
                  </div>
                  {productForm.colors !== ALL_COLORS_VALUE && (
                    <>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                        {COLOR_PALETTE.map(c => {
                          const selected = (productForm.colors || '').split(',').map(x => x.trim().toLowerCase()).includes(c.name.toLowerCase());
                          return (
                            <button type="button" key={c.name} title={c.name}
                              onClick={() => {
                                const cur = (productForm.colors || '').split(',').map(x => x.trim()).filter(Boolean);
                                const idx = cur.findIndex(x => x.toLowerCase() === c.name.toLowerCase());
                                let next;
                                if (idx >= 0) next = cur.filter((_, i) => i !== idx);
                                else next = [...cur, c.name];
                                setProductForm(p => ({ ...p, colors: next.join(', ') }));
                              }}
                              style={{
                                width: 32, height: 32, borderRadius: '50%', background: c.hex, cursor: 'pointer',
                                border: selected ? '3px solid #f97316' : `1.5px solid ${c.hex === '#FFFFFF' || c.hex === '#EDE0C8' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.08)'}`,
                                boxShadow: selected ? '0 0 0 3px rgba(249,115,22,0.15), 0 2px 6px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.15)',
                                transform: selected ? 'scale(1.08)' : 'scale(1)',
                                transition: 'all 0.15s',
                              }} />
                          );
                        })}
                      </div>
                      {productForm.colors && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {productForm.colors.split(',').map(x => x.trim()).filter(Boolean).map(color => (
                            <span key={color} style={{ fontSize: 16, padding: '3px 10px', borderRadius: 20, background: '#f9731615', border: '1px solid #f9731640', color: '#f97316', fontWeight: 600 }}>{color}</span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Photo Upload */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>{t.dashProductPhotos}</label>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: -4, marginBottom: 10 }}>{t.dashProductPhotosHint}</div>
                  <input type="file" accept="image/*" multiple
                    onChange={e => {
                      const files = Array.from(e.target.files).slice(0, 5);
                      setPhotoFiles(files);
                    }}
                    style={{ ...inputStyle, padding: '10px 14px', cursor: 'pointer' }}
                  />
                  {photoFiles.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      {photoFiles.map((f, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <img src={URL.createObjectURL(f)} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)' }} />
                          <button onClick={() => setPhotoFiles(prev => prev.filter((_, j) => j !== i))}
                            style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {productFormError && <p style={{ color: '#ef4444', fontSize: 16, marginBottom: 12 }}>{productFormError}</p>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={handleSaveProduct} disabled={productSaving} style={{ padding: '10px 20px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 17, cursor: 'pointer' }}>
                    {productSaving ? (photoUploading ? t.dashUploadingPhotos : t.saving) : t.saveChanges}
                  </button>
                  <button onClick={() => { setShowProductForm(false); setEditingProduct(null); }} style={{ padding: '10px 20px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>{t.back}</button>
                </div>
              </div>
            )}
            {storeLoading ? <p style={{ color: 'var(--text-muted)' }}>{t.loading}</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {storeProducts.length === 0 && <p style={{ color: 'var(--text-muted)' }}>{t.noResults}</p>}
                {storeProducts.map(product => (
                  <div key={product.id} style={{ background: 'var(--bg-main)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      {product.photos && product.photos.length > 0 && (
                        <img src={product.photos[0].url} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(0,0,0,0.06)' }} />
                      )}
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <div style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: 17 }}>{product.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 16, marginTop: 2 }}>ETB {Number(product.price).toLocaleString()} · {product.category} · {t.dashStockLabel(product.stock_quantity)}</div>
                      </div>
                      {product.status === 'removed' && (
                        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444', padding: '4px 10px', borderRadius: 8, fontSize: 16, fontWeight: 600 }}>{t.removedByAdmin}: {product.removal_reason}</div>
                      )}
                      {product.status !== 'removed' && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          {Number(product.stock_quantity) === 0 ? (
                            <span style={{ padding: '6px 14px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, fontSize: 16, fontWeight: 700 }}>{t.storeSoldOut}</span>
                          ) : (
                            <button onClick={() => handleMarkSoldOutProduct(product.id)} style={{ padding: '6px 14px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>{t.storeMarkSoldOut}</button>
                          )}
                          <button onClick={() => { setEditingProduct(product); setProductForm({ name: product.name, description: product.description || '', price: product.price, category: product.category, subcategory: product.subcategory || '', stock_quantity: product.stock_quantity, colors: product.colors || '' }); setShowProductForm(true); setPhotoFiles([]); setProductFormError(''); }} style={{ padding: '6px 14px', background: 'rgba(255,122,0,0.08)', color: 'var(--primary)', border: '1px solid rgba(255,122,0,0.15)', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>{t.editProduct}</button>
                          <button onClick={() => handleDeleteProduct(product.id)} style={{ padding: '6px 14px', background: 'rgba(239,68,68,0.06)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.12)', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>{t.deleteProduct}</button>
                        </div>
                      )}
                    </div>
                    {product.photos && product.photos.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                        {product.photos.map(ph => (
                          <div key={ph.id} style={{ position: 'relative' }}>
                            <img src={ph.url} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(0,0,0,0.08)' }} />
                            <button onClick={() => handleDeletePhoto(product.id, ph.id)}
                              style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'orders' && profile.status === 'active' && (
          <div>
            <h3 style={{ color: 'var(--primary)', fontSize: 16, marginBottom: 20 }}>{t.myOrdersTab}</h3>
            {ordersLoading ? <p style={{ color: 'var(--text-muted)' }}>{t.loading}</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sellerOrders.length === 0 && <p style={{ color: 'var(--text-muted)' }}>{t.noOrders}</p>}
                {sellerOrders.map(order => (
                  <div key={order.id} style={{ background: 'var(--bg-main)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>{t.orderNumber}{order.id}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 16, marginLeft: 12 }}>{order.customer_name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>ETB {Number(order.total_amount).toLocaleString()}</span>
                        <span style={{ fontSize: 16, padding: '3px 10px', borderRadius: 20, background: order.status === 'pending' ? 'rgba(249,115,22,0.1)' : order.status === 'confirmed' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: order.status === 'pending' ? '#f97316' : order.status === 'confirmed' ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{orderStatusLabel(order.status)}</span>
                      </div>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 10 }}>{t.bank}: {order.payment_method?.toUpperCase()} · {t.proof}: {order.proof_type === 'screenshot' ? `📷 ${t.screenshot}` : `${t.ref}: ${order.proof_value}`}</div>
                    {order.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => handleConfirmOrder(order.id)} style={{ padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 17, cursor: 'pointer' }}>{t.confirmPayment}</button>
                        <button onClick={() => handleRejectOrder(order.id)} style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>{t.rejectPayment}</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'payments' && profile.status === 'active' && (
          <div>
            <h3 style={{ color: 'var(--primary)', fontSize: 16, marginBottom: 8 }}>{t.dashPaymentMethods}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 20 }}>{t.dashPaymentMethodsDesc}</p>

            {bankError && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444', fontWeight: 600, fontSize: 16 }}>{bankError}</div>}
            {bankSuccess && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 16, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', color: '#22c55e', fontWeight: 600, fontSize: 16 }}>{bankSuccess}</div>}

            <div style={{ background: 'var(--bg-main)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <h4 style={{ color: 'var(--secondary)', marginTop: 0, marginBottom: 16, fontSize: 16 }}>{t.dashAddBankAccount}</h4>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>{t.dashBankLabel}</label>
                <select value={bankForm.bank} onChange={e => setBankForm({ ...bankForm, bank: e.target.value })}
                  style={{ ...inputStyle, cursor: 'pointer' }}>
                  {BANKS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
              <Field label={t.dashAccountNumber} name="account_number" value={bankForm.account_number} onChange={e => setBankForm({ ...bankForm, account_number: e.target.value })} placeholder={t.dashAccountNumberPh} />
              <Field label={t.dashAccountNameOptional} name="account_name" value={bankForm.account_name || ''} onChange={e => setBankForm({ ...bankForm, account_name: e.target.value })} placeholder={t.dashAccountNamePh} />
              <button onClick={handleAddBank} disabled={bankSaving} style={{ padding: '10px 20px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 17, cursor: 'pointer' }}>
                {bankSaving ? t.saving : t.dashAddPaymentMethod}
              </button>
            </div>

            <h4 style={{ color: 'var(--secondary)', marginBottom: 12, fontSize: 16 }}>{t.dashYourAccounts}</h4>
            {bankLoading ? <p style={{ color: 'var(--text-muted)' }}>{t.loading}</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {bankAccounts.length === 0 && <p style={{ color: 'var(--text-muted)' }}>{t.dashNoBankAccounts}</p>}
                {bankAccounts.map(bank => (
                  <div key={bank.id} style={{ background: 'var(--bg-main)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,122,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏦</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: 17 }}>{BANKS.find(b => b.value === bank.bank)?.label || bank.bank}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 16, marginTop: 2 }}>{t.dashAccountLabel(bank.account_number)}{bank.account_name ? ` · ${bank.account_name}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'purchases' && (
          <div>
            <h3 style={{ color: 'var(--primary)', fontSize: 16, marginBottom: 20 }}>{t.myPurchasesTab}</h3>
            {purchasesLoading ? <p style={{ color: 'var(--text-muted)' }}>{t.loading}</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {purchases.length === 0 && <p style={{ color: 'var(--text-muted)' }}>{t.noOrders}</p>}
                {purchases.map(order => (
                  <div key={order.id} style={{ background: 'var(--bg-main)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--secondary)' }}>{t.orderNumber}{order.id}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 16, marginTop: 2 }}>{order.seller_name} · ETB {Number(order.total_amount).toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16, padding: '3px 10px', borderRadius: 20, background: order.status === 'pending' ? 'rgba(249,115,22,0.1)' : order.status === 'confirmed' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: order.status === 'pending' ? '#f97316' : order.status === 'confirmed' ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{orderStatusLabel(order.status)}</span>
                      {order.status === 'confirmed' && (
                        <a href="/bazaar/delivery" style={{ color: 'var(--primary)', fontSize: 16, textDecoration: 'none', borderBottom: '1px solid rgba(255,122,0,0.2)' }}>{t.requestDelivery}</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Newsletter / Subscribe */}
      <div style={{ maxWidth: 800, margin: '40px auto', padding: '40px 32px', background: 'var(--secondary)', borderRadius: 20, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-main)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{t.mpNewsletterTitle}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 20, lineHeight: 1.5 }}>{t.mpNewsletterDesc}</p>
        <form onSubmit={e => { e.preventDefault(); alert(t.mpNewsletterSuccess); }} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 440, margin: '0 auto' }}>
          <input type="email" required placeholder={t.mpNewsletterPlaceholder} style={{ flex: '1 1 180px', padding: '12px 16px', borderRadius: 10, border: 'none', fontSize: 16, outline: 'none' }} />
          <button type="submit" style={{ padding: '12px 24px', background: 'var(--primary)', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 17, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>{t.mpNewsletterBtn}</button>
        </form>
      </div>
    </div>
  );
}

const Field = ({ label, name, type = 'text', value, onChange, placeholder }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={labelStyle}>{label}</label>
    {type === 'password' ? (
      <PasswordInput name={name} value={value} onChange={onChange} placeholder={placeholder} autoComplete="new-password" style={inputStyle} />
    ) : (
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} style={inputStyle} />
    )}
  </div>
);

const SaveBtn = ({ saving, label }) => {
  const { t } = useLang();
  return (
    <button type="submit" disabled={saving} style={{ padding: '12px 28px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 17, cursor: 'pointer' }}>
      {saving ? t.saving : (label || t.saveChanges)}
    </button>
  );
};

const inputStyle = { width: '100%', padding: '11px 14px', background: 'var(--bg-main)', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, color: 'var(--text-main)', fontSize: 16 };
const labelStyle = { display: 'block', fontSize: 16, color: 'var(--text-muted)', marginBottom: 6 };
