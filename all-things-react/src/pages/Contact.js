import React, { useState } from 'react';
import API from '../api';
import { useLang } from '../LangContext';
import { ETHIOPIAN_CITIES, CITY_TRANSLATIONS, BUSINESS_TYPE_GROUPS } from '../constants';
import { WHATSAPP_NUMBER } from '../components/socials';

export default function Contact() {
  const { t, lang } = useLang();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', business_type: '', company_name: '', tin_number: '', elmis_registration: '', business_license: '', location: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = e => {
    let { name, value } = e.target;
    if (name === 'phone') value = value.replace(/\D/g, '').slice(0, 9);
    if (['tin_number', 'elmis_registration', 'business_license'].includes(name))
      value = value.replace(/[^a-zA-Z0-9/\-]/g, '');
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.full_name.trim()) { alert(t.alertFullNameRequired); return; }
    if (!/^\d{9}$/.test(form.phone)) { alert(t.alertPhoneDigits); return; }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { alert(t.alertValidEmail); return; }
    setLoading(true);
    try { await API.post('/contact', { ...form, phone: '+251' + form.phone, lang }); setSubmitted(true); }
    catch { alert(t.alertSubmissionFailed); }
    finally { setLoading(false); }
  };

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 900, marginBottom: 8 }}>{t.contactTitle}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 36 }}>{t.contactSub}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, marginBottom: 36 }}>
        {[
          ['📧', t.labelEmail, 'allthingsethiopia2026@gmail.com', `mailto:allthingsethiopia2026@gmail.com`],
          ['📍', t.labelLocation, 'Addis Ababa, Ethiopia', 'https://maps.google.com/?q=Addis+Ababa,+Ethiopia'],
          ['📞', t.labelPhone, '+251 911 031 884', 'tel:+251911031884'],
          ['🕐', t.labelHours, 'Mon–Fri: 9AM–6PM', null],
          ['✈️', t.labelTelegram, '@Allthings2026', 'https://t.me/Allthings2026'],
          ['💬', t.labelWhatsApp, '+251 911 031 884', `https://wa.me/${WHATSAPP_NUMBER}`],
        ].map(([icon, label, val, href]) => {
          const Wrapper = href ? 'a' : 'div';
          const wrapperProps = href ? { href, target: '_blank', rel: 'noopener noreferrer' } : {};
          return (
            <Wrapper key={label} {...wrapperProps} style={{
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
              borderRadius: 16,
              padding: '20px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              textDecoration: 'none',
              cursor: href ? 'pointer' : 'default',
              transition: 'all 0.25s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 122, 0, 0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.04)'; }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: 'rgba(255, 122, 0, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>{icon}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{label}</div>
                <div style={{ color: 'var(--primary)', fontSize: 15, fontWeight: 700, wordBreak: 'break-all' }}>{val}</div>
              </div>
            </Wrapper>
          );
        })}
      </div>

      {submitted ? (
        <div style={{ background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 16, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: 'var(--text-main)' }}>{t.successTitle}</h3>
          <p style={{ color: 'var(--text-main)' }}>{t.successMsg}</p>
          <button onClick={() => setSubmitted(false)} style={{ marginTop: 20, background: 'white', border: '1px solid #d1d5db', color: 'var(--text-main)', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>
            {t.sendAnother}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 'clamp(20px, 4vw, 32px)' }}>
          <div className="grid-2">
            <Field label={t.fullName} name="full_name" value={form.full_name} onChange={set} required />
            <Field label={t.email} name="email" type="email" value={form.email} onChange={set} />
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>{t.phone}</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #d1d5db', borderRadius: 8, overflow: 'hidden' }}>
                <span style={{ padding: '10px 12px', color: '#f97316', fontWeight: 700, fontSize: 16, borderRight: '1px solid #d1d5db' }}>+251</span>
                <input type="tel" name="phone" value={form.phone} onChange={set} required maxLength={9} placeholder="9XX XXX XXX" style={{ flex: 1, padding: '10px 12px', background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: 16, outline: 'none' }} />
              </div>
            </div>
            <Field label={t.company} name="company_name" value={form.company_name} onChange={set} />
            <Field label={t.tin} name="tin_number" value={form.tin_number} onChange={set} />
            <Field label={t.elmis} name="elmis_registration" value={form.elmis_registration} onChange={set} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>{t.contactLocationCity}</label>
            <select name="location" value={form.location} onChange={set} style={inp}>
              <option value="">{t.selectCity}</option>
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
          <div style={{ background: '#ffedd5', border: '1px solid #fed7aa', borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 15, color: 'var(--text-main)' }}>
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

const inp = { width: '100%', padding: '10px 12px', background: '#f8fafc', border: '1px solid #d1d5db', borderRadius: 8, color: 'var(--text-main)', fontSize: 16 };
const lbl = { display: 'block', fontSize: 15, color: 'var(--text-main)', marginBottom: 6 };
