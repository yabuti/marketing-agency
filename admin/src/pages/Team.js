import React, { useEffect, useState } from 'react';
import API from '../api';
import useConfirm from '../components/ConfirmModal';
import { useToast } from '../components/Toast';
import Alert from '../components/Alert';

const DEPARTMENTS = [
  'Executive Management',
  'Creative & Digital Marketing',
  'Technology & Platform Support',
  'Finance & Administration',
  'Customer & Sales',
];

const empty = { full_name: '', position: '', department: DEPARTMENTS[0], responsibilities: '', sort_order: 0, is_active: 1 };

export default function TeamAdmin() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const confirm = useConfirm();
  const toast = useToast();

  const load = () => {
    API.get('/team/all')
      .then(r => setMembers(r.data))
      .catch(err => toast.error(err.response?.data?.message || 'Could not load team members.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setPhoto(null); setError(''); setShowForm(true); };
  const openEdit = (m) => {
    setEditing(m);
    setForm({
      full_name: m.full_name,
      position: m.position,
      department: m.department,
      responsibilities: m.responsibilities || '',
      sort_order: m.sort_order,
      is_active: Number(m.is_active) ? 1 : 0
    });
    setPhoto(null);
    setError('');
    setShowForm(true);
  };

  const toggleActive = async (m) => {
    const next = Number(m.is_active) ? 0 : 1;
    try {
      const fd = new FormData();
      fd.append('_method', 'PUT');
      fd.append('is_active', next);
      await API.post(`/team/${m.id}`, fd);
      toast.info(`Team member is now ${next ? 'visible' : 'hidden'}.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update visibility.');
    }
  };

  const save = async () => {
    if (!form.full_name || !form.position || !form.department) {
      setError('Full name, position and department are required.');
      toast.warning('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (photo) fd.append('photo', photo);
    try {
      if (editing) {
        fd.append('_method', 'PUT');
        await API.post(`/team/${editing.id}`, fd);
        toast.success(`Updated "${form.full_name}".`);
      } else {
        await API.post('/team', fd);
        toast.success(`Added "${form.full_name}".`);
      }
      setShowForm(false);
      load();
    } catch (err) {
      const msg = err.response?.data?.message || 'Save failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const del = async (id, name) => {
    if (!(await confirm.ask(`Delete team member "${name}"?`, { okLabel: 'Delete Member' }))) return;
    try {
      await API.post(`/team/${id}`, { _method: 'DELETE' });
      toast.success(`"${name}" removed from team.`);
      load();
    } catch (err) {
      toast.error('Failed to delete member.');
    }
  };

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>👥 Team Members</h1>
          <p style={{ color: '#a3a3a3', marginTop: 4 }}>{members.length} team members displayed on the About & Team pages</p>
        </div>
        <button onClick={openNew} style={btnPrimary}>+ Add Member</button>
      </div>

      {showForm && (
        <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: 24, marginBottom: 28, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ color: '#f97316', fontSize: 18, fontWeight: 700 }}>{editing ? 'Edit Member' : 'New Member'}</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#a3a3a3', fontSize: 16, cursor: 'pointer' }}>✕</button>
          </div>
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Full Name *" value={form.full_name} onChange={v => setForm({ ...form, full_name: v })} />
            <Field label="Position / Title *" value={form.position} onChange={v => setForm({ ...form, position: v })} />
            <div>
              <label style={lbl}>Department *</label>
              <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} style={inp}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Photo</label>
              <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} style={{ color: '#a3a3a3', fontSize: 13, marginTop: 6 }} />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={lbl}>Bio / Responsibilities</label>
            <textarea value={form.responsibilities} onChange={e => setForm({ ...form, responsibilities: e.target.value })} rows={3} style={{ ...inp, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowForm(false)} style={btnSecondary}>Cancel</button>
            <button onClick={save} disabled={saving} style={btnPrimary}>
              {saving ? 'Saving...' : editing ? 'Update Member' : 'Add Member'}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
        {members.map(m => (
          <div key={m.id} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
              {m.photo_url ? (
                <img src={m.photo_url} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#262626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  👤
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{m.full_name}</div>
                <div style={{ color: '#f97316', fontSize: 13, marginTop: 2 }}>{m.position}</div>
                <div style={{ color: '#666', fontSize: 12 }}>{m.department}</div>
              </div>
            </div>

            {m.responsibilities && (
              <p style={{ color: '#a3a3a3', fontSize: 12, lineHeight: 1.5, marginBottom: 14, flex: 1 }}>
                {m.responsibilities}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #222' }}>
              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: Number(m.is_active) ? '#22c55e20' : '#ef444420', color: Number(m.is_active) ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                {Number(m.is_active) ? 'Active' : 'Hidden'}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => toggleActive(m)} style={btnSecondary}>{Number(m.is_active) ? 'Hide' : 'Show'}</button>
                <button onClick={() => openEdit(m)} style={btnSecondary}>Edit</button>
                <button onClick={() => del(m.id, m.full_name)} style={btnDanger}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {members.length === 0 && <p style={{ color: '#a3a3a3' }}>No team members listed yet.</p>}
      </div>

      {confirm.modal}
    </div>
  );
}

const Field = ({ label, value, onChange }) => (
  <div>
    <label style={lbl}>{label}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} style={inp} />
  </div>
);

const lbl = { display: 'block', fontSize: 12, color: '#a3a3a3', marginBottom: 4, fontWeight: 600 };
const inp = { width: '100%', padding: '10px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 13, boxSizing: 'border-box' };
const btnPrimary = { background: '#f97316', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' };
const btnSecondary = { background: '#262626', color: '#fff', border: '1px solid #333', padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600 };
const btnDanger = { background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600 };
