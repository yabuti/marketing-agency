// chat — en. Chat window, seller inbox and navbar shell copy.

export default {
  // ChatWindow.js
  chatTitle: '💬 Messages',
  chatWith: (name) => `Chat with ${name}`,
  chatSignInBefore: 'Please',
  chatSignInLink: 'sign in',
  chatSignInAfter: 'to chat with the seller.',
  chatOnline: 'Online',
  chatConnecting: 'Connecting...',
  chatTypeMessage: 'Type a message...',
  chatRetry: 'Retry',
  chatEmpty: 'Start the conversation! Ask about the product.',
  chatStartError: 'Could not start conversation. Please try again.',
  chatConnectionError: 'Connection error. Please check your internet and try again.',
  chatConnectionErrorShort: 'Connection error.',
  chatFailed: 'Failed',
  chatSendError: 'Failed to send message.',
  chatSendRetryError: 'Failed to send. Please try again.',
  chatOpenSupport: 'Open chat support',
  chatOnMessenger: 'Chat on Messenger',
  chatOnWhatsApp: 'Chat on WhatsApp',

  // SellerChat.js
  chatNoConversations: 'No conversations yet.',
  chatSelectConversation: 'Select a conversation to start chatting',
  chatConversationFallback: 'Conversation',
  chatUnread: (n) => `${n} new`,

  // Navbar.js
  navMarket: 'Market',
  navBazaar: 'Bazaar',
  navMyPurchases: 'My Purchases',
  navUserFallback: 'User',
  navSellerFallback: 'Seller',
  navWishlist: 'Wishlist',
  navWishlistCount: (n) => `Wishlist (${n})`,
  navWishlistItems: (n) => `Wishlist, ${n} items`,
  navLightMode: 'Light mode',
  navDarkMode: 'Dark mode',
  navSwitchToLight: 'Switch to light mode',
  navSwitchToDark: 'Switch to dark mode',
  navLanguage: 'Language',
  navExpandSidebar: 'Expand sidebar',
  navCollapseSidebar: 'Collapse sidebar',
};