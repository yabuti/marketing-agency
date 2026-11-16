// account — or. Buyer account pages: register, password reset, purchases, dashboard.

export default {
  // BuyerRegister
  regNameRequired: 'Maqaa guutuu barbaachisaadha.',
  regPhoneDigits: 'Bilisaan gara 9 qofaaf ta’uu qabaachuu qaba.',
  regFailed: 'Galmeessuu kufeffate.',
  regBack: 'Duubatti',
  regTaglineRedirect: 'Akkaata bitannoo kee xumuradhuuf herrega bilisaa samii',
  regTaglineDefault: 'Qofa bitadhu — hayyama hin qabu',
  regFullName: 'Maqaa guutuu *',
  regFullNamePh: 'Maqaa guutuu kee',
  regPhoneLabel: 'Lakkawwe bilisaa *',
  regEmailOptional: 'Iimeelii (yoo dhiifamuu ta’e)',
  regPassword: 'Jecha darbii *',
  regConfirmPassword: 'Jecha darbii mirkaneessi *',
  regConfirmPh: 'Jecha darbii kee haa dubbifadhu',
  regCreating: 'Herrega gamchuu…',
  regSubmit: 'Herrega bitamuu samii',
  regWantToSell: 'Gurgurtaa siifuu qabdu?',

  // ForgotPassword
  fpTitle: 'Jecha darbii kee jijjiiri',
  fpStepPhone: 'Bilisaan',
  fpStepVerify: 'Mirgaa’eessi',
  fpStepPassword: 'Jecha Darbii Haaraa',
  fpInvalidPhone: 'Lakkawwe bilisaa gara 9 qofaaf kan qabaa galchi',
  fpPhoneNotFound: 'Lakkawwe bilisaa hin argamne.',
  fpEnterCode: 'Koodii gara 6 qofaaf kan qabaa galchi',
  fpPasswordShort: 'Jecha darbii xiqqaate qubee 6 qabaachuu qaba',
  fpPasswordMismatch: 'Jechoonni darbii wal hin simtan',
  fpResetFailed: 'Jijjiirraan hin danda’mne. Irra deebi’i.',
  fpIntroPhone: 'Lakkawwe bilisaa sifacta kee galchi; koodii ragaa isnaanii erginaaf.',
  fpPhoneLabel: 'Lakkawwe bilisaa',
  fpSending: 'Ergamaa…',
  fpSendCode: 'Koodii ragaa isnaanii ergi',
  fpCodeSentTo: 'Koodii gara 6 qofaaf ergame erga',
  fpDemoMode: '🔔 Kan filadhu — koodii kee:',
  fpCodeLabel: 'Koodii ragaa isnaanii',
  fpVerify: 'Koodii mirgaa’eessi',
  fpBack: 'Duubatti',
  fpEnterNewPassword: 'Jecha darbii haaraa kee galchi.',
  fpNewPassword: 'Jecha Darbii Haaraa',
  fpPasswordPh: 'Xiqqaate qubee 6',
  fpConfirmPassword: 'Jecha darbii mirkaneessi',
  fpConfirmPh: 'Jecha darbii haa dubbifadhu',
  fpResetting: 'Jijjiirraa…',
  fpReset: 'Jecha Darbii Jijjiiri',
  fpRemember: 'Jecha darbii kee yaadattu?',

  // MyPurchases
  purchLoadFailed: 'Bitannoota fe’uu hin danda’ne.',

  // BuyerDashboard
  bdLoadFailed: 'Ajajoota fe’uu hin danda’ne. Irra deebi’i.',
  bdOrderCount: (n) => (n === 1 ? `(${n} ajajoo)` : `(${n} ajajoota)`),

  bdPayment: 'Kaffaltii:',
  bdUnitEach: (v) => `ETB ${v} hundaa`,

  // Shared order rows
  acctOrderNum: (id) => `Ajajoo #${id}`,
  acctProof: 'Ragaa:',
  acctScreenshot: 'Suurii',
  acctRef: (v) => `Wabii: ${v}`,
};
