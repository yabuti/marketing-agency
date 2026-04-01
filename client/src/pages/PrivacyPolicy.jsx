import { useLanguage } from '../context/LanguageContext'
import '../styles/privacy.css'

export default function PrivacyPolicy() {
  const { language } = useLanguage()

  return (
    <section className="privacy-section">
      <div className="privacy-container">
        <h1>{language === 'en' ? 'Privacy Policy' : 'የግላዊነት ፖሊሲ'}</h1>
        <p className="last-updated">{language === 'en' ? 'Last Updated: January 2026' : 'የመጨረሻ ማሻሻያ: ጥር 2026'}</p>

        {language === 'en' ? (
          <>
            <div className="policy-section">
              <h2>1. Introduction</h2>
              <p>Welcome to All Things Marketing Agency. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our website or use our services.</p>
            </div>

            <div className="policy-section">
              <h2>2. Information We Collect</h2>
              <p>We may collect the following types of information:</p>
              <ul>
                <li><strong>Personal Information:</strong> Name, email address, phone number, business name, and business license details when you contact us or apply for our services.</li>
                <li><strong>Usage Data:</strong> Information about how you use our website, including pages visited, time spent, and browser type.</li>
                <li><strong>Communication Data:</strong> Messages you send through our contact form or customer support chat.</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>3. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul>
                <li>Provide and improve our marketing services</li>
                <li>Verify business licenses and legitimacy</li>
                <li>Communicate with you about our services</li>
                <li>Send promotional materials (with your consent)</li>
                <li>Analyze website usage to improve user experience</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>4. Data Protection</h2>
              <p>We implement appropriate security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Your data is stored securely and accessed only by authorized personnel.</p>
            </div>

            <div className="policy-section">
              <h2>5. Third-Party Services</h2>
              <p>We may use third-party services for analytics, payment processing, and marketing. These services have their own privacy policies, and we encourage you to review them.</p>
            </div>

            <div className="policy-section">
              <h2>6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>7. Cookies</h2>
              <p>Our website uses cookies to enhance your browsing experience. You can control cookie settings through your browser preferences.</p>
            </div>

            <div className="policy-section">
              <h2>8. Contact Us</h2>
              <p>If you have questions about this privacy policy, please contact us:</p>
              <ul>
                <li>📧 Email: allthingsethiopia2026@gmail.com</li>
                <li>📞 Phone: +251911031884, +251905841982, +251915840037</li>
                <li>📍 Address: Addis Ababa, Ethiopia</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>9. Changes to This Policy</h2>
              <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated revision date.</p>
            </div>
          </>
        ) : (
          <>
            <div className="policy-section">
              <h2>1. መግቢያ</h2>
              <p>ወደ All Things Marketing Agency እንኳን ደህና መጡ። ግላዊነትዎን እናከብራለን እና የግል መረጃዎን ለመጠበቅ ቁርጠኞች ነን። ይህ የግላዊነት ፖሊሲ ድረ-ገጻችንን ሲጎበኙ ወይም አገልግሎቶቻችንን ሲጠቀሙ መረጃዎን እንዴት እንደምንሰበስብ፣ እንደምንጠቀም እና እንደምንጠብቅ ያብራራል።</p>
            </div>

            <div className="policy-section">
              <h2>2. የምንሰበስበው መረጃ</h2>
              <p>የሚከተሉትን የመረጃ አይነቶች ልንሰበስብ እንችላለን:</p>
              <ul>
                <li><strong>የግል መረጃ:</strong> ሲያገኙን ወይም ለአገልግሎታችን ሲያመለክቱ ስም፣ ኢሜይል አድራሻ፣ ስልክ ቁጥር፣ የንግድ ስም እና የንግድ ፈቃድ ዝርዝሮች።</li>
                <li><strong>የአጠቃቀም መረጃ:</strong> ድረ-ገጻችንን እንዴት እንደሚጠቀሙ መረጃ፣ የተጎበኙ ገጾችን፣ የተጠቀሙበትን ጊዜ እና የአሳሽ አይነትን ጨምሮ።</li>
                <li><strong>የግንኙነት መረጃ:</strong> በእውቂያ ቅጽ ወይም በደንበኛ ድጋፍ ቻት የሚልኩት መልዕክቶች።</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>3. መረጃዎን እንዴት እንጠቀማለን</h2>
              <p>መረጃዎን የምንጠቀመው:</p>
              <ul>
                <li>የግብይት አገልግሎቶቻችንን ለማቅረብ እና ለማሻሻል</li>
                <li>የንግድ ፈቃዶችን እና ህጋዊነትን ለማረጋገጥ</li>
                <li>ስለ አገልግሎቶቻችን ለመገናኘት</li>
                <li>የማስተዋወቂያ ቁሳቁሶችን ለመላክ (በፈቃድዎ)</li>
                <li>የተጠቃሚ ተሞክሮን ለማሻሻል የድረ-ገጽ አጠቃቀምን ለመተንተን</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>4. የመረጃ ጥበቃ</h2>
              <p>የግል መረጃዎን ካልተፈቀደ መዳረሻ፣ ለውጥ፣ ይፋ ማድረግ ወይም ማጥፋት ለመጠበቅ ተገቢ የደህንነት እርምጃዎችን እንተገብራለን። መረጃዎ በአስተማማኝ ሁኔታ ይቀመጣል እና በተፈቀደላቸው ሰራተኞች ብቻ ይደርሳል።</p>
            </div>

            <div className="policy-section">
              <h2>5. የሶስተኛ ወገን አገልግሎቶች</h2>
              <p>ለትንታኔ፣ ለክፍያ ሂደት እና ለግብይት የሶስተኛ ወገን አገልግሎቶችን ልንጠቀም እንችላለን። እነዚህ አገልግሎቶች የራሳቸው የግላዊነት ፖሊሲዎች አሏቸው፣ እና እንዲገመግሟቸው እናበረታታለን።</p>
            </div>

            <div className="policy-section">
              <h2>6. መብቶችዎ</h2>
              <p>የሚከተሉት መብቶች አሉዎት:</p>
              <ul>
                <li>የግል መረጃዎን ማግኘት</li>
                <li>የተሳሳተ መረጃ እንዲስተካከል መጠየቅ</li>
                <li>መረጃዎ እንዲሰረዝ መጠየቅ</li>
                <li>ከግብይት ግንኙነቶች መውጣት</li>
                <li>ፈቃድን በማንኛውም ጊዜ መሰረዝ</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>7. ኩኪዎች</h2>
              <p>ድረ-ገጻችን የአሰሳ ተሞክሮዎን ለማሻሻል ኩኪዎችን ይጠቀማል። በአሳሽ ምርጫዎችዎ በኩል የኩኪ ቅንብሮችን መቆጣጠር ይችላሉ።</p>
            </div>

            <div className="policy-section">
              <h2>8. አግኙን</h2>
              <p>ስለዚህ የግላዊነት ፖሊሲ ጥያቄዎች ካሉዎት እባክዎ ያግኙን:</p>
              <ul>
                <li>📧 ኢሜይል: allthingsethiopia2026@gmail.com</li>
                <li>📞 ስልክ: +251911031884, +251905841982, +251915840037</li>
                <li>📍 አድራሻ: አዲስ አበባ፣ ኢትዮጵያ</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>9. በዚህ ፖሊሲ ላይ ለውጦች</h2>
              <p>ይህንን የግላዊነት ፖሊሲ ከጊዜ ወደ ጊዜ ልናዘምነው እንችላለን። አዲሱን ፖሊሲ በዚህ ገጽ ላይ በተዘመነ የክለሳ ቀን በመለጠፍ ስለማንኛውም ለውጦች እናሳውቅዎታለን።</p>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
