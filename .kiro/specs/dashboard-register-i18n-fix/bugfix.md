# Bugfix Requirements Document

## Introduction

Two pages in the `all-things-react` frontend fail to respond to language changes made via the language switcher. `UserDashboard.js` does not import or use `useLang` at all — every visible string is hardcoded in English. `Register.js` imports `useLang` and uses `t.*` for validation messages and a few field labels, but still has many hardcoded English strings for step labels, section headings, field labels, button text, and the info note in step 2. Both pages must use the `t` object from `useLang` so that all visible text switches correctly when the user selects Amharic or Oromo. The `i18n.js` file already contains all required translation keys for both pages in all three languages (en, am, or).

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the user navigates to `/dashboard` and the active language is Amharic or Oromo THEN the system displays all dashboard text (page title "My Dashboard", sign-out button "Sign Out", pending-review banner heading and message, tab labels "👤 Profile" / "🏢 Business Info" / "📱 Social & Extra" / "🔒 Password", section headings, field labels, save/change-password button text, and loading indicator) in English

1.2 WHEN the user navigates to `/register` and the active language is Amharic or Oromo THEN the system displays the step indicator labels ("Account", "Business Info", "Documents"), the section headings ("Account Details", "Business Information", "Business Documents"), the field labels ("Full Name \*", "Phone Number \*", "Email Address (optional)", "Password \*", "Confirm Password \*", "Company / Business Name \*", "Business Type", "Location (City)", "Website (optional)", "Business License Number \*", "TIN Number", "E-LMIS Registration"), the button text ("Next: Business Info →", "Next: Documents →", "← Back", "Create Account →", "Creating Account..."), and the info note in step 2 in English

1.3 WHEN the user changes language while on `/register` THEN the system does not update the step labels, section headings, field labels, button text, or the info note in step 2 to the selected language

### Expected Behavior (Correct)

2.1 WHEN the user navigates to `/dashboard` and the active language is Amharic or Oromo THEN the system SHALL display all dashboard text using the corresponding `t.*` translation keys (`t.myDashboardTitle`, `t.signOut`, `t.underReview`, `t.underReviewMsg`, `t.profileTab`, `t.businessTab`, `t.socialTab`, `t.passwordTab`, `t.saveChanges`, `t.saving`, `t.changePassword`, `t.loading`, `t.profileUpdated`, `t.passwordChanged`, `t.currentPassword`, `t.newPassword`, `t.confirmNewPassword`)

2.2 WHEN the user navigates to `/register` and the active language is Amharic or Oromo THEN the system SHALL display the step indicator labels using `t.accountDetails`, `t.businessInfo`, `t.documents`; section headings using `t.accountDetails`, `t.businessInfo`, `t.businessDocsTitle`; field labels using the corresponding `t.*` keys (`t.fullNameLabel`, `t.phoneLabel2`, `t.emailLabel`, `t.passwordPlaceholder`, `t.confirmPassword`, `t.minPassword`, `t.companyNameLabel`, `t.businessTypeLabel2`, `t.locationLabel`, `t.websiteLabel`, `t.businessLicenseLabel`, `t.tinLabel`, `t.elmisLabel`); button text using `t.nextBusiness`, `t.nextDocs`, `t.back`, `t.createAccount`, `t.creating`; and the info note using `t.licenseInfo`

2.3 WHEN the user changes language while on `/register` THEN the system SHALL immediately update all step labels, section headings, field labels, button text, and the info note to the newly selected language

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the active language is English THEN the system SHALL CONTINUE TO display all dashboard and register text in English, identical to the current hardcoded strings

3.2 WHEN the user interacts with the register form (filling fields, advancing steps, submitting) THEN the system SHALL CONTINUE TO perform the same validation logic and API submission behavior as before

3.3 WHEN the user interacts with the dashboard (switching tabs, saving profile, changing password, logging out) THEN the system SHALL CONTINUE TO perform the same API calls and navigation behavior as before

3.4 WHEN the register page renders the city selector and business-type selector THEN the system SHALL CONTINUE TO use the existing `CITY_TRANSLATIONS` and `BUSINESS_TYPE_GROUPS` locale-aware data as before

3.5 WHEN the dashboard displays the user's account status badge THEN the system SHALL CONTINUE TO show the raw status value from the API response unchanged
