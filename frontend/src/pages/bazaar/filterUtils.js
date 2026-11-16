// Shared price-filter helpers for the Bazaar and Market pages.
// Both pages filter products, so the rules live here to keep them identical.

/**
 * The price a buyer actually pays. A product may carry a discount_price, and
 * the cards show that whenever it is set and lower than the base price — so
 * filtering has to use the same value or a discounted product can show a price
 * that falls outside the range the user filtered for.
 */
export function effectivePrice(product = {}) {
  const price = Number(product.price) || 0;
  const discount = Number(product.discount_price);
  return Number.isFinite(discount) && discount > 0 && discount < price ? discount : price;
}

/**
 * Translate a price-range option value into min/max bounds.
 * Returns strings because filter state holds raw input values; an empty string
 * means "no bound on that side".
 */
export function priceRangeToBounds(value) {
  if (!value) return { min_price: '', max_price: '' };
  if (value.startsWith('under-')) return { min_price: '', max_price: value.slice('under-'.length) };
  if (value.startsWith('over-'))  return { min_price: value.slice('over-'.length),  max_price: '' };
  const [min, max] = value.split('-');
  return { min_price: min ?? '', max_price: max ?? '' };
}
