const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const NOTIFY = process.env.NOTIFY_EMAIL || process.env.MAIL_USER;
const FROM   = process.env.MAIL_FROM    || `"All Things" <${process.env.MAIL_USER}>`;

// ─── Generic send ─────────────────────────────────────────────
async function send(to, subject, html) {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.warn('[Mailer] MAIL_USER / MAIL_PASS not set — skipping email.');
    return;
  }
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
    console.log(`[Mailer] Sent "${subject}" → ${to}`);
  } catch (err) {
    console.error('[Mailer] Failed:', err.message);
  }
}

// ─── Templates ────────────────────────────────────────────────

function wrap(title, body) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;border-radius:12px;overflow:hidden;">
    <div style="background:#f97316;padding:24px 32px;">
      <h1 style="margin:0;font-size:22px;color:#000;">All Things by All Things Solution</h1>
      <p style="margin:4px 0 0;color:#000;opacity:0.7;font-size:14px;">${title}</p>
    </div>
    <div style="padding:32px;">${body}</div>
    <div style="padding:16px 32px;background:#111;font-size:12px;color:#666;text-align:center;">
      © 2026 All Things by All Things Solution · Addis Ababa, Ethiopia
    </div>
  </div>`;
}

function row(label, value) {
  if (!value) return '';
  return `<tr>
    <td style="padding:8px 0;color:#a3a3a3;font-size:13px;width:160px;">${label}</td>
    <td style="padding:8px 0;color:#fff;font-size:13px;">${value}</td>
  </tr>`;
}

// ─── Contact submission notification ──────────────────────────
async function notifyContact(data) {
  const subject = `📬 New Contact: ${data.full_name} — ${data.company_name || 'No company'}`;
  const html = wrap('New Contact Form Submission', `
    <p style="color:#a3a3a3;margin-bottom:20px;">A new contact form was submitted on the website/app.</p>
    <table style="width:100%;border-collapse:collapse;">
      ${row('Name', data.full_name)}
      ${row('Email', data.email)}
      ${row('Phone', data.phone)}
      ${row('Company', data.company_name)}
      ${row('Business Type', data.business_type)}
      ${row('TIN Number', data.tin_number)}
      ${row('E-LMIS', data.elmis_registration)}
      ${row('License No.', data.business_license)}
    </table>
    ${data.message ? `<div style="margin-top:20px;padding:16px;background:#171717;border-radius:8px;border-left:3px solid #f97316;">
      <p style="color:#a3a3a3;font-size:12px;margin:0 0 6px;">Message:</p>
      <p style="color:#fff;margin:0;">${data.message}</p>
    </div>` : ''}
    <p style="margin-top:24px;"><a href="http://localhost:3001/contacts" style="background:#f97316;color:#000;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">View in Admin Panel →</a></p>
  `);
  await send(NOTIFY, subject, html);
}

// ─── User registration notification ───────────────────────────
async function notifyRegistration(data) {
  const subject = `🆕 New Registration: ${data.full_name} — ${data.company_name || 'No company'}`;
  const html = wrap('New User Registration', `
    <p style="color:#a3a3a3;margin-bottom:20px;">A new business has registered on the platform.</p>
    <table style="width:100%;border-collapse:collapse;">
      ${row('Full Name', data.full_name)}
      ${row('Email', data.email)}
      ${row('Phone', data.phone)}
      ${row('Company', data.company_name)}
      ${row('Business Type', data.business_type)}
      ${row('TIN Number', data.tin_number)}
      ${row('E-LMIS', data.elmis_registration)}
      ${row('License No.', data.business_license_number)}
      ${row('Location', data.location)}
      ${row('Website', data.website)}
    </table>
    <p style="margin-top:24px;"><a href="http://localhost:3001/registrations" style="background:#f97316;color:#000;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">View in Admin Panel →</a></p>
  `);
  await send(NOTIFY, subject, html);
}

// ─── Welcome email to new user ─────────────────────────────────
async function welcomeUser(data) {
  if (!data.email) return;
  const subject = '🎉 Welcome to All Things by All Things Solution!';
  const html = wrap('Welcome!', `
    <h2 style="color:#f97316;margin-top:0;">Hello, ${data.full_name}!</h2>
    <p style="color:#a3a3a3;line-height:1.7;">
      Thank you for registering with <strong style="color:#fff;">All Things by All Things Solution</strong>.
      Your account has been created successfully.
    </p>
    <p style="color:#a3a3a3;line-height:1.7;">
      Our team will review your business information and contact you shortly to discuss how we can help grow your social media presence.
    </p>
    <div style="margin:24px 0;padding:16px;background:#171717;border-radius:8px;border-left:3px solid #22c55e;">
      <p style="color:#22c55e;font-weight:bold;margin:0 0 4px;">What happens next?</p>
      <p style="color:#a3a3a3;margin:0;font-size:14px;">We will verify your business license and reach out within 1–2 business days.</p>
    </div>
    <p style="color:#a3a3a3;">You can reach us at:<br/>
      📧 allthingsethiopia2026@gmail.com<br/>
      📱 +251 911 031 884
    </p>
  `);
  await send(data.email, subject, html);
}

// ─── Profile update notification ──────────────────────────────
async function notifyProfileUpdate(data) {
  const subject = `✏️ Profile Updated: ${data.full_name}`;
  const html = wrap('User Profile Updated', `
    <p style="color:#a3a3a3;margin-bottom:20px;">A registered user has updated their profile information.</p>
    <table style="width:100%;border-collapse:collapse;">
      ${row('Name', data.full_name)}
      ${row('Email', data.email)}
      ${row('Phone', data.phone)}
      ${row('Company', data.company_name)}
      ${row('Business Type', data.business_type)}
      ${row('TIN Number', data.tin_number)}
      ${row('License No.', data.business_license_number)}
    </table>
    <p style="margin-top:24px;"><a href="http://localhost:3001/users" style="background:#f97316;color:#000;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">View in Admin Panel →</a></p>
  `);
  await send(NOTIFY, subject, html);
}

module.exports = { notifyContact, notifyRegistration, welcomeUser, notifyProfileUpdate };

// ─── SMS via Africa's Talking ──────────────────────────────────
function getSmsClient() {
  const apiKey = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;
  if (!apiKey || !username) return null;
  const AfricasTalking = require('africastalking');
  return AfricasTalking({ apiKey, username }).SMS;
}

async function sendSms(phone, message) {
  const sms = getSmsClient();
  if (!sms) {
    console.warn('[SMS] AT_API_KEY / AT_USERNAME not set — skipping SMS.');
    return;
  }
  // Normalize Ethiopian numbers to +251 format
  let to = phone.replace(/\s+/g, '');
  if (to.startsWith('0')) to = '+251' + to.slice(1);
  if (!to.startsWith('+')) to = '+' + to;
  try {
    await sms.send({ to: [to], message, from: process.env.AT_SENDER_ID || 'AllThings' });
    console.log(`[SMS] Sent to ${to}`);
  } catch (err) {
    console.error('[SMS] Failed:', err.message);
  }
}

// ─── Account activated SMS ─────────────────────────────────────
async function notifyUserActivated(data) {
  // SMS to user's phone
  const msg = `Hello ${data.full_name}, your All Things by All Things Solution account has been activated! You can now log in at allthings.com. Welcome aboard!`;
  await sendSms(data.phone, msg);

  // Also send activation email if they have one
  if (data.email) {
    const html = wrap('Your Account is Active!', `
      <h2 style="color:#22c55e;margin-top:0;">🎉 You're all set, ${data.full_name}!</h2>
      <p style="color:#a3a3a3;line-height:1.7;">
        Your business account at <strong style="color:#fff;">All Things by All Things Solution</strong> has been <strong style="color:#22c55e;">activated</strong>.
      </p>
      <p style="color:#a3a3a3;line-height:1.7;">
        You can now log in to your dashboard and start growing your business with us.
      </p>
      <p style="margin-top:24px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login"
           style="background:#22c55e;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Log In to Dashboard →
        </a>
      </p>
      <p style="color:#a3a3a3;margin-top:24px;">Questions? Reach us at:<br/>
        📧 allthingsethiopia2026@gmail.com<br/>
        📱 +251 911 031 884
      </p>
    `);
    await send(data.email, '✅ Your All Things Account is Now Active!', html);
  }
}

module.exports = { notifyContact, notifyRegistration, welcomeUser, notifyProfileUpdate, notifyUserActivated };
