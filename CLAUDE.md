# TradeSource: notes for Claude

TradeSource is a **fictional** replica of the NBS Source site. It is the target for Sam Greenwood's Cypress and Playwright automation course, so the same locators and journeys must exist here as on NBS Source. Nothing on it is real: brands, products, phone numbers, social links and the API are all invented.

Read `README.md` (overview), `LOCATORS.md` (locator strategies and deliberate quirks) and `COURSE-MAPPING.md` (NBS Source to TradeSource mapping) before changing anything. Don't copy their content here.

## Working rules (from Sam)

- **Never commit or push to `master`, and never merge.** For every change: new branch, then a pull request for Sam to review. Check which PRs are already merged before choosing a PR base (`gh api repos/samGreenwood2022/tradesource-site/pulls?state=all`).
- **Don't write or change tests in the TradeSource-Cypress repo.** Sam is building that framework and replicating the course tests himself. `examples/locator-examples.spec.ts` here is a reference catalogue only.
- Update `README.md` / `LOCATORS.md` in the same PR as any change to features or locators. Both files get appended to often, so expect merge conflicts when PRs run in parallel and keep both sides when resolving.

## Running it

- `npm start` serves the site at `http://localhost:4321` (`PORT` overrides it). There are no dependencies and no build step.
- `API_DELAY_MS` (default 150) sets the fake API latency.
- `npm run images` regenerates the SVG artwork in `public/images/` from `scripts/generate-images.js`. Edit the script, not the SVGs.
- Test sign-in (fictional): `test.user@tradesource.example` / `Password123!`.

## Architecture

- `server.js`: static server with SPA fallback, a path-traversal guard (403 outside `public/`), and two fake endpoints: `POST /api/graphql` and `POST /api/contact-manufacturer`.
- `public/app.js`: vanilla JS router and all views, with delegated `a[data-spa]` navigation. Shared helpers are on `window.TS` (`util.js`). `data.js` holds all fictional data; `api-data.js` holds the API data.
- `public/overlays.js`: cookie banner and "new feature" dialog.
- Session is demo-only: `localStorage` key `tradesource.session`.

## Contracts to keep stable

These are what Sam's tests depend on. Don't rename or restructure them casually.

- **Locators mirror NBS Source:** `a[action="telephone"]`, `.mat-mdc-tab-links`, `button.contact-button`, the "Choose location and language" button, `data-cy` / `data-testid` / `id` on key elements. The Contact button's text keeps its padding spaces (`" Contact manufacturer "`).
- **Angular-style custom elements** are deliberate stable hooks: `app-breadcrumbs`, `app-autocomplete`, `app-certificate-list`, `app-search-result-wrapper`, `app-no-results-guidance`, `app-sponsored-*`, `app-inspiration-grid`.
- **GraphQL shape:** requests are an array of `{operationName, query, variables}` and responses are an array. The tiles query (containing `paginatedResponse`) returns `data.<op>.byBrandId.paginatedResponse.{items,totalItems}`; the filters query returns `filters`. Sam's stub tests (rename, empty, 500, slow, dropped, malformed) rely on this, and the only URL change from NBS is `**/api.source.thenbs.com/graphql` to `**/api/graphql`.
- **Deliberate quirks, not bugs:** breadcrumb `<nav>` has no accessible name, the Browse menu has an explicit `role="menu"`, manufacturer cards have long accessible names, the social links are icon-only, and two search boxes exist (desktop plus a hidden mobile copy).
- **Contact manufacturer:** signed out shows a "Sign in required" dialog; signed in shows a Subject/Question form posting to `/api/contact-manufacturer`. When the dialog is open, the header "Sign in" and the dialog's "Sign in to continue" can both match, so tests scope to `role=dialog`.
- **Overlays:** the cookie banner and feature dialog are sequential on purpose (two overlays sharing one backdrop deadlocked `addLocatorHandler`). Switch them off with the cookie `tradesource_overlays=off`.
- **Visual stability:** the homepage lazy regions use fixed tile heights so masked screenshots stay stable. Don't make their sizes content-dependent. Baselines are not committed (they're per browser and OS).
- **Look:** a cohesive green and teal palette. Sam asked for low contrast between tile colours, so avoid introducing clashing hues.
- **Artwork:** original generic SVGs only. No real brand logos, including social platforms, and no copyrighted images.

## Gotchas

- Fixed port 4321. Start the server with `nohup node server.js >/dev/null 2>&1 </dev/null &` and don't stop it with `pkill -f` patterns that can match the calling shell.
- `gh pr create` fails here (GraphQL blocked). Use `gh api repos/samGreenwood2022/tradesource-site/pulls -f ...` (REST).
- This clone can be shallow, so remote-tracking refs may be missing after a push. If force-pushing a rebased branch, pass an explicit `--force-with-lease=<branch>:<sha>`.
- The OneTrust geolocation test from the NBS course can't be replicated (third-party service).
