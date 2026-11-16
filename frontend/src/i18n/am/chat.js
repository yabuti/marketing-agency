// chat — am. Chat window, seller inbox and navbar shell copy.

export default {
  // ChatWindow.js
  chatTitle: '💬 መልዕክቶች',
  chatWith: (name) => `ከ${name} ጋር ያናግሩ`,
  chatSignInBefore: 'እባክዎ',
  chatSignInLink: 'ይግቡ',
  chatSignInAfter: 'ከሻሻዩ ጋር ለመናገር።',
  chatOnline: 'በመስመር ላይ',
  chatConnecting: 'በመስካት ላይ...',
  chatTypeMessage: 'መልዕክት ይጻፉ...',
  chatRetry: 'እንደገና ይሞክሩ',
  chatEmpty: 'ውይይቱን ይጀምሩ! ስለ ምርቱ ይጠይቁ።',
  chatStartError: 'ውይይቱን ማስጀመር አልተቻለም። እባክዎ እንደገና ይሞክሩ።',
  chatConnectionError: 'የግንኙነት ስህተት። እባክዎ የኢንተርኔትዎን አረጋግጠው እንደገና ይሞክሩ።',
  chatConnectionErrorShort: 'የግንኙነት ስህተት።',
  chatFailed: 'አልተሳካም',
  chatSendError: 'መልዕክቱን መላክ አልተቻለም።',
  chatSendRetryError: 'መላክ አልተቻለም። እባክዎ እንደገና ይሞክሩ።',
  chatOpenSupport: 'የቻት ድጋፍን ይክፈቱ',
  chatOnMessenger: 'በመልእክተኛ ያናግሩ',
  chatOnWhatsApp: 'በዋትስአፕ ያናግሩ',

  // SellerChat.js
  chatNoConversations: 'እስካሁን ውይይቶች የሉም።',
  chatSelectConversation: 'ውይይት ይምረጡ ለመናገር',
  chatConversationFallback: 'ውይይት',
  chatUnread: (n) => `${n} አዲስ`,

  // Navbar.js
  navMarket: 'ገበያ',
  navBazaar: 'ባዛር',
  navMyPurchases: 'ግዢዎቼ',
  navUserFallback: 'ተጠቃሚ',
  navSellerFallback: 'ሻሽላት',
  navWishlist: 'ዝልይት',
  navWishlistCount: (n) => `ዝልይት (${n})`,
  navWishlistItems: (n) => `ዝልይት፣ ${n} ንዑስ ዕቃዎች`,
  navLightMode: 'የብሩህ ሁኔታ',
  navDarkMode: 'የጨለማ ሁኔታ',
  navSwitchToLight: 'ወደ የብሩህ ሁኔታ ይቀይሩ',
  navSwitchToDark: 'ወደ የጨለማ ሁኔታ ይቀይሩ',
  navLanguage: 'ቋንቋ',
  navExpandSidebar: 'የጎን አሞሌውን ያስልቱ',
  navCollapseSidebar: 'የጎን አሞሌውን ይለጥፉ',
};