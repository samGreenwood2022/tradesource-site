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
