import React, { useEffect, useState } from 'react';
import API from '../api';
import { useToast } from '../components/Toast';

const ETHIOPIAN_CITIES = [
  'Addis Ababa','Dire Dawa','Gondar',"Mek'ele",'Adama / Nazret',
  'Bahir Dar','Dessie','Hawassa','Jimma','Bishoftu',
  'Harar','Sodo','Shashamene','Arba Minch','Adigrat','Debre Birhan',
];

function LoginStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    API.get('/users/login-stats')
      .then(r => setStats(r.data))
      .catch(() => {
        setStats(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ marginBottom: 36, padding: 24, background: '#141414', borderRadius: 16, border: '1px solid #262626', color: '#a3a3a3', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 16, height: 16, border: '2px solid #f97316', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        Loading login activity...
      </div>
    );
  }
  if (!stats) return null;

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🔐</span> Login & Security Activity
        </h2>
        <p style={{ color: '#737373', fontSize: 13, margin: '4px 0 0' }}>Overview of admin & user authentication events</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Logins', value: stats.total, color: '#f97316' },
          { label: 'Today', value: stats.today, color: '#22c55e' },
          { label: 'Last 7 Days', value: stats.thisWeek, color: '#3b82f6' },
          { label: 'Last 30 Days', value: stats.thisMonth, color: '#a855f7' },
          { label: 'Unique Users', value: stats.unique, color: '#06b6d4' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#141414', border: '1px solid #262626', borderRadius: 14, padding: '20px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 900, color, letterSpacing: '-0.03em' }}>{value ?? 0}</div>
            <div style={{ color: '#a3a3a3', fontSize: 12, fontWeight: 600, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Recent logins table */}
      {stats.recent?.length > 0 && (
        <div style={{ background: '#141414', border: '1px solid #262626', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #262626', fontWeight: 800, fontSize: 14, color: '#fff' }}>
            Recent Authenticated Sessions
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
              <thead>
                <tr style={{ background: '#0d0d0d', borderBottom: '1px solid #262626' }}>
                  {['User', 'Company / Org', 'IP Address', 'Timestamp'].map(h => (
                    <th key={h} style={{ padding: '12px 18px', color: '#a3a3a3', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((r, i) => (
                  <tr key={i} style={{ borderBottom: i < stats.recent.length - 1 ? '1px solid #1f1f1f' : 'none' }}>
                    <td style={{ padding: '12px 18px', fontWeight: 600, fontSize: 13, color: '#fff' }}>{r.full_name}</td>
                    <td style={{ padding: '12px 18px', color: '#a3a3a3', fontSize: 13 }}>{r.company_name || '—'}</td>
                    <td style={{ padding: '12px 18px', color: '#737373', fontSize: 12, fontFamily: 'monospace' }}>{r.ip_address || '—'}</td>
                    <td style={{ padding: '12px 18px', color: '#737373', fontSize: 12 }}>{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Analytics() {
  const [location, setLocation] = useState('');
  const [filterType, setFilterType] = useState('none'); // 'none' | 'date' | 'month' | 'year'
  const [dateVal, setDateVal] = useState('');
  const [monthVal, setMonthVal] = useState('');
  const [yearVal, setYearVal] = useState('');
  const [results, setResults] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetch = async () => {
    setLoading(true);
    const params = {};
    if (location) params.location = location;
    if (filterType === 'date' && dateVal) params.date = dateVal;
    if (filterType === 'month' && monthVal) {
      const [y, m] = monthVal.split('-');
      params.year = y; params.month = m;
    }
    if (filterType === 'year' && yearVal) params.year = yearVal;

    try {
      const { data } = await API.get('/clients/admin/analytics', { params });
      setResults(data.clients || []);
      setCount(data.count ?? 0);
    } catch {
      setResults([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [location, filterType, dateVal, monthVal, yearVal]);

  const clearDates = () => { setDateVal(''); setMonthVal(''); setYearVal(''); };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px 0', color: '#fff', letterSpacing: '-0.02em' }}>Analytics & Intelligence</h1>
        <p style={{ color: '#a3a3a3', fontSize: 14, margin: 0 }}>Review business distribution across regions and monitor user activity metrics</p>
      </div>

      <LoginStats />

      {/* Client segmentation section */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px 0', color: '#fff', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>📊</span> Regional & Temporal Client Breakdown
        </h2>
        <p style={{ color: '#737373', fontSize: 13, margin: 0 }}>Filter registered clients by geographical market or registration timeline</p>
      </div>

      {/* Filters card */}
      <div style={{ background: '#141414', border: '1px solid #262626', borderRadius: 16, padding: 22, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {/* Location */}
          <div>
            <label style={lbl}>📍 City / Location</label>
            <select value={location} onChange={e => setLocation(e.target.value)} style={inp}>
              <option value="">All Ethiopian Cities</option>
              {ETHIOPIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Date filter type */}
          <div>
            <label style={lbl}>📅 Time Frame</label>
            <select value={filterType} onChange={e => { setFilterType(e.target.value); clearDates(); }} style={inp}>
              <option value="none">All Time (No filter)</option>
              <option value="date">Specific Date</option>
              <option value="month">Month & Year</option>
              <option value="year">Specific Year</option>
            </select>
          </div>

          {/* Date value input */}
          {filterType === 'date' && (
            <div>
              <label style={lbl}>Select Exact Date</label>
              <input type="date" value={dateVal} onChange={e => setDateVal(e.target.value)} style={inp} />
            </div>
          )}
          {filterType === 'month' && (
            <div>
              <label style={lbl}>Select Month & Year</label>
              <input type="month" value={monthVal} onChange={e => setMonthVal(e.target.value)} style={inp} />
            </div>
          )}
          {filterType === 'year' && (
            <div>
              <label style={lbl}>Select Year</label>
              <input type="number" min="2020" max="2035" placeholder="e.g. 2025"
                value={yearVal} onChange={e => setYearVal(e.target.value)} style={inp} />
            </div>
          )}
        </div>
      </div>

      {/* Results count pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div style={{ background: '#f9731615', border: '1px solid #f9731630', borderRadius: 10, padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#f97316', fontWeight: 800, fontSize: 20 }}>{count}</span>
          <span style={{ color: '#a3a3a3', fontSize: 13, fontWeight: 600 }}>client{count !== 1 ? 's' : ''} matched</span>
        </div>
        {loading && <span style={{ color: '#737373', fontSize: 13 }}>Updating query...</span>}
      </div>

      {/* Results table */}
      {count === 0 && !loading ? (
        <div style={{ background: '#141414', border: '1px solid #262626', borderRadius: 14, padding: 48, textAlign: 'center', color: '#737373' }}>
          <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.5 }}>🔍</div>
          No clients match the specified filter criteria.
        </div>
      ) : (
        <div style={{ background: '#141414', border: '1px solid #262626', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
              <thead>
                <tr style={{ background: '#0d0d0d', borderBottom: '1px solid #262626' }}>
                  {['Business Name', 'Category', 'Location', 'Registered Date'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', color: '#a3a3a3', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < results.length - 1 ? '1px solid #1f1f1f' : 'none' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 700, fontSize: 14, color: '#fff' }}>{c.name}</td>
                    <td style={{ padding: '14px 20px', color: '#a3a3a3', fontSize: 13 }}>{c.category || '—'}</td>
                    <td style={{ padding: '14px 20px', color: '#a3a3a3', fontSize: 13 }}>📍 {c.location || '—'}</td>
                    <td style={{ padding: '14px 20px', color: '#737373', fontSize: 12 }}>{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const inp = { width: '100%', padding: '10px 14px', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none' };
const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: '#a3a3a3', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' };
