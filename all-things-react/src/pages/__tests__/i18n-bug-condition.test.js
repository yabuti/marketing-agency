/**
 * Bug Condition Exploration Test — i18n Fix for UserDashboard & Register
 *
 * PURPOSE: This test MUST FAIL on unfixed code. Failure confirms the bug exists.
 * DO NOT attempt to fix the test or the implementation when it fails.
 *
 * EXPECTED COUNTEREXAMPLES (confirmed on unfixed code):
 *   1. UserDashboard renders "My Dashboard" instead of "የእኔ ዳሽቦርድ" when lang='am'
 *      → Root cause: UserDashboard never calls useLang(), all strings are hardcoded English
 *   2. UserDashboard renders "Sign Out" instead of "Ba'i" when lang='or'
 *      → Root cause: Sign Out button text is a hardcoded string literal
 *   3. Register renders "Account" instead of "የመለያ ዝርዝሮች" for step 0 label when lang='am'
 *      → Root cause: STEPS = ['Account', 'Business Info', 'Documents'] is a module-level
 *         constant defined before any hook runs, never updated on lang change
 *   4. Register renders English info note instead of Oromo translation when lang='or' at step 2
 *      → Root cause: The info note in step 2 is a hardcoded JSX string literal
 *
 * Validates: Requirements 1.1, 1.2, 1.3 (Bug Condition — Property 1)
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

// ─── Mock the API module so UserDashboard's useEffect doesn't fail ────────────
jest.mock('../../api', () => ({
  __esModule: true,
  default: {
    defaults: { headers: { common: {} } },
    get: jest.fn(),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
  },
}));

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

// ─── Setup: set a fake token so UserDashboard doesn't redirect to /login ──────
beforeEach(() => {
  localStorage.setItem('userToken', 'fake-token-for-test');
  API.get.mockResolvedValue({ data: DEFAULT_PROFILE });
});

afterEach(() => {
  localStorage.removeItem('userToken');
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST 1: UserDashboard heading in Amharic
// Expected on UNFIXED code: FAIL — finds "My Dashboard" instead of "የእኔ ዳሽቦርድ"
// ─────────────────────────────────────────────────────────────────────────────
test('UserDashboard with lang=am renders translated dashboard title (የእኔ ዳሽቦርድ)', async () => {
  const expectedTitle = translations['am'].myDashboardTitle; // "የእኔ ዳሽቦርድ"

  await act(async () => {
    renderWithLang(<UserDashboard />, 'am');
  });

  // On unfixed code: UserDashboard never calls useLang(), so it renders
  // the hardcoded "My Dashboard" — this assertion FAILS, confirming the bug.
  expect(screen.getByText(expectedTitle)).toBeInTheDocument();
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST 2: UserDashboard Sign Out button in Oromo
// Expected on UNFIXED code: FAIL — finds "Sign Out" instead of "Ba'i"
// ─────────────────────────────────────────────────────────────────────────────
test("UserDashboard with lang=or renders translated Sign Out button (Ba'i)", async () => {
  const expectedSignOut = translations['or'].signOut; // "Ba'i"

  await act(async () => {
    renderWithLang(<UserDashboard />, 'or');
  });

  // On unfixed code: the Sign Out button has hardcoded text "Sign Out" —
  // this assertion FAILS, confirming the bug.
  expect(screen.getByText(expectedSignOut)).toBeInTheDocument();
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST 3: Register step 0 indicator label in Amharic
// Expected on UNFIXED code: FAIL — finds "Account" instead of "የመለያ ዝርዝሮች"
// ─────────────────────────────────────────────────────────────────────────────
test('Register with lang=am renders translated step 0 label (የመለያ ዝርዝሮች)', () => {
  const expectedLabel = translations['am'].accountDetails; // "የመለያ ዝርዝሮች"

  renderWithLang(<Register />, 'am');

  // On unfixed code: STEPS = ['Account', 'Business Info', 'Documents'] is a
  // module-level constant — the step indicator renders "Account" regardless of lang.
  // This assertion FAILS, confirming the bug.
  // After fix: the label appears in both the step indicator AND the section heading (correct).
  expect(screen.getAllByText(expectedLabel).length).toBeGreaterThan(0);
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST 4: Register step 2 info note in Oromo
// Expected on UNFIXED code: FAIL — finds English text instead of Oromo translation
// ─────────────────────────────────────────────────────────────────────────────
test('Register at step 2 with lang=or renders translated info note (Oromo licenseInfo)', () => {
  const expectedLicenseInfo = translations['or'].licenseInfo;
  // "📋 Odeeffannoon kee garee keenya ni madaalama. Galmee booda imeelii siif ergama."

  renderWithLang(<Register />, 'or');

  // Advance to step 1: fill required fields and click "Next: Business Info"
  fireEvent.change(screen.getByPlaceholderText(/\+251/i), {
    target: { name: 'phone', value: '0911000000' },
  });

  const fullNameInput = document.querySelector('input[name="full_name"]');
  if (fullNameInput) {
    fireEvent.change(fullNameInput, { target: { name: 'full_name', value: 'Test User' } });
  }

  const pwInputs = document.querySelectorAll('input[type="password"]');
  if (pwInputs.length >= 2) {
    fireEvent.change(pwInputs[0], { target: { name: 'password', value: 'password123' } });
    fireEvent.change(pwInputs[1], { target: { name: 'confirm_password', value: 'password123' } });
  }

  // Click "Next: Business Info →" (or Oromo equivalent — on unfixed code it's still English)
  // We use a regex that matches either the English or Oromo text
  const nextBtn1 = screen.getByText(/Next.*Business|Itti aanaa.*Daldala/i);
  fireEvent.click(nextBtn1);

  // Fill step 1 required field (company_name)
  const companyInput = document.querySelector('input[name="company_name"]');
  if (companyInput) {
    fireEvent.change(companyInput, { target: { name: 'company_name', value: 'Test Co' } });
  }

  // Click "Next: Documents →" (or Oromo equivalent)
  const nextBtn2 = screen.getByText(/Next.*Documents|Itti aanaa.*Sanadoota/i);
  fireEvent.click(nextBtn2);

  // On unfixed code: the info note in step 2 is a hardcoded English string:
  // "📋 Your information will be reviewed by our team..."
  // This assertion FAILS, confirming the bug.
  expect(screen.getByText(expectedLicenseInfo)).toBeInTheDocument();
});
