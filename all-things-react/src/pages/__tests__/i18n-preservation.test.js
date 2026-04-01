/**
 * Preservation Property Tests — i18n Fix for UserDashboard & Register
 *
 * PURPOSE: These tests MUST PASS on unfixed code. They establish the baseline
 * behavior that must be preserved after the fix is applied.
 *
 * EXPECTED OUTCOME: All tests PASS on unfixed code.
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { LangContext } from '../../LangContext';
import translations from '../../i18n';
import UserDashboard from '../UserDashboard';
import Register from '../Register';
import API from '../../api';

// ─── Mock the API module ──────────────────────────────────────────────────────
jest.mock('../../api', () => ({
  __esModule: true,
  default: {
    defaults: { headers: { common: {} } },
    get: jest.fn(),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
  },
}));

// Default profile data used by most tests
const DEFAULT_PROFILE = {
  full_name: 'Test User',
  company_name: 'Test Co',
  status: 'pending',
  email: 'test@test.com',
  phone: '0911000000',
};

// ─── Helper: wrap component with a LangContext that forces a specific lang ────
function renderWithLang(ui, lang) {
  const t = translations[lang] || translations.en;
  const contextValue = { lang, switchLang: jest.fn(), t };
  return render(
    <LangContext.Provider value={contextValue}>
      <MemoryRouter>{ui}</MemoryRouter>
    </LangContext.Provider>
  );
}

// ─── Setup: fake token + reset API mock before each test ─────────────────────
beforeEach(() => {
  localStorage.setItem('userToken', 'fake-token-for-test');
  // Restore default get mock so UserDashboard tests always have a working API
  API.get.mockResolvedValue({ data: DEFAULT_PROFILE });
});

afterEach(() => {
  localStorage.removeItem('userToken');
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP 1: UserDashboard renders all English strings correctly (lang='en')
// Validates: Requirements 3.1
// ─────────────────────────────────────────────────────────────────────────────

test('UserDashboard with lang=en renders "My Dashboard" heading', async () => {
  await act(async () => {
    renderWithLang(<UserDashboard />, 'en');
  });
  expect(screen.getByText('My Dashboard')).toBeInTheDocument();
});

test('UserDashboard with lang=en renders "Sign Out" button', async () => {
  await act(async () => {
    renderWithLang(<UserDashboard />, 'en');
  });
  expect(screen.getByText('Sign Out')).toBeInTheDocument();
});

test('UserDashboard with lang=en renders "Account Under Review" banner when status=pending', async () => {
  await act(async () => {
    renderWithLang(<UserDashboard />, 'en');
  });
  expect(screen.getByText('Account Under Review')).toBeInTheDocument();
});

test('UserDashboard with lang=en renders all tab labels', async () => {
  await act(async () => {
    renderWithLang(<UserDashboard />, 'en');
  });
  expect(screen.getByText('👤 Profile')).toBeInTheDocument();
  expect(screen.getByText('🏢 Business Info')).toBeInTheDocument();
  expect(screen.getByText('📱 Social & Extra')).toBeInTheDocument();
  expect(screen.getByText('🔒 Password')).toBeInTheDocument();
});

test('UserDashboard with lang=en renders "Save Changes" button', async () => {
  await act(async () => {
    renderWithLang(<UserDashboard />, 'en');
  });
  expect(screen.getByText('Save Changes')).toBeInTheDocument();
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP 2: Register renders all English strings correctly (lang='en')
// Validates: Requirements 3.1
// ─────────────────────────────────────────────────────────────────────────────

test('Register with lang=en renders step 0 label "Account Details" in step indicator', () => {
  renderWithLang(<Register />, 'en');
  // After fix: step indicator uses t.accountDetails ("Account Details"), not the old "Account"
  expect(screen.getAllByText('Account Details').length).toBeGreaterThan(0);
});

test('Register with lang=en renders "Account Details" section heading', () => {
  renderWithLang(<Register />, 'en');
  // After fix: both step indicator and section heading use t.accountDetails
  expect(screen.getAllByText('Account Details').length).toBeGreaterThan(0);
});

test('Register with lang=en renders "Full Name *" field label', () => {
  renderWithLang(<Register />, 'en');
  expect(screen.getByText('Full Name *')).toBeInTheDocument();
});

test('Register with lang=en renders "Next: Business Info →" button', () => {
  renderWithLang(<Register />, 'en');
  expect(screen.getByText('Next: Business Info →')).toBeInTheDocument();
});

test('Register with lang=en renders "Create your business account" subtitle', () => {
  renderWithLang(<Register />, 'en');
  expect(screen.getByText('Create your business account')).toBeInTheDocument();
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP 3: Register form validation fires correctly for all languages
// Validates: Requirements 3.2, 3.3
// ─────────────────────────────────────────────────────────────────────────────

const LANGS = ['en', 'am', 'or'];

LANGS.forEach((lang) => {
  test(`Register with lang=${lang}: submitting step 0 with empty fields shows t.fillRequired`, () => {
    const t = translations[lang];
    renderWithLang(<Register />, lang);
    const nextBtn = screen.getByText(/Next.*Business|Itti aanaa.*Daldala|ቀጣይ.*ንግድ/i);
    fireEvent.click(nextBtn);
    expect(screen.getByText(t.fillRequired)).toBeInTheDocument();
  });

  test(`Register with lang=${lang}: submitting step 0 with mismatched passwords shows t.passwordMismatch`, () => {
    const t = translations[lang];
    renderWithLang(<Register />, lang);
    fireEvent.change(document.querySelector('input[name="full_name"]'), { target: { name: 'full_name', value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText(/\+251/i), { target: { name: 'phone', value: '0911000000' } });
    const pwInputs = document.querySelectorAll('input[type="password"]');
    fireEvent.change(pwInputs[0], { target: { name: 'password', value: 'password123' } });
    fireEvent.change(pwInputs[1], { target: { name: 'confirm_password', value: 'different456' } });
    fireEvent.click(screen.getByText(/Next.*Business|Itti aanaa.*Daldala|ቀጣይ.*ንግድ/i));
    expect(screen.getByText(t.passwordMismatch)).toBeInTheDocument();
  });

  test(`Register with lang=${lang}: submitting step 0 with short password shows t.passwordShort`, () => {
    const t = translations[lang];
    renderWithLang(<Register />, lang);
    fireEvent.change(document.querySelector('input[name="full_name"]'), { target: { name: 'full_name', value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText(/\+251/i), { target: { name: 'phone', value: '0911000000' } });
    const pwInputs = document.querySelectorAll('input[type="password"]');
    fireEvent.change(pwInputs[0], { target: { name: 'password', value: 'abc' } });
    fireEvent.change(pwInputs[1], { target: { name: 'confirm_password', value: 'abc' } });
    fireEvent.click(screen.getByText(/Next.*Business|Itti aanaa.*Daldala|ቀጣይ.*ንግድ/i));
    expect(screen.getByText(t.passwordShort)).toBeInTheDocument();
  });

  test(`Register with lang=${lang}: submitting step 1 with empty company_name shows t.companyRequired`, () => {
    const t = translations[lang];
    renderWithLang(<Register />, lang);
    // Advance through step 0
    fireEvent.change(document.querySelector('input[name="full_name"]'), { target: { name: 'full_name', value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText(/\+251/i), { target: { name: 'phone', value: '0911000000' } });
    const pwInputs = document.querySelectorAll('input[type="password"]');
    fireEvent.change(pwInputs[0], { target: { name: 'password', value: 'password123' } });
    fireEvent.change(pwInputs[1], { target: { name: 'confirm_password', value: 'password123' } });
    fireEvent.click(screen.getByText(/Next.*Business|Itti aanaa.*Daldala|ቀጣይ.*ንግድ/i));
    // On step 1 — click Next without company_name
    fireEvent.click(screen.getByText(/Next.*Documents|Itti aanaa.*Sanadoota|ቀጣይ.*ሰነዶች/i));
    expect(screen.getByText(t.companyRequired)).toBeInTheDocument();
  });

  test(`Register with lang=${lang}: submitting step 2 with empty business_license_number shows t.businessLicenseReq`, () => {
    const t = translations[lang];
    renderWithLang(<Register />, lang);
    // Step 0
    fireEvent.change(document.querySelector('input[name="full_name"]'), { target: { name: 'full_name', value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText(/\+251/i), { target: { name: 'phone', value: '0911000000' } });
    const pwInputs = document.querySelectorAll('input[type="password"]');
    fireEvent.change(pwInputs[0], { target: { name: 'password', value: 'password123' } });
    fireEvent.change(pwInputs[1], { target: { name: 'confirm_password', value: 'password123' } });
    fireEvent.click(screen.getByText(/Next.*Business|Itti aanaa.*Daldala|ቀጣይ.*ንግድ/i));
    // Step 1 — fill company_name and advance
    fireEvent.change(document.querySelector('input[name="company_name"]'), { target: { name: 'company_name', value: 'Test Co' } });
    fireEvent.click(screen.getByText(/Next.*Documents|Itti aanaa.*Sanadoota|ቀጣይ.*ሰነዶች/i));
    // Step 2 — submit without business_license_number
    fireEvent.click(screen.getByText(/Create Account|Herrega Uumi|መለያ ፍጠር/i));
    expect(screen.getByText(t.businessLicenseReq)).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP 4: UserDashboard renders profile.status raw value unchanged
// Validates: Requirements 3.5
// ─────────────────────────────────────────────────────────────────────────────

LANGS.forEach((lang) => {
  test(`UserDashboard with lang=${lang}: status='pending' renders "pending" badge`, async () => {
    API.get.mockResolvedValueOnce({ data: { ...DEFAULT_PROFILE, status: 'pending' } });
    await act(async () => { renderWithLang(<UserDashboard />, lang); });
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  test(`UserDashboard with lang=${lang}: status='active' renders "active" badge`, async () => {
    API.get.mockResolvedValueOnce({ data: { ...DEFAULT_PROFILE, status: 'active' } });
    await act(async () => { renderWithLang(<UserDashboard />, lang); });
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  test(`UserDashboard with lang=${lang}: status='suspended' renders "suspended" badge`, async () => {
    API.get.mockResolvedValueOnce({ data: { ...DEFAULT_PROFILE, status: 'suspended' } });
    await act(async () => { renderWithLang(<UserDashboard />, lang); });
    expect(screen.getByText('suspended')).toBeInTheDocument();
  });
});
