import React, { useState } from 'react';
import API from '../api';
import { useLang } from '../LangContext';
import { BUSINESS_TYPE_GROUPS } from '../constants';
import { WHATSAPP_NUMBER } from '../components/socials';
import { useSiteSettings } from '../SiteSettingsContext';

export default function Contact() {
  const { t, lang } = useLang();
  const { contact, social } = useSiteSettings();
  const whatsappNumber = (social.whatsapp || WHATSAPP_NUMBER).replace(/[^0-9]/g, '');
  const phoneItems = (contact.phones || []).filter(Boolean);
  const firstPhone = phoneItems[0] || WHATSAPP_NUMBER;
  const secondPhone = phoneItems[1] || null;
  const clean = p => `tel:${p.replace(/[^0-9+]/g, '')}`;
  const info = [
    ['📧', t.labelEmail, contact.email, `mailto:${contact.email}`],
    ['📍', t.labelLocation, contact.address, `https://maps.google.com/?q=${encodeURIComponent(contact.address)}`],
    ['📞', t.labelPhone, firstPhone, clean(firstPhone)],
    ['📱', t.labelPhone, secondPhone, secondPhone ? clean(secondPhone) : null],
    ['🕐', t.labelHours, contact.hours, null],
    ['✈️', t.labelTelegram, contact.telegramHandle, social.telegram || null],
    ['💬', t.labelWhatsApp, `+${whatsappNumber}`, `https://wa.me/${whatsappNumber}`],
  ].filter(row => row[2]);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', business_type: '', company_name: '', tin_number: '', elmis_registration: '', message: '' });
  const [showCompany, setShowCompany] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = e => {
    let { name, value } = e.target;
    if (name === 'phone') value = value.replace(/\D/g, '').slice(0, 9);
    if (['tin_number', 'elmis_registration'].includes(name))
      value = value.replace(/[^a-zA-Z0-9/\-]/g, '');
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.full_name.trim()) { alert(t.alertFullNameRequired); return; }
    if (!/^\d{9}$/.test(form.phone)) { alert(t.alertPhoneDigits); return; }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { alert(t.alertValidEmail); return; }
    if (showCompany) {
      if (!form.company_name.trim()) { alert(t.alertCompanyRequired || 'Company name is required.'); return; }
      if (!form.tin_number.trim()) { alert(t.alertTinRequired || 'TIN number is required.'); return; }
      if (!form.elmis_registration.trim()) { alert(t.alertElmisRequired || 'E-LMIS registration is required.'); return; }
      if (!form.business_type) { alert(t.alertBusinessTypeRequired || 'Business type is required.'); return; }
    }
    setLoading(true);
    try { await API.post('/contact', { ...form, phone: '+251' + form.phone, lang }); setSubmitted(true); }
    catch { alert(t.alertSubmissionFailed); }
    finally { setLoading(false); }
  };

  return (
    <div className="page" style={{ maxWidth: 1100 }}>
      <style>{`
        .contact-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 32px; align-items: start; }
        .contact-form-wrap .grid-2 { gap: 16px; }
        @media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr; gap: 24px; } }
      `}</style>
      <h1 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 900, marginBottom: 8 }}>{t.contactTitle}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 36 }}>{t.contactSub}</p>

      <div className="contact-grid">
      <div className="contact-info" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        {info.map(([icon, label, val, href], i) => {
          const Wrapper = href ? 'a' : 'div';
          const wrapperProps = href ? { href, target: '_blank', rel: 'noopener noreferrer' } : {};
          return (
            <Wrapper key={i} {...wrapperProps} style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
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
              onMouseEnter={e => {               e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 122, 0, 0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.04)'; }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: 'rgba(255, 122, 0, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>{icon}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{label}</div>
                <div style={{ color: 'var(--primary)', fontSize: 17, fontWeight: 700, overflowWrap: 'break-word', wordBreak: 'normal', minWidth: 0 }}>{val}</div>
              </div>
            </Wrapper>
          );
        })}
      </div>

      <div className="contact-form-wrap">
      {submitted ? (
        <div style={{ background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 16, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: 'var(--text-main)' }}>{t.successTitle}</h3>
          <p style={{ color: 'var(--text-main)' }}>{t.successMsg}</p>
          <button onClick={() => setSubmitted(false)} style={{ marginTop: 20, background: 'var(--bg-main)',             border: '1px solid var(--card-border)', color: 'var(--text-main)', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>
            {t.sendAnother}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 20, padding: 'clamp(20px, 4vw, 32px)' }}>
          <div className="grid-2">
            <Field label={t.fullName} name="full_name" value={form.full_name} onChange={set} required />
            <Field label={t.email} name="email" type="email" value={form.email} onChange={set} />
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>{t.phone}</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 8, overflow: 'hidden' }}>
                <span style={{ padding: '10px 12px', color: '#f97316', fontWeight: 700, fontSize: 17, borderRight: '1px solid var(--card-border)', whiteSpace: 'nowrap', flexShrink: 0 }}>+251</span>
                <input type="tel" name="phone" value={form.phone} onChange={set} required maxLength={9} placeholder="9XX XXX XXX" style={{ flex: '1 1 0', minWidth: 0, width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: 16, outline: 'none' }} />
              </div>
            </div>
          </div>

          {/* Company toggle */}
          <div style={{ marginBottom: 16 }}>
            <button type="button" onClick={() => setShowCompany(!showCompany)} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '14px 16px', background: showCompany ? 'rgba(249,115,22,0.08)' : 'var(--bg-subtle)',
              border: `1.5px solid ${showCompany ? '#f97316' : 'var(--card-border)'}`,
              borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'all 0.25s',
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                background: showCompany ? '#f97316' : 'var(--bg-main)',
                border: showCompany ? '1.5px solid #f97316' : '1.5px solid var(--card-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16,
              }}>{showCompany ? '✓' : ''}</span>
              <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-main)' }}>🏢 {t.companyToggle || 'Send as a Company'}</span>
            </button>
          </div>

          {showCompany && (
            <div style={{ background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div className="grid-2">
                <Field label={t.company} name="company_name" value={form.company_name} onChange={set} required />
                <Field label={t.tin} name="tin_number" value={form.tin_number} onChange={set} required />
                <Field label={t.elmis} name="elmis_registration" value={form.elmis_registration} onChange={set} required />
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>{t.businessType}</label>
                  <select name="business_type" value={form.business_type} onChange={set} style={inp} required>
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
              </div>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>{t.message}</label>
            <textarea name="message" value={form.message} onChange={set} rows={4} style={{ ...inp, resize: 'vertical' }} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, background: '#f97316', color: '#000', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 17 }}>
            {loading ? t.submitting : t.submit}
          </button>
        </form>
      )}
      </div>
      </div>
    </div>
  );
}

const Field = ({ label, name, type = 'text', value, onChange, required }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={lbl}>{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} required={required} style={inp} />
  </div>
);

const inp = { width: '100%', padding: '10px 12px', background: 'var(--bg-subtle)', border: '1px solid #d1d5db', borderRadius: 8, color: 'var(--text-main)', fontSize: 16 };
const lbl = { display: 'block', fontSize: 16, color: 'var(--text-main)', marginBottom: 6 };
