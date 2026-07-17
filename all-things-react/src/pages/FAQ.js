import React, { useState } from 'react';
import { useLang } from '../LangContext';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ_KEYS = [
  { q: 'faq1q', a: 'faq1a' },
  { q: 'faq2q', a: 'faq2a' },
  { q: 'faq3q', a: 'faq3a' },
  { q: 'faq4q', a: 'faq4a' },
  { q: 'faq5q', a: 'faq5a' },
  { q: 'faq6q', a: 'faq6a' },
  { q: 'faq7q', a: 'faq7a' },
  { q: 'faq8q', a: 'faq8a' },
];

export default function FAQ() {
  const { t } = useLang();
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="page" style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 900, marginBottom: 8 }}>{t.faqTitle}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 36, fontSize: 16 }}>
        {t.faqSubtitle}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {FAQ_KEYS.map((item, index) => (
          <div
            key={index}
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            }}
          >
            <button
              onClick={() => toggleFAQ(index)}
              style={{
                width: '100%',
                padding: '18px 20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--secondary)',
                textAlign: 'left',
              }}
            >
              <span>{t[item.q]}</span>
              <span style={{
                fontSize: 20,
                color: 'var(--primary)',
                transition: 'transform 0.3s',
                transform: openIndex === index ? 'rotate(45deg)' : 'rotate(0deg)',
                flexShrink: 0,
              }}>+</span>
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <p style={{
                    padding: '0 20px 18px',
                    margin: 0,
                    color: 'var(--text-muted)',
                    fontSize: 15,
                    lineHeight: 1.7,
                    borderTop: '1px solid rgba(0,0,0,0.04)',
                    paddingTop: 16,
                  }}>
                    {t[item.a]}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
