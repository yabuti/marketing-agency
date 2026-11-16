import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { useLang } from '../LangContext';
import { CATEGORY_ICONS } from '../constants';

const catIcon = (name) => (CATEGORY_ICONS[String(name).toLowerCase()] || { icon: '📦' }).icon;

function groupBy(orders, keyFn) {
  const map = {};
  for (const order of orders) {
    const key = keyFn(order) || 'Other';
    if (!map[key]) map[key] = [];
    map[key].push(order);
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, orders]) => ({ key, orders }));
}

const STATUS_COLORS = {
  pending:   { bg: 'rgba(249,115,22,0.12)', color: '#f97316' },
  confirmed: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
  rejected:  { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
};

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const { t } = useLang();

  const buyerToken = localStorage.getItem('buyerToken');
  const buyer      = (() => { try { const v = localStorage.getItem('buyer'); return v && v !== 'undefined' ? JSON.parse(v) : null; } catch { return null; } })();

  useEffect(() => {
    if (!buyerToken || !buyer) navigate('/login');
  }, [buyerToken, buyer, navigate]);

  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [groupMode, setGroupMode] = useState('category');

  useEffect(() => {
    if (!buyerToken || !buyer) return;
    API.defaults.headers.common['Authorization'] = `Bearer ${buyerToken}`;
    API.get('/bazaar/orders', { params: { buyer_id: buyer.id } })
      .then(r => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError(t.bdLoadFailed))
      .finally(() => setLoading(false));
  }, [buyerToken, buyer?.id]);

  const logout = () => {
    localStorage.removeItem('buyerToken');
    localStorage.removeItem('buyer');
    navigate('/');
    window.location.reload();
  };

  const grouped = useMemo(() => {
    if (groupMode === 'seller') {
      return groupBy(orders, o => o.seller_name);
    }
    return groupBy(orders, o => {
      const firstItem = o.items?.[0];
      return firstItem?.product_category || 'Other';
    });
  }, [orders, groupMode]);

  if (!buyerToken || !buyer) return null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--primary)', padding: 0 }}>←</button>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--secondary)', marginBottom: 4 }}>
              {t.buyerDashboardTitle}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>
              {buyer.full_name} · {buyer.phone}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          style={{ padding: '9px 18px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}
        >
          {t.signOut}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', rowGap: 10, marginBottom: 28 }}>
        <button
          onClick={() => setGroupMode('category')}
          style={{ padding: '8px 18px', borderRadius: 8, border: 'none', fontSize: 16, cursor: 'pointer', background: groupMode === 'category' ? 'var(--primary)' : 'var(--bg-subtle)', color: groupMode === 'category' ? '#fff' : 'var(--text-muted)', fontWeight: groupMode === 'category' ? 700 : 400 }}
        >
          {t.groupedByCategory}
        </button>
        <button
          onClick={() => setGroupMode('seller')}
          style={{ padding: '8px 18px', borderRadius: 8, border: 'none', fontSize: 16, cursor: 'pointer', background: groupMode === 'seller' ? 'var(--primary)' : 'var(--bg-subtle)', color: groupMode === 'seller' ? '#fff' : 'var(--text-muted)', fontWeight: groupMode === 'seller' ? 700 : 400 }}
        >
          {t.groupedBySeller}
        </button>
      </div>

      {loading && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 60 }}>{t.loading}</p>
      )}

      {!loading && error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 20 }}>{t.noPurchases}</p>
          <Link to="/bazaar" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>
            {t.bazaarTitle} →
          </Link>
        </div>
      )}

      {!loading && !error && grouped.map(({ key, orders: groupOrders }) => (
        <div key={key} style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary)', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--card-border)' }}>
            {groupMode === 'seller' ? '🏪 ' : '📦 '}{key}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 16, marginLeft: 8 }}>
              {t.bdOrderCount(groupOrders.length)}
            </span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {groupOrders.map(order => (
              <OrderCard key={order.id} order={order} t={t} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function OrderCard({ order, t }) {
  const [expanded, setExpanded] = useState(false);
  const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.pending;

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14, overflow: 'hidden' }}>
      <div
        style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}
        role="button"
        aria-expanded={expanded}
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setExpanded(v => !v)}
      >
        <div>
          <span style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: 17 }}>{t.acctOrderNum(order.id)}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 16, marginLeft: 12 }}>
            {order.seller_name}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 17 }}>
            ETB {Number(order.total_amount).toLocaleString()}
          </span>
          <span style={{ fontSize: 16, padding: '3px 10px', borderRadius: 20, background: statusStyle.bg, color: statusStyle.color, fontWeight: 600 }}>
            {order.status}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--card-border)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--bg-subtle)', borderRadius: 8, padding: '8px 14px', fontSize: 16 }}>
              <span style={{ color: 'var(--text-muted)' }}>{t.bdPayment}{' '}</span>
              <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>{order.payment_method?.toUpperCase()}</span>
            </div>
            <div style={{ background: 'var(--bg-subtle)', borderRadius: 8, padding: '8px 14px', fontSize: 16 }}>
              <span style={{ color: 'var(--text-muted)' }}>{t.acctProof}{' '}</span>
              <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>
                {order.proof_type === 'screenshot' ? t.acctScreenshot : t.acctRef(order.proof_value)}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(order.items || []).map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: 'var(--bg-subtle)', borderRadius: 10, padding: '12px 14px' }}>
                {item.product_photo ? (
                  <img src={item.product_photo} alt={item.product_name}
                    style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 52, height: 52, background: 'var(--bg-main)', borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid var(--card-border)' }}>
                    {catIcon(item.product_category)}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: 17, marginBottom: 2 }}>{item.product_name}</div>
                  {item.product_description && (
                    <div style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.product_description}
                    </div>
                  )}
                  {item.product_category && (
                    <span style={{ fontSize: 16, padding: '2px 8px', borderRadius: 12, background: 'rgba(255,122,0,0.08)', color: 'var(--primary)', fontWeight: 600 }}>
                      {item.product_category}
                    </span>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: 16 }}>× {item.quantity}</div>
                  <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 17 }}>
                    ETB {(Number(item.unit_price) * item.quantity).toLocaleString()}
                  </div>
                  <div style={{ color: 'var(--text-light)', fontSize: 16 }}>
                    {t.bdUnitEach(Number(item.unit_price).toLocaleString())}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {order.status === 'confirmed' && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--card-border)' }}>
              <Link
                to="/bazaar/delivery"
                style={{ color: 'var(--primary)', fontSize: 17, fontWeight: 700, textDecoration: 'none', borderBottom: '1px solid rgba(255,122,0,0.25)', paddingBottom: 2 }}
              >
                {t.requestDelivery}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
