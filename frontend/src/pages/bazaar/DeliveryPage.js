import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import API from '../../api';
import { useLang } from '../../LangContext';

const Reveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

const TibebPattern = () => (
  <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, opacity: 0.04, pointerEvents: 'none' }}>
    <pattern id="tibeb" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
      <path d="M60 0 L120 60 L60 120 L0 60 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="60" cy="60" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <path d="M0 0 L120 120 M120 0 L0 120" stroke="currentColor" strokeWidth="0.2" opacity="0.5" />
    </pattern>
    <rect width="100%" height="100%" fill="url(#tibeb)" />
  </svg>
);

export default function DeliveryPage() {
  const navigate = useNavigate();
  const { t } = useLang();

  const userToken = localStorage.getItem('userToken');
  useEffect(() => {
    if (!userToken) navigate('/login');
  }, [userToken, navigate]);

  const userId = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}').id; } catch { return null; }
  })();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ order_id: '', delivery_address: '', contact_phone: '', preferred_delivery_time: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!userId) return;
    API.get('/bazaar/orders', { params: { customer_id: userId } })
      .then(r => {
        const confirmed = (r.data || []).filter(o => o.status === 'confirmed');
        setOrders(confirmed);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.order_id) { setError(t.linkedOrder); return; }
    if (!form.delivery_address.trim()) { setError(t.deliveryAddress); return; }
    if (!form.contact_phone.trim()) { setError(t.contactPhone); return; }

    setSubmitting(true);
    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(apiBase + '/bazaar/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + userToken },
        body: JSON.stringify({
          order_id: form.order_id,
          delivery_address: form.delivery_address.trim(),
          contact_phone: form.contact_phone.trim(),
          preferred_delivery_time: form.preferred_delivery_time.trim() || null,
        }),
      });
      const data = await response.json();
      if (response.status === 201 || response.status === 200) {
        setSuccess(data.request_id || data.id);
      } else {
        setError(data.message || t.deliveryDuplicateError);
      }
    } catch {
      setError(t.deliveryDuplicateError);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="page" style={{ paddingTop: 100 }}>
        <div className="hero-gradient" style={{ height: '40vh' }} />
        <Reveal>
          <div className="creative-card delivery-done-card" style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center', padding: '48px 40px' }}>
            <div style={{ width: 80, height: 80, background: '#22c55e', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 24px' }}>✓</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>{t.dlReceivedTitle}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 32 }}>{t.dlRequestId} <strong>#{success}</strong></p>
            <Link to="/bazaar" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>{t.coBackToBazaar}</Link>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="page" style={{ paddingTop: 100 }}>
      <div className="hero-gradient" style={{ height: '30vh' }} />
      <TibebPattern />

      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Reveal>
          <Link to="/bazaar" style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>{t.dlBackToBazaar}</Link>
          <h1 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 900, marginBottom: 24 }}>{t.deliveryTitle}</h1>
        </Reveal>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--primary)', fontWeight: 700 }}>{t.loading}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Reveal delay={0.1}>
              <div className="creative-card" style={{ display: 'grid', gap: 24 }}>
                <div>
                  <label style={miniLabelStyle}>{t.linkedOrder}</label>
                  <select value={form.order_id} onChange={e => handleChange('order_id', e.target.value)} style={selectStyle}>
                    <option value="">— {t.linkedOrder} —</option>
                    {orders.map(order => (
                      <option key={order.id} value={order.id}>
                        {t.dlOrderNum}{order.id} — ETB {Number(order.total_amount).toLocaleString()}
                      </option>
                    ))}
                  </select>
                  {orders.length === 0 && <p style={{ color: '#ef4444', fontSize: 16, marginTop: 8, fontWeight: 600 }}>{t.noOrders}</p>}
                </div>

                <Field label={t.deliveryAddress} value={form.delivery_address} onChange={e => handleChange('delivery_address', e.target.value)} isTextArea />
                <Field label={t.contactPhone} value={form.contact_phone} onChange={e => handleChange('contact_phone', e.target.value)} />
                <Field label={t.preferredTime} value={form.preferred_delivery_time} onChange={e => handleChange('preferred_delivery_time', e.target.value)} />

                {error && <div style={errorStyle}>{error}</div>}

                <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '18px 0', fontSize: 16 }}>
                  {submitting ? t.submitting : t.requestDelivery}
                </button>
              </div>
            </Reveal>
          </form>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .delivery-done-card { padding: 32px 20px !important; }
        }
      `}</style>
    </div>
  );
}

const Field = ({ label, value, onChange, isTextArea }) => (
  <div>
    <label style={miniLabelStyle}>{label}</label>
    {isTextArea ? (
      <textarea value={value} onChange={onChange} style={inputStyle} rows={3} />
    ) : (
      <input type="text" value={value} onChange={onChange} style={inputStyle} />
    )}
  </div>
);

const miniLabelStyle = { display: 'block', fontSize: 17, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 };
const selectStyle = { width: '100%', padding: '14px 16px', background: 'var(--bg-subtle)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, color: 'var(--secondary)', fontSize: 16, fontWeight: 600, cursor: 'pointer', outline: 'none' };
const inputStyle = { width: '100%', padding: '14px 16px', background: 'var(--bg-subtle)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, color: 'var(--secondary)', fontSize: 16, fontWeight: 600, outline: 'none', boxSizing: 'border-box' };
const errorStyle = { background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '16px', borderRadius: 16, fontSize: 16, fontWeight: 600 };
