import { createContext, useContext, useState } from 'react'

const translations = {
  en: {
    // Navigation
    home: 'Home',
    about: 'About',
    ourClients: 'Our Clients',
    contact: 'Contact',
    login: 'Login',
    register: 'Register',
    
    // Home Page
    licensedOnly: 'Licensed Businesses Only',
    heroTitle1: 'Social Media Marketing for',
    heroTitle2: 'Licensed Businesses',
    heroDesc: 'We exclusively partner with verified, licensed businesses to create authentic social media presence.',
    getStarted: 'Get Started',
    viewClients: 'View Our Clients',
    clients: 'Clients',
    licensed: 'Licensed',
    avgGrowth: 'Avg Growth',
    ourServices: 'Our Services',
    socialMediaMgmt: 'Social Media Management',
    socialMediaMgmtDesc: 'Complete management of your social accounts',
    contentCreation: 'Content Creation',
    contentCreationDesc: 'Professional photos, videos & graphics',
    growthStrategy: 'Growth Strategy',
    growthStrategyDesc: 'Data-driven strategies for growth',
    paidAds: 'Paid Advertising',
    paidAdsDesc: 'Targeted ads on all platforms',
    
    // About Page
    aboutUs: 'About Us',
    weAre: 'We are',
    marketingAgency: 'Marketing Agency',
    ourMission: 'Our Mission',
    ourVision: 'Our Vision',
    missionDesc: 'To empower Ethiopian Small and Medium Enterprises (ESMEs) by providing comprehensive digital marketing solutions that enhance their online presence, drive customer engagement, and accelerate business growth through innovative and results-driven strategies.',
    visionDesc: 'To be the leading digital marketing agency in Ethiopia, recognized for transforming ESMEs into digitally empowered businesses that thrive in the modern marketplace and contribute significantly to the country\'s economic development.',
    whyLicensed: 'Why Licensed Businesses?',
    verification: 'Verification',
    verificationDesc: 'We verify all trade licenses before partnership',
    trust: 'Trust',
    trustDesc: 'Build authentic relationships with real businesses',
    quality: 'Quality',
    qualityDesc: 'Deliver premium results for legitimate companies',
    compliance: 'Compliance',
    complianceDesc: 'Ensure all marketing follows regulations',
    ourValues: 'Our Values',
    excellence: 'Excellence',
    integrity: 'Integrity',
    innovation: 'Innovation',
    partnership: 'Partnership',
    
    // Clients Page
    businessesWePromote: 'Businesses We Promote',
    everyBusinessVerified: 'Every business below has been verified with valid trade licenses.',
    verifiedBusinesses: '100% Verified Businesses',
    allClientsVerified: 'All clients have submitted valid trade licenses verified by our team',
    verifiedLicensed: 'Verified Licensed Business',
    followers: 'Followers',
    growth: 'Growth',
    engagement: 'Engagement',
    wantToJoin: 'Want to Join Our',
    verifiedNetwork: 'Verified Network',
    ifYouHaveLicense: 'If you have a licensed business, we\'d love to work with you.',
    applyNow: 'Apply Now',
    
    // Client Detail
    backToClients: '← Back to All Clients',
    established: 'Established',
    location: 'Location',
    employees: 'Employees',
    industry: 'Industry',
    allDocsVerified: 'All documents verified',
    licenseType: 'License Type',
    licenseNumber: 'License Number',
    issueDate: 'Issue Date',
    expiryDate: 'Expiry Date',
    status: 'Status',
    activeVerified: 'Active & Verified',
    businessContact: 'Business Contact',
    
    // Contact Page
    contactUs: 'Contact Us',
    letsWorkTogether: "Let's Work Together",
    readyToGrow: 'Ready to grow your licensed business on social media?',
    emailUs: 'Email Us',
    callUs: 'Call Us',
    visitUs: 'Visit Us',
    workingHours: 'Working Hours',
    monFri: 'Mon - Fri: 9AM - 6PM',
    sendMessage: 'Send Us a Message',
    fillForm: 'Fill out the form below and we\'ll get back to you.',
    yourName: 'Your Name',
    emailAddress: 'Email Address',
    phoneNumber: 'Phone Number',
    businessType: 'Business Type',
    selectIndustry: 'Select your industry',
    companyName: 'Company / Business Name',
    tellUsAbout: 'Tell Us About Your Business',
    describeYourBusiness: 'Describe your business...',
    important: 'Important:',
    onlyLicensed: 'We only work with licensed businesses.',
    submitApplication: 'Submit Application →',
    thankYou: 'Thank you! Your message has been received. We will contact you soon.',
    
    // Business Types
    furnitureStore: 'Furniture Store',
    medicalClinic: 'Medical Clinic',
    supermarket: 'Supermarket / Retail',
    restaurant: 'Restaurant / Cafe',
    beautySalon: 'Beauty Salon',
    fitnessCenter: 'Fitness Center',
    otherBusiness: 'Other Licensed Business',
    
    // Login/Register
    welcomeBack: 'Welcome Back',
    loginToContact: 'Login to contact us or apply for our services',
    password: 'Password',
    forgotPassword: 'Forgot your password?',
    dontHaveAccount: "Don't have an account?",
    registerHere: 'Register here',
    createAccount: 'Create Account',
    registerToContact: 'Register to contact us or apply for our services',
    comingSoon: 'Coming Soon',
    comingSoonMsg: 'Registration will be available when we launch the full site.',
    fullName: 'Full Name',
    confirmPassword: 'Confirm Password',
    alreadyHaveAccount: 'Already have an account?',
    loginHere: 'Login here',
    forgotPasswordTitle: 'Forgot Password',
    enterEmailReset: "Enter your email and we'll send you a reset link",
    sendResetLink: 'Send Reset Link',
    resetLinkSent: 'If an account exists with this email, you will receive a password reset link.',
    backToLogin: 'Back to Login',
    
    // Footer
    premiumMarketing: 'Premium social media marketing for licensed businesses.',
    pages: 'Pages',
    services: 'Services',
    socialMedia: 'Social Media',
    allRightsReserved: 'All rights reserved.',
    
    // Chat Support
    customerSupport: 'Customer Support',
    online: 'Online',
    typeMessage: 'Type a message...',
    chatWelcome: 'Hi! Welcome to All Things Marketing. How can we help you today?',
    
    // News Page
    news: 'News',
    techNews: 'Technology News',
    latestTech: 'Latest Technology Updates from Ethiopia',
    readMore: 'Read More',
    
    // Updated ESMEs
    esmes: 'ESMEs',
    supportingEsmes: 'Supporting Ethiopian Small and Medium Enterprises',
  },
  am: {
    // Navigation
    home: 'መነሻ',
    about: 'ስለ እኛ',
    ourClients: 'ደንበኞቻችን',
    contact: 'አግኙን',
    login: 'ግባ',
    register: 'ተመዝገብ',
    
    // Home Page
    licensedOnly: 'ፈቃድ ያላቸው ንግዶች ብቻ',
    heroTitle1: 'ለፈቃድ ያላቸው ንግዶች',
    heroTitle2: 'ማህበራዊ ሚዲያ ግብይት',
    heroDesc: 'ከተረጋገጡ እና ፈቃድ ካላቸው ንግዶች ጋር ብቻ በመተባበር ትክክለኛ የማህበራዊ ሚዲያ መገኘት እንፈጥራለን።',
    getStarted: 'ጀምር',
    viewClients: 'ደንበኞቻችንን ይመልከቱ',
    clients: 'ደንበኞች',
    licensed: 'ፈቃድ ያላቸው',
    avgGrowth: 'አማካይ እድገት',
    ourServices: 'አገልግሎቶቻችን',
    socialMediaMgmt: 'የማህበራዊ ሚዲያ አስተዳደር',
    socialMediaMgmtDesc: 'የማህበራዊ ሚዲያ አካውንቶችዎን ሙሉ በሙሉ እናስተዳድራለን',
    contentCreation: 'ይዘት መፍጠር',
    contentCreationDesc: 'ፕሮፌሽናል ፎቶዎች፣ ቪዲዮዎች እና ግራፊክስ',
    growthStrategy: 'የእድገት ስትራቴጂ',
    growthStrategyDesc: 'በመረጃ ላይ የተመሰረተ የእድገት ስትራቴጂ',
    paidAds: 'የሚከፈልበት ማስታወቂያ',
    paidAdsDesc: 'በሁሉም መድረኮች ላይ ያነጣጠሩ ማስታወቂያዎች',
    
    // About Page
    aboutUs: 'ስለ እኛ',
    weAre: 'እኛ',
    marketingAgency: 'የግብይት ኤጀንሲ ነን',
    ourMission: 'ተልዕኮአችን',
    ourVision: 'ራዕያችን',
    missionDesc: 'የኢትዮጵያ ትናንሽ እና መካከለኛ ኢንተርፕራይዞችን (ኢኤስኤምኢዎች) የመስመር ላይ መገኘታቸውን የሚያሳድግ፣ የደንበኞች ተሳትፎን የሚያበረታታ እና አዳዲስ እና ውጤታማ ስትራቴጂዎችን በመጠቀም የንግድ እድገትን የሚያፋጥን ሁሉን አቀፍ የዲጂታል ማርኬቲንግ መፍትሄዎችን በመስጠት ማጎልበት።',
    visionDesc: 'ኢኤስኤምኢዎችን በዘመናዊ ገበያ ውስጥ የሚበለጽጉ እና ለሀገሪቱ ኢኮኖሚያዊ ልማት ከፍተኛ አስተዋጽኦ የሚያደርጉ በዲጂታል የተጎለበቱ ንግዶች ወደ መቀየር በሚታወቅ በኢትዮጵያ ውስጥ ግንባር ቀደም የዲጂታል ማርኬቲንግ ኤጀንሲ መሆን።',
    whyLicensed: 'ለምን ፈቃድ ያላቸው ንግዶች?',
    verification: 'ማረጋገጫ',
    verificationDesc: 'ከሽርክና በፊት ሁሉንም የንግድ ፈቃዶች እናረጋግጣለን',
    trust: 'እምነት',
    trustDesc: 'ከእውነተኛ ንግዶች ጋር ትክክለኛ ግንኙነት እንገነባለን',
    quality: 'ጥራት',
    qualityDesc: 'ለህጋዊ ኩባንያዎች ከፍተኛ ጥራት ያለው ውጤት እናቀርባለን',
    compliance: 'ተገዢነት',
    complianceDesc: 'ሁሉም ግብይት ደንቦችን መከተሉን እናረጋግጣለን',
    ourValues: 'እሴቶቻችን',
    excellence: 'ልቀት',
    integrity: 'ታማኝነት',
    innovation: 'ፈጠራ',
    partnership: 'ሽርክና',
    
    // Clients Page
    businessesWePromote: 'የምናስተዋውቃቸው ንግዶች',
    everyBusinessVerified: 'ከዚህ በታች ያሉት ሁሉም ንግዶች በትክክለኛ የንግድ ፈቃድ ተረጋግጠዋል።',
    verifiedBusinesses: '100% የተረጋገጡ ንግዶች',
    allClientsVerified: 'ሁሉም ደንበኞች በቡድናችን የተረጋገጡ ትክክለኛ የንግድ ፈቃዶች አቅርበዋል',
    verifiedLicensed: 'የተረጋገጠ ፈቃድ ያለው ንግድ',
    followers: 'ተከታዮች',
    growth: 'እድገት',
    engagement: 'ተሳትፎ',
    wantToJoin: 'መቀላቀል ይፈልጋሉ',
    verifiedNetwork: 'የተረጋገጠ አውታረ መረብ',
    ifYouHaveLicense: 'ፈቃድ ያለው ንግድ ካለዎት፣ ከእርስዎ ጋር መስራት እንፈልጋለን።',
    applyNow: 'አሁን ያመልክቱ',
    
    // Client Detail
    backToClients: '← ወደ ሁሉም ደንበኞች ተመለስ',
    established: 'የተቋቋመበት',
    location: 'አድራሻ',
    employees: 'ሰራተኞች',
    industry: 'ኢንዱስትሪ',
    allDocsVerified: 'ሁሉም ሰነዶች ተረጋግጠዋል',
    licenseType: 'የፈቃድ አይነት',
    licenseNumber: 'የፈቃድ ቁጥር',
    issueDate: 'የተሰጠበት ቀን',
    expiryDate: 'የሚያበቃበት ቀን',
    status: 'ሁኔታ',
    activeVerified: 'ንቁ እና የተረጋገጠ',
    businessContact: 'የንግድ አድራሻ',
    
    // Contact Page
    contactUs: 'አግኙን',
    letsWorkTogether: 'አብረን እንስራ',
    readyToGrow: 'ፈቃድ ያለው ንግድዎን በማህበራዊ ሚዲያ ላይ ለማሳደግ ዝግጁ ነዎት?',
    emailUs: 'ኢሜይል ይላኩልን',
    callUs: 'ይደውሉልን',
    visitUs: 'ይጎብኙን',
    workingHours: 'የስራ ሰዓት',
    monFri: 'ሰኞ - አርብ: 9AM - 6PM',
    sendMessage: 'መልዕክት ይላኩልን',
    fillForm: 'ከዚህ በታች ያለውን ቅጽ ይሙሉ እና እናገኝዎታለን።',
    yourName: 'ስምዎ',
    emailAddress: 'ኢሜይል አድራሻ',
    phoneNumber: 'ስልክ ቁጥር',
    businessType: 'የንግድ አይነት',
    selectIndustry: 'ኢንዱስትሪዎን ይምረጡ',
    companyName: 'የኩባንያ / የንግድ ስም',
    tellUsAbout: 'ስለ ንግድዎ ይንገሩን',
    describeYourBusiness: 'ንግድዎን ይግለጹ...',
    important: 'አስፈላጊ:',
    onlyLicensed: 'ከፈቃድ ካላቸው ንግዶች ጋር ብቻ እንሰራለን።',
    submitApplication: 'ማመልከቻ ያስገቡ →',
    thankYou: 'እናመሰግናለን! መልዕክትዎ ደርሶናል። በቅርቡ እናገኝዎታለን።',
    
    // Business Types
    furnitureStore: 'የቤት እቃ መደብር',
    medicalClinic: 'የህክምና ክሊኒክ',
    supermarket: 'ሱፐርማርኬት / ችርቻሮ',
    restaurant: 'ምግብ ቤት / ካፌ',
    beautySalon: 'የውበት ሳሎን',
    fitnessCenter: 'የአካል ብቃት ማዕከል',
    otherBusiness: 'ሌላ ፈቃድ ያለው ንግድ',
    
    // Login/Register
    welcomeBack: 'እንኳን ደህና መጡ',
    loginToContact: 'ለማግኘት ወይም ለአገልግሎታችን ለማመልከት ይግቡ',
    password: 'የይለፍ ቃል',
    forgotPassword: 'የይለፍ ቃልዎን ረሱ?',
    dontHaveAccount: 'አካውንት የለዎትም?',
    registerHere: 'እዚህ ይመዝገቡ',
    createAccount: 'አካውንት ይፍጠሩ',
    registerToContact: 'ለማግኘት ወይም ለአገልግሎታችን ለማመልከት ይመዝገቡ',
    comingSoon: 'በቅርቡ ይመጣል',
    comingSoonMsg: 'ሙሉ ድረ-ገጹን ስንጀምር ምዝገባ ይገኛል።',
    fullName: 'ሙሉ ስም',
    confirmPassword: 'የይለፍ ቃል ያረጋግጡ',
    alreadyHaveAccount: 'አካውንት አለዎት?',
    loginHere: 'እዚህ ይግቡ',
    forgotPasswordTitle: 'የይለፍ ቃል ረሱ',
    enterEmailReset: 'ኢሜይልዎን ያስገቡ እና የይለፍ ቃል ዳግም ማስጀመሪያ ሊንክ እንልክልዎታለን',
    sendResetLink: 'ሊንክ ላክ',
    resetLinkSent: 'በዚህ ኢሜይል አካውንት ካለ፣ የይለፍ ቃል ዳግም ማስጀመሪያ ሊንክ ይደርስዎታል።',
    backToLogin: 'ወደ መግቢያ ተመለስ',
    
    // Footer
    premiumMarketing: 'ለፈቃድ ያላቸው ንግዶች ከፍተኛ ጥራት ያለው የማህበራዊ ሚዲያ ግብይት።',
    pages: 'ገጾች',
    services: 'አገልግሎቶች',
    socialMedia: 'ማህበራዊ ሚዲያ',
    allRightsReserved: 'መብቱ በህግ የተጠበቀ ነው።',
    
    // Chat Support
    customerSupport: 'የደንበኛ ድጋፍ',
    online: 'መስመር ላይ',
    typeMessage: 'መልዕክት ይጻፉ...',
    chatWelcome: 'ሰላም! ወደ All Things Marketing እንኳን ደህና መጡ። ዛሬ እንዴት ልንረዳዎ እንችላለን?',
    
    // News Page
    news: 'ዜና',
    techNews: 'የቴክኖሎጂ ዜና',
    latestTech: 'ከኢትዮጵያ የቅርብ ጊዜ የቴክኖሎጂ ዜናዎች',
    readMore: 'ተጨማሪ ያንብቡ',
    
    // Updated ESMEs
    esmes: 'ኢኤስኤምኢዎች',
    supportingEsmes: 'የኢትዮጵያ ትናንሽ እና መካከለኛ ኢንተርፕራይዞችን መደገፍ',
  },
  or: {
    // Navigation
    home: 'Mana',
    about: 'Waaʼee Keenya',
    ourClients: 'Maamiltoota Keenya',
    contact: 'Nu Qunnamaa',
    login: 'Seeni',
    register: 'Galmaaʼi',
    
    // Home Page
    licensedOnly: 'Daldala Hayyama Qaban Qofa',
    heroTitle1: 'Gabaa Hawaasaa Daldala',
    heroTitle2: 'Hayyama Qabaniif',
    heroDesc: 'Daldala hayyama qabanii fi mirkaneeffaman qofa waliin tumsuun dhugaa taʼe gabaa hawaasaa uumna.',
    getStarted: 'Jalqabi',
    viewClients: 'Maamiltoota Keenya Ilaali',
    clients: 'Maamiltoota',
    licensed: 'Hayyama Qaban',
    avgGrowth: 'Guddina Giddugaleessaa',
    ourServices: 'Tajaajila Keenya',
    socialMediaMgmt: 'Bulchiinsa Gabaa Hawaasaa',
    socialMediaMgmtDesc: 'Akkaawuntii gabaa hawaasaa keessanii guutummaatti bulchina',
    contentCreation: 'Qabiyyee Uumuu',
    contentCreationDesc: 'Suuraa, viidiyoo fi giraafiiksii ogummaa',
    growthStrategy: 'Tarsiimoo Guddina',
    growthStrategyDesc: 'Daataa irratti hundaaʼe tarsiimoo guddina',
    paidAds: 'Beeksisa Kaffaltii',
    paidAdsDesc: 'Waltajjii hunda irratti beeksisa xiyyeeffannoo',
    
    // About Page
    aboutUs: 'Waaʼee Keenya',
    weAre: 'Nu',
    marketingAgency: 'Eejensii Gabaa dha',
    ourMission: 'Ergama Keenya',
    ourVision: 'Mul\'ata Keenya',
    missionDesc: 'Dhaabbilee Xixiqqoo fi Giddugaleessaa Itoophiyaa (IIESMIiwwan) furmaata gabaa dijitaalaa bal\'aa kennuudhaan argama isaanii toora irratti guddisuu, hirmaannaa maamilaa kakaasuu fi tooftaalee haaraa fi bu\'aa qabeessa ta\'aniin guddina daldalaa saffisisuun jajjabeessuu.',
    visionDesc: 'IIESMIiwwan gara daldala dijitaalin jajjabeeffamanii gabaa ammayyaa keessatti milkaa\'anii fi guddina dinagdee biyyattiif gumaacha guddaa godhan jijjiiruun beekamuu fi Itoophiyaa keessatti eejensii gabaa dijitaalaa dura dhaabbataa ta\'uu.',
    whyLicensed: 'Maaliif Daldala Hayyama Qaban?',
    verification: 'Mirkaneessa',
    verificationDesc: 'Tumsa dura hayyama daldala hunda ni mirkaneessina',
    trust: 'Amanamummaa',
    trustDesc: 'Daldala dhugaa waliin hariiroo amanamaa ijaarru',
    quality: 'Qulqullina',
    qualityDesc: 'Dhaabbilee seeraan jiran bu\'uura olaanaa kennina',
    compliance: 'Seera Eeguu',
    complianceDesc: 'Gabaan hundi seera akka eegu mirkaneessina',
    ourValues: 'Gatii Keenya',
    excellence: 'Olaantummaa',
    integrity: 'Amanamummaa',
    innovation: 'Kalaqaa',
    partnership: 'Tumsa',
    
    // Clients Page
    businessesWePromote: 'Daldala Nu Beeksisu',
    everyBusinessVerified: 'Daldalli armaan gadii hundi hayyama daldala sirrii taʼeen mirkaneeffameera.',
    verifiedBusinesses: '100% Daldala Mirkaneeffame',
    allClientsVerified: 'Maamiltonni hundi hayyama daldala sirrii garee keenyaan mirkaneeffame dhiʼeessaniiru',
    verifiedLicensed: 'Daldala Hayyama Mirkaneeffame',
    followers: 'Hordoftoota',
    growth: 'Guddina',
    engagement: 'Hirmaannaa',
    wantToJoin: 'Seenuu Barbaaddu',
    verifiedNetwork: 'Neetworkii Mirkaneeffame',
    ifYouHaveLicense: 'Yoo daldala hayyama qabaattan, isin waliin hojjechuu feena.',
    applyNow: 'Amma Iyyannoo Galchi',
    
    // Client Detail
    backToClients: '← Gara Maamiltoota Hundaatti Deebiʼi',
    established: 'Hundeeffame',
    location: 'Bakka',
    employees: 'Hojjettoota',
    industry: 'Indaastirii',
    allDocsVerified: 'Galmeen hundi mirkaneeffameera',
    licenseType: 'Gosa Hayyamaa',
    licenseNumber: 'Lakkoofsa Hayyamaa',
    issueDate: 'Guyyaa Kenname',
    expiryDate: 'Guyyaa Xumuramuu',
    status: 'Haala',
    activeVerified: 'Sochii fi Mirkaneeffame',
    businessContact: 'Qunnamtii Daldaa',
    
    // Contact Page
    contactUs: 'Nu Qunnamaa',
    letsWorkTogether: 'Waliin Haa Hojjennu',
    readyToGrow: 'Daldala hayyama qaban gabaa hawaasaa irratti guddisuu qophaaʼuu?',
    emailUs: 'Imeeliin Nu Ergaa',
    callUs: 'Nu Bilbilaa',
    visitUs: 'Nu Daawwadha',
    workingHours: 'Saʼaatii Hojii',
    monFri: 'Wiix - Arb: 9AM - 6PM',
    sendMessage: 'Ergaa Nu Ergaa',
    fillForm: 'Unka armaan gadii guutaatii nu argattan.',
    yourName: 'Maqaa Keessan',
    emailAddress: 'Teessoo Imeelii',
    phoneNumber: 'Lakkoofsa Bilbilaa',
    businessType: 'Gosa Daldaa',
    selectIndustry: 'Indaastirii keessan filadha',
    companyName: 'Maqaa Dhaabbataa / Daldaa',
    tellUsAbout: 'Waaʼee Daldaa Keessanii Nu Himaa',
    describeYourBusiness: 'Daldaa keessan ibsaa...',
    important: 'Barbaachisaa:',
    onlyLicensed: 'Daldala hayyama qaban qofa waliin hojjenna.',
    submitApplication: 'Iyyannoo Galchi →',
    thankYou: 'Galatoomaa! Ergaan keessan nu gaʼeera. Yeroo dhiyootti isin arganna.',
    
    // Business Types
    furnitureStore: 'Mana Gurgurtaa Meeshaa Manaa',
    medicalClinic: 'Kilinikii Yaalaa',
    supermarket: 'Suuparmaarkeetii / Daldalaa',
    restaurant: 'Mana Nyaataa / Kaafee',
    beautySalon: 'Saloonii Bareedina',
    fitnessCenter: 'Giddugala Qaamaa Jajjabeessuu',
    otherBusiness: 'Daldala Hayyama Qabu Biraa',
    
    // Login/Register
    welcomeBack: 'Baga Nagaan Deebitan',
    loginToContact: 'Nu argachuuf ykn tajaajila keenyaaf iyyannoo galchuuf seenaa',
    password: 'Jecha Icciitii',
    forgotPassword: 'Jecha icciitii irraanfattan?',
    dontHaveAccount: 'Akkaawuntii hin qabdanii?',
    registerHere: 'Asitti galmaaʼaa',
    createAccount: 'Akkaawuntii Uumaa',
    registerToContact: 'Nu argachuuf ykn tajaajila keenyaaf iyyannoo galchuuf galmaaʼaa',
    comingSoon: 'Dhiyootti Dhufaa Jira',
    comingSoonMsg: 'Marsariitii guutuu yeroo jalqabnu galmaaʼuun ni argama.',
    fullName: 'Maqaa Guutuu',
    confirmPassword: 'Jecha Icciitii Mirkaneessaa',
    alreadyHaveAccount: 'Akkaawuntii qabduu?',
    loginHere: 'Asitti seenaa',
    forgotPasswordTitle: 'Jecha Icciitii Irraanfatte',
    enterEmailReset: 'Imeelii keessan galchaatii linkii irra deebisuuf isinii ergina',
    sendResetLink: 'Linkii Ergaa',
    resetLinkSent: 'Yoo akkaawuntiin imeelii kanaan jiraate, linkii jecha icciitii irra deebisuu argattan.',
    backToLogin: 'Gara Seenuutti Deebiʼi',
    
    // Footer
    premiumMarketing: 'Daldala hayyama qabaniif gabaa hawaasaa qulqullina olaanaa.',
    pages: 'Fuulota',
    services: 'Tajaajilawwan',
    socialMedia: 'Gabaa Hawaasaa',
    allRightsReserved: 'Mirgi hundi seera jalatti eegameera.',
    
    // Chat Support
    customerSupport: 'Deeggarsa Maamilaa',
    online: 'Toora Irratti',
    typeMessage: 'Ergaa barreessaa...',
    chatWelcome: 'Nagaa! Gara All Things Marketing baga nagaan dhuftan. Harʼa akkamitti isin gargaaruu dandaʼna?',
    
    // News Page
    news: 'Oduu',
    techNews: 'Oduu Teeknooloojii',
    latestTech: 'Oduu Teeknooloojii Haaraa Itoophiyaa Keessaa',
    readMore: 'Dabalataan Dubbisaa',
    
    // Updated ESMEs
    esmes: 'IIESMIiwwan',
    supportingEsmes: 'Dhaabbilee Xixiqqoo fi Giddugaleessaa Itoophiyaa Deeggaruu',
  }
}

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en')
  
  const t = (key) => translations[language][key] || key
  
  const toggleLanguage = () => {
    setLanguage(prev => {
      if (prev === 'en') return 'am'
      if (prev === 'am') return 'or'
      return 'en'
    })
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
