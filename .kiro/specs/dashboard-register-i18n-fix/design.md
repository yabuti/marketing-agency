# Dashboard & Register i18n Fix — Bugfix Design

## Overview

`UserDashboard.js` and `Register.js` render all visible text as hardcoded English strings, ignoring the active language selected via the language switcher. The fix is purely additive: wire both components into the existing `useLang` hook and replace every hardcoded string with the corresponding `t.*` key. All required translation keys already exist in `i18n.js` for `en`, `am`, and `or`. No logic, API calls, validation rules, or data structures change.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug — the active language is not `'en'` AND the component renders a hardcoded English string instead of the translated value from `t`
- **Property (P)**: The desired behavior — every visible string in the component equals `translations[lang][key]` for the active language
- **Preservation**: All functional behavior (form validation, API calls, navigation, city/business-type selectors, status badge) that must remain unchanged by the fix
- **useLang**: The custom hook exported from `LangContext.js` that returns `{ lang, switchLang, t }` where `t = translations[lang]`
- **t**: The translation object for the active language, sourced from `i18n.js`
- **hardcoded string**: A string literal in JSX or a module-level constant that is not derived from `t`
- **STEPS**: The module-level array `['Account', 'Business Info', 'Documents']` in `Register.js` — currently hardcoded, must be replaced with `t.*` values at render time

## Bug Details

### Bug Condition

The bug manifests when the active language is Amharic (`am`) or Oromo (`or`) and the user visits `/dashboard` or `/register`. `UserDashboard.js` never calls `useLang`, so `t` is never available and every string is a hardcoded English literal. `Register.js` calls `useLang` and uses `t` for validation messages, but the `STEPS` array, section headings, field labels, button text, and the step-2 info note are still hardcoded English literals or derived from the hardcoded `STEPS` constant.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input = { lang: string, component: 'UserDashboard' | 'Register', stringKey: string }
  OUTPUT: boolean

  RETURN input.lang IN ['am', 'or']
         AND translations[input.lang][input.stringKey] EXISTS
         AND renderedText(input.component, input.stringKey) = translations['en'][input.stringKey]
END FUNCTION
```

### Examples

- Language = `am`, navigate to `/dashboard` → title renders "My Dashboard" instead of "የእኔ ዳሽቦርድ"
- Language = `or`, navigate to `/dashboard` → Sign Out button renders "Sign Out" instead of "Ba'i"
- Language = `am`, navigate to `/register` step 0 → step indicator label renders "Account" instead of "የመለያ ዝርዝሮች"
- Language = `or`, navigate to `/register` step 1 → section heading renders "Business Information" instead of "Odeeffannoo Daldala"
- Language = `am`, navigate to `/register` step 2 → info note renders English instead of Amharic `t.licenseInfo`
- Language = `en` → all strings render correctly (not a bug condition)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Form validation logic in `Register.js` (required field checks, password match, password length, company name required, license number required) must continue to work identically in all languages
- API calls (`POST /users/register`, `GET /users/me`, `PUT /users/me`, `POST /users/change-password`) must remain unchanged
- Navigation behavior (`navigate('/dashboard')`, `navigate('/login')`) must remain unchanged
- The `CITY_TRANSLATIONS` and `BUSINESS_TYPE_GROUPS` locale-aware selectors in `Register.js` must continue to use the existing `lang` value as before
- The account status badge in `UserDashboard.js` must continue to display the raw `profile.status` value from the API response
- English (`lang = 'en'`) rendering must produce output identical to the current hardcoded strings

**Scope:**
All inputs where `lang === 'en'` are outside the bug condition. All functional interactions (form input, step navigation, form submission, tab switching, save/change-password, logout) are outside the bug condition and must be completely unaffected.

## Hypothesized Root Cause

1. **Missing `useLang` import in `UserDashboard.js`**: The component never imports or calls `useLang`, so it has no access to `t`. Every string is a hardcoded literal or a `SaveBtn` default prop value.

2. **Module-level `STEPS` constant in `Register.js`**: `STEPS` is defined as `['Account', 'Business Info', 'Documents']` at module scope, before any hook can run. It is used directly in JSX for the step indicator labels. Because it is static, it never reflects the active language.

3. **Remaining hardcoded strings in `Register.js` JSX**: Section headings (`"Account Details"`, `"Business Information"`, `"Business Documents"`), field labels, button text (`"Next: Business Info →"`, `"Next: Documents →"`, `"← Back"`, `"Create Account →"`, `"Creating Account..."`), the step-2 description paragraph, and the info note box are all string literals in JSX rather than `t.*` references.

4. **`SaveBtn` default prop in `UserDashboard.js`**: `SaveBtn` has `label = 'Save Changes'` as a default prop. The call sites that rely on this default will not translate unless the default is replaced with a `t.*` value passed from the parent.

## Correctness Properties

Property 1: Bug Condition — Translated Strings Rendered for Non-English Languages

_For any_ active language `lang` in `['am', 'or']` and any translation key `k` that maps to a visible string in `UserDashboard` or `Register`, the fixed components SHALL render `translations[lang][k]` — not the English literal — for that string.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation — English Rendering Unchanged

_For any_ active language `lang === 'en'`, the fixed components SHALL render output identical to the current components, preserving all existing English strings exactly as they appear today.

**Validates: Requirements 3.1**

Property 3: Preservation — Functional Behavior Unchanged Across All Languages

_For any_ active language `lang` in `['en', 'am', 'or']`, the fixed components SHALL perform identical validation logic, API calls, navigation, city/business-type selector behavior, and status badge rendering as the original components.

**Validates: Requirements 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

**File**: `all-things-react/src/pages/UserDashboard.js`

**Specific Changes:**
1. **Import `useLang`**: Add `import { useLang } from '../LangContext';` at the top of the file
2. **Destructure `t`**: Call `const { t } = useLang();` inside the component body, before the early return
3. **Replace hardcoded strings in JSX**: Replace every hardcoded English string with the corresponding `t.*` key:
   - `"Loading..."` → `t.loading`
   - `"My Dashboard"` → `t.myDashboardTitle`
   - `"Sign Out"` → `t.signOut`
   - `"Account Under Review"` → `t.underReview`
   - `"Our team is reviewing..."` → `t.underReviewMsg`
   - Tab labels array `[['profile', '👤 Profile'], ...]` → use `t.profileTab`, `t.businessTab`, `t.socialTab`, `t.passwordTab`
   - Section headings `"Personal Information"`, `"Business Information"`, `"Social Media & Extra Details"`, `"Change Password"` — note: `i18n.js` does not have dedicated keys for these section headings; they can reuse `t.profileTab` (stripped of emoji), or the closest available key. Looking at i18n.js, the dashboard section headings are not separately keyed — use the tab label values or keep as-is. **Actually**: checking i18n.js, there are no `personalInfo`, `businessInfoHeading`, etc. keys. The section headings inside the forms (`"Personal Information"`, `"Business Information"`, `"Social Media & Extra Details"`) are not in i18n.js. Only the tab labels are. The fix should use the tab label text for section headings where a direct key is unavailable, or leave section headings as-is if no key exists. For the purposes of this fix, only replace strings that have a direct `t.*` key.
   - `"Save Changes"` / `"Saving..."` → pass `t.saveChanges` / `t.saving` to `SaveBtn` label prop
   - `"Change Password"` → `t.changePassword`
   - `"Current Password"` → `t.currentPassword`
   - `"New Password"` → `t.newPassword`
   - `"Confirm New Password"` → `t.confirmNewPassword`
   - `'Profile updated successfully.'` → `t.profileUpdated`
   - `'Password changed successfully.'` → `t.passwordChanged`
   - `'Passwords do not match.'` → use existing pattern (no dedicated key — keep as-is or add; i18n.js has `t.passwordMismatch`)
   - `'Update failed.'` / `'Failed to change password.'` — no dedicated keys in i18n.js; keep as-is

**File**: `all-things-react/src/pages/Register.js`

**Specific Changes:**
1. **Remove module-level `STEPS` constant**: Delete `const STEPS = ['Account', 'Business Info', 'Documents'];`
2. **Derive step labels from `t` at render time**: Replace `STEPS` usage in the step indicator with `[t.accountDetails, t.businessInfo, t.documents]` inline
3. **Replace hardcoded section headings**:
   - `"Account Details"` → `t.accountDetails`
   - `"Business Information"` → `t.businessInfo`
   - `"Business Documents"` → `t.businessDocsTitle`
4. **Replace hardcoded field labels**:
   - `"Full Name *"` → `t.fullNameLabel`
   - `"Phone Number *"` → `t.phoneLabel2`
   - `"Email Address (optional)"` → `t.emailLabel`
   - `"Password *"` → `t.passwordPlaceholder`
   - `"Confirm Password *"` → `t.confirmPassword`
   - `"Min. 6 characters"` placeholder → `t.minPassword`
   - `"Company / Business Name *"` → `t.companyNameLabel`
   - `"Business Type"` label → `t.businessTypeLabel2`
   - `"Location (City)"` label → `t.locationLabel`
   - `"Website (optional)"` → `t.websiteLabel`
   - `"Business License Number *"` → `t.businessLicenseLabel`
   - `"TIN Number"` → `t.tinLabel`
   - `"E-LMIS Registration"` → `t.elmisLabel`
5. **Replace hardcoded button text**:
   - `"Next: Business Info →"` → `t.nextBusiness`
   - `"Next: Documents →"` → `t.nextDocs`
   - `"← Back"` (both instances) → `t.back`
   - `{loading ? 'Creating Account...' : 'Create Account →'}` → `{loading ? t.creating : t.createAccount}`
6. **Replace step-2 description and info note**:
   - `"We only work with licensed businesses. Please provide your official document numbers."` → `t.businessDocsDesc`
   - The info note box content → `t.licenseInfo`
7. **Replace hardcoded `'Registration failed.'` fallback** → `t.registrationFailed`
8. **Replace `"Create your business account"` subtitle** → `t.registerTitle`
9. **Replace `"Already have an account?"` text** → `t.alreadyHave`

## Testing Strategy

### Validation Approach

Two-phase approach: first confirm the bug is reproducible on unfixed code by rendering components with non-English lang and asserting English strings appear (counterexample collection), then verify the fix produces translated output and preserves all functional behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm the root cause (missing `useLang` call and hardcoded strings).

**Test Plan**: Render `UserDashboard` and `Register` wrapped in a `LangProvider` with `lang` forced to `'am'`, then assert that key strings match Amharic translations. On unfixed code these assertions will fail, confirming the bug.

**Test Cases**:
1. **Dashboard title in Amharic** (will fail on unfixed code): Render `UserDashboard` with `lang='am'`, assert heading text equals `"የእኔ ዳሽቦርድ"` — will find `"My Dashboard"` instead
2. **Dashboard Sign Out button in Oromo** (will fail on unfixed code): Render with `lang='or'`, assert button text equals `"Ba'i"` — will find `"Sign Out"` instead
3. **Register step labels in Amharic** (will fail on unfixed code): Render `Register` with `lang='am'`, assert step 0 label equals `"የመለያ ዝርዝሮች"` — will find `"Account"` instead
4. **Register step-2 info note in Oromo** (will fail on unfixed code): Advance to step 2 with `lang='or'`, assert info note contains Oromo text — will find English instead

**Expected Counterexamples**:
- Rendered text equals English literals regardless of `lang` value
- Root cause confirmed: `UserDashboard` has no `useLang` call; `Register` has hardcoded `STEPS` and JSX string literals

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed components render translated strings.

**Pseudocode:**
```
FOR ALL lang IN ['am', 'or'] DO
  FOR ALL (component, key) IN buggyStrings DO
    rendered := render(component, lang)
    ASSERT textOf(rendered, key) = translations[lang][key]
  END FOR
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (`lang === 'en'`), the fixed components produce output identical to the original.

**Pseudocode:**
```
FOR ALL (component, key) IN allStrings DO
  ASSERT render_fixed(component, 'en')[key] = render_original(component, 'en')[key]
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain (all language values, all form states)
- It catches edge cases that manual unit tests might miss (e.g., switching language mid-form)
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on unfixed code with `lang='en'` to establish baseline, then write property-based tests asserting the same output after the fix.

**Test Cases**:
1. **English rendering preservation**: For `lang='en'`, all strings in both components match current hardcoded values
2. **Validation logic preservation**: For any `lang`, submitting an incomplete form still triggers the same validation errors
3. **City/business-type selector preservation**: For any `lang`, the selectors still use `CITY_TRANSLATIONS` and `BUSINESS_TYPE_GROUPS` with the active `lang`
4. **Status badge preservation**: Dashboard renders `profile.status` raw value unchanged for any `lang`

### Unit Tests

- Render `UserDashboard` with `lang='am'` and assert `t.myDashboardTitle`, `t.signOut`, `t.underReview`, `t.underReviewMsg`, tab labels, and save button text are displayed
- Render `Register` step 0 with `lang='or'` and assert step indicator labels, section heading, field labels, and button text match Oromo translations
- Render `Register` step 2 with `lang='am'` and assert `t.businessDocsTitle`, `t.businessDocsDesc`, `t.licenseInfo`, `t.createAccount` are displayed
- Verify `Register` validation errors still fire in all three languages

### Property-Based Tests

- For any `lang` in `['en', 'am', 'or']`, every visible string in `UserDashboard` equals `translations[lang][correspondingKey]` (Property 1 + Property 2)
- For any `lang` in `['en', 'am', 'or']`, switching language causes `Register` step labels to immediately reflect the new language (Property 1)
- For any `lang`, `Register` form validation behavior is identical to the original (Property 3)

### Integration Tests

- Full register flow (step 0 → 1 → 2 → submit) with `lang='am'`: all strings translated at each step, form submits correctly
- Switch language from `en` to `am` while on `/register` step 1: all visible strings update immediately
- Dashboard tab switching with `lang='or'`: tab labels and section content display in Oromo
- Dashboard save profile with `lang='am'`: success message displays `t.profileUpdated` in Amharic
