const https = require('https');

/**
 * Translates text using Google Translate's unofficial endpoint.
 * No API key required. Supports Amharic (am) and Oromo (om).
 *
 * @param {string} text  - Source text (English)
 * @param {string} to    - Target language code ('am' or 'om')
 * @returns {Promise<string>} - Translated text
 */
function translate(text, to) {
  return new Promise((resolve) => {
    if (!text || !text.trim()) { resolve(''); return; }

    // Truncate to 4000 chars to stay within limits
    const safeText = text.slice(0, 4000);
    const encoded = encodeURIComponent(safeText);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${to}&dt=t&q=${encoded}`;

    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          // Response is nested arrays: [[["translated","original",...],...],...]
          const result = parsed[0]
            .filter(Boolean)
            .map(part => part[0])
            .join('');
          resolve(result || safeText);
        } catch {
          resolve(safeText); // fallback to original on parse error
        }
      });
    }).on('error', () => resolve(safeText)); // fallback on network error
  });
}

/**
 * Translates a news article from English into Amharic and Oromo.
 * Returns { title_am, title_or, content_am, content_or }
 */
async function translateNews(title, content) {
  try {
    const [title_am, title_or, content_am, content_or] = await Promise.all([
      translate(title, 'am'),
      translate(title, 'om'),
      translate(content, 'am'),
      translate(content, 'om'),
    ]);
    return { title_am, title_or, content_am, content_or };
  } catch {
    return { title_am: '', title_or: '', content_am: '', content_or: '' };
  }
}

module.exports = { translate, translateNews };
