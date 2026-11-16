<?php
require_once __DIR__ . '/../vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;

function sendMail(string $to, string $subject, string $html): void {
    $user = getenv('MAIL_USER');
    $pass = getenv('MAIL_PASS');
    if (!$user || !$pass) return;

    register_shutdown_function(function () use ($to, $subject, $html, $user, $pass) {
        $mail = new PHPMailer(true);
        try {
            $mail->Timeout     = 10;
            $mail->SMTPOptions = [
                'ssl' => [
                    'verify_peer'       => false,
                    'verify_peer_name'  => false,
                    'allow_self_signed' => true,
                ],
            ];
            $mail->isSMTP();
            $mail->Host       = getenv('MAIL_HOST') ?: 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = $user;
            $mail->Password   = $pass;
            $mail->SMTPSecure = 'tls';
            $mail->Port       = (int)(getenv('MAIL_PORT') ?: 587);
            $mail->setFrom($user, 'All Things');
            $mail->addAddress($to);
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $html;
            $mail->send();
        } catch (Exception $e) {
            error_log('[Mailer] Failed: ' . $e->getMessage());
        }
    });
}

function mailWrap(string $title, string $body): string {
    return "
    <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;border-radius:12px;overflow:hidden;'>
      <div style='background:#f97316;padding:24px 32px;'>
        <h1 style='margin:0;font-size:22px;color:#000;'>All Things by All Things Solution</h1>
        <p style='margin:4px 0 0;color:#000;opacity:0.7;font-size:14px;'>$title</p>
      </div>
      <div style='padding:32px;'>$body</div>
      <div style='padding:16px 32px;background:#111;font-size:12px;color:#666;text-align:center;'>
        © 2026 All Things by All Things Solution · Addis Ababa, Ethiopia
      </div>
    </div>";
}

function mailRow(string $label, ?string $value): string {
    if (!$value) return '';
    return "<tr>
      <td style='padding:8px 0;color:#a3a3a3;font-size:13px;width:160px;'>$label</td>
      <td style='padding:8px 0;color:#fff;font-size:13px;'>$value</td>
    </tr>";
}

function notifyContact(array $d): void {
    $notify = getenv('NOTIFY_EMAIL') ?: getenv('MAIL_USER');
    $subject = "📬 New Contact: {$d['full_name']} — " . ($d['company_name'] ?? 'No company');
    $rows = mailRow('Name', $d['full_name']) . mailRow('Email', $d['email'] ?? '') .
            mailRow('Phone', $d['phone']) . mailRow('Company', $d['company_name'] ?? '') .
            mailRow('Business Type', $d['business_type'] ?? '') . mailRow('TIN', $d['tin_number'] ?? '') .
            mailRow('E-LMIS', $d['elmis_registration'] ?? '') . mailRow('License', $d['business_license'] ?? '');
    $msg = $d['message'] ?? '';
    $msgBlock = $msg ? "<div style='margin-top:20px;padding:16px;background:#171717;border-radius:8px;border-left:3px solid #f97316;'><p style='color:#fff;margin:0;'>$msg</p></div>" : '';
    $html = mailWrap('New Contact Form Submission', "<table style='width:100%;border-collapse:collapse;'>$rows</table>$msgBlock");
    sendMail($notify, $subject, $html);
}

function notifyRegistration(array $d): void {
    $notify = getenv('NOTIFY_EMAIL') ?: getenv('MAIL_USER');
    $subject = "🆕 New Registration: {$d['full_name']} — " . ($d['company_name'] ?? 'No company');
    $rows = mailRow('Full Name', $d['full_name']) . mailRow('Email', $d['email'] ?? '') .
            mailRow('Phone', $d['phone']) . mailRow('Company', $d['company_name'] ?? '') .
            mailRow('Business Type', $d['business_type'] ?? '') . mailRow('TIN', $d['tin_number'] ?? '') .
            mailRow('License', $d['business_license_number'] ?? '') . mailRow('Location', $d['location'] ?? '');
    $html = mailWrap('New User Registration', "<table style='width:100%;border-collapse:collapse;'>$rows</table>");
    sendMail($notify, $subject, $html);
}

function welcomeUser(array $d): void {
    if (empty($d['email'])) return;
    $name = $d['full_name'];
    $html = mailWrap('Welcome!', "
      <h2 style='color:#f97316;margin-top:0;'>Hello, $name!</h2>
      <p style='color:#a3a3a3;line-height:1.7;'>Thank you for registering with <strong style='color:#fff;'>All Things by All Things Solution</strong>. Your account has been created and is pending review.</p>
      <p style='color:#a3a3a3;'>We will verify your business license and reach out within 1–2 business days.</p>
    ");
    sendMail($d['email'], '🎉 Welcome to All Things!', $html);
}

function notifyUserActivated(array $d): void {
    if (empty($d['email'])) return;
    $name = $d['full_name'];
    $loginUrl = (getenv('FRONTEND_URL') ?: 'http://localhost:3000') . '/login';
    $html = mailWrap('Your Account is Active!', "
      <h2 style='color:#22c55e;margin-top:0;'>🎉 You're all set, $name!</h2>
      <p style='color:#a3a3a3;line-height:1.7;'>Your account has been <strong style='color:#22c55e;'>activated</strong>. You can now log in.</p>
      <p style='margin-top:24px;'><a href='$loginUrl' style='background:#22c55e;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;'>Log In →</a></p>
    ");
    sendMail($d['email'], '✅ Your All Things Account is Now Active!', $html);
}

function notifyProfileUpdate(array $d): void {
    $notify = getenv('NOTIFY_EMAIL') ?: getenv('MAIL_USER');
    $subject = "✏️ Profile Updated: {$d['full_name']}";
    $rows = mailRow('Name', $d['full_name']) . mailRow('Email', $d['email'] ?? '') .
            mailRow('Phone', $d['phone'] ?? '') . mailRow('Company', $d['company_name'] ?? '');
    $html = mailWrap('User Profile Updated', "<table style='width:100%;border-collapse:collapse;'>$rows</table>");
    sendMail($notify, $subject, $html);
}
