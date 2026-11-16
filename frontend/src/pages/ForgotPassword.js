import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { useLang } from '../LangContext';
import PasswordInput from '../components/PasswordInput';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [step, setStep] = useState(0); // 0=phone, 1=otp, 2=newpass
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async () => {
    if (!/^\d{9}$/.test(phone)) { setError(t.fpInvalidPhone); return; }
    setLoading(true); setError('');
    try {
      const { data } = await API.post('/users/forgot-password', { phone: '+251' + phone });
      setDemoOtp(data.demo_otp || '');
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.message || t.fpPhoneNotFound);
    } finally { setLoading(false); }
  };

  const verifyOtp = () => {
    if (otp.length !== 6) { setError(t.fpEnterCode); return; }
    setError('');
    setStep(2);
  };

  const resetPassword = async () => {
    if (newPassword.length < 6) { setError(t.fpPasswordShort); return; }
    if (newPassword !== confirm) { setError(t.fpPasswordMismatch); return; }
    setLoading(true); setError('');
    try {
      await API.post('/users/reset-password', { phone: '+251' + phone, otp, newPassword });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || t.fpResetFailed);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(to bottom, #3B1F0F, #7A4020)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900 }}>All <span style={{ color: '#f97316' }}>Things</span></h1>
          <p style={{ color: '#ffffff', marginTop: 6 }}>{t.fpTitle}</p>
        </div>

        <div style={{ background: '#3B1F0F', border: '1px solid #7A402050', borderRadius: 16, padding: 32 }}>
          {error && <div style={errStyle}>{error}</div>}

          {/* Step indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
            {[t.fpStepPhone, t.fpStepVerify, t.fpStepPassword].map((label, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700,
                  background: i < step ? '#22c55e' : i === step ? '#f97316' : '#262626',
                  color: i <= step ? '#000' : '#666' }}>
                  {i < step ? '✓' : i + 1}
                </div>
                {i < 2 && <div style={{ width: 24, height: 2, background: i < step ? '#22c55e' : '#262626' }} />}
              </div>
            ))}
          </div>

          {step === 0 && (
            <div>
              <p style={{ color: '#ffffff', fontSize: 16, marginBottom: 20 }}>{t.fpIntroPhone}</p>
              <label style={lbl}>{t.fpPhoneLabel}</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#2a1208', border: '1px solid #7A402060', borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
                <span style={{ padding: '11px 12px', color: '#f97316', fontWeight: 700, fontSize: 17, borderRight: '1px solid #7A402060', whiteSpace: 'nowrap', flexShrink: 0 }}>+251</span>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))} maxLength={9} placeholder="9XX XXX XXX"
                  style={{ flex: '1 1 0', minWidth: 0, width: '100%', boxSizing: 'border-box', padding: '11px 12px', background: 'transparent', border: 'none', color: '#fff', fontSize: 16, outline: 'none' }} />
              </div>
              <button onClick={sendOtp} disabled={loading} style={btn}>{loading ? t.fpSending : t.fpSendCode}</button>
            </div>
          )}

          {step === 1 && (
            <div>
              <p style={{ color: '#ffffff', fontSize: 16, marginBottom: 8 }}>{t.fpCodeSentTo} <strong style={{ color: '#fff' }}>+251{phone}</strong></p>
              {demoOtp && (
                <div style={{ background: '#22c55e15', border: '1px solid #22c55e40', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 16, color: '#22c55e' }}>
                  {t.fpDemoMode} <strong style={{ fontSize: 18, letterSpacing: 4 }}>{demoOtp}</strong>
                </div>
              )}
              <label style={lbl}>{t.fpCodeLabel}</label>
              <input type="tel" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} placeholder="000000"
                style={{ ...inp, letterSpacing: 8, fontSize: 22, textAlign: 'center', marginBottom: 20 }} />
              <button onClick={verifyOtp} style={btn}>{t.fpVerify}</button>
              <button onClick={() => { setStep(0); setOtp(''); setError(''); }} style={backBtn}>{t.fpBack}</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <p style={{ color: '#ffffff', fontSize: 16, marginBottom: 20 }}>{t.fpEnterNewPassword}</p>
              <label style={lbl}>{t.fpNewPassword}</label>
              <PasswordInput value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t.fpPasswordPh} autoComplete="new-password" style={{ ...inp, marginBottom: 14 }} />
              <label style={lbl}>{t.fpConfirmPassword}</label>
              <PasswordInput value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={t.fpConfirmPh} autoComplete="new-password" style={{ ...inp, marginBottom: 20 }} />
              <button onClick={resetPassword} disabled={loading} style={btn}>{loading ? t.fpResetting : t.fpReset}</button>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', color: '#ffffff', marginTop: 18, fontSize: 16 }}>
          {t.fpRemember} <Link to="/login" style={{ color: '#f97316' }}>{t.signIn}</Link>
        </p>
      </div>
    </div>
  );
}

const inp = { width: '100%', padding: '11px 14px', background: '#2a1208', border: '1px solid #7A402060', borderRadius: 8, color: '#fff', fontSize: 16 };
const lbl = { display: 'block', fontSize: 16, color: '#d4a574', marginBottom: 6 };
const btn = { width: '100%', padding: '13px', background: '#f97316', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 17, cursor: 'pointer', marginBottom: 10 };
const backBtn = { width: '100%', padding: '11px', background: 'transparent', color: '#ffffff', border: '1px solid #7A402060', borderRadius: 8, fontSize: 16, cursor: 'pointer' };
const errStyle = { background: '#ef444420', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 16 };
