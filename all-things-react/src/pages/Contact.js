import React, { useState } from 'react';
import API from '../api';
import { useLang } from '../LangContext';
import { ETHIOPIAN_CITIES, CITY_TRANSLATIONS, BUSINESS_TYPE_GROUPS } from '../constants';

export default function Contact() {
  const { t, lang } = useLang();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', business_type: '', company_name: '', tin_number: '', elmis_registration: '', business_license: '', location: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try { await API.post('/contact', form); setSubmitted(true); }
    catch { alert('Submission failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, marginBottom: 8 }}>{t.contactTitle}</h1>
      <p style={{ color: '#a3a3a3', marginBottom: 36 }}>{t.contactSub}</p>

      <div className="grid-2" style={{ marginBottom: 36 }}>
        {[
          ['📧', 'Email', 'allthingsethiopia2026@gmail.com'],
          ['📍', 'Location', 'Addis Ababa, Ethiopia'],
          ['🕐', 'Hours', 'Mon–Fri: 9AM–6PM'],
          ['✈️', 'Telegram', '@Allthings2026'],
        ].map(([icon, label, val]) => (
          <div key={label} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
              <div style={{ color: '#a3a3a3', fontSize: 13 }}>{val}</div>
            </div>
          </div>
        ))}
      </div>

      {submitted ? (
        <div style={{ background: '#22c55e15', border: '1px solid #22c55e40', borderRadius: 16, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{t.successTitle}</h3>
          <p style={{ color: '#a3a3a3' }}>{t.successMsg}</p>
          <button onClick={() => setSubmitted(false)} style={{ marginTop: 20, background: 'none', border: '1px solid #333', color: '#fff', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>
            {t.sendAnother}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ background: '#171717', border: '1px solid #262626', borderRadius: 20, padding: 'clamp(20px, 4vw, 32px)' }}>
          <div className="grid-2">
            <Field label={t.fullName} name="full_name" value={form.full_name} onChange={set} required />
            <Field label={t.email} name="email" type="email" value={form.email} onChange={set} />
            <Field label={t.phone} name="phone" value={form.phone} onChange={set} required />
            <Field label={t.company} name="company_name" value={form.company_name} onChange={set} />
            <Field label={t.tin} name="tin_number" value={form.tin_number} onChange={set} />
            <Field label={t.elmis} name="elmis_registration" value={form.elmis_registration} onChange={set} />
            <Field label={t.license} name="business_license" value={form.business_license} onChange={set} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Location (City)</label>
            <select name="location" value={form.location} onChange={set} style={inp}>
              <option value="">Select city...</option>
              {ETHIOPIAN_CITIES.map(c => (
                <option key={c} value={c}>{CITY_TRANSLATIONS[lang]?.[c] || c}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>{t.businessType}</label>
            <select name="business_type" value={form.business_type} onChange={set} style={inp}>
              <option value="">{t.selectType}</option>
              {BUSINESS_TYPE_GROUPS[lang]?.map((group, gi) => (
                <optgroup key={gi} label={group.group}>
                  {group.items.map((item, ii) => (
                    <option key={ii} value={BUSINESS_TYPE_GROUPS.en[gi]?.items[ii] || item}>{item}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>{t.message}</label>
            <textarea name="message" value={form.message} onChange={set} rows={4} style={{ ...inp, resize: 'vertical' }} />
          </div>
          <div style={{ background: '#f9731610', border: '1px solid #f9731630', borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 13, color: '#a3a3a3' }}>
            {t.licenseNote}
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, background: '#f97316', color: '#000', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 16 }}>
            {loading ? t.submitting : t.submit}
          </button>
        </form>
      )}
    </div>
  );
}

const Field = ({ label, name, type = 'text', value, onChange, required }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={lbl}>{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} required={required} style={inp} />
  </div>
);

const inp = { width: '100%', padding: '10px 12px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14 };
const lbl = { display: 'block', fontSize: 13, color: '#a3a3a3', marginBottom: 6 };
