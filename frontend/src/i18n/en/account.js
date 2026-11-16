// account — en. Buyer account pages: register, password reset, purchases, dashboard.

export default {
  // BuyerRegister
  regNameRequired: 'Full name is required.',
  regPhoneDigits: 'Phone must be 9 digits.',
  regFailed: 'Registration failed.',
  regBack: 'Back',
  regTaglineRedirect: 'Create a free account to complete your purchase',
  regTaglineDefault: 'Shop instantly — no approval needed',
  regFullName: 'Full Name *',
  regFullNamePh: 'Your full name',
  regPhoneLabel: 'Phone Number *',
  regEmailOptional: 'Email (optional)',
  regPassword: 'Password *',
  regConfirmPassword: 'Confirm Password *',
  regConfirmPh: 'Repeat your password',
  regCreating: 'Creating account...',
  regSubmit: 'Create Buyer Account',
  regWantToSell: 'Want to sell?',

  // ForgotPassword
  fpTitle: 'Reset your password',
  fpStepPhone: 'Phone',
  fpStepVerify: 'Verify',
  fpStepPassword: 'New Password',
  fpInvalidPhone: 'Enter a valid 9-digit phone number',
  fpPhoneNotFound: 'Phone number not found.',
  fpEnterCode: 'Enter the 6-digit code',
  fpPasswordShort: 'Password must be at least 6 characters',
  fpPasswordMismatch: 'Passwords do not match',
  fpResetFailed: 'Reset failed. Please try again.',
  fpIntroPhone: "Enter your registered phone number and we'll send you a verification code.",
  fpPhoneLabel: 'Phone Number',
  fpSending: 'Sending...',
  fpSendCode: 'Send Verification Code',
  fpCodeSentTo: 'Enter the 6-digit code sent to',
  fpDemoMode: '🔔 Demo mode — your code is:',
  fpCodeLabel: 'Verification Code',
  fpVerify: 'Verify Code',
  fpBack: 'Back',
  fpEnterNewPassword: 'Enter your new password.',
  fpNewPassword: 'New Password',
  fpPasswordPh: 'Min. 6 characters',
  fpConfirmPassword: 'Confirm Password',
  fpConfirmPh: 'Repeat password',
  fpResetting: 'Resetting...',
  fpReset: 'Reset Password',
  fpRemember: 'Remember your password?',

  // MyPurchases
  purchLoadFailed: 'Failed to load purchases.',

  // BuyerDashboard
  bdLoadFailed: 'Failed to load orders. Please try again.',
  bdOrderCount: (n) => (n === 1 ? `(${n} order)` : `(${n} orders)`),
  bdPayment: 'Payment:',
  bdUnitEach: (v) => `ETB ${v} each`,

  // Shared order rows
  acctOrderNum: (id) => `Order #${id}`,
  acctProof: 'Proof:',
  acctScreenshot: 'Screenshot',
  acctRef: (v) => `Ref: ${v}`,
};
