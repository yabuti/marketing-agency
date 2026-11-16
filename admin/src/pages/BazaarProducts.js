import React, { useEffect, useState } from 'react';
import API from '../api';
import Pagination from '../components/Pagination';
import { useToast } from '../components/Toast';
import Alert from '../components/Alert';

const PER_PAGE = 10;

export default function BazaarProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ seller: '', category: '', status: '' });
  const [deletingId, setDeletingId] = useState(null);
  const [removalReason, setRemovalReason] = useState('');
  const [removalError, setRemovalError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [bazaarOpen, setBazaarOpen] = useState(false);
  const [openDate, setOpenDate] = useState('');
  const [toggling, setToggling] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [managedCategories, setManagedCategories] = useState([]);

  // Edit state
  const [editProduct, setEditProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [actionError, setActionError] = useState('');
  const [uploadFiles, setUploadFiles] = useState([]);

  // Create state
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    seller_id: '', name: '', description: '', price: '', discount_price: '',
    category: '', subcategory: '', stock_quantity: '', colors: '',
  });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const [createPhoto, setCreatePhoto] = useState(null);

  const toast = useToast();

  const openCreate = () => {
    setCreateForm({
      seller_id: sellerOptions[0]?.id || '', name: '', description: '', price: '',
      discount_price: '', category: categories[0] || '', subcategory: '',
      stock_quantity: '1', colors: '',
    });
    setCreateError('');
    setCreatePhoto(null);
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    setCreateError('');
    if (!createForm.seller_id) { setCreateError('Select a seller.'); return; }
    if (!createForm.name.trim()) { setCreateError('Product name is required.'); return; }
    if (!(parseFloat(createForm.price) > 0)) { setCreateError('Price must be greater than zero.'); return; }
    if (!createForm.category) { setCreateError('Category is required.'); return; }
    setCreating(true);
    try {
      const payload = {
        ...createForm,
        seller_id: Number(createForm.seller_id),
        stock_quantity: Number(createForm.stock_quantity) || 0,
        discount_price: createForm.discount_price === '' ? null : createForm.discount_price,
      };
      if (createPhoto) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
        fd.append('file', createPhoto);
        await API.post('/bazaar/products/admin', fd);
      } else {
        await API.post('/bazaar/products/admin', payload);
      }
      setCreateOpen(false);
      toast.success(`Product "${createForm.name}" created successfully.`);
      load();
    } catch (e) {
      const msg = e.response?.data?.message || 'Could not create product.';
      setCreateError(msg);
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const load = () => {
    setLoading(true);
    API.get('/bazaar/products/admin/all')
      .then((r) => setProducts(Array.isArray(r.data) ? r.data : []))
      .catch((err) => {
        setProducts([]);
        toast.error(err.response?.data?.message || 'Could not load products.');
      })
      .finally(() => setLoading(false));
  };

  const loadSettings = () => {
    API.get('/bazaar/settings')
      .then(r => { setBazaarOpen(r.data?.is_open === '1'); setOpenDate(r.data?.open_date || ''); setSettingsLoaded(true); })
      .catch(() => setSettingsLoaded(true));
  };

  const loadCategories = () => {
    API.get('/bazaar/categories')
      .then(r => { if (Array.isArray(r.data)) setManagedCategories(r.data.map(c => c.name)); })
      .catch(() => {});
  };

  useEffect(() => { load(); loadSettings(); loadCategories(); }, []);

  const toggleBazaar = async () => {
    setToggling(true);
    setActionError('');
    try {
      const newVal = bazaarOpen ? '0' : '1';
      await API.put('/bazaar/settings', { is_open: newVal, schedule_enabled: '0' });
      setBazaarOpen(!bazaarOpen);
      toast.info(`Bazaar is now ${newVal === '1' ? 'OPEN' : 'CLOSED'}.`);
    } catch (e) {
      const msg = e.response?.data?.message || 'Could not update bazaar status.';
      setActionError(msg);
      toast.error(msg);
    }
    setToggling(false);
  };

  const saveOpenDate = async (date) => {
    try {
      await API.put('/bazaar/settings', { open_date: date });
      setOpenDate(date);
      toast.success('Next opening date set.');
    } catch {
      toast.error('Failed to set opening date.');
    }
  };

  const runAction = async (fn, fallback, successMsg) => {
    setActionError('');
    try {
      await fn();
      if (successMsg) toast.success(successMsg);
    } catch (e) {
      const msg = e.response?.data?.message || fallback;
      setActionError(msg);
      toast.error(msg);
      return;
    }
    load();
  };

  const approve = (id, name) =>
    runAction(() => API.put(`/bazaar/products/admin/${id}/approve`), 'Could not approve product.', `"${name || 'Product'}" approved.`);

  const reject = (id, name) => {
    const reason = window.prompt('Reason for rejection:');
    if (!reason) return;
    return runAction(() => API.put(`/bazaar/products/admin/${id}/reject`, { reason }), 'Could not reject product.', `"${name || 'Product'}" rejected.`);
  };

  const toggleInBazaar = (p) => {
    const next = !(Number(p.in_bazaar ?? 1) === 1);
    return runAction(
      () => API.put(`/bazaar/products/admin/${p.id}/in-bazaar`, { in_bazaar: next }),
      'Could not update Bazaar listing.',
      `Product ${next ? 'included in' : 'hidden from'} bazaar.`
    );
  };

  const sellers = [...new Set(products.map((p) => p.seller_name).filter(Boolean))].sort();
  const sellerOptions = [];
  products.forEach((p) => {
    if (p.seller_id && !sellerOptions.some(o => o.id === p.seller_id)) {
      sellerOptions.push({ id: p.seller_id, name: p.seller_name || `Seller #${p.seller_id}` });
    }
  });
  sellerOptions.sort((a, b) => a.name.localeCompare(b.name));
  const derivedCategories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort();
  const categories = [...new Set([...managedCategories, ...derivedCategories])].sort();

  const filtered = products.filter((p) => {
    if (filters.seller && p.seller_name !== filters.seller) return false;
    if (filters.category && p.category !== filters.category) return false;
    if (filters.status && p.status !== filters.status) return false;
    return true;
  });

  const pendingCount = products.filter(p => p.status === 'pending').length;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const openDelete = (id) => { setDeletingId(id); setRemovalReason(''); setRemovalError(''); };
  const closeDelete = () => { setDeletingId(null); setRemovalReason(''); setRemovalError(''); };

  const confirmDelete = async () => {
    if (!removalReason.trim()) { setRemovalError('Removal reason is required.'); return; }
    setConfirming(true);
    try {
      await API.post(`/bazaar/products/admin/${deletingId}`, { _method: 'DELETE', removal_reason: removalReason.trim() });
      closeDelete();
      toast.success('Product removed.');
      load();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete product.';
      setRemovalError(msg);
      toast.error(msg);
    } finally { setConfirming(false); }
  };

  const statusBadge = (status) => {
    const map = {
      active:   { bg: '#22c55e20', color: '#22c55e' },
      pending:  { bg: '#f9731620', color: '#f97316' },
      inactive: { bg: '#26262620', color: '#a3a3a3' },
      removed:  { bg: '#ef444420', color: '#ef4444' },
    };
    const s = map[status] || { bg: '#26262620', color: '#a3a3a3' };
    return <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, fontWeight: 700, textTransform: 'capitalize' }}>{status}</span>;
  };

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  return (
    <div>
      {actionError && <Alert type="error" message={actionError} onClose={() => setActionError('')} />}

      {/* Header + Bazaar Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>🛍️ Bazaar Products</h1>
          <p style={{ color: '#a3a3a3', marginTop: 4 }}>{filtered.length} of {products.length} products listed</p>
          <button onClick={openCreate} disabled={sellerOptions.length === 0}
            title={sellerOptions.length === 0 ? 'No sellers found' : ''}
            style={{ marginTop: 12, padding: '9px 18px', background: '#f97316', color: '#000', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: sellerOptions.length === 0 ? 'not-allowed' : 'pointer', opacity: sellerOptions.length === 0 ? 0.5 : 1 }}>
            + Add Product
          </button>
        </div>

        {/* Bazaar Open/Close Toggle */}
        {settingsLoaded && (
          <div style={{ background: '#171717', border: `2px solid ${bazaarOpen ? '#22c55e40' : '#ef444440'}`, borderRadius: 14, padding: '16px 24px', textAlign: 'center', minWidth: 220 }}>
            <div style={{ fontSize: 12, color: '#a3a3a3', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase' }}>Live Bazaar Status</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: bazaarOpen ? '#22c55e' : '#ef4444', marginBottom: 12 }}>
              {bazaarOpen ? '🟢 OPEN' : '🔴 CLOSED'}
            </div>
            <button onClick={toggleBazaar} disabled={toggling}
              style={{ padding: '8px 18px', background: bazaarOpen ? '#ef444420' : '#22c55e20', color: bazaarOpen ? '#ef4444' : '#22c55e', border: `1px solid ${bazaarOpen ? '#ef444440' : '#22c55e40'}`, borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', marginBottom: 12 }}>
              {toggling ? 'Updating...' : bazaarOpen ? 'Close Bazaar' : 'Open Bazaar'}
            </button>
            <div style={{ borderTop: '1px solid #262626', paddingTop: 12 }}>
              <div style={{ fontSize: 11, color: '#a3a3a3', marginBottom: 6 }}>📅 Next Opening Date</div>
              <input
                type="datetime-local"
                value={openDate}
                onChange={e => saveOpenDate(e.target.value)}
                style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', padding: '6px 10px', fontSize: 12, width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Pending Banner */}
      {pendingCount > 0 && (
        <Alert
          type="warning"
          title={`${pendingCount} Pending Product${pendingCount > 1 ? 's' : ''}`}
          message="Merchants have submitted new products awaiting admin approval."
        />
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }} style={sel}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending Approval</option>
          <option value="inactive">Inactive</option>
          <option value="removed">Removed</option>
        </select>
        <select value={filters.category} onChange={e => { setFilters(f => ({ ...f, category: e.target.value })); setPage(1); }} style={sel}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.seller} onChange={e => { setFilters(f => ({ ...f, seller: e.target.value })); setPage(1); }} style={sel}>
          <option value="">All Sellers</option>
          {sellers.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(filters.status || filters.category || filters.seller) && (
          <button onClick={() => { setFilters({ seller: '', category: '', status: '' }); setPage(1); }}
            style={{ background: 'none', border: '1px solid #333', color: '#a3a3a3', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #262626' }}>
              {['Photo', 'Name', 'Seller', 'Category', 'Price (ETB)', 'Stock', 'Status', 'In Bazaar', 'Added', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: '#a3a3a3', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                <td style={{ padding: '10px 14px' }}>
                  {p.photos?.[0] ? (
                    <img src={p.photos[0].url} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, background: '#0a0a0a' }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 8, background: '#262626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🛍️</div>
                  )}
                </td>
                <td style={{ padding: '10px 14px', fontWeight: 600, color: '#fff', maxWidth: 180 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  {p.subcategory && <div style={{ fontSize: 11, color: '#666' }}>{p.subcategory}</div>}
                </td>
                <td style={{ padding: '10px 14px', color: '#a3a3a3', maxWidth: 130 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.seller_name || '—'}</div>
                </td>
                <td style={{ padding: '10px 14px', color: '#a3a3a3' }}>{p.category}</td>
                <td style={{ padding: '10px 14px', fontWeight: 600, color: '#fff' }}>
                  {p.discount_price ? (
                    <span>
                      <span style={{ color: '#22c55e' }}>{Number(p.discount_price).toLocaleString()}</span>
                      <span style={{ fontSize: 11, color: '#666', textDecoration: 'line-through', marginLeft: 6 }}>{Number(p.price).toLocaleString()}</span>
                    </span>
                  ) : (
                    Number(p.price).toLocaleString()
                  )}
                </td>
                <td style={{ padding: '10px 14px', color: p.stock_quantity === 0 ? '#ef4444' : '#a3a3a3' }}>
                  {p.stock_quantity ?? '—'}
                </td>
                <td style={{ padding: '10px 14px' }}>{statusBadge(p.status)}</td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => toggleInBazaar(p)}
                    style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      background: (p.in_bazaar ?? 1) ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: (p.in_bazaar ?? 1) ? '#22c55e' : '#ef4444',
                      border: `1px solid ${(p.in_bazaar ?? 1) ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}` }}>
                    {(p.in_bazaar ?? 1) ? '✓ Shown' : '✕ Hidden'}
                  </button>
                </td>
                <td style={{ padding: '10px 14px', color: '#666', fontSize: 12, whiteSpace: 'nowrap' }}>
                  {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                    {p.status === 'pending' && (
                      <>
                        <button onClick={() => approve(p.id, p.name)} style={{ background: '#22c55e20', color: '#22c55e', border: '1px solid #22c55e40', padding: '5px 10px', borderRadius: 7, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>Approve</button>
                        <button onClick={() => reject(p.id, p.name)} style={{ background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', padding: '5px 10px', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>Reject</button>
                      </>
                    )}
                    <button onClick={() => {
                      setEditProduct(p);
                      setEditForm({
                        name: p.name || '',
                        description: p.description || '',
                        price: p.price || '',
                        discount_price: p.discount_price || '',
                        category: p.category || '',
                        subcategory: p.subcategory || '',
                        stock_quantity: p.stock_quantity || '',
                        colors: p.colors || '',
                      });
                      setUploadFiles([]);
                      setEditError('');
                    }} style={{ background: '#8b5cf620', color: '#8b5cf6', border: '1px solid #8b5cf640', padding: '5px 12px', borderRadius: 7, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>✏️ Edit</button>
                    {p.status !== 'removed' && p.status !== 'pending' && (
                      <button onClick={() => openDelete(p.id)} style={{ background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', padding: '5px 12px', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>Remove</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} style={{ padding: 32, textAlign: 'center', color: '#a3a3a3' }}>No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />

      {/* Create Modal */}
      {createOpen && (
        <div onClick={() => setCreateOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'auto' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 20, width: '100%', maxWidth: 520, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>➕ Add Product</h2>
            {createError && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{createError}</p>}
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={labelStyle}>Seller</label>
                <select value={createForm.seller_id} onChange={e => setCreateForm(f => ({ ...f, seller_id: e.target.value }))} style={inputStyle}>
                  <option value="">Select seller...</option>
                  {sellerOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Name</label>
                <input value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Price (ETB)</label>
                  <input type="number" value={createForm.price} onChange={e => setCreateForm(f => ({ ...f, price: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Discount Price</label>
                  <input type="number" value={createForm.discount_price} onChange={e => setCreateForm(f => ({ ...f, discount_price: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select value={createForm.category} onChange={e => setCreateForm(f => ({ ...f, category: e.target.value, subcategory: '' }))} style={inputStyle}>
                    <option value="">Select category...</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Stock Quantity</label>
                  <input type="number" value={createForm.stock_quantity} onChange={e => setCreateForm(f => ({ ...f, stock_quantity: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Colors</label>
                <input value={createForm.colors} onChange={e => setCreateForm(f => ({ ...f, colors: e.target.value }))} style={inputStyle} placeholder="e.g. Red, Blue, Black" />
              </div>
              <div>
                <label style={labelStyle}>Photo (optional)</label>
                <input type="file" accept="image/*" onChange={e => setCreatePhoto(e.target.files[0] || null)} style={{ color: '#a3a3a3', fontSize: 13, width: '100%' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setCreateOpen(false)} style={{ background: '#262626', color: '#fff', border: '1px solid #333', padding: '9px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitCreate} disabled={creating}
                style={{ background: '#f97316', color: '#000', border: 'none', padding: '9px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 700, opacity: creating ? 0.5 : 1 }}>
                {creating ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editProduct !== null && (
        <div onClick={() => setEditProduct(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'auto' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 20, width: '100%', maxWidth: 520, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>✏️ Edit Product #{editProduct.id}</h2>
            {editError && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{editError}</p>}
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={labelStyle}>Name</label>
                <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Price (ETB)</label>
                  <input type="number" value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Discount Price</label>
                  <input type="number" value={editForm.discount_price} onChange={e => setEditForm(f => ({ ...f, discount_price: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value, subcategory: '' }))} style={inputStyle}>
                    <option value="">Select category...</option>
                    {[...new Set([...categories, editForm.category].filter(Boolean))].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Subcategory</label>
                  <input value={editForm.subcategory || ''} onChange={e => setEditForm(f => ({ ...f, subcategory: e.target.value }))} style={inputStyle} placeholder="e.g. Women's Clothing" />
                </div>
                <div>
                  <label style={labelStyle}>Stock</label>
                  <input type="number" value={editForm.stock_quantity} onChange={e => setEditForm(f => ({ ...f, stock_quantity: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Colors</label>
                <input value={editForm.colors} onChange={e => setEditForm(f => ({ ...f, colors: e.target.value }))} style={inputStyle} placeholder="e.g. Red, Blue, Black" />
              </div>
              {/* Photos */}
              <div>
                <label style={labelStyle}>Photos</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  {editProduct.photos?.map(ph => (
                    <div key={ph.id} style={{ position: 'relative', width: 64, height: 64, borderRadius: 8, overflow: 'hidden', background: '#0a0a0a', border: '1px solid #333' }}>
                      <img src={ph.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button onClick={async () => {
                        try {
                          await API.post(`/bazaar/products/admin/${editProduct.id}/photos/${ph.id}`, { _method: 'DELETE' });
                          const r = await API.get('/bazaar/products/admin/all');
                          const updated = r.data.find(p => p.id === editProduct.id);
                          if (updated) setEditProduct(updated);
                          toast.info('Photo removed.');
                        } catch (e) {
                          setEditError(e.response?.data?.message || 'Could not delete photo.');
                        }
                      }} style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(239,68,68,0.8)', border: 'none', color: '#fff', width: 18, height: 18, fontSize: 11, cursor: 'pointer', borderRadius: '0 0 0 4px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                  ))}
                </div>
                <input type="file" multiple accept="image/*" onChange={e => setUploadFiles([...e.target.files])} style={{ color: '#a3a3a3', fontSize: 13, width: '100%' }} />
                {uploadFiles.length > 0 && <p style={{ color: '#a3a3a3', fontSize: 12, marginTop: 4 }}>{uploadFiles.length} file(s) selected</p>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditProduct(null)} style={{ background: '#262626', color: '#fff', border: '1px solid #333', padding: '9px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={async () => {
                setSaving(true);
                setEditError('');
                try {
                  await API.put(`/bazaar/products/admin/${editProduct.id}`, editForm);
                  for (const file of uploadFiles) {
                    const fd = new FormData();
                    fd.append('file', file);
                    await API.post(`/bazaar/products/admin/${editProduct.id}/photos`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                  }
                  setEditProduct(null);
                  toast.success('Product updated successfully.');
                  load();
                } catch (err) {
                  const msg = err.response?.data?.message || 'Failed to save product.';
                  setEditError(msg);
                  toast.error(msg);
                }
                setSaving(false);
              }} disabled={saving}
                style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 700, opacity: saving ? 0.5 : 1 }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingId !== null && (
        <div onClick={closeDelete} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 20, width: '100%', maxWidth: 480, padding: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Remove Product</h2>
            <label style={{ display: 'block', fontSize: 13, color: '#d4d4d4', marginBottom: 6 }}>Removal Reason *</label>
            <textarea value={removalReason} onChange={e => { setRemovalReason(e.target.value); setRemovalError(''); }}
              placeholder="Enter reason..." rows={4}
              style={{ width: '100%', background: '#0a0a0a', border: `1px solid ${removalError ? '#ef4444' : '#333'}`, borderRadius: 8, color: '#fff', fontSize: 14, padding: '10px 12px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
            {removalError && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 6 }}>{removalError}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button onClick={closeDelete} style={{ background: '#262626', color: '#fff', border: '1px solid #333', padding: '9px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDelete} disabled={!removalReason.trim() || confirming}
                style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer', opacity: !removalReason.trim() || confirming ? 0.5 : 1, fontWeight: 700 }}>
                {confirming ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const sel = { background: '#171717', border: '1px solid #333', color: '#d4d4d4', padding: '8px 12px', borderRadius: 8, fontSize: 13, outline: 'none', cursor: 'pointer' };
const inputStyle = { width: '100%', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14, padding: '10px 12px', outline: 'none', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: 13, color: '#d4d4d4', marginBottom: 6, fontWeight: 600 };
