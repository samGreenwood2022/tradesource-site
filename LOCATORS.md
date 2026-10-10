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
- **Alternatives:** `locatorA.or(locatorB)` (used in your `navigateToNBSHomepage`)

## Things the site deliberately includes for practice

- **Two search boxes** (desktop and a hidden mobile copy) with the same `data-cy`, `placeholder`, `label` and `data-testid`. Role-based locators skip the hidden one automatically; the others need `.filter({ visible: true })`.
- **Two buttons named "Sign in"** at different times (header, then the form). The header one is removed while the form is showing so role locators are unambiguous.
- **A tab strip with the same class names as the NBS pages** (`.mat-mdc-tab-links`) and a `data-cy="certificatesTab"` link; Halden Locks UK shows a **CPD** tab instead of Certifications.
- **Breadcrumbs in an unnamed `<nav>`:** it has no `aria-label`, so `getByRole('navigation', { name: 'Breadcrumb' })` finds nothing and `app-breadcrumbs` is the stable locator (a real accessibility gap, kept as a teaching point).
- **Custom element tags** (`app-autocomplete`, `app-certificate-list`, `app-search-result-wrapper`, `app-no-results-guidance`, `app-sponsored-*`) as stable hooks instead of generated classes.
- **A menu with explicit `role="menu"`** around plain links, which an accessibility scan will flag. Good material for the accessibility scenarios.
- **Content that arrives late:** pop-ups, the lazy-loaded home sections and the "Certification bodies" section all need proper waits.
- **Whitespace in the button text** (`" Contact manufacturer "`), which is why `toHaveText` is used with the padding in the course material.
