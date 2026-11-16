import React, { useEffect, useState } from 'react';
import API from '../api';
import { useToast } from '../components/Toast';
import Alert from '../components/Alert';

const input = {
  width: '100%', padding: '10px 12px', background: '#171717', border: '1px solid #333',
  color: '#d4d4d4', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
};
const label = { display: 'block', fontSize: 12, color: '#a3a3a3', marginBottom: 6, fontWeight: 600 };
const card = { background: '#111', border: '1px solid #262626', borderRadius: 14, padding: 20, marginBottom: 0 };
const field = { marginBottom: 14 };

const LANG_CODES = [
  { code: 'en', label: 'English' },
  { code: 'am', label: 'አማርኛ' },
  { code: 'or', label: 'Afaan Oromoo' },
];

const TABS = [
  { id: 'contact', label: '📧 Contact & Social' },
  { id: 'home', label: '📊 Home' },
  { id: 'about', label: '🏆 About' },
  { id: 'footer', label: '🔗 Footer' },
  { id: 'content', label: '✏️ Content' },
];

const CONTENT_SECTIONS = [
  {
    title: 'Home — Hero',
    fields: [
      ['mpHeroTitle', 'Hero Title', 'Marketplace for'],
      ['mpHeroTitleHighlight', 'Hero Highlight', 'Verified Businesses'],
      ['mpHeroDesc', 'Hero Description', 'Discover trusted Ethiopian businesses, shop quality products, and grow your brand on Africa’s rising digital marketplace.'],
      ['mpStartShopping', 'Start Shopping Button', 'Start Shopping'],
      ['mpRegisterBusiness', 'Register Button', 'Register Your Business'],
    ],
  },
  {
    title: 'About — Hero & Story',
    fields: [
      ['aboutTag', 'Tag', 'About Us'],
      ['aboutHeroTitle1', 'Hero Title 1', "Empowering Ethiopia's"],
      ['aboutHeroTitle2', 'Hero Title 2', 'Digital Future'],
      ['aboutSub', 'Hero Sub', 'We are'],
      ['aboutCatalyst', 'Catalyst Text', 'We are the catalyst for Ethiopian MSMEs growth in the modern digital marketplace.'],
      ['whoWeAre', 'Who We Are Heading', 'Who We Are'],
      ['whoWeAreText', 'Who We Are Text', 'We are a digital marketing and e-commerce support platform helping Ethiopian MSMEs grow online.'],
      ['vision', 'Vision Heading', 'Vision'],
      ['visionText', 'Vision Text', 'To become Ethiopia’s leading digital marketing company empowering MSMEs.'],
      ['mission', 'Mission Heading', 'Mission'],
      ['missionText', 'Mission Text', 'To deliver innovative, affordable and measurable marketing solutions.'],
      ['ourCoreValues', 'Core Values Heading', 'Our Core'],
      ['ourCoreValuesHighlight', 'Core Values Highlight', 'Values'],
    ],
  },
  {
    title: 'About — Services',
    fields: [
      ['svcSocialMedia', 'Service 1 Title', 'Social Media Management'],
      ['svcSocialMediaDesc', 'Service 1 Description', 'Complete management of your social media accounts.'],
      ['svcContentCreation', 'Service 2 Title', 'Content Creation'],
      ['svcContentDesc', 'Service 2 Description', 'Professional photos, videos, and graphics.'],
      ['svcGrowthStrategy', 'Service 3 Title', 'Growth Strategy'],
      ['svcGrowthDesc', 'Service 3 Description', 'Data-driven strategies to accelerate growth.'],
      ['svcPaidAds', 'Service 4 Title', 'Paid Advertising'],
      ['svcAdsDesc', 'Service 4 Description', 'Targeted advertising campaigns across platforms.'],
      ['svcBranding', 'Service 5 Title', 'Branding & Logo Design'],
      ['svcBrandingDesc', 'Service 5 Description', 'Brand identity and visual storytelling.'],
      ['svcOutdoor', 'Service 6 Title', 'Outdoor Advertising'],
      ['svcOutdoorDesc', 'Service 6 Description', 'Billboards, banners, and offline visibility.'],
      ['svcEcommerce', 'Service 7 Title', 'E-Commerce Setup'],
      ['svcEcomDesc', 'Service 7 Description', 'Online store setup and marketplace integration.'],
      ['svcConsultation', 'Service 8 Title', 'Business Consultation'],
      ['svcConsultDesc', 'Service 8 Description', 'Expert guidance and strategic advice.'],
    ],
  },
  {
    title: 'FAQ — Questions & Answers',
    fields: [
      ['faq1q', 'FAQ 1 — Question', 'What is All Things?'],
      ['faq1a', 'FAQ 1 — Answer', ''],
      ['faq2q', 'FAQ 2 — Question', 'How do I register as a seller?'],
      ['faq2a', 'FAQ 2 — Answer', ''],
      ['faq3q', 'FAQ 3 — Question', 'How do I buy from the Bazaar?'],
      ['faq3a', 'FAQ 3 — Answer', ''],
      ['faq4q', 'FAQ 4 — Question', 'What payment methods are accepted?'],
      ['faq4a', 'FAQ 4 — Answer', ''],
      ['faq5q', 'FAQ 5 — Question', 'How does delivery work?'],
      ['faq5a', 'FAQ 5 — Answer', ''],
      ['faq6q', 'FAQ 6 — Question', 'Is there a return policy?'],
      ['faq6a', 'FAQ 6 — Answer', ''],
      ['faq7q', 'FAQ 7 — Question', 'How do I become a client/customer?'],
      ['faq7a', 'FAQ 7 — Answer', ''],
      ['faq8q', 'FAQ 8 — Question', 'What services does All Things offer?'],
      ['faq8a', 'FAQ 8 — Answer', ''],
    ],
  },
  {
    title: 'Chat Bot',
    fields: [
      ['chatGreeting', 'Greeting', "👋 Hello! I'm the All Things assistant."],
      ['chatTitle', 'Window Title', 'All Things Support'],
      ['chatSubtitle', 'Window Subtitle', 'We reply instantly'],
    ],
  },
  {
    title: 'Newsletter & Footer Headings',
    fields: [
      ['mpNewsletterTitle', 'Newsletter Title', 'Stay Updated'],
      ['mpNewsletterDesc', 'Newsletter Description', 'Subscribe to get the latest deals and news.'],
      ['mpNewsletterPlaceholder', 'Newsletter Placeholder', 'Enter your email'],
      ['mpNewsletterBtn', 'Newsletter Button', 'Subscribe'],
      ['mpNewsletterSuccess', 'Newsletter Success', '✅ Thank you for subscribing!'],
      ['mpFooterQuickLinks', 'Footer — Quick Links Heading', 'Quick Links'],
      ['legalTitle', 'Footer — Legal Heading', 'Legal / Policies'],
    ],
  },
  {
    title: 'Market — Category Grid Hero',
    fields: [
      ['mpCatGridTitle', 'Section Title', 'Shop by Category'],
      ['mpCatGridViewAll', 'View All Link', 'View All'],
      ['mpCatGridH1', 'Card 1 Heading', ''],
      ['mpCatGridH2', 'Card 2 Heading', ''],
      ['mpCatGridH3', 'Card 3 Heading', ''],
      ['mpCatGridH4', 'Card 4 Heading', ''],
    ],
  },
];

const emptyContent = () => ({ en: {}, am: {}, or: {} });

const SITE_DEFAULTS = {
  contact: {
    email: 'allthingsethiopia2026@gmail.com',
    phones: ['+251 905 841 982', '+251 967 033 544', '+251 911 031 884'],
    address: 'Addis Ababa, Ethiopia',
    hours: 'Mon–Fri: 9AM–6PM',
    telegramHandle: '@Allthings2026',
  },
  social: {
    whatsapp: '251911031884',
    facebook: 'https://web.facebook.com/profile.php?id=61586399832267',
    instagram: 'https://www.instagram.com/allthings.ethiopia/',
    tiktok: 'https://www.tiktok.com/@kingarsenal26',
    youtube: 'https://www.youtube.com/@ALLTHINGS-2026',
    telegram: 'https://t.me/Allthings2026',
    messenger: 'https://m.me/61586399832267',
  },
  home: {
    satisfaction: '98', businessFallback: '5', productFallback: '50', cityFallback: '5',
    testimonials: [
      { quote: 'All Things doubled our reach in just a few months. Their team truly cares about our growth.', name: 'Selam T.', role: 'Selam Fashion' },
      { quote: 'A game-changer for our coffee business — real customers from every region of Ethiopia.', name: 'Dawit M.', role: 'Dawit Coffee' },
      { quote: 'Professional, transparent, and results-driven. Our sales have never been better.', name: 'Hanna G.', role: 'Hanna Cosmetics' },
      { quote: 'From a local shop to an online brand — the marketplace made it happen for us.', name: 'Yonas K.', role: 'Yonas Electronics' },
    ],
  },
  about: {
    stats: [
      { num: '5000+', label: 'Businesses Empowered' },
      { num: '98%', label: 'Client Satisfaction' },
      { num: '10+', label: 'Years of Experience' },
      { num: '20+', label: 'Markets Reached' },
    ],
  },
  footer: {
    quickLinks: [
      ['/website', 'Home'], ['/market', 'Market'], ['/bazaar', 'Bazaar'], ['/blog', 'Blogs/News'],
      ['/about', 'About'], ['/team', 'Team'], ['/faq', 'FAQ'], ['/contact', 'Contact'], ['/all-clients', 'Customers'],
    ].map(([to, labelText]) => ({ to, label: labelText })),
    legalLinks: [
      ['/terms', 'Terms & Conditions'], ['/privacy-policy', 'Privacy Policy'], ['/billing-policy', 'Billing Policy'],
      ['/cookie-policy', 'Cookie Policy'], ['/copyright-infringement', 'Copyright Policy'],
    ].map(([to, labelText]) => ({ to, label: labelText })),
    copyright: '© 2026 AllThings. All rights reserved.',
  },
  content: emptyContent(),
};

const emptyForm = () => JSON.parse(JSON.stringify(SITE_DEFAULTS));

const cleanContent = (obj) => {
  const out = {};
  Object.keys(obj).forEach(k => {
    const v = typeof obj[k] === 'string' ? obj[k].trim() : obj[k];
    if (v !== '') out[k] = v;
  });
  return out;
};

const FormCtx = React.createContext(null);

function F({ path, ph, labelText }) {
  const { form, setPath } = React.useContext(FormCtx);
  const parts = path.split('.');
  let cur = form;
  for (const p of parts) cur = cur ? cur[p] : undefined;
  return (
    <div style={field}>
      <label style={label}>{labelText}</label>
      <input style={input} value={cur ?? ''} placeholder={ph} onChange={e => setPath(path, e.target.value)} />
    </div>
  );
}

export default function SiteSettings() {
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannerAlert, setBannerAlert] = useState(null); // { type, message }
  const [tab, setTab] = useState('contact');
  const [lang, setLang] = useState('en');
  const toast = useToast();

  useEffect(() => {
    API.get('/settings')
      .then(r => {
        const s = r.data?.settings;
        if (!s || typeof s !== 'object' || Array.isArray(s) || !Object.keys(s).length) {
          setBannerAlert({
            type: 'warning',
            message: 'No saved settings found in database yet. Form prefilled with live defaults.',
          });
          setForm(emptyForm());
          return;
        }
        const merged = emptyForm();
        const contact = { ...merged.contact, ...(s.contact || {}) };
        contact.phones = (s.contact?.phones?.length ? s.contact.phones : merged.contact.phones);
        for (let i = 0; i < 3; i++) contact.phones[i] = contact.phones[i] || '';
        const home = { ...merged.home, ...(s.home || {}) };
        if (Array.isArray(s.home?.testimonials) && s.home.testimonials.length) home.testimonials = s.home.testimonials;
        const about = { ...merged.about, ...(s.about || {}) };
        if (Array.isArray(s.about?.stats) && s.about.stats.length) about.stats = s.about.stats;
        const footer = { ...merged.footer, ...(s.footer || {}) };
        if (Array.isArray(s.footer?.quickLinks) && s.footer.quickLinks.length) footer.quickLinks = s.footer.quickLinks;
        if (Array.isArray(s.footer?.legalLinks) && s.footer.legalLinks.length) footer.legalLinks = s.footer.legalLinks;
        const content = emptyContent();
        LANG_CODES.forEach(({ code }) => { content[code] = { ...(s.content?.[code] || {}) }; });
        setForm({ contact, social: { ...merged.social, ...(s.social || {}) }, home, about, footer, content });
      })
      .catch(e => {
        const detail = e.response?.data?.message || e.message;
        const msg = `Could not load settings: ${detail}`;
        setBannerAlert({ type: 'error', message: msg });
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const setPath = (path, value) => {
    const parts = path.split('.');
    setForm(prev => {
      const next = { ...prev };
      let cur = next;
      let src = prev;
      for (let i = 0; i < parts.length - 1; i++) {
        const k = parts[i];
        cur[k] = Array.isArray(src[k]) ? [...src[k]] : { ...src[k] };
        cur = cur[k];
        src = src[k];
      }
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        contact: { ...form.contact, phones: form.contact.phones.filter(Boolean) },
        social: form.social,
        home: {
          ...form.home,
          satisfaction: String(form.home.satisfaction || ''),
          businessFallback: String(form.home.businessFallback || ''),
          productFallback: String(form.home.productFallback || ''),
          cityFallback: String(form.home.cityFallback || ''),
        },
        about: form.about,
        footer: {
          ...form.footer,
          quickLinks: form.footer.quickLinks.filter(l => l.to || l.label),
          legalLinks: form.footer.legalLinks.filter(l => l.to || l.label),
        },
        content: {
          en: cleanContent(form.content.en),
          am: cleanContent(form.content.am),
          or: cleanContent(form.content.or),
        },
      };
      await API.put('/settings', { settings: payload });
      toast.success('Site settings saved and published live.');
      setBannerAlert({ type: 'success', message: 'Settings successfully saved to database.' });
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to save settings.';
      toast.error(msg);
      setBannerAlert({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ color: '#a3a3a3' }}>Loading...</p>;

  const formCtx = { form, setPath };

  return (
    <FormCtx.Provider value={formCtx}>
      <div style={{ maxWidth: 860 }}>
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>⚙️ Site Settings</h1>
            <p style={{ color: '#a3a3a3', marginTop: 4, fontSize: 13 }}>Site-wide brand info, social links, contact numbers, and multilingual page copy</p>
          </div>
          <button onClick={save} disabled={saving} style={{ padding: '10px 22px', background: '#f97316', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving...' : '💾 Save Settings'}
          </button>
        </div>

        {bannerAlert && (
          <Alert
            type={bannerAlert.type}
            message={bannerAlert.message}
            onClose={() => setBannerAlert(null)}
          />
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: tab === t.id ? '#f97316' : '#171717', color: tab === t.id ? '#000' : '#a3a3a3',
              border: tab === t.id ? '1px solid #f97316' : '1px solid #333',
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── Contact & Social ── */}
        {tab === 'contact' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={card}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f97316', margin: '0 0 16px' }}>📧 Contact & Identity</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <F path="contact.email" labelText="Email (top strip + contact page)" ph="allthingsethiopia2026@gmail.com" />
                <F path="contact.address" labelText="Address" ph="Addis Ababa, Ethiopia" />
                <F path="contact.phones.0" labelText="Phone 1" ph="+251 905 841 982" />
                <F path="contact.phones.1" labelText="Phone 2" ph="+251 967 033 544" />
                <F path="contact.phones.2" labelText="Phone 3" ph="+251 911 031 884" />
                <F path="contact.hours" labelText="Support Hours" ph="Mon–Fri: 9AM–6PM" />
                <F path="contact.telegramHandle" labelText="Telegram Handle" ph="@Allthings2026" />
              </div>
            </div>
            <div style={card}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f97316', margin: '0 0 16px' }}>🌐 Social Media</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <F path="social.whatsapp" labelText="WhatsApp Number (digits only)" ph="251911031884" />
                <F path="social.facebook" labelText="Facebook URL" ph="https://..." />
                <F path="social.instagram" labelText="Instagram URL" ph="https://..." />
                <F path="social.tiktok" labelText="TikTok URL" ph="https://..." />
                <F path="social.youtube" labelText="YouTube URL" ph="https://..." />
                <F path="social.telegram" labelText="Telegram URL" ph="https://t.me/..." />
                <F path="social.messenger" labelText="Messenger URL" ph="https://m.me/..." />
              </div>
            </div>
          </div>
        )}

        {/* ── Home ── */}
        {tab === 'home' && (
          <div style={card}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f97316', margin: '0 0 16px' }}>📊 Home Stats & Testimonials</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <F path="home.businessFallback" labelText="Businesses (fallback)" ph="5" />
              <F path="home.productFallback" labelText="Products (fallback)" ph="50" />
              <F path="home.cityFallback" labelText="Cities (fallback)" ph="5" />
              <F path="home.satisfaction" labelText="Satisfaction %" ph="98" />
            </div>
            <div style={{ marginTop: 8 }}>
              {form.home.testimonials.map((tm, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, borderTop: '1px solid #222', paddingTop: 14, marginTop: 14 }}>
                  <F path={`home.testimonials.${i}.quote`} labelText={`Testimonial ${i + 1} — Quote`} />
                  <F path={`home.testimonials.${i}.name`} labelText={`Testimonial ${i + 1} — Name`} />
                  <F path={`home.testimonials.${i}.role`} labelText={`Testimonial ${i + 1} — Role`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── About ── */}
        {tab === 'about' && (
          <div style={card}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f97316', margin: '0 0 16px' }}>🏆 About Statistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {form.about.stats.map((st, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
                  <F path={`about.stats.${i}.num`} labelText={`Stat ${i + 1} — Number`} />
                  <F path={`about.stats.${i}.label`} labelText={`Stat ${i + 1} — Label`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        {tab === 'footer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={card}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f97316', margin: '0 0 16px' }}>🔗 Footer Links & Copyright</h3>
              <div style={{ maxWidth: 420 }}>
                <F path="footer.copyright" labelText="Copyright Text" ph="© 2026 AllThings. All rights reserved." />
              </div>
              <h4 style={{ color: '#a3a3a3', fontSize: 13, margin: '16px 0 10px' }}>Quick Links (route path + label)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {form.footer.quickLinks.map((l, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <F path={`footer.quickLinks.${i}.to`} labelText="Route" ph="/website" />
                    <F path={`footer.quickLinks.${i}.label`} labelText="Label" ph="Home" />
                  </div>
                ))}
              </div>
              <h4 style={{ color: '#a3a3a3', fontSize: 13, margin: '16px 0 10px' }}>Legal Links (route path + label)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {form.footer.legalLinks.map((l, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <F path={`footer.legalLinks.${i}.to`} labelText="Route" ph="/terms" />
                    <F path={`footer.legalLinks.${i}.label`} labelText="Label" ph="Terms & Conditions" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Content ── */}
        {tab === 'content' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              {LANG_CODES.map(l => (
                <button key={l.code} onClick={() => setLang(l.code)} style={{
                  padding: '7px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  background: lang === l.code ? '#f97316' : '#171717', color: lang === l.code ? '#000' : '#a3a3a3',
                  border: lang === l.code ? '1px solid #f97316' : '1px solid #333',
                }}>{l.label}</button>
              ))}
              <span style={{ color: '#666', fontSize: 12, alignSelf: 'center', marginLeft: 4 }}>Each language has its own text. Leave empty to keep default.</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CONTENT_SECTIONS.map((sec, si) => (
                <details key={si} open={si === 0} style={card}>
                  <summary style={{ fontSize: 14, fontWeight: 700, color: '#f97316', cursor: 'pointer', marginBottom: 8 }}>{sec.title}</summary>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {sec.fields.map(([key, labelText, ph]) => (
                      <F key={key} path={`content.${lang}.${key}`} labelText={labelText} ph={ph} />
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <button onClick={save} disabled={saving} style={{ padding: '12px 28px', background: '#f97316', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving...' : '💾 Save Settings'}
          </button>
        </div>
      </div>
    </FormCtx.Provider>
  );
}
