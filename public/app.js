// Minimal client-side router for the TradeSource practice site.
// No framework, no build step — plain DOM manipulation, deliberately
// kept simple since the site exists to be tested, not to be impressive.

(function () {
  const DATA = window.TRADESOURCE_DATA;
  const app = document.getElementById('app');

  function findManufacturer(slug) {
    return DATA.manufacturers.find((m) => m.slug === slug);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[c]);
  }

  // ---------------------------------------------------------------
  // Views
  // ---------------------------------------------------------------

  function renderHome() {
    app.innerHTML = `
      <section class="hero">
        <h1>Find trade products and manufacturers</h1>
        <p>Search TradeSource's fictional catalogue of manufacturers and products, used for automation-testing practice.</p>
      </section>
    `;
  }

  // Simple generic line-art icons — invented shapes, not copied product
  // photography — just enough to make a product tile look like more than
  // a text link.
  const ICONS = {
    vacuum: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="20" y="6" width="8" height="22" rx="3"/><path d="M14 28h20l4 10H10z"/><circle cx="16" cy="40" r="3"/><circle cx="32" cy="40" r="3"/></svg>',
    dryer: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="12" y="8" width="24" height="30" rx="4"/><path d="M18 38v4M30 38v4" /><circle cx="24" cy="20" r="5"/></svg>',
    tower: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="16" y="4" width="16" height="40" rx="6"/><path d="M20 14h8M20 22h8M20 30h8"/></svg>',
    bolt: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 10h20l4 6-4 6H14l-4-6z"/><rect x="22" y="22" width="4" height="18"/></svg>',
    collar: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="7"/></svg>',
    panel: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="14" width="36" height="20" rx="2"/><path d="M6 20h36M6 28h36M16 14v20M32 14v20"/></svg>',
  };

  const TABS = [
    { key: 'products', label: 'Products' },
    { key: 'manufacturers', label: 'Manufacturers' },
    { key: 'cpd', label: 'CPD' },
    { key: 'literature', label: 'Literature' },
    { key: 'case-studies', label: 'Case studies' },
  ];

  function renderSearch(query) {
    const q = (query || '').trim().toLowerCase();

    const matchedManufacturers = DATA.manufacturers.filter((m) =>
      m.name.toLowerCase().includes(q),
    );
    const matchedProducts = DATA.products.filter((p) =>
      p.name.toLowerCase().includes(q),
    );

    function panelFor(tab) {
      if (tab === 'manufacturers') {
        return matchedManufacturers.length
          ? `<div class="tiles">${matchedManufacturers.map(manufacturerTile).join('')}</div>`
          : emptyState('manufacturers');
      }
      if (tab === 'products') {
        return matchedProducts.length
          ? `<div class="tiles">${matchedProducts.map(productTile).join('')}</div>`
          : emptyState('products');
      }
      // CPD, Literature, Case studies — no fictional content behind these
      // yet, they exist so the tab bar matches the real site's shape.
      return emptyState(tab);
    }

    function emptyState(tab) {
      const label = TABS.find((t) => t.key === tab)?.label ?? tab;
      return `<p class="empty-state">No ${label.toLowerCase()} found for &ldquo;${escapeHtml(query || '')}&rdquo;.</p>`;
    }

    function wireTileClicks() {
      app.querySelectorAll('[data-manufacturer-slug]').forEach((tile) => {
        tile.addEventListener('click', (e) => {
          e.preventDefault();
          const m = findManufacturer(tile.dataset.manufacturerSlug);
          navigate(manufacturerPath(m, 'overview'));
        });
      });
    }

    const totalCount = matchedManufacturers.length + matchedProducts.length;

    app.innerHTML = `
      <section class="search-results">
        <h1>&ldquo;${escapeHtml(query || '')}&rdquo;</h1>
        <p class="result-count">${totalCount} result${totalCount === 1 ? '' : 's'} found</p>

        <div class="tabs" role="tablist">
          ${TABS.map((t, i) => `<button type="button" role="tab" id="tab-${t.key}" class="tab-button${i === 0 ? ' is-active' : ''}" data-cy="tabCategory" data-testid="tab-${t.key}" data-tab="${t.key}" aria-selected="${i === 0}">${t.label}</button>`).join('')}
        </div>

        <div class="tiles-panel" data-tab-panel="active">
          ${panelFor('products')}
        </div>
      </section>
    `;

    wireTileClicks();

    app.querySelectorAll('.tab-button').forEach((btn) => {
      btn.addEventListener('click', () => {
        app.querySelectorAll('.tab-button').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        app.querySelectorAll('.tab-button').forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
        app.querySelector('[data-tab-panel="active"]').innerHTML = panelFor(btn.dataset.tab);
        wireTileClicks();
      });
    });
  }

  function manufacturerTile(m) {
    return `
      <a href="#" class="tile tile--manufacturer" data-cy="resultTile" data-testid="result-tile" data-manufacturer-slug="${m.slug}" title="View ${escapeHtml(m.name)}">
        <span class="tile-logo" role="img" aria-label="${escapeHtml(m.name)}" style="background:${m.color}">${escapeHtml(m.initials)}</span>
        <span class="tile-name">${escapeHtml(m.name)}</span>
        <span class="tile-desc">${escapeHtml(m.tagline)}</span>
      </a>
    `;
  }

  function productTile(p) {
    const manufacturer = findManufacturer(p.manufacturerSlug);
    return `
      <a href="#" class="tile tile--product" data-cy="resultTile" data-testid="result-tile" title="View ${escapeHtml(p.name)}">
        <span class="tile-icon">${ICONS[p.icon] || ''}</span>
        <span class="tile-name">${escapeHtml(p.name)}</span>
        <span class="tile-manufacturer">${escapeHtml(manufacturer ? manufacturer.name : '')}</span>
        <span class="tile-desc">${escapeHtml(p.description)}</span>
      </a>
    `;
  }

  // Manufacturer pages live under /en/gb/manufacturer/<slug>/<id>/<section>.
  // The bare /manufacturer/... form is still accepted, so older links keep working.
  function manufacturerPath(m, section) {
    return `/en/gb/manufacturer/${m.slug}/${m.id}/${section}`;
  }

  // Tab strip for a manufacturer page. Most show "Certifications"; ones flagged
  // hasCpd show "CPD" instead, so the strip genuinely differs between pages.
  function manufacturerSections(m) {
    return [
      { key: 'overview', label: 'Overview' },
      { key: 'products', label: 'Products' },
      m.hasCpd
        ? { key: 'cpd', label: 'CPD', cy: 'cpdTab' }
        : { key: 'third-party-certifications', label: 'Certifications', cy: 'certificatesTab' },
      { key: 'literature', label: 'Literature' },
      { key: 'case-studies', label: 'Case studies' },
      { key: 'about', label: 'About us' },
    ];
  }

  function renderManufacturer(slug, sectionKey) {
    const m = findManufacturer(slug);
    if (!m) {
      document.title = 'Page not found | TradeSource';
      app.innerHTML = `<section><h1>Manufacturer not found</h1></section>`;
      return;
    }

    const sections = manufacturerSections(m);
    const current = sections.find((t) => t.key === (sectionKey || 'overview')) || sections[0];
    document.title = `${m.name} | ${current.label} | TradeSource`;
    const ownProducts = DATA.products.filter((p) => p.manufacturerSlug === m.slug);

    const nav = `
      <nav class="manufacturer-nav" aria-label="Manufacturer navigation" data-cy="manufacturerNav">
        <div class="mat-mdc-tab-links">
          ${sections.map((t) => `<a href="${manufacturerPath(m, t.key)}" id="nav-${t.key}" class="mdc-tab${t === current ? ' mdc-tab--active' : ''}"${t.cy ? ` data-cy="${t.cy}"` : ''} data-testid="nav-${t.key}"${t === current ? ' aria-current="page"' : ''}>${t.label}</a>`).join('')}
        </div>
      </nav>
    `;

    const overview = `
      <p class="manufacturer-about" data-testid="manufacturer-about">${escapeHtml(m.about)}</p>

      ${m.certificationBodies ? `
        <section class="certification-bodies" data-cy="certificationBodies">
          <h2>Certification bodies</h2>
          <ul>${m.certificationBodies.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
        </section>
      ` : ''}

      ${ownProducts.length ? `
        <h2>Products</h2>
        <div class="tiles">${ownProducts.map(productTile).join('')}</div>
      ` : ''}
    `;

    const placeholder = `
      <section class="manufacturer-section" data-cy="sectionPlaceholder">
        <h2>${current.label}</h2>
        <p class="empty-state">There is no ${current.label.toLowerCase()} content for ${escapeHtml(m.name)} yet.</p>
      </section>
    `;

    app.innerHTML = `
      <section class="manufacturer-page">
        <span class="tile-logo tile-logo--large" role="img" aria-label="${escapeHtml(m.name)} logo" style="background:${m.color}">${escapeHtml(m.initials)}</span>
        <div class="brand-title-container">
          <h1 id="manufacturer-name" data-testid="manufacturer-name">${escapeHtml(m.name)}</h1>
        </div>
        <p class="manufacturer-tagline" data-testid="manufacturer-tagline">${escapeHtml(m.tagline)}</p>

        <div class="manufacturer-actions">
          <a action="telephone" id="manufacturer-phone" data-testid="manufacturer-phone" title="Call ${escapeHtml(m.name)}" href="${m.phoneHref}">${escapeHtml(m.phoneDisplay)}</a>
          <a
            action="company-website"
            id="manufacturer-website"
            data-testid="manufacturer-website"
            href="${m.website}"
            target="_blank"
            title="Visit ${m.website}"
          > Website </a>
          <button class="contact-button" id="contact-manufacturer" data-testid="contact-manufacturer" type="button"> Contact manufacturer </button>
        </div>

        ${nav}

        ${current.key === 'overview' ? overview : placeholder}
      </section>
    `;

    app.querySelectorAll('.mat-mdc-tab-links a').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(link.getAttribute('href'));
      });
    });
  }

  // ---------------------------------------------------------------
  // Session (demo only: stored in localStorage, no real auth)
  // ---------------------------------------------------------------

  const SESSION_KEY = 'tradesource.session';
  const SIGN_IN_PATH = '/en/gb/signin';

  function getSession() {
    try {
      return JSON.parse(window.localStorage.getItem(SESSION_KEY));
    } catch (e) {
      return null;
    }
  }

  function setSession(user) {
    try {
      window.localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ email: user.email, firstName: user.firstName, lastName: user.lastName }),
      );
    } catch (e) { /* storage unavailable: stay signed out */ }
  }

  function clearSession() {
    try { window.localStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
  }

  // Only allow same-site relative paths, so ?returnUrl= can't redirect elsewhere.
  function safeReturnUrl(value) {
    if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) {
      return value;
    }
    return '/en/gb';
  }

  function renderAuth() {
    const slot = document.querySelector('[data-cy="headerAuth"]');
    const session = getSession();

    if (!session) {
      // On the sign-in page the form's own "Sign in" button takes over, so the
      // header one is removed (two buttons with the same name would be ambiguous).
      if (window.location.pathname === SIGN_IN_PATH) {
        slot.innerHTML = '';
        return;
      }
      slot.innerHTML = '<button type="button" class="sign-in-button" id="sign-in-button" data-cy="signInButton" data-testid="sign-in-button">Sign in</button>';
      slot.querySelector('button').addEventListener('click', () => {
        // Remember where the user was so we can send them back after sign-in.
        navigate(SIGN_IN_PATH + '?returnUrl=' + encodeURIComponent(window.location.pathname + window.location.search));
      });
      return;
    }

    const initials = ((session.firstName || '')[0] || '') + ((session.lastName || '')[0] || '');
    slot.innerHTML = `
      <button type="button" class="avatar" id="user-menu-button" data-cy="userAvatar" data-testid="user-menu-button" aria-label="Open user menu" aria-haspopup="true" aria-expanded="false">
        <span class="avatar-initials" role="figure" data-testid="user-initials">${escapeHtml(initials.toUpperCase())}</span>
      </button>
      <div class="avatar-menu" id="user-menu" data-cy="userMenu" data-testid="user-menu" hidden>
        <p class="avatar-menu-email" data-cy="userEmail" data-testid="user-email">${escapeHtml(session.email)}</p>
        <button type="button" id="sign-out-button" data-cy="signOutButton" data-testid="sign-out-button">Sign out</button>
      </div>
    `;
    const avatar = slot.querySelector('[data-cy="userAvatar"]');
    const menu = slot.querySelector('[data-cy="userMenu"]');
    avatar.addEventListener('click', () => {
      menu.hidden = !menu.hidden;
      avatar.setAttribute('aria-expanded', String(!menu.hidden));
    });
    slot.querySelector('[data-cy="signOutButton"]').addEventListener('click', () => {
      clearSession();
      render(window.location.pathname, window.location.search);
    });
  }

  function renderSignIn(search) {
    const params = new URLSearchParams(search);
    const returnUrl = safeReturnUrl(params.get('returnUrl'));

    // Already signed in: nothing to do here.
    if (getSession()) {
      window.history.replaceState({}, '', returnUrl);
      render(window.location.pathname, window.location.search);
      return;
    }

    let email = '';

    function showEmailStep() {
      app.innerHTML = `
        <section class="sign-in" data-cy="signInPage">
          <h1>Sign in</h1>
          <form class="sign-in-form" data-cy="signInEmailForm" novalidate>
            <label for="signInEmail">Email address</label>
            <input type="email" id="signInEmail" name="email" data-cy="signInEmail" data-testid="sign-in-email" autocomplete="username" value="${escapeHtml(email)}" />
            <p class="form-error" data-cy="signInError" data-testid="sign-in-error" role="alert" hidden></p>
            <button type="submit" class="primary-button" id="sign-in-next" data-cy="signInNext" data-testid="sign-in-next">Next</button>
          </form>
        </section>
      `;
      const form = app.querySelector('form');
      const error = app.querySelector('[data-cy="signInError"]');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = form.querySelector('input').value.trim();
        if (!value) {
          error.textContent = 'Enter your email address.';
          error.hidden = false;
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error.textContent = 'Enter a valid email address.';
          error.hidden = false;
          return;
        }
        email = value;
        showPasswordStep();
      });
    }

    function showPasswordStep() {
      app.innerHTML = `
        <section class="sign-in" data-cy="signInPage">
          <h1>Enter your password</h1>
          <p class="sign-in-email" data-cy="signInEmailDisplay">${escapeHtml(email)}</p>
          <form class="sign-in-form" data-cy="signInPasswordForm" novalidate>
            <label for="signInPassword">Password</label>
            <input type="password" id="signInPassword" name="password" data-cy="signInPassword" data-testid="sign-in-password" autocomplete="current-password" />
            <p class="form-error" data-cy="signInError" data-testid="sign-in-error" role="alert" hidden></p>
            <button type="submit" class="primary-button" id="sign-in-submit" data-cy="signInSubmit" data-testid="sign-in-submit">Sign in</button>
            <button type="button" class="link-button" id="sign-in-back" data-cy="signInBack" data-testid="sign-in-back">Use a different email</button>
          </form>
        </section>
      `;
      const form = app.querySelector('form');
      const error = app.querySelector('[data-cy="signInError"]');
      form.querySelector('[data-cy="signInBack"]').addEventListener('click', showEmailStep);
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = form.querySelector('input').value;
        if (!password) {
          error.textContent = 'Enter your password.';
          error.hidden = false;
          return;
        }
        const user = DATA.users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
        );
        if (!user) {
          // Same message whether the email or the password was wrong.
          error.textContent = 'Incorrect email address or password.';
          error.hidden = false;
          return;
        }
        setSession(user);
        renderAuth();
        // Replace the sign-in entry so Back doesn't return to the sign-in form.
        window.history.replaceState({}, '', returnUrl);
        render(window.location.pathname, window.location.search);
      });
    }

    showEmailStep();
  }

  // ---------------------------------------------------------------
  // Router
  // ---------------------------------------------------------------

  function render(pathname, search) {
    document.title = 'TradeSource';
    renderAuth();
    if (pathname === '/en/gb') {
      renderHome();
      return;
    }
    if (pathname === '/en/gb/search') {
      const params = new URLSearchParams(search);
      document.title = `${params.get('q') || ''} | Search | TradeSource`;
      renderSearch(params.get('q'));
      return;
    }
    if (pathname === SIGN_IN_PATH) {
      document.title = 'Sign in | TradeSource';
      renderSignIn(search);
      return;
    }
    const manufacturerMatch = pathname.match(/^(?:\/en\/gb)?\/manufacturer\/([^/]+)\/[^/]+\/([^/]+)$/);
    if (manufacturerMatch) {
      renderManufacturer(manufacturerMatch[1], manufacturerMatch[2]);
      return;
    }
    app.innerHTML = `<section><h1>Page not found</h1></section>`;
  }

  function navigate(pathAndQuery) {
    const [pathname, search] = pathAndQuery.split('?');
    window.history.pushState({}, '', pathAndQuery);
    render(pathname, search ? `?${search}` : '');
  }

  window.addEventListener('popstate', () => {
    render(window.location.pathname, window.location.search);
  });

  // Wire up both search boxes (desktop always visible, mobile hidden
  // behind the nav toggle) — deliberately two so cy.get(...).filter(':visible')
  // has a real reason to exist.
  document.querySelectorAll('.search-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('[data-cy="searchFieldSearch"]');
      navigate(`/en/gb/search?q=${encodeURIComponent(input.value)}`);
    });
  });

  document.querySelector('[data-cy="navToggle"]').addEventListener('click', () => {
    const mobileForm = document.querySelector('[data-cy="searchFormMobile"]');
    mobileForm.hidden = !mobileForm.hidden;
  });

  // ---------------------------------------------------------------
  // Initial load
  // ---------------------------------------------------------------

  renderAuth();

  if (window.location.pathname === '/') {
    window.history.replaceState({}, '', '/en/gb');
  }
  render(window.location.pathname, window.location.search);
})();
