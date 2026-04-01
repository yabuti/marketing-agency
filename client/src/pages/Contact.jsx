import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import '../styles/contact.css'

export default function Contact() {
  const { t } = useLanguage()
  const [form, setForm] = useState({ name: '', email: '', phone: '', business_type: '', company: '', tin_number: '', elmis_registration: '', business_license_number: '', message: '' })
  const [success, setSuccess] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // For now, just show success message (no backend)
    setSuccess(t('thankYou'))
    setForm({ name: '', email: '', phone: '', business_type: '', company: '', tin_number: '', elmis_registration: '', business_license_number: '', message: '' })
  }

  return (
    <>
      <section className="contact-hero">
        <div className="section-tag">📞 {t('contactUs')}</div>
        <h1>{t('letsWorkTogether')}</h1>
        <p>{t('readyToGrow')}</p>
      </section>

      <section className="contact-section">
        <div className="contact-grid">
          <div className="contact-info">
            <div className="info-card"><div className="info-icon">📧</div><div className="info-text"><h4>{t('emailUs')}</h4><p>allthingsethiopia2026@gmail.com</p></div></div>
            <div className="info-card"><div className="info-icon">📞</div><div className="info-text"><h4>{t('callUs')}</h4><p>+251911031884</p><p>+251905841982</p><p>+251915840037</p></div></div>
            <div className="info-card"><div className="info-icon">📍</div><div className="info-text"><h4>{t('visitUs')}</h4><p>Addis Ababa, Ethiopia</p></div></div>
            <div className="info-card">
              <div className="info-icon">🌐</div>
              <div className="info-text">
                <h4>Follow Us</h4>
                <div style={{display: 'flex', gap: '10px', marginTop: '8px'}}>
                  <a href="https://www.instagram.com/all63527?igsh=ZWd4Ymo4ZmU3aXgw&utm_source=qr" target="_blank" rel="noopener noreferrer" style={{fontSize: '24px'}}>📸</a>
                  <a href="https://www.tiktok.com/@allthings2026?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" style={{fontSize: '24px'}}>🎵</a>
                  <a href="https://t.me/Allthings2026" target="_blank" rel="noopener noreferrer" style={{fontSize: '24px'}}>✈️</a>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-card">
            <h3>{t('sendMessage')}</h3>
            <p>{t('fillForm')}</p>
            {success && <div className="success-box">{success}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('yourName')} *</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" required />
                </div>
                <div className="form-group">
                  <label>{t('emailAddress')} *</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@company.com" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('phoneNumber')} *</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+251 91 234 5678" required />
                </div>
                <div className="form-group">
                  <label>{t('businessType')} *</label>
                  <select value={form.business_type} onChange={e => setForm({...form, business_type: e.target.value})} required>
                    <option value="">{t('selectIndustry')}</option>
                    <optgroup label="Startups and Entrepreneurs">
                      <option value="Tech startups (apps, software, IT services)">Tech startups (apps, software, IT services)</option>
                      <option value="E-commerce businesses">E-commerce businesses</option>
                      <option value="Digital service startups">Digital service startups</option>
                      <option value="Creative startups (design, media, photography)">Creative startups (design, media, photography)</option>
                    </optgroup>
                    <optgroup label="Retail and Wholesale Businesses">
                      <option value="Shops and minimarkets">Shops and minimarkets</option>
                      <option value="Clothing and fashion stores">Clothing and fashion stores</option>
                      <option value="Shoe and accessories shops">Shoe and accessories shops</option>
                      <option value="Electronics and mobile phone shops">Electronics and mobile phone shops</option>
                      <option value="Cosmetics and beauty product shops">Cosmetics and beauty product shops</option>
                      <option value="Bookshops and stationery shops">Bookshops and stationery shops</option>
                      <option value="Furniture and home appliance shops">Furniture and home appliance shops</option>
                      <option value="Food and beverage wholesalers">Food and beverage wholesalers</option>
                      <option value="Construction material suppliers">Construction material suppliers</option>
                      <option value="Agricultural input suppliers">Agricultural input suppliers</option>
                      <option value="Textile and garment wholesalers">Textile and garment wholesalers</option>
                    </optgroup>
                    <optgroup label="Hospitality and Tourism Sector">
                      <option value="Restaurants and cafes">Restaurants and cafes</option>
                      <option value="Traditional food houses">Traditional food houses</option>
                      <option value="Event and conference venues">Event and conference venues</option>
                      <option value="Car rental services">Car rental services</option>
                    </optgroup>
                    <optgroup label="Educational Institutions">
                      <option value="Private schools (KG–Grade 12)">Private schools (KG–Grade 12)</option>
                      <option value="Training centers">Training centers</option>
                      <option value="Language schools">Language schools</option>
                      <option value="Computer and IT training centers">Computer and IT training centers</option>
                      <option value="Tutorial and exam preparation centers">Tutorial and exam preparation centers</option>
                      <option value="Online learning platforms">Online learning platforms</option>
                      <option value="Educational consultancy services">Educational consultancy services</option>
                    </optgroup>
                    <optgroup label="Service Providers">
                      <option value="Advertising and marketing agencies">Advertising and marketing agencies</option>
                      <option value="Printing and publishing services">Printing and publishing services</option>
                      <option value="Graphic design and branding services">Graphic design and branding services</option>
                      <option value="Accounting and auditing firms">Accounting and auditing firms</option>
                      <option value="Legal and consultancy services">Legal and consultancy services</option>
                      <option value="Cleaning and maintenance services">Cleaning and maintenance services</option>
                      <option value="Security service providers">Security service providers</option>
                      <option value="Repair services (electronics, machinery, vehicles)">Repair services (electronics, machinery, vehicles)</option>
                      <option value="Beauty salons and barber shops">Beauty salons and barber shops</option>
                      <option value="Transportation and logistics services">Transportation and logistics services</option>
                    </optgroup>
                    <optgroup label="Manufacturers">
                      <option value="Food and beverage processing enterprises">Food and beverage processing enterprises</option>
                      <option value="Garment and textile manufacturers">Garment and textile manufacturers</option>
                      <option value="Shoe and leather product manufacturers">Shoe and leather product manufacturers</option>
                      <option value="Plastic product manufacturers">Plastic product manufacturers</option>
                      <option value="Metal and wood furniture manufacturers">Metal and wood furniture manufacturers</option>
                      <option value="Building material manufacturers (cement blocks, tiles)">Building material manufacturers (cement blocks, tiles)</option>
                      <option value="Packaging and labeling manufacturers">Packaging and labeling manufacturers</option>
                      <option value="Soap, detergent, and cosmetic producers">Soap, detergent, and cosmetic producers</option>
                      <option value="Agro-processing plants">Agro-processing plants</option>
                    </optgroup>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>{t('companyName')} *</label>
                <input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="Your Business Name" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>TIN Number *</label>
                  <input type="text" value={form.tin_number} onChange={e => setForm({...form, tin_number: e.target.value})} placeholder="Enter TIN Number" required />
                </div>
                <div className="form-group">
                  <label>E-LMIS Registration *</label>
                  <input type="text" value={form.elmis_registration} onChange={e => setForm({...form, elmis_registration: e.target.value})} placeholder="Enter E-LMIS Registration" required />
                </div>
              </div>
              <div className="form-group">
                <label>Business License Number *</label>
                <input type="text" value={form.business_license_number} onChange={e => setForm({...form, business_license_number: e.target.value})} placeholder="Enter Business License Number" required />
              </div>
              <div className="form-group">
                <label>{t('tellUsAbout')} *</label>
                <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder={t('describeYourBusiness')} required></textarea>
              </div>
              <div className="license-notice">
                <span className="icon">📋</span>
                <p><strong>{t('important')}</strong> {t('onlyLicensed')}</p>
              </div>
              <button type="submit" className="submit-btn">{t('submitApplication')}</button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
