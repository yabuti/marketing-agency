/**
 * Pure cart utility functions.
 * No localStorage side effects — localStorage read/write stays in page components.
 *
 * Cart item shape: { product_id, name, price, quantity, photo_url, seller_id, seller_name }
 */

/**
 * Get the current logged-in user's ID (works for both user & buyer).
 * @returns {string|null}
 */
export function getCurrentUserId() {
  try {
    const user  = JSON.parse(localStorage.getItem('user')  || 'null');
    const buyer = JSON.parse(localStorage.getItem('buyer') || 'null');
    const profile = user || buyer;
    return profile?.id ? String(profile.id) : null;
  } catch { return null; }
}

/**
 * The localStorage key prefix shared by every cart belonging to a user.
 * Callers that need to enumerate a user's carts (e.g. the navbar badge) must
 * use this rather than re-spelling the format, so the key has one definition.
 * @param {string|number} userId
 * @returns {string}
 */
export function cartKeyPrefix(userId) {
  return `bazaar_cart_${userId}_`;
}

/**
 * Build the user-scoped localStorage key for a seller's cart.
 * Returns null if no user is logged in (prevents cross-user cart leaks).
 * @param {string|number} sellerId
 * @returns {string|null}
 */
export function getCartKey(sellerId) {
  const uid = getCurrentUserId();
  return uid ? cartKeyPrefix(uid) + sellerId : null;
}

/**
 * Add a product to the cart or increment its quantity if already present.
 * @param {Array} cart - current cart items
 * @param {Object} product - product to add (must have id, name, price, seller_id, seller_name, photos)
 * @param {number} quantity - quantity to add (default 1)
 * @returns {Array} new cart array
 */
export function addToCart(cart, product, quantity = 1) {
  const existing = cart.find(item => item.product_id === product.id);
  if (existing) {
    return cart.map(item =>
      item.product_id === product.id
        ? { ...item, quantity: item.quantity + quantity }
        : item
    );
  }
  return [
    ...cart,
    {
      product_id: product.id,
      name: product.name,
      price: Number(product.discount_price && Number(product.discount_price) < Number(product.price) ? product.discount_price : product.price),
      original_price: product.price,
      quantity,
      photo_url: product.photos?.[0]?.url || null,
      seller_id: product.seller_id,
      seller_name: product.seller_name,
    },
  ];
}


