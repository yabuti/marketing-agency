import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { useLang } from '../LangContext';

const STATUS_COLORS = {
  pending:   { bg: 'rgba(249,115,22,0.12)', color: '#f97316' },
  confirmed: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
  rejected:  { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
};

export default function MyPurchases() {
  const navigate = useNavigate();
  const { t } = useLang();

  const userToken = localStorage.getItem('userToken');

  useEffect(() => {
    if (!userToken) navigate('/login');
  }, [userToken, navigate]);

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userToken) return;
    API.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    API.get('/users/me')
      .then(r => setProfile(r.data))
      .catch(() => navigate('/login'));
  }, [userToken, navigate]);

  useEffect(() => {
    if (!profile) return;
    API.get('/bazaar/orders', { params: { customer_id: profile.id } })
      .then(r => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError(t.purchLoadFailed))
      .finally(() => setLoading(false));
  }, [profile]);

  if (!profile) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>{t.loading}</div>;

  return (
    <div className="my-purchases" style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--primary)', padding: 0 }}>←</button>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--secondary)', margin: 0 }}>{t.myPurchasesTab}</h1>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>{t.loading}</p>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 20 }}>{t.noOrders}</p>
          <Link to="/bazaar" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>{t.bazaarTitle}</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {orders.map(order => {
            const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
            return (
              <div key={order.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14, padding: '18px 20px' }}>
                <div className="mp-order-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: 17 }}>{t.acctOrderNum(order.id)}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 16, marginLeft: 12 }}>{order.seller_name}</span>
                  </div>
                  <div className="mp-order-meta" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>ETB {Number(order.total_amount).toLocaleString()}</span>
                    <span style={{ fontSize: 16, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color, fontWeight: 600 }}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: order.status === 'confirmed' ? 12 : 0 }}>
                  {t.selectBank}: {order.payment_method?.toUpperCase()} ·{' '}
                  {t.acctProof}{' '}
                  {order.proof_type === 'screenshot' ? t.acctScreenshot : t.acctRef(order.proof_value)}
                </div>
                {order.status === 'confirmed' && (
                  <Link to="/bazaar/delivery" style={{ color: 'var(--primary)', fontSize: 17, fontWeight: 700, textDecoration: 'none', borderBottom: '1px solid rgba(255,122,0,0.25)', paddingBottom: 1 }}>
                    {t.requestDelivery}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .my-purchases { padding: 28px 16px !important; }
          .mp-order-row { flex-direction: column; align-items: flex-start !important; }
          .mp-order-meta { flex-wrap: wrap; }
        }
        @media (max-width: 400px) {
          .my-purchases { padding: 24px 12px !important; }
        }
      `}</style>
    </div>
  );
}
