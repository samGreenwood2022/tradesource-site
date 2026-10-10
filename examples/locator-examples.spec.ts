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

async function signedOut(page: Page, path: string) {
  await page.goto(BASE + '/en/gb');
  await page.evaluate(() => localStorage.clear());
  await page.goto(BASE + path);
}

async function signedIn(page: Page, path: string) {
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
