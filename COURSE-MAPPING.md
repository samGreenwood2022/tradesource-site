# Course notes for TradeSource

Everything below is fictional. Use this when you write or port a course test (Cypress or
Playwright) against the training site. The Cypress framework that runs against it lives in
[TradeSource-Cypress](https://github.com/samGreenwood2022/TradeSource-Cypress/).

## Basics

| Item | TradeSource |
|---|---|
| Base URL | `http://localhost:4321` (`npm start`) |
| Home | `/en/gb` |
| Manufacturer | **Vortix** (`/en/gb/manufacturer/vortix/vtxA1B2C3D4E5F6G7H8/overview`) |
| Manufacturer with a **CPD** tab | **Halden Locks UK** (`/en/gb/manufacturer/halden-locks-uk/hldtIYD2mz1WnVtvyGn/overview`) |
| Product | **Vortix Airbar V Hand Dryer** |
| Vortix phone | `08001234567` |
| Halden phone | `+44 (0)191 498 0123` (href `tel:+44 (0)191 498 0123`). The spaces in the href are deliberate |
| Page title | `Vortix \| Overview \| TradeSource` |
| Vortix website | `https://www.vortix-commercial.example/overview` |
| Vortix tagline | "Commercial cleaning equipment, built for daily use" |

Manufacturer tab hrefs follow `/en/gb/manufacturer/<slug>/<id>/<section>` with sections
`overview`, `products`, `third-party-certifications` (or `cpd`), `literature`, `case-studies`, `about`.

## Product page and breadcrumbs

Product URL: `/en/gb/product/vortix-ab-v/TEnfYYR0sgglYs7gmQOCzL/zdp7Odro0hT6MHVuk0hIvF`

Breadcrumb trail (seven links, in `<app-breadcrumbs>`; the `<nav>` has no accessible name, deliberately):

| text | href |
|---|---|
| Home | `/en/gb` |
| Categories | `/en/gb/categories` |
| Catalogue | `/en/gb/categories/catalogue` |
| Cleaning and hygiene | `/en/gb/category/catalogue/cleaning-and-hygiene/tHWdvTImJqzji3Ib5sNsi1` |
| Washroom equipment | `/en/gb/category/catalogue/cleaning-and-hygiene/washroom-equipment/I54xuk3HtcTalSqDdrHLcB` |
| Personal drying | `/en/gb/category/catalogue/cleaning-and-hygiene/washroom-equipment/personal-drying/MidvE9rPrKCWmtLMhGeKCh` |
| Hand dryers | `/en/gb/category/catalogue/cleaning-and-hygiene/washroom-equipment/personal-drying/hand-dryers/eY5VJApKqoGKMckxgCgUKE` |

## Certifications tab and network stubs

The tab loads its data with real requests to **`POST /api/graphql`**, which stands in for the
site's GraphQL API. As in the course, requests are batched (the body and the response
are **arrays**), and two requests share the operation name `certifications`: one for the filter
options and one for the result tiles. Only the tiles request mentions `paginatedResponse`, and its
response has `data.certifications.byBrandId.paginatedResponse.items[].name` and `.totalItems`.

So a `stubCertifications()` helper only needs to intercept this URL:

```ts
await page.route("**/api/graphql", ...)
resp.url().includes("/api/graphql")
```

Everything else (rename / empty / 500 / abort / slow / malformed) behaves the same way:

| Outcome | What the page does |
|---|---|
| Items returned | `<app-search-result-wrapper>` with tiles (`[data-cy="searchResultTileTitle"]`, text padded with spaces) |
| No items | wrapper with `<app-no-results-guidance>` ("Sorry, no results were found") |
| 500, dropped connection, `paginatedResponse: null` | `<app-certificate-list>` appears but stays **blank**: no wrapper, no tiles, no message |

Other tabs use the same API with different operation names: `cpd` (Halden has 3 items),
`literature` (Vortix 2, Halden 1) and `caseStudies` (empty for everyone, so the "no results"
state is reachable without stubbing). The Overview's "Certification bodies" section comes from a
separate `certificationBodies` request a moment after the page shell appears, so it needs an explicit wait.

Set `API_DELAY_MS=0` (or a larger number) when starting the server to change the API's latency.

## Pop-ups

A cookie banner (button **Accept all**) appears about a second after load. Once it is dealt with, a
"new feature" dialog (button **Close dialog**) follows. Both sit behind a
`.cdk-overlay-backdrop-showing` backdrop with `aria-modal="false"`, so the page behind stays
"visible" but clicks fail. Your `dismissOverlaysAutomatically` handler works unchanged.

Choices are remembered (cookie `tradesource_consent`, localStorage `tradesource.newFeatureSeen`), and
Cypress/Playwright clear those between tests, so the pop-ups come back each time. To switch them
off for tests that are not about pop-ups, set the cookie `tradesource_overlays=off` before the page loads:

```ts
// Cypress
cy.setCookie('tradesource_overlays', 'off')
// Playwright
await context.addCookies([{ name: 'tradesource_overlays', value: 'off', url: baseURL }])
```

## Search

Like NBS Source, the homepage has two identical search fields (hero and header) and shows
only one, depending on screen width; every other page has one. A test that targets
`[data-cy="searchFieldSearch"]` on the homepage therefore matches two elements, and has to
pick the visible one (`.filter(':visible')` in Cypress, `.filter({ visible: true })` in
Playwright). See `LOCATORS.md` for the details.

Typing two or more characters opens `<app-autocomplete>` with a Manufacturers section and a
Products section (`app-autocomplete article.manufacturers a[href*="/manufacturer/vortix/"]`).
It closes on Enter, Escape, a click elsewhere or navigation. The search results tabs are
Products, Manufacturers, CPD, Literature and Case studies.

## Visual regression

The homepage has the four rotating regions your masks target: `app-sponsored-brands`,
`app-sponsored-products`, `app-sponsored-cpd` and `app-inspiration-grid`. They are added to the page
only as you scroll near them (lazy-loaded), pick random content on every load, and keep a **fixed size**
so a mask lines up each time. Baselines are not stored in this repo: capture your own with your
framework's first run. Manufacturer, product and category pages are static between loads.

## Not replicated

The OneTrust geolocation API test calls a third party. TradeSource has no geolocation lookup: the detected
country is fixed at the UK, so the locale button shows "UK" by default and there is nothing equivalent to call.
(The location and language selector, region confirmation and reminder banner are replicated; see LOCATORS.md.) The `@block-analytics` scenario still works (there is nothing to block).
