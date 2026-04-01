import React, { useEffect, useState } from 'react';
import API from '../api';

const DEPARTMENTS = [
  'Executive Management',
  'Creative & Digital Marketing',
  'Technology & Platform Support',
  'Finance & Administration',
  'Customer & Sales',
];

const empty = { full_name: 'Abebe Kebede', position: '', department: DEPARTMENTS[0], responsibilities: '', sort_order: 0 };

export default function TeamAdmin() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => API.get('/team/all').then(r => setMembers(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setPhoto(null); setError(''); setShowForm(true); };
  const openEdit = (m) => { setEditing(m); setForm({ full_name: m.full_name, position: m.position, department: m.department, responsibilities: m.responsibilities || '', sort_order: m.sort_order }); setPhoto(null); setError(''); setShowForm(true); };

  const save = async () => {
    if (!form.position || !form.department) { setError('Position and department are required.'); return; }
    setSaving(true); setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (photo) fd.append('photo', photo);
    try {
      if (editing) await API.put(`/team/${editing.id}`, fd);
      else await API.post('/team', fd);
      setShowForm(false);
      load();
    } catch (err) { setError(err.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const del = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    await API.delete(`/team/${id}`);
    load();
  };

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26 }}>Team Members</h1>
          <p style={{ color: '#a3a3a3', marginTop: 4 }}>{members.length} members</p>
        </div>
        <button onClick={openNew} style={btnPrimary}>+ Add Member</button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{ background: '#171717', border: '1px solid #f9731640', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#f97316', marginBottom: 20 }}>{editing ? 'Edit Member' : 'New Member'}</h3>
          {error && <div style={errBox}>{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Full Name" value={form.full_name} onChange={v => setForm({ ...form, full_name: v })} />
            <Field label="Position *" value={form.position} onChange={v => setForm({ ...form, position: v })} />
            <div>
              <label style={lbl}>Department *</label>
              <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} style={inp}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <Field label="Sort Order" value={form.sort_order} type="number" onChange={v => setForm({ ...form, sort_order: v })} />
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={lbl}>Responsibilities</label>
            <textarea value={form.responsibilities} onChange={e => setForm({ ...form, responsibilities: e.target.value })} rows={3} style={{ ...inp, resize: 'vertical' }} />
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={lbl}>Photo</label>
            <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} style={{ color: '#a3a3a3', fontSize: 13 }} />
            {editing?.photo_url && !photo && <img src={editing.photo_url} alt="" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', marginTop: 8 }} />}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={save} disabled={saving} style={btnPrimary}>{saving ? 'Saving...' : 'Save'}</button>
            <button onClick={() => setShowForm(false)} style={btnSecondary}>Cancel</button>
          </div>
        </div>
      )}

      {/* Members list grouped by department */}
      {DEPARTMENTS.map(dept => {
        const deptMembers = members.filter(m => m.department === dept);
        if (!deptMembers.length) return null;
        return (
          <div key={dept} style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 15, color: '#f97316', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #262626' }}>{dept}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {deptMembers.map(m => (
                <div key={m.id} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', background: '#262626', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {m.photo_url ? <img src={m.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 22 }}>👤</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{m.full_name}</div>
                    <div style={{ color: '#f97316', fontSize: 13 }}>{m.position}</div>
                    {m.responsibilities && <div style={{ color: '#666', fontSize: 12, marginTop: 2 }}>{m.responsibilities.slice(0, 80)}{m.responsibilities.length > 80 ? '...' : ''}</div>}
                  </div>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: m.is_active ? '#22c55e20' : '#ef444420', color: m.is_active ? '#22c55e' : '#ef4444' }}>
                    {m.is_active ? 'Active' : 'Hidden'}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(m)} style={btnSecondary}>Edit</button>
                    <button onClick={() => del(m.id, m.full_name)} style={btnDanger}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const Field = ({ label, value, onChange, type = 'text' }) => (
  <div>
    <label style={lbl}>{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} style={inp} />
  </div>
);

const inp = { width: '100%', padding: '10px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 };
const lbl = { display: 'block', fontSize: 13, color: '#a3a3a3', marginBottom: 6 };
const btnPrimary = { background: '#f97316', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' };
const btnSecondary = { background: '#262626', color: '#fff', border: '1px solid #333', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' };
const btnDanger = { background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' };
const errBox = { background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 };
