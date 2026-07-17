import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useLang } from '../LangContext';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [tab, setTab] = useState('profile');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const dropdownRef = useRef(null);

  // Bazaar - My Store state
  const [storeProducts, setStoreProducts] = useState([]);
  const [storeLoading, setStoreLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', category: '', stock_quantity: '', photos: [] });
  const [productFormError, setProductFormError] = useState('');
  const [productSaving, setProductSaving] = useState(false);

  // Bazaar - My Orders (seller) state
  const [sellerOrders, setSellerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Bazaar - My Purchases (customer) state
  const [purchases, setPurchases] = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) { navigate('/login'); return; }

    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    API.get('/users/me')
      .then(({ data }) => {
        setProfile(data);
        setForm(data);
      })
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
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Please enter a valid email address'); return; }
    const phone = form.phone?.replace(/\D/g, '');
    if (phone && phone.length !== 9) { setError('Phone must be 9 digits'); return; }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await API.put('/users/me', { ...form, phone: phone ? '+251' + phone : form.phone });
      setSuccess(t.profileUpdated);
      setProfile({ ...profile, ...form });
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return setError(t.passwordMismatch);
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await API.post('/users/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setSuccess(t.passwordChanged);
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Bazaar data loading
  useEffect(() => {
    if (!profile) return;
    if (tab === 'store' && profile.status === 'active') {
      setStoreLoading(true);
      API.get('/bazaar/products', { params: { seller_id: profile.id } })
        .then(r => setStoreProducts(r.data || []))
        .finally(() => setStoreLoading(false));
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
  }, [tab, profile]);

  // Bazaar handlers
  const handleSaveProduct = async () => {
    setProductFormError('');
    if (!productForm.name) { setProductFormError(t.productName + ' is required.'); return; }
    if (!productForm.category) { setProductFormError(t.productCategory + ' is required.'); return; }
    const price = parseFloat(productForm.price);
    if (!price || price <= 0) { setProductFormError(t.productPrice + ' must be greater than zero.'); return; }
    const stock = parseInt(productForm.stock_quantity, 10);
    if (isNaN(stock) || stock < 0) { setProductFormError(t.productStock + ' must be zero or greater.'); return; }

    setProductSaving(true);
    try {
      const payload = { name: productForm.name, description: productForm.description, price, category: productForm.category, stock_quantity: stock };
      if (editingProduct) {
        await API.put('/bazaar/products/' + editingProduct.id, payload);
      } else {
        await API.post('/bazaar/products', payload);
      }
      setShowProductForm(false);
      setEditingProduct(null);
      const r = await API.get('/bazaar/products', { params: { seller_id: profile.id } });
      setStoreProducts(r.data || []);
    } catch (err) {
      setProductFormError(err.response?.data?.message || 'Save failed.');
    } finally {
      setProductSaving(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm(t.deleteProduct + '?')) return;
    try {
      await API.delete('/bazaar/products/' + productId);
      setStoreProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      await API.put('/bazaar/orders/' + orderId + '/confirm');
      setSellerOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'confirmed' } : o));
    } catch (err) {
      setError(err.response?.data?.message || 'Confirm failed.');
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      await API.put('/bazaar/orders/' + orderId + '/reject');
      setSellerOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'rejected' } : o));
    } catch (err) {
      setError(err.response?.data?.message || 'Reject failed.');
    }
  };

  if (!profile) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>{t.loading}</div>;

  const statusColor = { pending: '#f97316', active: '#22c55e', suspended: '#ef4444' };

  const allTabs = [
    { key: 'profile', label: t.profileTab, icon: '👤' },
    { key: 'business', label: t.businessTab, icon: '🏢' },
    { key: 'social', label: t.socialTab, icon: '📱' },
    { key: 'password', label: t.passwordTab, icon: '🔒' },
    ...(profile.status === 'active' ? [
      { key: 'store', label: t.myStoreTab, icon: '🛍️' },
      { key: 'orders', label: t.myOrdersTab, icon: '📦' },
    ] : []),
    { key: 'purchases', label: t.myPurchasesTab, icon: '🛒' },
  ];

  const currentTab = allTabs.find(t2 => t2.key === tab);

  return (
    <div className="page" style={{ paddingTop: 140, maxWidth: 800, margin: '0 auto' }}>
      <div className="hero-gradient" style={{ height: '30vh' }} />

      {/* Header with username and logout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--primary)', padding: 0 }}>←</button>
          <div>
            <h1 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 900 }}>{t.myDashboardTitle}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <span
                onClick={() => navigate('/dashboard')}
                style={{ color: 'var(--secondary)', fontSize: 16, fontWeight: 700, cursor: 'pointer', borderBottom: '2px solid var(--primary)', paddingBottom: 2 }}
              >
                {profile.company_name || profile.full_name}
              </span>
              <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20,
                background: `${statusColor[profile.status]}20`, color: statusColor[profile.status], fontWeight: 600 }}>
                {profile.status}
              </span>
            </div>
          </div>
        </div>

        {/* Right side: username clickable + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            onClick={() => navigate('/dashboard')}
            style={{
              color: 'var(--text-muted)', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8, transition: 'all 0.2s',
            }}
          >
            <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
              {(profile.full_name || 'U').charAt(0).toUpperCase()}
            </span>
            {profile.full_name}
          </span>
          <button onClick={logout} style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {t.signOut}
          </button>
        </div>
      </div>

      {profile.status === 'pending' && (
        <div style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 12, padding: 16, marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 24 }}>⏳</span>
          <div>
            <div style={{ color: 'var(--primary)', fontWeight: 600 }}>{t.underReview}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 2 }}>{t.underReviewMsg}</div>
          </div>
        </div>
      )}

      {/* Dropdown tab navigation */}
      <div ref={dropdownRef} style={{ marginBottom: 24, position: 'relative', zIndex: 99 }}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            width: '100%', padding: '14px 20px',
            background: 'var(--bg-subtle)', border: '2px solid rgba(255,122,0,0.15)',
            borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 700, color: 'var(--secondary)' }}>
            <span style={{ fontSize: 20 }}>{currentTab?.icon}</span>
            {currentTab?.label}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
        </button>

        {dropdownOpen && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
            background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12,
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 100,
          }}>
            {allTabs.map(t2 => (
              <button
                key={t2.key}
                onClick={() => { setTab(t2.key); setDropdownOpen(false); setSuccess(''); setError(''); }}
                style={{
                  width: '100%', padding: '12px 20px',
                  background: tab === t2.key ? 'rgba(255,122,0,0.08)' : 'transparent',
                  border: 'none', display: 'flex', alignItems: 'center', gap: 10,
                  fontSize: 15, fontWeight: tab === t2.key ? 700 : 500,
                  color: tab === t2.key ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 18 }}>{t2.icon}</span>
                {t2.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {(success || error) && (
        <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 15,
          background: success ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${success ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
          color: success ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
          {success || error}
        </div>
      )}

      <div style={{ background: 'var(--bg-subtle)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 16, padding: 28, position: 'relative', zIndex: 1 }}>
        {tab === 'profile' && (
          <form onSubmit={saveProfile}>
            <h3 style={{ color: 'var(--primary)', fontSize: 15, marginBottom: 20 }}>{t.personalInformation}</h3>
            <Field label={t.fullNameLabel} name="full_name" value={form.full_name || ''} onChange={set} />
            <Field label={t.emailLabel} name="email" type="email" value={form.email || ''} onChange={set} />
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t.phoneLabel2}</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, overflow: 'hidden' }}>
                <span style={{ padding: '11px 12px', color: 'var(--primary)', fontWeight: 700, fontSize: 16, borderRight: '1px solid rgba(0,0,0,0.08)' }}>+251</span>
                <input type="tel" name="phone" value={(form.phone || '').replace('+251', '')} onChange={set} maxLength={9} placeholder="9XX XXX XXX" style={{ flex: 1, padding: '11px 12px', background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: 16, outline: 'none' }} />
              </div>
            </div>
            <SaveBtn saving={saving} label={saving ? t.saving : t.saveChanges} />
          </form>
        )}

        {tab === 'business' && (
          <form onSubmit={saveProfile}>
            <h3 style={{ color: 'var(--primary)', fontSize: 15, marginBottom: 20 }}>{t.businessInformation}</h3>
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
            <h3 style={{ color: 'var(--primary)', fontSize: 15, marginBottom: 20 }}>{t.socialMediaExtra}</h3>
            <Field label={t.instagramHandle} name="instagram" value={form.instagram || ''} onChange={set} placeholder="@yourbusiness" />
            <Field label={t.tiktokHandle} name="tiktok" value={form.tiktok || ''} onChange={set} placeholder="@yourbusiness" />
            <Field label={t.telegramLabel} name="telegram" value={form.telegram || ''} onChange={set} placeholder="@yourbusiness" />
            <Field label={t.facebookPage} name="facebook" value={form.facebook || ''} onChange={set} />
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t.servicesNeeded}</label>
              <textarea name="services_needed" value={form.services_needed || ''} onChange={set} rows={3}
                style={{ ...inputStyle, resize: 'vertical' }} placeholder={t.servicesNeededPlaceholder} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t.aboutYourBusiness}</label>
              <textarea name="bio" value={form.bio || ''} onChange={set} rows={4}
                style={{ ...inputStyle, resize: 'vertical' }} placeholder={t.aboutYourBusinessPlaceholder} />
            </div>
            <SaveBtn saving={saving} label={saving ? t.saving : t.saveChanges} />
          </form>
        )}

        {tab === 'password' && (
          <form onSubmit={changePassword}>
            <h3 style={{ color: 'var(--primary)', fontSize: 15, marginBottom: 20 }}>{t.changePassword}</h3>
            <Field label={t.currentPassword} name="currentPassword" type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
            <Field label={t.newPassword} name="newPassword" type="password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder={t.minPassword} />
            <Field label={t.confirmNewPassword} name="confirm" type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
            <SaveBtn saving={saving} label={saving ? t.saving : t.changePassword} />
          </form>
        )}

        {tab === 'store' && profile.status === 'active' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: 'var(--primary)', fontSize: 15, margin: 0 }}>{t.myStoreTab}</h3>
              <button onClick={() => { setShowProductForm(true); setEditingProduct(null); setProductForm({ name: '', description: '', price: '', category: '', stock_quantity: '' }); setProductFormError(''); }}
                style={{ padding: '8px 16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                + {t.addProduct}
              </button>
            </div>

            {showProductForm && (
              <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <h4 style={{ color: 'var(--secondary)', marginTop: 0, marginBottom: 16 }}>{editingProduct ? t.editProduct : t.addProduct}</h4>
                <Field label={t.productName} name="name" value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} />
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>{t.productDescription}</label>
                  <textarea name="description" value={productForm.description || ''} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <Field label={t.productPrice} name="price" type="number" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} />
                <Field label={t.productCategory} name="category" value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))} />
                <Field label={t.productStock} name="stock_quantity" type="number" value={productForm.stock_quantity} onChange={e => setProductForm(p => ({ ...p, stock_quantity: e.target.value }))} />
                {productFormError && <p style={{ color: '#ef4444', fontSize: 15, marginBottom: 12 }}>{productFormError}</p>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={handleSaveProduct} disabled={productSaving}
                    style={{ padding: '10px 20px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                    {productSaving ? t.saving : t.saveChanges}
                  </button>
                  <button onClick={() => setShowProductForm(false)}
                    style={{ padding: '10px 20px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, fontSize: 15, cursor: 'pointer' }}>
                    {t.back}
                  </button>
                </div>
              </div>
            )}

            {storeLoading ? <p style={{ color: 'var(--text-muted)' }}>{t.loading}</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {storeProducts.length === 0 && <p style={{ color: 'var(--text-muted)' }}>{t.noResults}</p>}
                {storeProducts.map(product => (
                  <div key={product.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <div style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: 16 }}>{product.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>ETB {Number(product.price).toLocaleString()} · {product.category} · Stock: {product.stock_quantity}</div>
                    </div>
                    {product.status === 'removed' && (
                      <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                        {t.removedByAdmin}: {product.removal_reason}
                      </div>
                    )}
                    {product.status !== 'removed' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { setEditingProduct(product); setProductForm({ name: product.name, description: product.description || '', price: product.price, category: product.category, stock_quantity: product.stock_quantity }); setShowProductForm(true); setProductFormError(''); }}
                          style={{ padding: '6px 14px', background: 'rgba(255,122,0,0.08)', color: 'var(--primary)', border: '1px solid rgba(255,122,0,0.15)', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
                          {t.editProduct}
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id)}
                          style={{ padding: '6px 14px', background: 'rgba(239,68,68,0.06)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.12)', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
                          {t.deleteProduct}
                        </button>
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
            <h3 style={{ color: 'var(--primary)', fontSize: 15, marginBottom: 20 }}>{t.myOrdersTab}</h3>
            {ordersLoading ? <p style={{ color: 'var(--text-muted)' }}>{t.loading}</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sellerOrders.length === 0 && <p style={{ color: 'var(--text-muted)' }}>{t.noOrders}</p>}
                {sellerOrders.map(order => (
                  <div key={order.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>{t.orderNumber}{order.id}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 15, marginLeft: 12 }}>{order.customer_name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>ETB {Number(order.total_amount).toLocaleString()}</span>
                        <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: order.status === 'pending' ? 'rgba(249,115,22,0.1)' : order.status === 'confirmed' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: order.status === 'pending' ? '#f97316' : order.status === 'confirmed' ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 10 }}>
                      {t.bank}: {order.payment_method?.toUpperCase()} · {t.proof}: {order.proof_type === 'screenshot' ? `📷 ${t.screenshot}` : `${t.ref}: ${order.proof_value}`}
                    </div>
                    {order.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => handleConfirmOrder(order.id)}
                          style={{ padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                          {t.confirmPayment}
                        </button>
                        <button onClick={() => handleRejectOrder(order.id)}
                          style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, fontSize: 15, cursor: 'pointer' }}>
                          {t.rejectPayment}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'purchases' && (
          <div>
            <h3 style={{ color: 'var(--primary)', fontSize: 15, marginBottom: 20 }}>{t.myPurchasesTab}</h3>
            {purchasesLoading ? <p style={{ color: 'var(--text-muted)' }}>{t.loading}</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {purchases.length === 0 && <p style={{ color: 'var(--text-muted)' }}>{t.noOrders}</p>}
                {purchases.map(order => (
                  <div key={order.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--secondary)' }}>{t.orderNumber}{order.id}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 2 }}>{order.seller_name} · ETB {Number(order.total_amount).toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: order.status === 'pending' ? 'rgba(249,115,22,0.1)' : order.status === 'confirmed' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: order.status === 'pending' ? '#f97316' : order.status === 'confirmed' ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                        {order.status}
                      </span>
                      {order.status === 'confirmed' && (
                        <a href="/bazaar/delivery" style={{ color: 'var(--primary)', fontSize: 15, textDecoration: 'none', borderBottom: '1px solid rgba(255,122,0,0.2)' }}>
                          {t.requestDelivery}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const Field = ({ label, name, type = 'text', value, onChange, placeholder }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={labelStyle}>{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} style={inputStyle} />
  </div>
);

const SaveBtn = ({ saving, label = 'Save Changes' }) => (
  <button type="submit" disabled={saving} style={{ padding: '12px 28px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
    {saving ? 'Saving...' : label}
  </button>
);

const inputStyle = { width: '100%', padding: '11px 14px', background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, color: 'var(--text-main)', fontSize: 16 };
const labelStyle = { display: 'block', fontSize: 15, color: 'var(--text-muted)', marginBottom: 6 };
