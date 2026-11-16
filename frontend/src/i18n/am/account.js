// account — am. Buyer account pages: register, password reset, purchases, dashboard.

export default {
  // BuyerRegister
  regNameRequired: 'ሙሉ ስም ያስፈልጋል።',
  regPhoneDigits: 'ስልኩ 9 ቁምፊዎች መሆን አለበት።',
  regFailed: 'ምዝገባው አልተሳካም።',
  regBack: 'ተመለስ',
  regTaglineRedirect: 'ግዢዎን ለማጠናቀቅ ነፃ መለያ ይፍጠሩ',
  regTaglineDefault: 'ወዲያውኑ ይግዙ — ምንም ማጽደቅ አያስፈልግም',
  regFullName: 'ሙሉ ስም *',
  regFullNamePh: 'ሙሉ ስምዎ',
  regPhoneLabel: 'ስልክ ቁጥር *',
  regEmailOptional: 'ኢሜይል (አማራጭ)',
  regPassword: 'የይለፍ ቃል *',
  regConfirmPassword: 'የይለፍ ቃሉን ያረጋግጡ *',
  regConfirmPh: 'የይለፍ ቃልዎን ይድገሙ',
  regCreating: 'መለያ በመፍጠር ላይ...',
  regSubmit: 'የገዢ መለያ ፍጠር',
  regWantToSell: 'ለመሸጣት ይፈልጋሉ?',

  // ForgotPassword
  fpTitle: 'የይለፍ ቃልዎን ይቀይሩ',
  fpStepPhone: 'ስልክ',
  fpStepVerify: 'ማረጋገጫ',
  fpStepPassword: 'አዲስ የይለፍ ቃል',
  fpInvalidPhone: 'ትክክለኛ የ9 ቁምፊዎች ስልክ ቁጥር ያስገቡ',
  fpPhoneNotFound: 'የስልክ ቁጥሩ አልተገኘም።',
  fpEnterCode: '6 ቁምፊዎች ያለውን ኮድ ያስገቡ',
  fpPasswordShort: 'የይለፍ ቃሉ ቢያንስ 6 ቁምፊዎች መሆን አለበት',
  fpPasswordMismatch: 'የይለፍ ቃሎቹ አይሳማም',
  fpResetFailed: 'ማስተካከያው አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
  fpIntroPhone: 'የተመዘገበትዎን የስልክ ቁጥር ያስገቡ፤ የማረጋገጫ ኮድ እንልክዎታለን።',
  fpPhoneLabel: 'ስልክ ቁጥር',
  fpSending: 'በመላክ ላይ...',
  fpSendCode: 'የማረጋገጫ ኮድ ላክ',
  fpCodeSentTo: 'የተላከውን 6 ቁምፊዎች ኮድ ያስገቡ',
  fpDemoMode: '🔔 የሙከራ ሁኔታ — ኮድዎት፦',
  fpCodeLabel: 'የማረጋገጫ ኮድ',
  fpVerify: 'ኮዱን አረጋግጥ',
  fpBack: 'ተመለስ',
  fpEnterNewPassword: 'አዲስ የይለፍ ቃልዎን ያስገቡ።',
  fpNewPassword: 'አዲስ የይለፍ ቃል',
  fpPasswordPh: 'ቢያንስ 6 ቁምፊዎች',
  fpConfirmPassword: 'የይለፍ ቃሉን ያረጋግጡ',
  fpConfirmPh: 'የይለፍ ቃልዎን ይድገሙ',
  fpResetting: 'በማስተካከያ ላይ...',
  fpReset: 'የይለፍ ቃል ቀይር',
  fpRemember: 'የይለፍ ቃልዎን ያስታውሱ?',

  // MyPurchases
  purchLoadFailed: 'ግዢዎችን መጫን አልተቻለም።',

  // BuyerDashboard
  bdLoadFailed: 'ትዕዛዞችን መጫን አልተቻለም። እባክዎ እንደገና ይሞክሩ።',
  bdOrderCount: (n) => (n === 1 ? `(${n} ትዕዛዝ)` : `(${n} ትዕዛዦች)`),
  bdPayment: 'ክፍያ፦',
  bdUnitEach: (v) => `በአንድ ${v} ETB`,

  // Shared order rows
  acctOrderNum: (id) => `ትዕዛዝ #${id}`,
  acctProof: 'ማረጋገጫ፦',
  acctScreenshot: 'ቅጹል ስክሪንሾት',
  acctRef: (v) => `ማጣቀሻ፦ ${v}`,
};
