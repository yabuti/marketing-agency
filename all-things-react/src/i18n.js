// ─── Translation strings for EN / AM / OR ─────────────────────
const translations = {
  en: {
    // Navbar
    home: 'Home', clients: 'Clients', news: 'News', about: 'About',
    contact: 'Contact', signIn: 'Sign In', register: 'Register',
    signOut: 'Sign Out', myDashboard: 'My Dashboard', team: 'Team',

    // Ad splash
    adOf: (i, n) => `Ad ${i} of ${n}`,
    watchAd: 'Please watch the ad to continue',
    secondsLeft: (s) => `${s} second${parseFloat(s) !== 1 ? 's' : ''} remaining`,
    overall: 'Overall',
    complete: 'complete',

    // Home
    heroTag: 'Licensed Businesses Only',
    heroTitle1: 'Digital Marketing & E-Commerce for',
    heroTitle2: 'Licensed Businesses',
    heroDesc: 'We exclusively partner with verified, licensed businesses to create authentic social media presence.',
    // Links page
    linksTagline: 'Digital Marketing & E-Commerce · Addis Ababa, Ethiopia',
    linksDesc: 'We help verified, licensed businesses grow through digital marketing, e-commerce solutions, and authentic social media presence.',
    linksWebsite: 'Website',
    applyNow: 'Apply Now →',
    viewClients: 'View Clients',
    seeMore: 'See More →',
    totalClients: 'Clients', licensed: 'Licensed', avgGrowth: 'Avg Growth',
    ourServices: 'Our Services',

    // Clients categories
    catAll: 'All', catStartups: 'Startups & Entrepreneurs',
    catRetail: 'Retail & Wholesale', catHospitality: 'Hospitality & Tourism',
    catEducation: 'Educational Institutions', catServices: 'Service Providers',
    catManufacturers: 'Manufacturers',
    allCities: '📍 All Cities', clearFilter: '✕ Clear',
    noClientsInCity: (city) => `No clients found in ${city}.`,
    noClientsInCategory: 'No clients in this category yet.',
    verifiedBusinesses: 'Verified licensed businesses we promote',
    verified: '✓ Verified',
    followers: 'Followers', growth: 'Growth', engagement: 'Engagement',
    noClients: 'No clients yet.',

    // News
    newsTitle: 'News', latestUpdates: 'Latest updates and articles',
    readMore: 'Read More →', noNews: 'No articles yet.',
    loading: 'Loading...',
    sourceRef: '📎 Source / Reference →',
    categories: { General: 'General', Marketing: 'Marketing', Business: 'Business', Technology: 'Technology', News: 'News', Events: 'Events', Tips: 'Tips' },

    // About
    aboutTitle: 'About Us', aboutSub: 'We are',
    vision: 'Vision', mission: 'Mission',
    visionText: "To become Ethiopia's leading digital marketing and e-commerce solutions company dedicated to empowering MSMEs — All Things by All Things Solution.",
    missionText: 'To deliver innovative, affordable and measurable marketing and advertising solutions that help Ethiopian MSMEs grow sustainably.',
    coreValues: 'Core Values',
    strategicObjectives: 'Strategic Objectives',
    so1: 'Provide nationwide access to professional marketing services',
    so2: 'Support MSME growth through digital visibility and branding',
    so3: 'Utilize technology (website, mobile app, and social media) for service delivery',
    so4: 'Build long-term partnerships with MSMEs and institutions',
    so5: 'Create employment opportunities for skilled youth',

    // Contact
    contactTitle: 'Contact Us', contactSub: 'Ready to grow your business?',
    fullName: 'Full Name *', email: 'Email', phone: 'Phone *',
    company: 'Company Name', businessType: 'Business Type',
    tin: 'TIN Number', elmis: 'E-LMIS Registration',
    license: 'Business License', message: 'Message',
    submit: 'Submit Application →', submitting: 'Submitting...',
    successTitle: 'Message Sent!', successMsg: 'Thank you! We will contact you soon.',
    sendAnother: 'Send Another',
    licenseNote: '📋 Important: We only work with licensed businesses.',
    selectType: 'Select type...',

    // Register
    registerTitle: 'Create your business account',
    accountDetails: 'Account Details', businessInfo: 'Business Info', documents: 'Documents',
    namePlaceholder: 'Full Name *', passwordPlaceholder: 'Password *',
    confirmPassword: 'Confirm Password *', minPassword: 'Min. 6 characters',
    nextBusiness: 'Next: Business Info →', nextDocs: 'Next: Documents →',
    back: '← Back', createAccount: 'Create Account →', creating: 'Creating Account...',
    alreadyHave: 'Already have an account?',
    businessLicenseReq: 'Business license number is required.',
    licenseInfo: '📋 Your information will be reviewed by our team. You\'ll receive a welcome email after registration.',
    companyNameLabel: 'Company / Business Name *',
    businessTypeLabel2: 'Business Type',
    locationLabel: 'Location (City)',
    websiteLabel: 'Website (optional)',
    businessLicenseLabel: 'Business License Number *',
    tinLabel: 'TIN Number',
    elmisLabel: 'E-LMIS Registration',
    phoneLabel2: 'Phone Number *',
    emailLabel: 'Email Address (optional)',
    fullNameLabel: 'Full Name *',
    businessDocsTitle: 'Business Documents',
    businessDocsDesc: 'We only work with licensed businesses. Please provide your official document numbers.',
    fillRequired: 'Please fill all required fields.',
    passwordMismatch: 'Passwords do not match.',
    passwordShort: 'Password must be at least 6 characters.',
    companyRequired: 'Company name is required.',
    registrationFailed: 'Registration failed.',

    // Login
    loginTitle: 'Sign in to your account',
    phoneLabel: 'Phone Number',
    passwordLabel: 'Password',
    emailPlaceholder: 'your@email.com',
    loginBtn: 'Sign In →', loggingIn: 'Signing in...',
    noAccount: "Don't have an account?", registerBusiness: 'Register your business',
    loginFailed: 'Login failed.',

    // Dashboard
    myDashboardTitle: 'My Dashboard',
    underReview: 'Account Under Review',
    underReviewMsg: "Our team is reviewing your business information. We'll contact you within 1–2 business days.",
    profileTab: '👤 Profile', businessTab: '🏢 Business Info',
    socialTab: '📱 Social & Extra', passwordTab: '🔒 Password',
    saveChanges: 'Save Changes', saving: 'Saving...',
    profileUpdated: 'Profile updated successfully.',
    passwordChanged: 'Password changed successfully.',
    currentPassword: 'Current Password', newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    changePassword: 'Change Password',

    // Footer
    footerTagline: 'Digital Marketing & E-Commerce · Addis Ababa, Ethiopia',
    copyright: '© 2026 All Things Solution',

    // Client detail
    backToClients: '← Back to Clients',
    established: 'Established', location: 'Location',
    verifiedLicensed: 'Verified Licensed Business',
    licenseLabel: 'License',
    ourMarketingWork: 'Our Marketing Work',
    videoContent: 'Video Content',
    video: 'Video',
    watch: 'Watch ↗',
    businessTypeLabel: 'Business Type',
    contactSocial: 'Contact & Social Media',
    sourceRef: '📎 Source / Reference →',

    // Services
    service1Title: 'Social Media Management',
    service1Desc: 'Complete management of your social accounts',
    service2Title: 'Content Creation',
    service2Desc: 'Professional photos, videos & graphics',
    service3Title: 'Growth Strategy',
    service3Desc: 'Data-driven strategies for growth',
    service4Title: 'Paid Advertising',
    service4Desc: 'Targeted ads on all platforms',

    // Core values
    cv1Title: 'Innovation and Creativity', cv1Desc: 'We embrace new ideas and creative solutions',
    cv2Title: 'Customer-Centered Service', cv2Desc: "Our clients' success is at the heart of everything we do",
    cv3Title: 'Integrity and Transparency', cv3Desc: 'We operate with honesty and openness',
    cv4Title: 'Technology Adoption', cv4Desc: 'We leverage the latest digital tools',
    cv5Title: 'Results-Oriented Performance', cv5Desc: 'We focus on measurable outcomes',
  },

  am: {
    // Navbar
    home: 'ዋና ገጽ', clients: 'ደንበኞች', news: 'ዜና', about: 'ስለ እኛ',
    contact: 'ያግኙን', signIn: 'ግባ', register: 'ተመዝገብ',
    signOut: 'ውጣ', myDashboard: 'የእኔ ዳሽቦርድ', team: 'ቡድን',

    // Ad splash
    adOf: (i, n) => `ማስታወቂያ ${i} ከ ${n}`,
    watchAd: 'ለመቀጠል ማስታወቂያውን ይመልከቱ',
    secondsLeft: (s) => `${s} ሰከንድ ቀርቷል`,
    overall: 'አጠቃላይ', complete: 'ተጠናቋል',

    // Home
    heroTag: 'ፈቃድ ያላቸው ንግዶች ብቻ',
    heroTitle1: 'ለፈቃድ ያላቸው ንግዶች',
    heroTitle2: 'ዲጂታል ማርኬቲንግ እና ኢ-ኮሜርስ',
    heroDesc: 'ትክክለኛ የሶሻል ሚዲያ ተሳትፎ ለመፍጠር ከተረጋገጡ ፈቃድ ካላቸው ንግዶች ጋር ብቻ እንሰራለን።',
    // Links page
    linksTagline: 'ዲጂታል ማርኬቲንግ እና ኢ-ኮሜርስ · አዲስ አበባ፣ ኢትዮጵያ',
    linksDesc: 'ተረጋግጠው ፈቃድ ያላቸው ንግዶች በዲጂታል ማርኬቲንግ፣ ኢ-ኮሜርስ እና ትክክለኛ የሶሻል ሚዲያ ተሳትፎ እንዲያድጉ እንረዳለን።',
    linksWebsite: 'ድህረ ገጽ',
    applyNow: 'አሁን ያመልክቱ →',
    viewClients: 'ደንበኞችን ይመልከቱ',
    seeMore: 'እዚህ ጋ ይነልከቱ →',
    totalClients: 'ደንበኞች', licensed: 'ፈቃድ ያላቸው', avgGrowth: 'አማካይ እድገት',
    ourServices: 'አገልግሎቶቻችን',

    // Clients categories
    catAll: 'ሁሉም', catStartups: 'ስታርተፖች እና ስራ ፈጣሪዎች',
    catRetail: 'ችርቻሮ እና ጅምላ', catHospitality: 'ሆቴልና ቱሪዝም',
    catEducation: 'የትምህርት ተቋማት', catServices: 'አገልግሎት ሰጪዎች',
    catManufacturers: 'አምራቾች',
    allCities: '📍 ሁሉም ከተሞች', clearFilter: '✕ አጽዳ',
    noClientsInCity: (city) => `በ${city} ምንም ደንበኛ አልተገኘም።`,
    noClientsInCategory: 'በዚህ ምድብ ምንም ደንበኛ የለም።',

    // Clients
    ourClients: 'ደንበኞቻችን',
    verifiedBusinesses: 'የምናስተዋውቃቸው ተረጋግጠው ፈቃድ ያላቸው ንግዶች',
    verified: '✓ ተረጋግጧል',
    followers: 'ተከታዮች', growth: 'እድገት', engagement: 'ተሳትፎ',
    noClients: 'እስካሁን ደንበኞች የሉም።',

    // News
    newsTitle: 'ዜና', latestUpdates: 'የቅርብ ጊዜ ዜናዎች እና ጽሑፎች',
    readMore: 'ተጨማሪ ያንብቡ →', noNews: 'እስካሁን ጽሑፎች የሉም።',
    loading: 'በመጫን ላይ...',
    sourceRef: '📎 ምንጭ / ማጣቀሻ →',
    categories: { General: 'አጠቃላይ', Marketing: 'ማርኬቲንግ', Business: 'ንግድ', Technology: 'ቴክኖሎጂ', News: 'ዜና', Events: 'ዝግጅቶች', Tips: 'ምክሮች' },

    // About
    aboutTitle: 'ስለ እኛ', aboutSub: 'እኛ ነን',
    vision: 'ራዕይ', mission: 'ተልዕኮ',
    visionText: 'MSMEዎችን ለማብቃት ኢትዮጵያ ውስጥ ቀዳሚ የዲጂታል ማርኬቲንግ እና ማስታወቂያ ኩባንያ መሆን።',
    missionText: 'የኢትዮጵያ MSMEዎች ዘላቂ እድገት እንዲያሳኩ የሚረዱ ፈጠራዊ፣ ተመጣጣኝ እና ሊለካ የሚችሉ የማርኬቲንግ እና ማስታወቂያ መፍትሄዎችን ማቅረብ።',
    coreValues: 'መሰረታዊ እሴቶች',
    strategicObjectives: 'ስትራቴጂካዊ ዓላማዎች',
    so1: 'በሀገር አቀፍ ደረጃ ሙያዊ የማርኬቲንግ አገልግሎቶችን ማቅረብ',
    so2: 'MSMEዎችን በዲጂታል ታይነት እና ብራንዲንግ ማሳደግ',
    so3: 'ቴክኖሎጂን (ድህረ ገጽ፣ ሞባይል አፕ እና ሶሻል ሚዲያ) ለአገልግሎት አቅርቦት መጠቀም',
    so4: 'ከMSMEዎች እና ተቋማት ጋር የረጅም ጊዜ አጋርነት መገንባት',
    so5: 'ለተሰጠ ወጣቶች የስራ ዕድሎችን መፍጠር',

    // Contact
    contactTitle: 'ያግኙን', contactSub: 'ንግድዎን ለማሳደግ ዝግጁ ነዎት?',
    fullName: 'ሙሉ ስም *', email: 'ኢሜይል', phone: 'ስልክ *',
    company: 'የኩባንያ ስም', businessType: 'የንግድ አይነት',
    tin: 'TIN ቁጥር', elmis: 'E-LMIS ምዝገባ',
    license: 'የንግድ ፈቃድ', message: 'መልዕክት',
    submit: 'ማመልከቻ ያስገቡ →', submitting: 'በማስገባት ላይ...',
    successTitle: 'መልዕክት ተልኳል!', successMsg: 'እናመሰግናለን! በቅርቡ እናገኝዎታለን።',
    sendAnother: 'ሌላ ይላኩ',
    licenseNote: '📋 አስፈላጊ: ፈቃድ ካላቸው ንግዶች ጋር ብቻ እንሰራለን።',
    selectType: 'አይነት ይምረጡ...',

    // Register
    registerTitle: 'የንግድ መለያ ይፍጠሩ',
    accountDetails: 'የመለያ ዝርዝሮች', businessInfo: 'የንግድ መረጃ', documents: 'ሰነዶች',
    namePlaceholder: 'ሙሉ ስም *', passwordPlaceholder: 'የይለፍ ቃል *',
    confirmPassword: 'የይለፍ ቃል ያረጋግጡ *', minPassword: 'ቢያንስ 6 ቁምፊዎች',
    nextBusiness: 'ቀጣይ: የንግድ መረጃ →', nextDocs: 'ቀጣይ: ሰነዶች →',
    back: '← ተመለስ', createAccount: 'መለያ ፍጠር →', creating: 'መለያ በመፍጠር ላይ...',
    alreadyHave: 'አስቀድሞ መለያ አለዎት?',
    businessLicenseReq: 'የንግድ ፈቃድ ቁጥር ያስፈልጋል።',
    licenseInfo: '📋 መረጃዎ በቡድናችን ይገመገማል። ከተመዘገቡ በኋላ ኢሜይል ይደርስዎታል።',
    companyNameLabel: 'የኩባንያ / ንግድ ስም *',
    businessTypeLabel2: 'የንግድ አይነት',
    locationLabel: 'አካባቢ (ከተማ)',
    websiteLabel: 'ድህረ ገጽ (አማራጭ)',
    businessLicenseLabel: 'የንግድ ፈቃድ ቁጥር *',
    tinLabel: 'TIN ቁጥር',
    elmisLabel: 'E-LMIS ምዝገባ',
    phoneLabel2: 'ስልክ ቁጥር *',
    emailLabel: 'ኢሜይል (አማራጭ)',
    fullNameLabel: 'ሙሉ ስም *',
    businessDocsTitle: 'የንግድ ሰነዶች',
    businessDocsDesc: 'ፈቃድ ካላቸው ንግዶች ጋር ብቻ እንሰራለን። ኦፊሴላዊ ሰነድ ቁጥሮችዎን ያስገቡ።',
    fillRequired: 'ሁሉንም አስፈላጊ መስኮች ይሙሉ።',
    passwordMismatch: 'የይለፍ ቃሎቹ አይዛመዱም።',
    passwordShort: 'የይለፍ ቃሉ ቢያንስ 6 ቁምፊዎች መሆን አለበት።',
    companyRequired: 'የኩባንያ ስም ያስፈልጋል።',
    registrationFailed: 'ምዝገባ አልተሳካም።',

    // Login
    loginTitle: 'ወደ መለያዎ ይግቡ',
    phoneLabel: 'ስልክ ቁጥር',
    passwordLabel: 'የይለፍ ቃል',
    emailPlaceholder: 'your@email.com',
    loginBtn: 'ግባ →', loggingIn: 'በመግባት ላይ...',
    noAccount: 'መለያ የለዎትም?', registerBusiness: 'ንግድዎን ይመዝግቡ',
    loginFailed: 'መግባት አልተሳካም።',

    // Dashboard
    myDashboardTitle: 'የእኔ ዳሽቦርድ',
    underReview: 'መለያ በግምገማ ላይ',
    underReviewMsg: 'ቡድናችን የንግድ መረጃዎን እየገመገመ ነው። በ1-2 የስራ ቀናት ውስጥ እናገኝዎታለን።',
    profileTab: '👤 መገለጫ', businessTab: '🏢 የንግድ መረጃ',
    socialTab: '📱 ሶሻል እና ተጨማሪ', passwordTab: '🔒 የይለፍ ቃል',
    saveChanges: 'ለውጦችን አስቀምጥ', saving: 'በማስቀመጥ ላይ...',
    profileUpdated: 'መገለጫ በተሳካ ሁኔታ ተዘምኗል።',
    passwordChanged: 'የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል።',
    currentPassword: 'የአሁኑ የይለፍ ቃል', newPassword: 'አዲስ የይለፍ ቃል',
    confirmNewPassword: 'አዲስ የይለፍ ቃል ያረጋግጡ',
    changePassword: 'የይለፍ ቃል ቀይር',

    // Footer
    footerTagline: 'ዲጂታል ማርኬቲንግ እና ኢ-ኮሜርስ · አዲስ አበባ፣ ኢትዮጵያ',
    copyright: '© 2026 ኦል ቲንግስ በ ኦል ቲንግስ ሶሉሽን',

    // Client detail
    backToClients: '← ወደ ደንበኞች ተመለስ',
    established: 'የተቋቋመበት', location: 'አካባቢ',
    verifiedLicensed: 'ተረጋግጦ ፈቃድ ያለው ንግድ',
    licenseLabel: 'ፈቃድ',
    ourMarketingWork: 'የእኛ የማርኬቲንግ ስራ',
    videoContent: 'የቪዲዮ ይዘት',
    video: 'ቪዲዮ',
    watch: 'ይመልከቱ ↗',
    businessTypeLabel: 'የንግድ አይነት',
    contactSocial: 'ያግኙን እና ሶሻል ሚዲያ',
    sourceRef: '📎 ምንጭ / ማጣቀሻ →',

    // Services
    service1Title: 'የሶሻል ሚዲያ አስተዳደር',
    service1Desc: 'የሶሻል ሚዲያ መለያዎችዎን ሙሉ አስተዳደር',
    service2Title: 'ይዘት መፍጠር',
    service2Desc: 'ሙያዊ ፎቶዎች፣ ቪዲዮዎች እና ግራፊክስ',
    service3Title: 'የዕድገት ስትራቴጂ',
    service3Desc: 'ለዕድገት የውሂብ ላይ የተመሰረቱ ስትራቴጂዎች',
    service4Title: 'የሚከፈልበት ማስታወቂያ',
    service4Desc: 'በሁሉም መድረኮች ላይ ዒላማ ያደረጉ ማስታወቂያዎች',

    // Core values
    cv1Title: 'ፈጠራ እና ፈጠራ', cv1Desc: 'አዳዲስ ሀሳቦችን እና ፈጠራ መፍትሄዎችን እንቀበላለን',
    cv2Title: 'ደንበኛ ማዕከላዊ አገልግሎት', cv2Desc: 'የደንበኞቻችን ስኬት ለሁሉም ነገር ማዕከል ነው',
    cv3Title: 'ታማኝነት እና ግልጽነት', cv3Desc: 'በታማኝነት እና ግልጽነት እንሰራለን',
    cv4Title: 'ቴክኖሎጂ ተቀባይነት', cv4Desc: 'የቅርብ ጊዜ ዲጂታል መሳሪያዎችን እንጠቀማለን',
    cv5Title: 'ውጤት ተኮር አፈጻጸም', cv5Desc: 'ሊለካ በሚችሉ ውጤቶች ላይ እናተኩራለን',
  },

  or: {
    // Navbar
    home: 'Fuula Dura', clients: 'Maamiltoota', news: 'Oduu', about: "Waa'ee Keenya",
    contact: 'Nu Quunnamaa', signIn: 'Seeni', register: "Galmaa'i",
    signOut: "Ba'i", myDashboard: 'Daashboordii Koo', team: 'Garee',

    // Ad splash
    adOf: (i, n) => `Beeksisa ${i} kan ${n}`,
    watchAd: 'Itti fufuuf beeksisa ilaali',
    secondsLeft: (s) => `Sekoondii ${s} hafee`,
    overall: 'Waliigala', complete: 'xumurame',

    // Home
    heroTag: 'Daldala Hayyama Qabaniif Qofa',
    heroTitle1: 'Daldala Hayyama Qabaniif',
    heroTitle2: 'Maarketiingii Dijitaalaa fi E-Commerce',
    heroDesc: 'Argama miidiyaa hawaasaa dhugaa uumuuf daldala hayyama qaban qofa waliin hojjenna.',
    // Links page
    linksTagline: 'Maarketiingii Dijitaalaa fi E-Commerce · Finfinnee, Itoophiyaa',
    linksDesc: 'Daldala hayyama qaban mirkana\'ame maarketiingii dijitaalaa, furmaata e-commerce fi argama miidiyaa hawaasaa dhugaa dhaan guddifna.',
    linksWebsite: 'Marsariitii',
    applyNow: 'Amma Iyyaddhu →',
    viewClients: 'Maamiltoota Ilaali',
    seeMore: 'Dabalata Ilaali →',
    totalClients: 'Maamiltoota', licensed: 'Hayyama Qaban', avgGrowth: 'Guddina Giddu-galeessaa',
    ourServices: 'Tajaajila Keenya',

    // Clients categories
    catAll: 'Hunda', catStartups: 'Dhaabbilee Haaraa',
    catRetail: 'Daldala Xiqqaa fi Guddaa', catHospitality: 'Keessummaa fi Turizimii',
    catEducation: 'Dhaabbilee Barnootaa', catServices: 'Dhiyeessitootaa Tajaajilaa',
    catManufacturers: 'Warshaalee',
    allCities: '📍 Magaalota Hunda', clearFilter: '✕ Haqi',
    noClientsInCity: (city) => `${city} keessatti maamiltoota hin argamne.`,
    noClientsInCategory: 'Ammaaf maamiltoonni kutaa kana keessa hin jiran.',

    // Clients
    ourClients: 'Maamiltoota Keenya',
    verifiedBusinesses: "Daldala mirkana'e hayyama qaban kan beeksifnu",
    verified: "✓ Mirkana'e",
    followers: 'Hordoftootaa', growth: 'Guddina', engagement: 'Hirmaannaa',
    noClients: 'Ammaaf maamiltoota hin jiran.',

    // News
    newsTitle: 'Oduu', latestUpdates: 'Oduu fi barreeffama haaraa',
    readMore: 'Dabalata Dubbisi →', noNews: 'Ammaaf barreeffamni hin jiru.',
    loading: "Fe'aa jira...",
    sourceRef: '📎 Madda / Wabii →',
    categories: { General: 'Waliigala', Marketing: 'Maarketiingii', Business: 'Daldala', Technology: 'Teeknooloojii', News: 'Oduu', Events: 'Taateewwan', Tips: 'Gorsa' },

    // About
    aboutTitle: "Waa'ee Keenya", aboutSub: 'Nuti',
    vision: "Mul'ata", mission: 'Ergama',
    visionText: "MSME-oota gargaaruuf Itoophiyaa keessatti dhaabbata maarketiingii dijitaalaa fi beeksisaa duraa ta'uu.",
    missionText: "MSME-oota Itoophiyaa guddina waaraa argachuuf gargaaran furmaata maarketiingii fi beeksisaa haaraa, gatii madaalawaa fi safaramuu danda'u dhiyeessuu.",
    coreValues: "Gatii Bu'uuraa",
    strategicObjectives: 'Kaayyoo Tarsiimoo',
    so1: 'Tajaajila maarketiingii ogummaa qabu biyyatti guutuu dhiyeessuu',
    so2: 'Guddina MSME argamummaa dijitaalaa fi braadingiitiin deeggaruu',
    so3: 'Teeknooloojii (marsariitii, app mobaayilii fi miidiyaa hawaasaa) tajaajila dhiyeessuuf fayyadamuu',
    so4: 'Hirmaannaa dheeraa MSME-oota fi dhaabbilee waliin ijaaruu',
    so5: 'Carraa hojii dargaggoota dandeettii qabaniif uumuu',

    // Contact
    contactTitle: 'Nu Quunnamaa', contactSub: 'Daldalakee guddisuuf qophii dha?',
    fullName: 'Maqaa Guutuu *', email: 'Imeelii', phone: 'Bilbila *',
    company: 'Maqaa Dhaabbata', businessType: 'Gosa Daldala',
    tin: 'Lakkoofsa TIN', elmis: 'Galmee E-LMIS',
    license: 'Hayyama Daldala', message: 'Ergaa',
    submit: 'Iyyannoo Galchi →', submitting: 'Galchaa jira...',
    successTitle: 'Ergaan Ergame!', successMsg: 'Galatoomaa! Dafnee si quunnamna.',
    sendAnother: 'Biraa Ergi',
    licenseNote: '📋 Barbaachisaa: Daldala hayyama qaban qofa waliin hojjenna.',
    selectType: 'Gosa filadhu...',

    // Register
    registerTitle: 'Herrega daldala kee uumi',
    accountDetails: "Bal'ina Herregaa", businessInfo: 'Odeeffannoo Daldala', documents: 'Sanadoota',
    namePlaceholder: 'Maqaa Guutuu *', passwordPlaceholder: 'Jecha Darbii *',
    confirmPassword: 'Jecha Darbii Mirkaneessi *', minPassword: 'Xiqqaate qubee 6',
    nextBusiness: 'Itti aanaa: Odeeffannoo Daldala →', nextDocs: 'Itti aanaa: Sanadoota →',
    back: "← Deebi'i", createAccount: 'Herrega Uumi →', creating: 'Herrega uumaa jira...',
    alreadyHave: 'Herrega qabdaa?',
    businessLicenseReq: 'Lakkoofsa hayyama daldala barbaachisaadha.',
    licenseInfo: '📋 Odeeffannoon kee garee keenya ni madaalama. Galmee booda imeelii siif ergama.',
    companyNameLabel: 'Maqaa Dhaabbata / Daldala *',
    businessTypeLabel2: 'Gosa Daldala',
    locationLabel: 'Bakka (Magaalaa)',
    websiteLabel: 'Marsariitii (dirqama miti)',
    businessLicenseLabel: 'Lakkoofsa Hayyama Daldala *',
    tinLabel: 'Lakkoofsa TIN',
    elmisLabel: 'Galmee E-LMIS',
    phoneLabel2: 'Lakkoofsa Bilbilaa *',
    emailLabel: 'Imeelii (dirqama miti)',
    fullNameLabel: 'Maqaa Guutuu *',
    businessDocsTitle: 'Sanadoota Daldala',
    businessDocsDesc: 'Daldala hayyama qaban qofa waliin hojjenna. Lakkoofsa sanadaa mirkaneessaa galchi.',
    fillRequired: 'Dirreewwan barbaachisoo hunda guuti.',
    passwordMismatch: 'Jechoonni darbii wal hin simatan.',
    passwordShort: 'Jecha darbii xiqqaate qubee 6 qabaachuu qaba.',
    companyRequired: 'Maqaa dhaabbata barbaachisaadha.',
    registrationFailed: "Galmaa'uu hin milkoofne.",

    // Login
    loginTitle: 'Herrega kee seeni',
    phoneLabel: 'Lakkoofsa Bilbilaa',
    passwordLabel: 'Jecha Darbii',
    emailPlaceholder: 'your@email.com',
    loginBtn: 'Seeni →', loggingIn: 'Seenaa jira...',
    noAccount: 'Herrega hin qabduu?', registerBusiness: 'Daldala kee galmeessi',
    loginFailed: 'Seenuu hin milkoofne.',

    // Dashboard
    myDashboardTitle: 'Daashboordii Koo',
    underReview: 'Herregni Madaallii Jala Jira',
    underReviewMsg: 'Gareen keenya odeeffannoo daldala kee madaalaa jira. Guyyaa hojii 1-2 keessatti si quunnamna.',
    profileTab: '👤 Profaayilii', businessTab: '🏢 Odeeffannoo Daldala',
    socialTab: '📱 Hawaasaa fi Dabalata', passwordTab: '🔒 Jecha Darbii',
    saveChanges: 'Jijjiirama Kuusi', saving: 'Kuusaa jira...',
    profileUpdated: "Profaayiliin milkaa'inaan haaromfame.",
    passwordChanged: "Jecha darbiin milkaa'inaan jijjiirameera.",
    currentPassword: 'Jecha Darbii Ammaa', newPassword: 'Jecha Darbii Haaraa',
    confirmNewPassword: 'Jecha Darbii Haaraa Mirkaneessi',
    changePassword: 'Jecha Darbii Jijjiiri',

    // Footer
    footerTagline: 'Maarketiingii Dijitaalaa fi E-Commerce · Finfinnee, Itoophiyaa',
    copyright: '© 2026 All Things by All Things Solution',

    // Client detail
    backToClients: "← Gara Maamiltoota Deebi'i",
    established: 'Hundeeffame', location: 'Bakka',
    verifiedLicensed: "Daldala Mirkana'e Hayyama Qabu",
    licenseLabel: 'Hayyama',
    ourMarketingWork: 'Hojii Maarketiingii Keenya',
    videoContent: 'Qabiyyee Viidiyoo',
    video: 'Viidiyoo',
    watch: 'Ilaali ↗',
    businessTypeLabel: 'Gosa Daldala',
    contactSocial: 'Nu Quunnamaa fi Miidiyaa Hawaasaa',
    sourceRef: '📎 Madda / Wabii →',

    // Services
    service1Title: 'Bulchiinsa Miidiyaa Hawaasaa',
    service1Desc: 'Bulchiinsa guutuu herreega miidiyaa hawaasaa keessan',
    service2Title: 'Uumuu Qabiyyee',
    service2Desc: 'Suuraa, viidiyoo fi graafiiksii ogummaa qabu',
    service3Title: 'Tarsiimoo Guddina',
    service3Desc: "Tarsiimoo guddina irratti hundaa'e",
    service4Title: 'Beeksisa Kaffalamu',
    service4Desc: 'Beeksisa kaayyoo qabu marsaalee hunda irratti',

    // Core values
    cv1Title: 'Haaroomsa fi Uumamummaa', cv1Desc: 'Yaada haaraa fi furmaata uumamaa simanna',
    cv2Title: 'Tajaajila Maamilaa Giddugaleessa', cv2Desc: "Milkaa'ina maamiltoota keenya hundaaf giddugaleessa",
    cv3Title: 'Amanamummaa fi Iftoominaa', cv3Desc: 'Amanamummaa fi iftoominaan hojjenna',
    cv4Title: 'Fudhannaa Teeknooloojii', cv4Desc: 'Meeshaalee dijitaalaa haaraa fayyadamna',
    cv5Title: "Raawwii Bu'aa Xiyyeeffate", cv5Desc: "Bu'aa safaramuu danda'u irratti xiyyeeffanna",
  },
};

export default translations;
