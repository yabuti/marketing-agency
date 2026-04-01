import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useLang } from '../LangContext';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

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

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await API.put('/users/me', form);
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

  if (!profile) return <div style={{ textAlign: 'center', padding: 80, color: '#a3a3a3' }}>{t.loading}</div>;

  const statusColor = { pending: '#f97316', active: '#22c55e', suspended: '#ef4444' };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900 }}>{t.myDashboardTitle}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <span style={{ color: '#a3a3a3', fontSize: 14 }}>{profile.company_name || profile.full_name}</span>
            <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20,
              background: `${statusColor[profile.status]}20`, color: statusColor[profile.status], fontWeight: 600 }}>
              {profile.status}
            </span>
          </div>
        </div>
        <button onClick={logout} style={{ padding: '9px 18px', background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
          {t.signOut}
        </button>
      </div>

      {profile.status === 'pending' && (
        <div style={{ background: '#f9731615', border: '1px solid #f9731640', borderRadius: 12, padding: 16, marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 24 }}>⏳</span>
          <div>
            <div style={{ color: '#f97316', fontWeight: 600 }}>{t.underReview}</div>
            <div style={{ color: '#a3a3a3', fontSize: 13, marginTop: 2 }}>{t.underReviewMsg}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#111', borderRadius: 10, padding: 4 }}>
        {[['profile', t.profileTab], ['business', t.businessTab], ['social', t.socialTab], ['password', t.passwordTab]].map(([key, label]) => (
          <button key={key} onClick={() => { setTab(key); setSuccess(''); setError(''); }}
            style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: 'none', fontSize: 13, cursor: 'pointer',
              background: tab === key ? '#f97316' : 'transparent', color: tab === key ? '#000' : '#a3a3a3', fontWeight: tab === key ? 700 : 400 }}>
            {label}
          </button>
        ))}
      </div>

      {(success || error) && (
        <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14,
          background: success ? '#22c55e20' : '#ef444420', border: `1px solid ${success ? '#22c55e40' : '#ef444440'}`,
          color: success ? '#22c55e' : '#ef4444' }}>
          {success || error}
        </div>
      )}

      <div style={{ background: '#171717', border: '1px solid #262626', borderRadius: 16, padding: 28 }}>
        {tab === 'profile' && (
          <form onSubmit={saveProfile}>
            <h3 style={{ color: '#f97316', fontSize: 15, marginBottom: 20 }}>Personal Information</h3>
            <Field label={t.fullNameLabel} name="full_name" value={form.full_name || ''} onChange={set} />
            <Field label={t.emailLabel} name="email" type="email" value={form.email || ''} onChange={set} />
            <Field label={t.phoneLabel2} name="phone" value={form.phone || ''} onChange={set} />
            <SaveBtn saving={saving} label={saving ? t.saving : t.saveChanges} />
          </form>
        )}

        {tab === 'business' && (
          <form onSubmit={saveProfile}>
            <h3 style={{ color: '#f97316', fontSize: 15, marginBottom: 20 }}>Business Information</h3>
            <Field label={t.companyNameLabel} name="company_name" value={form.company_name || ''} onChange={set} />
            <Field label={t.businessTypeLabel2} name="business_type" value={form.business_type || ''} onChange={set} />
            <Field label={t.locationLabel} name="location" value={form.location || ''} onChange={set} />
            <Field label={t.websiteLabel} name="website" value={form.website || ''} onChange={set} />
            <Field label={t.tinLabel} name="tin_number" value={form.tin_number || ''} onChange={set} />
            <Field label={t.elmisLabel} name="elmis_registration" value={form.elmis_registration || ''} onChange={set} />
            <Field label={t.businessLicenseLabel} name="business_license_number" value={form.business_license_number || ''} onChange={set} />
            <Field label="Year Established" name="established" value={form.established || ''} onChange={set} />
            <Field label="Number of Employees" name="employees" value={form.employees || ''} onChange={set} />
            <SaveBtn saving={saving} label={saving ? t.saving : t.saveChanges} />
          </form>
        )}

        {tab === 'social' && (
          <form onSubmit={saveProfile}>
            <h3 style={{ color: '#f97316', fontSize: 15, marginBottom: 20 }}>Social Media & Extra Details</h3>
            <Field label="📸 Instagram Handle" name="instagram" value={form.instagram || ''} onChange={set} placeholder="@yourbusiness" />
            <Field label="🎵 TikTok Handle" name="tiktok" value={form.tiktok || ''} onChange={set} placeholder="@yourbusiness" />
            <Field label="✈️ Telegram" name="telegram" value={form.telegram || ''} onChange={set} placeholder="@yourbusiness" />
            <Field label="📘 Facebook Page" name="facebook" value={form.facebook || ''} onChange={set} />
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Services Needed</label>
              <textarea name="services_needed" value={form.services_needed || ''} onChange={set} rows={3}
                style={{ ...inputStyle, resize: 'vertical' }} placeholder="e.g. Social media management, content creation..." />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>About Your Business</label>
              <textarea name="bio" value={form.bio || ''} onChange={set} rows={4}
                style={{ ...inputStyle, resize: 'vertical' }} placeholder="Tell us about your business..." />
            </div>
            <SaveBtn saving={saving} label={saving ? t.saving : t.saveChanges} />
          </form>
        )}

        {tab === 'password' && (
          <form onSubmit={changePassword}>
            <h3 style={{ color: '#f97316', fontSize: 15, marginBottom: 20 }}>Change Password</h3>
            <Field label={t.currentPassword} name="currentPassword" type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
            <Field label={t.newPassword} name="newPassword" type="password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder={t.minPassword} />
            <Field label={t.confirmNewPassword} name="confirm" type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
            <SaveBtn saving={saving} label={saving ? t.saving : t.changePassword} />
          </form>
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
  <button type="submit" disabled={saving} style={{ padding: '12px 28px', background: '#f97316', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
    {saving ? 'Saving...' : label}
  </button>
);

const inputStyle = { width: '100%', padding: '11px 14px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 };
const labelStyle = { display: 'block', fontSize: 13, color: '#a3a3a3', marginBottom: 6 };
