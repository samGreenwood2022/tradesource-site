// locator-examples.spec.ts — a catalogue of locator strategies for every key
// element on the TradeSource training site.
//
// Each element lists several DIFFERENT ways to find the same thing, so you can
// compare them in the course: role / label / text / placeholder / title / test id
// / data-cy / id / name / class / CSS / XPath, plus Playwright's chaining and
// filtering helpers. Every strategy here is asserted to resolve, so if the site
// changes and a locator stops working, this file tells you which one.
//
// The labels are ordered roughly from "most recommended" to "last resort".
// As a rule of thumb: prefer user-facing locators (role, label, text) because
// they mirror what a person sees; fall back to a test id when the text is not
// stable; use CSS/XPath only when nothing better exists.
//
// Run it (site must be running on http://localhost:4321):
//   npx playwright test examples/locator-examples.spec.ts
// Playwright's getByTestId() reads data-testid by default. If your own config
// sets testIdAttribute to "data-cy", getByTestId() will use data-cy instead —
// both attributes exist on this site, so either setup works.

import { test, expect, Page, Locator } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const MANUFACTURER_PATH = '/en/gb/manufacturer/vortix/vtxA1B2C3D4E5F6G7H8/overview';
const DEMO_USER = { email: 'test.user@tradesource.example', password: 'Password123!' };

type Strategy = [label: string, find: (page: Page) => Locator];
type Element = { name: string; strategies: Strategy[]; count?: number };
type Group = {
  title: string;
  setup: (page: Page) => Promise<void>;
  elements: Element[];
};

// ---------------------------------------------------------------------------
// Setup helpers
// ---------------------------------------------------------------------------

// The site shows a cookie banner and a "new feature" pop-up a moment after load.
// They would get in the way of these examples, so switch them off with a cookie
// (see the overlay example at the bottom of this file for handling them instead).
async function overlaysOff(page: Page) {
  await page.context().addCookies([{ name: 'tradesource_overlays', value: 'off', url: BASE }]);
}

async function signedOut(page: Page, path: string) {
  await overlaysOff(page);
  await page.goto(BASE + '/en/gb');
  await page.evaluate(() => localStorage.clear());
  await page.goto(BASE + path);
}

async function signedIn(page: Page, path: string) {
  await overlaysOff(page);
  await page.goto(BASE + '/en/gb');
  await page.evaluate(() =>
    localStorage.setItem(
      'tradesource.session',
      JSON.stringify({ email: 'test.user@tradesource.example', firstName: 'Test', lastName: 'User' }),
    ),
  );
  await page.goto(BASE + path);
}

// ---------------------------------------------------------------------------
// The catalogue
// ---------------------------------------------------------------------------

const groups: Group[] = [
  {
    title: 'Header (every page, signed out)',
    setup: (page) => signedOut(page, '/en/gb'),
    elements: [
      {
        name: 'Logo link',
        strategies: [
          ['role + name', (p) => p.getByRole('link', { name: 'TradeSource', exact: true })],
          ['title', (p) => p.getByTitle('TradeSource home')],
          ['test id', (p) => p.getByTestId('logo-home')],
          ['data-cy', (p) => p.locator('[data-cy="logoHome"]')],
          ['id', (p) => p.locator('#site-logo')],
          ['css class', (p) => p.locator('a.logo')],
          ['css href attribute', (p) => p.locator('header a[href="/en/gb"]')],
          ['xpath', (p) => p.locator('//header//a[@id="site-logo"]')],
        ],
      },
      {
        name: 'Locale button (shows "UK")',
        strategies: [
          ['role + aria-label', (p) => p.getByRole('button', { name: 'Choose location and language' })],
          ['label text', (p) => p.getByLabel('Choose location and language')],
          ['test id', (p) => p.getByTestId('locale-button')],
          ['data-cy', (p) => p.locator('[data-cy="localeButton"]')],
          ['id', (p) => p.locator('#locale-button')],
          ['css class', (p) => p.locator('button.locale-button')],
          ['role + has text', (p) => p.getByRole('button').filter({ hasText: 'UK' })],
          ['xpath by text', (p) => p.locator('//button[span[normalize-space()="UK"]]')],
        ],
      },
      {
        name: 'Search field (desktop copy)',
        strategies: [
          ['role + name', (p) => p.getByRole('textbox', { name: 'Search' })],
          // The page has a hidden mobile copy of the search box too. Role-based locators
          // ignore hidden elements automatically; placeholder/label/test id do not, so
          // those need .filter({ visible: true }).
          ['placeholder (visible copy)', (p) => p.getByPlaceholder('Search TradeSource...').filter({ visible: true })],
          ['label (visible copy)', (p) => p.getByLabel('Search products or manufacturers').filter({ visible: true })],
          ['test id (visible copy)', (p) => p.getByTestId('search-input').filter({ visible: true })],
          ['data-cy (visible copy)', (p) => p.locator('[data-cy="searchFieldSearch"]').filter({ visible: true })],
          ['id', (p) => p.locator('#search-desktop')],
          ['name attribute', (p) => p.locator('input[name="q"]').filter({ visible: true })],
          ['css class + type', (p) => p.locator('input.search-field[type="text"]').filter({ visible: true })],
          ['scoped to the form', (p) => p.locator('[data-cy="searchFormDesktop"]').getByRole('textbox')],
          ['xpath', (p) => p.locator('//form[@data-cy="searchFormDesktop"]//input')],
        ],
      },
      {
        name: 'Search button (desktop copy)',
        strategies: [
          ['role + name', (p) => p.getByRole('button', { name: 'Search' })],
          ['title', (p) => p.getByTitle('Search').filter({ visible: true })],
          ['test id (visible copy)', (p) => p.getByTestId('search-button').filter({ visible: true })],
          ['data-cy (visible copy)', (p) => p.locator('[data-cy="searchButton"]').filter({ visible: true })],
          ['id', (p) => p.locator('#search-button-desktop')],
          ['css attribute', (p) => p.locator('button[type="submit"][aria-label="Search"]').filter({ visible: true })],
          ['xpath', (p) => p.locator('//form[@data-cy="searchFormDesktop"]//button')],
        ],
      },
      {
        name: 'Sign in button',
        strategies: [
          ['role + name', (p) => p.getByRole('button', { name: 'Sign in' })],
          ['text (exact)', (p) => p.getByText('Sign in', { exact: true })],
          ['test id', (p) => p.getByTestId('sign-in-button')],
          ['data-cy', (p) => p.locator('[data-cy="signInButton"]')],
          ['id', (p) => p.locator('#sign-in-button')],
          ['css class', (p) => p.locator('button.sign-in-button')],
          ['css :has-text', (p) => p.locator('header button:has-text("Sign in")')],
          ['inside its container', (p) => p.locator('[data-cy="headerAuth"]').getByRole('button')],
          ['xpath by text', (p) => p.locator('//button[normalize-space()="Sign in"]')],
        ],
      },
      {
        name: 'Main navigation Browse button',
        strategies: [
          ['role + name', (p) => p.getByRole('button', { name: 'Browse' })],
          ['data-cy', (p) => p.locator('[data-cy="browseButton"]')],
          ['id', (p) => p.locator('#browse-button')],
          ['scoped to nav landmark', (p) => p.getByRole('navigation', { name: 'Main navigation links' }).getByRole('button')],
          ['aria attribute', (p) => p.locator('button[aria-controls="browse-menu"]')],
        ],
      },
    ],
  },

  {
    title: 'Home page images',
    setup: (page) => signedOut(page, '/en/gb'),
    elements: [
      {
        name: 'Hero image',
        strategies: [
          ['alt text', (p) => p.getByAltText('Illustration of a city skyline at dusk')],
          ['role img + name', (p) => p.getByRole('img', { name: /skyline/ })],
          ['css class', (p) => p.locator('img.hero-image')],
          ['css src attribute', (p) => p.locator('img[src$="hero.svg"]')],
          ['xpath', (p) => p.locator('//section[contains(@class,"hero")]/img')],
        ],
      },
      {
        // The header logo's picture has alt="" because the text beside it already
        // says "TradeSource": decorative images are hidden from role queries.
        name: 'Header logo picture (decorative, alt="")',
        strategies: [
          ['css in logo link', (p) => p.locator('a.logo img')],
          ['css src attribute', (p) => p.locator('header img[src$="favicon.svg"]')],
          ['xpath', (p) => p.locator('//a[@id="site-logo"]/img')],
        ],
      },
    ],
  },

  {
    title: 'Search autocomplete (type two or more characters)',
    setup: async (page) => {
      await signedOut(page, '/en/gb');
      await page.getByRole('textbox', { name: 'Search' }).fill('vor');
    },
    elements: [
      {
        name: 'Suggestions panel',
        strategies: [
          ['component tag', (p) => p.locator('app-autocomplete')],
          ['data-cy', (p) => p.locator('[data-cy="autocomplete"]')],
          ['inside the search form', (p) => p.locator('[data-cy="searchFormDesktop"] app-autocomplete')],
        ],
      },
      {
        name: 'Vortix in the Manufacturers section',
        strategies: [
          ['section + href (course locator)', (p) => p.locator('app-autocomplete article.manufacturers a[href*="/manufacturer/vortix/"]')],
          ['role link in section', (p) => p.locator('article.manufacturers').getByRole('link', { name: /Vortix/ })],
          ['filter by heading', (p) => p.locator('app-autocomplete article').filter({ has: p.getByRole('heading', { name: 'Manufacturers' }) }).getByRole('link')],
          ['xpath', (p) => p.locator('//app-autocomplete//article[contains(@class,"manufacturers")]//a')],
        ],
      },
      {
        name: 'Product suggestions (3)',
        count: 3,
        strategies: [
          ['css section', (p) => p.locator('app-autocomplete article.products a')],
          ['role link in section', (p) => p.locator('article.products').getByRole('link')],
        ],
      },
    ],
  },

  {
    title: 'Sign-in page — step 1 (email)',
    setup: async (page) => {
      await signedOut(page, '/en/gb');
      await page.getByRole('button', { name: 'Sign in' }).click();
    },
    elements: [
      {
        name: 'Email field',
        strategies: [
          ['role + name', (p) => p.getByRole('textbox', { name: 'Email address' })],
          ['label', (p) => p.getByLabel('Email address')],
          ['test id', (p) => p.getByTestId('sign-in-email')],
          ['data-cy', (p) => p.locator('[data-cy="signInEmail"]')],
          ['id', (p) => p.locator('#signInEmail')],
          ['name attribute', (p) => p.locator('input[name="email"]')],
          ['css type', (p) => p.locator('input[type="email"]')],
          ['xpath', (p) => p.locator('//input[@id="signInEmail"]')],
        ],
      },
      {
        name: 'Next button',
        strategies: [
          ['role + name', (p) => p.getByRole('button', { name: 'Next' })],
          ['text', (p) => p.getByText('Next', { exact: true })],
          ['test id', (p) => p.getByTestId('sign-in-next')],
          ['data-cy', (p) => p.locator('[data-cy="signInNext"]')],
          ['id', (p) => p.locator('#sign-in-next')],
          ['css class', (p) => p.locator('form.sign-in-form button.primary-button')],
          ['xpath', (p) => p.locator('//section[@data-cy="signInPage"]//button[@type="submit"]')],
        ],
      },
      {
        name: 'Sign-in page heading',
        strategies: [
          ['role + level', (p) => p.getByRole('heading', { name: 'Sign in', level: 1 })],
          ['css', (p) => p.locator('section.sign-in h1')],
          ['xpath', (p) => p.locator('//section[@data-cy="signInPage"]/h1')],
        ],
      },
    ],
  },

  {
    title: 'Sign-in page — step 2 (password)',
    setup: async (page) => {
      await signedOut(page, '/en/gb');
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.getByLabel('Email address').fill(DEMO_USER.email);
      await page.getByRole('button', { name: 'Next' }).click();
    },
    elements: [
      {
        // A password input is exposed as a textbox, so the same role-based
        // locator you use for the email field works here too.
        name: 'Password field',
        strategies: [
          ['role + name', (p) => p.getByRole('textbox', { name: 'Password' })],
          ['label', (p) => p.getByLabel('Password')],
          ['test id', (p) => p.getByTestId('sign-in-password')],
          ['data-cy', (p) => p.locator('[data-cy="signInPassword"]')],
          ['id', (p) => p.locator('#signInPassword')],
          ['name attribute', (p) => p.locator('input[name="password"]')],
          ['css type', (p) => p.locator('input[type="password"]')],
          ['xpath', (p) => p.locator('//input[@type="password"]')],
        ],
      },
      {
        name: 'Sign in (submit) button',
        strategies: [
          ['role + name', (p) => p.getByRole('button', { name: 'Sign in' })],
          ['test id', (p) => p.getByTestId('sign-in-submit')],
          ['data-cy', (p) => p.locator('[data-cy="signInSubmit"]')],
          ['id', (p) => p.locator('#sign-in-submit')],
          ['css attribute', (p) => p.locator('section.sign-in button[type="submit"]')],
          ['xpath', (p) => p.locator('//button[normalize-space()="Sign in"]')],
        ],
      },
      {
        name: 'Email shown on step 2',
        strategies: [
          ['text', (p) => p.getByText(DEMO_USER.email)],
          ['data-cy', (p) => p.locator('[data-cy="signInEmailDisplay"]')],
          ['css class', (p) => p.locator('p.sign-in-email')],
        ],
      },
      {
        name: 'Use a different email button',
        strategies: [
          ['role + name', (p) => p.getByRole('button', { name: 'Use a different email' })],
          ['test id', (p) => p.getByTestId('sign-in-back')],
          ['id', (p) => p.locator('#sign-in-back')],
          ['css class', (p) => p.locator('button.link-button')],
        ],
      },
    ],
  },

  {
    title: 'Header (signed in)',
    setup: (page) => signedIn(page, '/en/gb'),
    elements: [
      {
        name: 'User menu button (avatar)',
        strategies: [
          ['role + aria-label', (p) => p.getByRole('button', { name: 'Open user menu' })],
          ['label', (p) => p.getByLabel('Open user menu')],
          ['test id', (p) => p.getByTestId('user-menu-button')],
          ['data-cy', (p) => p.locator('[data-cy="userAvatar"]')],
          ['id', (p) => p.locator('#user-menu-button')],
          ['css class', (p) => p.locator('button.avatar')],
          ['css aria attribute', (p) => p.locator('button[aria-haspopup="true"]')],
          ['xpath', (p) => p.locator('//button[@aria-label="Open user menu"]')],
        ],
      },
      {
        name: 'User initials ("TU")',
        strategies: [
          ['role figure', (p) => p.getByRole('figure')],
          ['text', (p) => p.getByText('TU', { exact: true })],
          ['test id', (p) => p.getByTestId('user-initials')],
          ['css class', (p) => p.locator('.avatar-initials')],
          ['xpath', (p) => p.locator('//button[@id="user-menu-button"]/span')],
        ],
      },
      {
        name: 'Sign in button is gone',
        count: 0,
        strategies: [
          ['role + name', (p) => p.getByRole('button', { name: 'Sign in' })],
          ['data-cy', (p) => p.locator('[data-cy="signInButton"]')],
        ],
      },
    ],
  },

  {
    title: 'Search results page',
    setup: (page) => signedOut(page, '/en/gb/search?q=vortix'),
    elements: [
      {
        name: 'Heading (the search term)',
        strategies: [
          ['role + name', (p) => p.getByRole('heading', { name: /vortix/i, level: 1 })],
          ['css', (p) => p.locator('section.search-results > h1')],
        ],
      },
      {
        name: 'Manufacturers tab',
        strategies: [
          ['role tab + name', (p) => p.getByRole('tab', { name: 'Manufacturers' })],
          ['text', (p) => p.getByText('Manufacturers', { exact: true })],
          ['test id', (p) => p.getByTestId('tab-manufacturers')],
          ['data-cy + filter text', (p) => p.locator('[data-cy="tabCategory"]').filter({ hasText: 'Manufacturers' })],
          ['data-cy + nth', (p) => p.locator('[data-cy="tabCategory"]').nth(1)],
          ['id', (p) => p.locator('#tab-manufacturers')],
          ['custom data attribute', (p) => p.locator('[data-tab="manufacturers"]')],
          ['tablist container', (p) => p.getByRole('tablist').getByRole('tab', { name: 'Manufacturers' })],
          ['xpath by text', (p) => p.locator('//button[@role="tab" and normalize-space()="Manufacturers"]')],
        ],
      },
      {
        name: 'All five tabs',
        count: 5,
        strategies: [
          ['role', (p) => p.getByRole('tab')],
          ['data-cy', (p) => p.locator('[data-cy="tabCategory"]')],
          ['css class', (p) => p.locator('.tabs .tab-button')],
        ],
      },
      {
        name: 'Active tab (Products)',
        strategies: [
          ['role + selected', (p) => p.getByRole('tab', { selected: true })],
          ['css class', (p) => p.locator('.tab-button.is-active')],
          ['aria attribute', (p) => p.locator('[role="tab"][aria-selected="true"]')],
        ],
      },
      {
        name: 'Result tiles (products tab shows 3 Vortix products)',
        count: 3,
        strategies: [
          ['test id', (p) => p.getByTestId('result-tile')],
          ['data-cy', (p) => p.locator('[data-cy="resultTile"]')],
          ['css class', (p) => p.locator('a.tile--product')],
          ['role link + name', (p) => p.getByRole('link', { name: /Vortix/ })],
        ],
      },
    ],
  },

  {
    title: 'Manufacturer page (Vortix, overview)',
    setup: (page) => signedOut(page, MANUFACTURER_PATH),
    elements: [
      {
        name: 'Page heading',
        strategies: [
          ['role + level', (p) => p.getByRole('heading', { name: 'Vortix', level: 1 })],
          ['test id', (p) => p.getByTestId('manufacturer-name')],
          ['id', (p) => p.locator('#manufacturer-name')],
          ['css tag', (p) => p.locator('h1')],
          ['css in container', (p) => p.locator('.brand-title-container h1')],
          ['xpath', (p) => p.locator('//div[contains(@class,"brand-title-container")]/h1')],
        ],
      },
      {
        name: 'Tagline',
        strategies: [
          ['text', (p) => p.getByText('Commercial cleaning equipment, built for daily use')],
          ['test id', (p) => p.getByTestId('manufacturer-tagline')],
          ['css class', (p) => p.locator('p.manufacturer-tagline')],
          ['css sibling (course locator)', (p) => p.locator('.brand-title-container + p')],
          ['xpath following-sibling', (p) => p.locator('//div[contains(@class,"brand-title-container")]/following-sibling::p[1]')],
        ],
      },
      {
        name: 'Telephone link',
        strategies: [
          ['css action attribute (course locator)', (p) => p.locator('a[action="telephone"]')],
          ['role + name', (p) => p.getByRole('link', { name: '08001234567' })],
          ['text', (p) => p.getByText('08001234567')],
          ['title', (p) => p.getByTitle('Call Vortix')],
          ['test id', (p) => p.getByTestId('manufacturer-phone')],
          ['id', (p) => p.locator('#manufacturer-phone')],
          ['css href starts-with', (p) => p.locator('a[href^="tel:"]')],
          ['xpath', (p) => p.locator('//a[starts-with(@href,"tel:")]')],
        ],
      },
      {
        name: 'Website link (opens in a new tab)',
        strategies: [
          ['css action attribute', (p) => p.locator('a[action="company-website"]')],
          ['role + name', (p) => p.getByRole('link', { name: 'Website' })],
          ['title', (p) => p.getByTitle('Visit https://www.vortix-commercial.example/overview')],
          ['test id', (p) => p.getByTestId('manufacturer-website')],
          ['id', (p) => p.locator('#manufacturer-website')],
          ['css target attribute', (p) => p.locator('a[target="_blank"]')],
          ['xpath', (p) => p.locator('//a[@target="_blank"]')],
        ],
      },
      {
        name: 'Contact manufacturer button',
        strategies: [
          ['role + name', (p) => p.getByRole('button', { name: 'Contact manufacturer' })],
          ['text', (p) => p.getByText('Contact manufacturer')],
          ['test id', (p) => p.getByTestId('contact-manufacturer')],
          ['id', (p) => p.locator('#contact-manufacturer')],
          ['css class', (p) => p.locator('button.contact-button')],
          ['css :has-text', (p) => p.locator('button:has-text("Contact manufacturer")')],
          ['xpath', (p) => p.locator('//button[contains(normalize-space(),"Contact manufacturer")]')],
        ],
      },
      {
        name: 'Navigation tab strip',
        strategies: [
          ['role navigation + name', (p) => p.getByRole('navigation', { name: 'Manufacturer navigation' })],
          ['data-cy', (p) => p.locator('[data-cy="manufacturerNav"]')],
          ['css class (course locator)', (p) => p.locator('.mat-mdc-tab-links')],
          ['xpath', (p) => p.locator('//nav[@aria-label="Manufacturer navigation"]')],
        ],
      },
      {
        name: 'Navigation tabs (6)',
        count: 6,
        strategies: [
          ['links inside strip', (p) => p.locator('.mat-mdc-tab-links').getByRole('link')],
          ['css descendant', (p) => p.locator('.mat-mdc-tab-links a')],
          ['xpath', (p) => p.locator('//div[contains(@class,"mat-mdc-tab-links")]/a')],
        ],
      },
      {
        name: 'Certifications tab',
        strategies: [
          ['role + name', (p) => p.getByRole('link', { name: 'Certifications' })],
          ['data-cy (course locator)', (p) => p.locator('a[data-cy="certificatesTab"]')],
          ['test id', (p) => p.getByTestId('nav-third-party-certifications')],
          ['id', (p) => p.locator('#nav-third-party-certifications')],
          ['css href ends-with', (p) => p.locator('a[href$="/third-party-certifications"]')],
          ['filter by text', (p) => p.locator('.mat-mdc-tab-links a').filter({ hasText: 'Certifications' })],
          ['nth (index 2)', (p) => p.locator('.mat-mdc-tab-links a').nth(2)],
          ['xpath', (p) => p.locator('//a[normalize-space()="Certifications"]')],
        ],
      },
      {
        name: 'Active tab (Overview)',
        strategies: [
          ['aria-current', (p) => p.locator('.mat-mdc-tab-links a[aria-current="page"]')],
          ['css class', (p) => p.locator('a.mdc-tab--active')],
          ['role + name', (p) => p.getByRole('link', { name: 'Overview' })],
        ],
      },
      {
        name: '"Certification bodies" section',
        strategies: [
          ['text', (p) => p.getByText('Certification bodies')],
          ['role heading', (p) => p.getByRole('heading', { name: 'Certification bodies' })],
          ['data-cy', (p) => p.locator('[data-cy="certificationBodies"]')],
          ['css class', (p) => p.locator('section.certification-bodies')],
          ['filter by child (has)', (p) => p.locator('section[data-cy]').filter({ has: p.getByRole('heading', { name: 'Certification bodies' }) })],
        ],
      },
      {
        name: 'Vortix product tiles (3)',
        count: 3,
        strategies: [
          ['test id', (p) => p.getByTestId('result-tile')],
          ['css in grid', (p) => p.locator('.tiles a.tile')],
          ['filter by text', (p) => p.locator('[data-cy="resultTile"]').filter({ hasText: 'Vortix' })],
        ],
      },
      {
        name: 'Manufacturer logo',
        strategies: [
          ['alt text', (p) => p.getByAltText('Vortix logo')],
          ['role img + name', (p) => p.getByRole('img', { name: 'Vortix logo' })],
          ['css class', (p) => p.locator('img.tile-logo--large')],
          ['css src attribute', (p) => p.locator('img[src*="logo-vortix"]')],
        ],
      },
    ],
  },

  {
    title: 'Manufacturer Certifications tab (data loaded from the API)',
    setup: async (page) => {
      await signedOut(page, MANUFACTURER_PATH.replace('/overview', '/third-party-certifications'));
      await expect(page.locator('[data-cy="searchResultTileTitle"]').first()).toBeVisible();
    },
    elements: [
      {
        name: 'Certificate list component',
        strategies: [
          ['component tag', (p) => p.locator('app-certificate-list')],
          ['data-cy', (p) => p.locator('[data-cy="resultList"]')],
        ],
      },
      {
        name: 'Results wrapper',
        strategies: [
          ['component tag', (p) => p.locator('app-search-result-wrapper')],
          ['data-cy', (p) => p.locator('[data-cy="searchResultWrapper"]')],
          ['inside the list', (p) => p.locator('app-certificate-list app-search-result-wrapper')],
        ],
      },
      {
        name: 'Certification tile titles (3)',
        count: 3,
        strategies: [
          ['data-cy (course locator)', (p) => p.locator('[data-cy="searchResultTileTitle"]')],
          ['role heading level 3', (p) => p.getByRole('heading', { level: 3 })],
          ['css', (p) => p.locator('article.result-tile h3')],
        ],
      },
      {
        name: 'First tile',
        strategies: [
          ['data-cy + first()', (p) => p.locator('[data-cy="searchResultTileTitle"]').first()],
          ['text', (p) => p.getByText('Commercial Cleaning Equipment Safety Certificate')],
          ['filter by text', (p) => p.locator('[data-cy="searchResultTile"]').filter({ hasText: 'Safety Certificate' })],
          ['xpath position', (p) => p.locator('(//h3[@data-cy="searchResultTileTitle"])[1]')],
        ],
      },
      {
        name: 'Type filter',
        strategies: [
          ['label', (p) => p.getByLabel('Type')],
          ['role combobox', (p) => p.getByRole('combobox', { name: 'Type' })],
          ['data-cy', (p) => p.locator('[data-cy="filterType"]')],
          ['id', (p) => p.locator('#filter-type')],
          ['css tag in label', (p) => p.locator('label.filter-label select')],
        ],
      },
    ],
  },

  {
    title: 'Manufacturer Case studies tab (empty state, no stubbing needed)',
    setup: (page) => signedOut(page, MANUFACTURER_PATH.replace('/overview', '/case-studies')),
    elements: [
      {
        name: 'No results panel',
        strategies: [
          ['component tag', (p) => p.locator('app-no-results-guidance')],
          ['data-cy', (p) => p.locator('[data-cy="noResultsGuidance"]')],
          ['text', (p) => p.getByText('Sorry, no results were found')],
        ],
      },
      {
        name: 'No tiles',
        count: 0,
        strategies: [['data-cy', (p) => p.locator('[data-cy="searchResultTileTitle"]')]],
      },
    ],
  },

  {
    title: 'Halden Locks UK (the manufacturer with a CPD tab)',
    setup: (page) => signedOut(page, '/en/gb/manufacturer/halden-locks-uk/hldtIYD2mz1WnVtvyGn/overview'),
    elements: [
      {
        name: 'CPD tab (instead of Certifications)',
        strategies: [
          ['role + name', (p) => p.getByRole('link', { name: 'CPD', exact: true })],
          ['data-cy', (p) => p.locator('a[data-cy="cpdTab"]')],
          ['id', (p) => p.locator('#nav-cpd')],
          ['css href ends-with', (p) => p.locator('a[href$="/cpd"]')],
        ],
      },
      {
        name: 'No Certifications tab',
        count: 0,
        strategies: [['data-cy', (p) => p.locator('a[data-cy="certificatesTab"]')]],
      },
      {
        name: 'Telephone link (number written with spaces)',
        strategies: [
          ['css action attribute', (p) => p.locator('a[action="telephone"]')],
          ['text', (p) => p.getByText('+44 (0)191 498 0123')],
          ['css href', (p) => p.locator('a[href="tel:+44 (0)191 498 0123"]')],
        ],
      },
    ],
  },

  {
    title: 'Product page and breadcrumbs',
    setup: async (page) => {
      await signedOut(page, '/en/gb/search?q=airbar');
      await page.getByRole('link', { name: /Vortix Airbar V Hand Dryer/ }).click();
    },
    elements: [
      {
        name: 'Product heading',
        strategies: [
          ['role + level', (p) => p.getByRole('heading', { name: 'Vortix Airbar V Hand Dryer', level: 1 })],
          ['test id', (p) => p.getByTestId('product-name')],
          ['css', (p) => p.locator('.product-header h1')],
        ],
      },
      {
        name: 'Product image',
        strategies: [
          ['alt text', (p) => p.getByAltText('Vortix Airbar V Hand Dryer')],
          ['role img + name', (p) => p.getByRole('img', { name: 'Vortix Airbar V Hand Dryer' })],
          ['css class', (p) => p.locator('img.product-image')],
          ['css src attribute', (p) => p.locator('img[src*="product-vortix-ab-v"]')],
        ],
      },
      {
        // The breadcrumb <nav> has no aria-label, so there is no accessible name
        // to select it by. The component tag is the stable way in.
        name: 'Breadcrumb trail',
        strategies: [
          ['component tag', (p) => p.locator('app-breadcrumbs')],
          ['data-cy', (p) => p.locator('[data-cy="breadcrumbs"]')],
          ['css nav inside component', (p) => p.locator('app-breadcrumbs nav')],
          ['xpath', (p) => p.locator('//app-breadcrumbs/nav/ol')],
        ],
      },
      {
        name: 'Breadcrumb links (7)',
        count: 7,
        strategies: [
          ['role link inside component', (p) => p.locator('app-breadcrumbs').getByRole('link')],
          ['css', (p) => p.locator('app-breadcrumbs li a')],
          ['xpath', (p) => p.locator('//app-breadcrumbs//li/a')],
        ],
      },
      {
        name: 'Last breadcrumb (Hand dryers)',
        strategies: [
          ['role link by name', (p) => p.locator('app-breadcrumbs').getByRole('link', { name: 'Hand dryers' })],
          ['last()', (p) => p.locator('app-breadcrumbs').getByRole('link').last()],
          ['css last-child', (p) => p.locator('app-breadcrumbs li:last-child a')],
          ['css href ends-with', (p) => p.locator('app-breadcrumbs a[href*="/hand-dryers/"]')],
        ],
      },
      {
        name: 'Manufacturer link',
        strategies: [
          ['role + name', (p) => p.getByRole('link', { name: 'Vortix', exact: true })],
          ['data-cy', (p) => p.locator('[data-cy="productManufacturerLink"]')],
          ['css in paragraph', (p) => p.locator('p.product-manufacturer a')],
        ],
      },
      {
        name: 'Specification rows (2)',
        count: 2,
        strategies: [
          ['role row inside table', (p) => p.locator('[data-cy="specTable"]').getByRole('row')],
          ['css', (p) => p.locator('table.spec-table tbody tr')],
        ],
      },
      {
        name: 'Specification value for "Drying time"',
        strategies: [
          ['row filter + cell', (p) => p.getByRole('row').filter({ hasText: 'Drying time' }).getByRole('cell')],
          ['xpath sibling', (p) => p.locator('//th[normalize-space()="Drying time"]/following-sibling::td')],
          ['css :has-text', (p) => p.locator('tr:has-text("Drying time") td')],
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// One test per element, one assertion per strategy
// ---------------------------------------------------------------------------

for (const group of groups) {
  test.describe(group.title, () => {
    for (const element of group.elements) {
      test(element.name, async ({ page }) => {
        await group.setup(page);
        const expected = element.count ?? 1;

        for (const [label, find] of element.strategies) {
          await test.step(label, async () => {
            await expect(find(page), `strategy "${label}"`).toHaveCount(expected);
            if (expected > 0) await expect(find(page).first()).toBeVisible();
          });
        }
      });
    }
  });
}

// ---------------------------------------------------------------------------
// Two "strategy in action" examples — locators are not just for assertions
// ---------------------------------------------------------------------------

test('Example: search then open a manufacturer using role-based locators', async ({ page }) => {
  await signedOut(page, '/en/gb');
  await page.getByRole('textbox', { name: 'Search' }).fill('vortix');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByRole('tab', { name: 'Manufacturers' }).click();
  await page.getByRole('link', { name: 'Vortix Vortix Commercial' }).click();
  await expect(page).toHaveURL(/\/manufacturer\/vortix\//);
  await expect(page).toHaveTitle('Vortix | Overview | TradeSource');
});

test('Example: the same journey using test ids and CSS only', async ({ page }) => {
  await signedOut(page, '/en/gb');
  await page.locator('#search-desktop').fill('vortix');
  await page.locator('#search-button-desktop').click();
  await page.locator('#tab-manufacturers').click();
  await page.locator('a.tile--manufacturer').first().click();
  await expect(page.locator('#manufacturer-name')).toHaveText('Vortix');
});

// ---------------------------------------------------------------------------
// Overlays: a pop-up that arrives late and blocks clicks
// ---------------------------------------------------------------------------
// The site shows a cookie banner, then (once that is dealt with) a "new feature"
// pop-up, each a second or two after the page loads, with a backdrop that
// swallows clicks. addLocatorHandler lets Playwright dismiss whichever one is in
// the way at the moment it matters. (The other tests switch overlays off with a
// cookie instead: tradesource_overlays=off.)

test('Example: dismissing late pop-ups automatically with addLocatorHandler', async ({ page }) => {
  await page.addLocatorHandler(page.locator('.cdk-overlay-backdrop-showing'), async () => {
    const closeButtons = [
      page.getByRole('button', { name: 'Accept all' }).first(),
      page.getByRole('button', { name: 'Close dialog' }).first(),
    ];
    for (const button of closeButtons) {
      if (await button.isVisible()) {
        await button.click();
        return;
      }
    }
  });

  await page.goto(BASE + '/en/gb');
  await page.waitForTimeout(1800); // by now the cookie banner is covering the page
  await page.getByRole('button', { name: 'Sign in' }).click(); // handler clears it, click goes ahead
  await expect(page).toHaveURL(/\/signin/);
});
