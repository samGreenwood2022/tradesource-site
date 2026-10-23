# TradeSource — practice site

A small, fictional trade-products directory site, built as a Cypress/Playwright
automation-testing practice target for The QA Workshop's training course.

The Cypress framework that runs tests against this site lives in a separate
repository: [TradeSource-Cypress](https://github.com/samGreenwood2022/TradeSource-Cypress/),
one of Sam Greenwood's automation repositories, created with his course. This
repo is the site under test; that repo holds the tests.

Nothing here is real: TradeSource, Vortix, Ferroline, Brightcore, the phone
numbers, and the `.example` website URLs are all invented for this course.

## Running it

No dependencies to install — it's plain HTML/CSS/JS served by a small
built-in Node script.

```bash
npm start
# or: node server.js
```

Then visit **http://localhost:4321** (or set `PORT=xxxx` before running to
use a different port). Use `http://localhost:4321` as your Cypress `baseUrl`.

## What it supports

- **Home page** at `/en/gb` with two identical search fields, like NBS
  Source: one in the hero and one in the header. Only one is visible at a
  time (hero on screens wider than 640px, header on narrower ones), so
  `.filter(':visible')` has a genuine job to do. Every other page has just
  the header search field.
- **Search results** at `/en/gb/search?q=<term>`, with three tabs — All,
  Manufacturers, Products — each tagged `data-cy="tabCategory"`.
- **Manufacturer pages** at `/manufacturer/<slug>/<id>/overview`, each with
  an `h1`, a tagline paragraph, a telephone link, a website link, and a
  "Contact manufacturer" button — the shape the course tests expect.

Three fictional manufacturers are seeded in `public/data.js`: **Vortix**
(commercial cleaning equipment), **Ferroline** (fixings), and **Brightcore**
(lighting). Add more there if you want extra search/filter scenarios.

## Sign-in (demo)

A "Sign in" button sits top-right in the header on every page. It takes the
user to `/en/gb/signin?returnUrl=<page they came from>`:

1. **Email step** – enter an email, click **Next** (empty / badly formatted emails show an error).
2. **Password step** – enter a password, click **Sign in**. Wrong credentials show
   "Incorrect email address or password." Success returns the user to the page they
   started from, and the button is replaced by an avatar (initials).

The avatar opens a small menu with the user's email and a **Sign out** button.

Demo account (fictional, visible in `public/data.js`):

| Email                             | Password       |
|-----------------------------------|----------------|
| `test.user@tradesource.example`   | `Password123!` |

The session lives in `localStorage` under `tradesource.session`, so Cypress's
default per-test clearing signs the user out between tests. This is not real
authentication.

| Element                | Selector                         |
|------------------------|----------------------------------|
| Header sign-in button  | `[data-cy="signInButton"]`       |
| Email field / Next     | `[data-cy="signInEmail"]` / `[data-cy="signInNext"]` |
| Password field / Submit| `[data-cy="signInPassword"]` / `[data-cy="signInSubmit"]` |
| Error message          | `[data-cy="signInError"]`        |
| Email shown on step 2  | `[data-cy="signInEmailDisplay"]` |
| Back to email step     | `[data-cy="signInBack"]`         |
| Avatar / menu          | `[data-cy="userAvatar"]` / `[data-cy="userMenu"]` |
| Sign out               | `[data-cy="signOutButton"]`      |

## What's on the site

- **Home** `/en/gb`: hero banner with its own search field, and four lazy-loaded, rotating sections (sponsored brands / products / CPD and an inspiration grid).
- **Two search fields on the homepage only** (copying NBS Source): the hero field (`app-search-bar[data-cy="homepageSearch"]`) and the header field (`app-search-bar[data-cy="headerSearch"]`). The inputs are identical apart from their ids (`search-input-0` header, `search-input-1` hero). Above 640px wide the hero field shows and the header field has `visibility: hidden`; at 640px and below the hero field has `display: none` and the header field shows. On every other page the header field is the only one and is always visible.
- **Header (every page):** logo, "Choose location and language" (UK), search field with autocomplete suggestions, search button, **Sign in** button (or avatar when signed in), plus a **Browse** menu of categories.
- **Search** `/en/gb/search?q=<term>`: tabs for Products, Manufacturers, CPD, Literature and Case studies.
- **Manufacturer pages** `/en/gb/manufacturer/<slug>/<id>/<section>`: tab strip, telephone and website links, "Contact manufacturer", async "Certification bodies", and tabs backed by the fictional API. Four manufacturers: Vortix, Ferroline, Brightcore and Halden Locks UK (which has a **CPD** tab instead of Certifications).
- **Location and language selector:** the header "UK" button opens a "Choose your location and language" panel (custom comboboxes for Location: UK, Canada, United States, Ireland; Language: English, plus Français for Canada). Saving a different country shows a "Confirm region change" dialog (**Remain in United Kingdom** / **Change to Canada**); confirming goes to the homepage and shows a "You are viewing content for Canada." reminder banner at the bottom (country dropdown, **Continue**, dismiss). The detected country is fixed at the UK; the choice is kept in `localStorage` (`tradesource.region`) and the banner's dismissal in `sessionStorage`.
- **Social links** on manufacturer pages: four icon-only links (LinkedIn, Facebook, YouTube, Instagram) with placeholder `example.com` URLs and original generic icons.
- **Contact manufacturer** (button on every manufacturer page): signed out, it opens a modal "Sign in required" dialog (`Sign in to continue` returns you to the same manufacturer page after sign-in); signed in, it opens a "Contact <name>" form with **Subject** and **Question** (both required, inline `role="alert"` errors), posts to the fake `POST /api/contact-manufacturer` and shows "Message sent" with a `MSG-XXXXXX` reference. Nothing is stored or sent. Escape, Cancel and the close button dismiss it.
- **Products** `/en/gb/product/<slug>/<id>/<listingId>` with a seven-link breadcrumb trail and a specification table.
- **Categories** `/en/gb/categories`, `/en/gb/categories/catalogue` and `/en/gb/category/catalogue/.../<id>`.
- **Sign in** `/en/gb/signin`, described above.
- **Pop-ups:** a cookie banner and a "new feature" dialog that arrive late and block clicks (switch off with the cookie `tradesource_overlays=off`).
- **Fictional API** `POST /api/graphql` (batched, stub-able).
- **Artwork:** original SVG logos, product illustrations, category art and hero banner in `public/images/`, generated by `node scripts/generate-images.js` (`npm run images`).

See [`COURSE-MAPPING.md`](COURSE-MAPPING.md) for how the course tests map to this site
(including the one-line change needed for the network stubs).

## Locators

Every key element has several locator options (role, label, placeholder, alt text, title,
`data-cy`, `data-testid`, id, name, class, CSS, XPath). See [`LOCATORS.md`](LOCATORS.md) for
the guide and [`examples/locator-examples.spec.ts`](examples/locator-examples.spec.ts) for a
runnable catalogue (needs `@playwright/test`; run with the site on port 4321).

## Course selectors

The selectors the course page objects and tests use — `data-cy`
attributes, `action` attributes, `.brand-title-container + p`, `h1`,
`button.contact-button` — are all present on this site.
