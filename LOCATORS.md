# Locator guide

The training site gives almost every element **several different ways to be found**, so
you can compare locator strategies in the course. The full element-by-element catalogue
is [`examples/locator-examples.spec.ts`](examples/locator-examples.spec.ts): every
strategy listed there is asserted to resolve, so it doubles as a regression check for
the site's markup.

## Strategies, from most to least recommended

| # | Strategy | Playwright example | Notes |
|---|----------|--------------------|-------|
| 1 | Role + accessible name | `getByRole('button', { name: 'Sign in' })` | Mirrors what a user/screen reader sees. Ignores hidden elements. |
| 2 | Label | `getByLabel('Email address')` | Best for form fields. |
| 3 | Placeholder | `getByPlaceholder('Search TradeSource...')` | Fine for inputs without a label; matches hidden elements too. |
| 4 | Text | `getByText('Contact manufacturer')` | Breaks if wording changes. Use `exact: true` to avoid partial matches. |
| 5 | Alt text | `getByAltText('Vortix logo')` | For images. Decorative images use `alt=""` and are hidden from role queries. |
| 5b | Title | `getByTitle('Call Vortix')` | Only where a `title` attribute exists. |
| 6 | Test id | `getByTestId('sign-in-button')` | Reads `data-testid`. If your config sets `testIdAttribute: 'data-cy'` it reads `data-cy` instead; both exist here. |
| 7 | `data-cy` attribute | `locator('[data-cy="signInButton"]')` | The attribute the Cypress course uses. |
| 8 | `id` | `locator('#sign-in-button')` | Unique per page, but check ids are not generated. |
| 9 | `name` / other attributes | `locator('input[name="email"]')` | Good for forms. |
| 10 | CSS class / structure | `locator('button.sign-in-button')`, `locator('.brand-title-container + p')` | Fragile if styling is refactored. |
| 11 | XPath | `locator('//button[@id="sign-in-button"]')` | Last resort; powerful for text and parent/sibling navigation. |

## Helpers worth teaching alongside

- **Filtering:** `.filter({ hasText: 'Manufacturers' })`, `.filter({ has: page.getByRole('heading') })`, `.filter({ visible: true })`
- **Position:** `.first()`, `.last()`, `.nth(2)` (use sparingly)
- **Chaining / scoping:** `page.locator('.mat-mdc-tab-links').getByRole('link')`
- **Alternatives:** `locatorA.or(locatorB)` (used in the course's homepage navigation helper)

## Things the site deliberately includes for practice

- **Two search boxes** (desktop and a hidden mobile copy) with the same `data-cy`, `placeholder`, `label` and `data-testid`. Role-based locators skip the hidden one automatically; the others need `.filter({ visible: true })`.
- **Two buttons named "Sign in"** at different times (header, then the form). The header one is removed while the form is showing so role locators are unambiguous.
- **A tab strip with Angular Material-style class names** (`.mat-mdc-tab-links`) and a `data-cy="certificatesTab"` link; Halden Locks UK shows a **CPD** tab instead of Certifications.
- **Breadcrumbs in an unnamed `<nav>`:** it has no `aria-label`, so `getByRole('navigation', { name: 'Breadcrumb' })` finds nothing and `app-breadcrumbs` is the stable locator (a real accessibility gap, kept as a teaching point).
- **Custom element tags** (`app-autocomplete`, `app-certificate-list`, `app-search-result-wrapper`, `app-no-results-guidance`, `app-sponsored-*`) as stable hooks instead of generated classes.
- **A menu with explicit `role="menu"`** around plain links, which an accessibility scan will flag. Good material for the accessibility scenarios.
- **Content that arrives late:** pop-ups, the lazy-loaded home sections and the "Certification bodies" section all need proper waits.
- **Whitespace in the button text** (`" Contact manufacturer "`), which is why `toHaveText` is used with the padding in the course material.
- **Icon-only social links** on every manufacturer page: a `<ul data-cy="socialLinks">` (list named "<Manufacturer> on social media") of four links, each containing only an image with empty `alt`. Locate by accessible name (`getByRole('link', { name: 'Vortix on LinkedIn' })`), `data-cy="social-linkedin"` / `data-testid="social-linkedin"` (also `facebook`, `youtube`, `instagram`), `title`, or `href`. They open in a new tab (`target="_blank"`), so use `context.waitForEvent('page')` in Playwright, or assert the attributes in Cypress (`should('have.attr', 'target', '_blank')`). URLs are `https://example.com/social/<manufacturer>/<platform>`; the icons are original generic glyphs, not real brand logos.
- **A modal contact flow with two states** (`role="dialog"`, `aria-modal="true"`, `data-cy="contactDialog"`). While it is open the page behind is covered by a `cdk-overlay-backdrop`, so there are briefly two "Sign in" buttons (header and, in the form-free state, "Sign in to continue"): scope with `page.getByRole('dialog')`. Fields: `getByLabel('Subject')`, `getByLabel('Question')`, `getByRole('button', { name: 'Send message' })`. The send is a real network call to `POST /api/contact-manufacturer`, so it can be stubbed with `page.route` / `cy.intercept` (try a 500 to see the "could not send" message, which keeps the dialog open).

- **Custom dropdowns, not native `<select>`:** the Location, Language and banner Country controls are `role="combobox"` buttons that open a `role="listbox"` of `role="option"` items, like Angular Material selects. `selectOption()` will not work: click the combobox (`getByRole('combobox', { name: 'Location' })`), then click the option (`getByRole('option', { name: 'Canada' })`). In Cypress: `cy.findByRole`-style queries or `cy.get('[data-testid="region-location"]').click()` then `cy.contains('[role="option"]', 'Canada').click()`.
- **Region journey, in three layers:** panel (`role="dialog"` named "Choose your location and language", `data-cy="regionPanel"`; Cancel / Save), confirm dialog (`role="dialog"` named "Confirm region change", `aria-modal`, `data-cy="regionConfirmDialog"`; the close button is named "Close"), and the bottom banner (`role="region"` named "Region reminder", `data-cy="regionBanner"`; **Continue** and "Dismiss region reminder"). The header button's text changes to the country code (UK / CA / US / IE). Because the homepage heading sits under the open panel, click elsewhere to test outside-click dismissal.
- **Reset state between tests:** the region lives in `localStorage` (`tradesource.region`) and the banner dismissal in `sessionStorage`, so Cypress's per-test clearing resets both; with Playwright a fresh context does the same.

