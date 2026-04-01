import React, { useEffect, useState } from 'react';
import API from '../api';

const ETHIOPIAN_CITIES = [
  'Addis Ababa','Dire Dawa','Gondar',"Mek'ele",'Adama / Nazret',
  'Bahir Dar','Dessie','Hawassa','Jimma','Bishoftu',
  'Harar','Sodo','Shashamene','Arba Minch','Adigrat','Debre Birhan',
];

export default function Analytics() {
  const [location, setLocation] = useState('');
  const [filterType, setFilterType] = useState('none'); // 'none' | 'date' | 'month' | 'year'
  const [dateVal, setDateVal] = useState('');
  const [monthVal, setMonthVal] = useState('');
  const [yearVal, setYearVal] = useState('');
  const [results, setResults] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

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
      setResults(data.clients);
      setCount(data.count);
    } catch { setResults([]); setCount(0); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [location, filterType, dateVal, monthVal, yearVal]);

  const clearDates = () => { setDateVal(''); setMonthVal(''); setYearVal(''); };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, marginBottom: 6 }}>Client Analytics</h1>
        <p style={{ color: '#a3a3a3' }}>Search and filter clients by city and date</p>
      </div>

      {/* Filters */}
      <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {/* Location */}
          <div>
            <label style={lbl}>📍 City / Location</label>
            <select value={location} onChange={e => setLocation(e.target.value)} style={inp}>
              <option value="">All Cities</option>
              {ETHIOPIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Date filter type */}
          <div>
            <label style={lbl}>📅 Filter by Date</label>
            <select value={filterType} onChange={e => { setFilterType(e.target.value); clearDates(); }} style={inp}>
              <option value="none">No date filter</option>
              <option value="date">Specific date</option>
              <option value="month">Month & Year</option>
              <option value="year">Year only</option>
            </select>
          </div>

          {/* Date value input */}
          {filterType === 'date' && (
            <div>
              <label style={lbl}>Select Date</label>
              <input type="date" value={dateVal} onChange={e => setDateVal(e.target.value)} style={inp} />
            </div>
          )}
          {filterType === 'month' && (
            <div>
              <label style={lbl}>Select Month</label>
              <input type="month" value={monthVal} onChange={e => setMonthVal(e.target.value)} style={inp} />
            </div>
          )}
          {filterType === 'year' && (
            <div>
              <label style={lbl}>Select Year</label>
              <input type="number" min="2020" max="2030" placeholder="e.g. 2025"
                value={yearVal} onChange={e => setYearVal(e.target.value)} style={inp} />
            </div>
          )}
        </div>
      </div>

      {/* Results count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#f9731620', border: '1px solid #f9731640', borderRadius: 10, padding: '10px 20px' }}>
          <span style={{ color: '#f97316', fontWeight: 700, fontSize: 24 }}>{count}</span>
          <span style={{ color: '#a3a3a3', fontSize: 14, marginLeft: 8 }}>client{count !== 1 ? 's' : ''} found</span>
        </div>
        {loading && <span style={{ color: '#a3a3a3', fontSize: 13 }}>Loading...</span>}
      </div>

      {/* Results table */}
      {count === 0 && !loading ? (
        <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: 40, textAlign: 'center', color: '#a3a3a3' }}>
          No clients match the selected filters.
        </div>
      ) : (
        <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr', padding: '12px 20px', background: '#111', borderBottom: '1px solid #262626' }}>
            {['Business Name', 'Category', 'Location', 'Registered'].map(h => (
              <span key={h} style={{ color: '#a3a3a3', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</span>
            ))}
          </div>
          {results.map((c, i) => (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr', padding: '14px 20px', borderBottom: i < results.length - 1 ? '1px solid #1a1a1a' : 'none', alignItems: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
              <div style={{ color: '#a3a3a3', fontSize: 13 }}>{c.category || '—'}</div>
              <div style={{ color: '#a3a3a3', fontSize: 13 }}>📍 {c.location || '—'}</div>
              <div style={{ color: '#666', fontSize: 12 }}>{new Date(c.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inp = { width: '100%', padding: '10px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 };
const lbl = { display: 'block', fontSize: 13, color: '#a3a3a3', marginBottom: 6 };
