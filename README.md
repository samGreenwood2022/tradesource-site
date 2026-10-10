# TradeSource — practice site

A small, fictional trade-products directory site, built as a Cypress/Playwright
automation-testing practice target for The QA Workshop's training course.
It replaces using a real company's live production site (NBS Source) as an
automation target, which risks breaching that site's terms of service.

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

- **Home page** at `/en/gb` with a search box (two, actually — a visible
  desktop one and a hidden mobile one behind the menu button, so
  `.filter(':visible')` has a genuine job to do).
- **Search results** at `/en/gb/search?q=<term>`, with three tabs — All,
  Manufacturers, Products — each tagged `data-cy="tabCategory"`.
- **Manufacturer pages** at `/manufacturer/<slug>/<id>/overview`, each with
  an `h1`, a tagline paragraph, a telephone link, a website link, and a
  "Contact manufacturer" button — the same shape as the original course's
  Dyson manufacturer page.

Three fictional manufacturers are seeded in `public/data.js`: **Vortix**
(commercial cleaning equipment — the direct replacement for "Dyson" in your
existing course material), **Ferroline** (fixings), and **Brightcore**
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

- **Home** `/en/gb`: hero banner and four lazy-loaded, rotating sections (sponsored brands / products / CPD and an inspiration grid).
- **Header (every page):** logo, "Choose location and language" (UK), search box (desktop + hidden mobile copy) with autocomplete suggestions, search button, **Sign in** button (or avatar when signed in), plus a **Browse** menu of categories.
- **Search** `/en/gb/search?q=<term>`: tabs for Products, Manufacturers, CPD, Literature and Case studies.
- **Manufacturer pages** `/en/gb/manufacturer/<slug>/<id>/<section>`: tab strip, telephone and website links, "Contact manufacturer", async "Certification bodies", and tabs backed by the fictional API. Four manufacturers: Vortix, Ferroline, Brightcore and Halden Locks UK (which has a **CPD** tab instead of Certifications).
- **Social links** on manufacturer pages: four icon-only links (LinkedIn, Facebook, YouTube, Instagram) with placeholder `example.com` URLs and original generic icons.
- **Contact manufacturer** (button on every manufacturer page): signed out, it opens a modal "Sign in required" dialog (`Sign in to continue` returns you to the same manufacturer page after sign-in); signed in, it opens a "Contact <name>" form with **Subject** and **Question** (both required, inline `role="alert"` errors), posts to the fake `POST /api/contact-manufacturer` and shows "Message sent" with a `MSG-XXXXXX` reference. Nothing is stored or sent. Escape, Cancel and the close button dismiss it.
- **Products** `/en/gb/product/<slug>/<id>/<listingId>` with a seven-link breadcrumb trail and a specification table.
- **Categories** `/en/gb/categories`, `/en/gb/categories/catalogue` and `/en/gb/category/catalogue/.../<id>`.
- **Sign in** `/en/gb/signin`, described above.
- **Pop-ups:** a cookie banner and a "new feature" dialog that arrive late and block clicks (switch off with the cookie `tradesource_overlays=off`).
- **Fictional API** `POST /api/graphql` (batched, stub-able).
- **Artwork:** original SVG logos, product illustrations, category art and hero banner in `public/images/`, generated by `node scripts/generate-images.js` (`npm run images`).

See [`COURSE-MAPPING.md`](COURSE-MAPPING.md) for how the NBS Source course tests map to this site
(including the one-line change needed for the network stubs).

## Locators

Every key element has several locator options (role, label, placeholder, alt text, title,
`data-cy`, `data-testid`, id, name, class, CSS, XPath). See [`LOCATORS.md`](LOCATORS.md) for
the guide and [`examples/locator-examples.spec.ts`](examples/locator-examples.spec.ts) for a
runnable catalogue (needs `@playwright/test`; run with the site on port 4321).

## Mapping from the old NBS Source course content

| Old (NBS Source)                                              | New (TradeSource)                                      |
|-----------------------------------------------------------------|---------------------------------------------------------|
| `dyson` / `Dyson`                                                | `vortix` / `Vortix`                                      |
| `nakAxHWxDZprdqkBaCdn4U` (manufacturer id)                       | `vtxA1B2C3D4E5F6G7H8`                                    |
| `Technology for business` (tagline)                              | `Commercial cleaning equipment, built for daily use`     |
| `08003457788`                                                    | `08001234567`                                            |
| `https://www.dyson.co.uk/commercial/overview`                   | `https://www.vortix-commercial.example/overview`         |
| `source.thenbs.com` / NBS Source                                 | `localhost:4321` / TradeSource                           |

Every selector your existing page objects and tests use — `data-cy`
attributes, `action` attributes, `.brand-title-container + p`, `h1`,
`button.contact-button` — is reproduced exactly, so swapping these values
in your test code and course appendices is a find-and-replace job, not a
rewrite.
