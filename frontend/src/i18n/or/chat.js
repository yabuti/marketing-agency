// chat — or. Chat window, seller inbox and navbar shell copy.

export default {
  // ChatWindow.js
  chatTitle: '💬 Ergaawwan',
  chatWith: (name) => `Waan ${name} waliin haasaa`,
  chatSignInBefore: 'Maaloo',
  chatSignInLink: 'Seenii',
  chatSignInAfter: 'gurgurtootaa waliin haasaasuuf.',
  chatOnline: 'Gara internetii jira',
  chatConnecting: 'Fulkaa jira...',
  chatTypeMessage: 'Ergaa barreessaa...',
  chatRetry: "Irra deebi'i",
  chatEmpty: 'Haasawwiin jalqabi! Meeshaa kana ilaalchuuf qabiyyee itti gaafadhu.',
  chatStartError: "Haasawwiin jalqabuun hin danda'amne. Maaloo irra deebi'i.",
  chatConnectionError: "Dogoggora kominishinii. Maaloo interneetii kee mirkaneessi irra deebi'i.",
  chatConnectionErrorShort: 'Dogoggora kominishinii.',
  chatFailed: 'Kufe',
  chatSendError: 'Ergaa lachuun kufe.',
  chatSendRetryError: "Lachuun kufe. Maaloo irra deebi'i.",
  chatOpenSupport: 'Deeggarsa haasaa bani',
  chatOnMessenger: 'Messenger irratti haasaadhu',
  chatOnWhatsApp: 'WhatsApp irratti haasaadhu',

  // SellerChat.js
  chatNoConversations: 'Ammaaf haasawwii hin jiru.',
  chatSelectConversation: 'Haasawwii filadhu jalqabsisuuf',
  chatConversationFallback: 'Haasawwii',
  chatUnread: (n) => `${n} haaraa`,

  // Navbar.js
  navMarket: 'Magaalaa',
  navBazaar: 'Baazaara',
  navMyPurchases: 'Bitannoota Koo',
  navUserFallback: 'Itti fayyadamuu',
  navSellerFallback: 'Gurgurtootaa',
  navWishlist: 'Kutaa dhaabbataa',
  navWishlistCount: (n) => `Kutaa dhaabbataa (${n})`,
  navWishlistItems: (n) => `Kutaa dhaabbataa, ${n} meeshaa`,
  navLightMode: 'Nurri',
  navDarkMode: 'Dhokkee',
  navSwitchToLight: 'Gara nurri fayyaatti jijjiiri',
  navSwitchToDark: 'Gara dhokkee fayyaatti jijjiiri',
  navLanguage: 'Afaan',
  navExpandSidebar: "K'oo boqqisi",
  navCollapseSidebar: "K'oo cimaa",
};