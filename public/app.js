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
          navigate(`/manufacturer/${m.slug}/${m.id}/overview`);
        });
      });
    }

    const totalCount = matchedManufacturers.length + matchedProducts.length;

    app.innerHTML = `
      <section class="search-results">
        <h1>&ldquo;${escapeHtml(query || '')}&rdquo;</h1>
        <p class="result-count">${totalCount} result${totalCount === 1 ? '' : 's'} found</p>

        <div class="tabs" role="tablist">
          ${TABS.map((t, i) => `<button class="tab-button${i === 0 ? ' is-active' : ''}" data-cy="tabCategory" data-tab="${t.key}">${t.label}</button>`).join('')}
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
        app.querySelector('[data-tab-panel="active"]').innerHTML = panelFor(btn.dataset.tab);
        wireTileClicks();
      });
    });
  }

  function manufacturerTile(m) {
    return `
      <a href="#" class="tile tile--manufacturer" data-cy="resultTile" data-manufacturer-slug="${m.slug}" title="View ${escapeHtml(m.name)}">
        <span class="tile-logo" style="background:${m.color}">${escapeHtml(m.initials)}</span>
        <span class="tile-name">${escapeHtml(m.name)}</span>
        <span class="tile-desc">${escapeHtml(m.tagline)}</span>
      </a>
    `;
  }

  function productTile(p) {
    const manufacturer = findManufacturer(p.manufacturerSlug);
    return `
      <a href="#" class="tile tile--product" data-cy="resultTile" title="View ${escapeHtml(p.name)}">
        <span class="tile-icon">${ICONS[p.icon] || ''}</span>
        <span class="tile-name">${escapeHtml(p.name)}</span>
        <span class="tile-manufacturer">${escapeHtml(manufacturer ? manufacturer.name : '')}</span>
        <span class="tile-desc">${escapeHtml(p.description)}</span>
      </a>
    `;
  }

  function renderManufacturer(slug) {
    const m = findManufacturer(slug);
    if (!m) {
      app.innerHTML = `<section><h1>Manufacturer not found</h1></section>`;
      return;
    }

    const ownProducts = DATA.products.filter((p) => p.manufacturerSlug === m.slug);

    app.innerHTML = `
      <section class="manufacturer-page">
        <span class="tile-logo tile-logo--large" style="background:${m.color}">${escapeHtml(m.initials)}</span>
        <div class="brand-title-container">
          <h1>${escapeHtml(m.name)}</h1>
        </div>
        <p>${escapeHtml(m.tagline)}</p>

        <div class="manufacturer-actions">
          <a action="telephone" href="${m.phoneHref}">${escapeHtml(m.phoneDisplay)}</a>
          <a
            action="company-website"
            href="${m.website}"
            target="_blank"
            title="Visit ${m.website}"
          > Website </a>
          <button class="contact-button" type="button"> Contact manufacturer </button>
        </div>

        <p class="manufacturer-about">${escapeHtml(m.about)}</p>

        ${ownProducts.length ? `
          <h2>Products</h2>
          <div class="tiles">${ownProducts.map(productTile).join('')}</div>
        ` : ''}
      </section>
    `;
  }

  // ---------------------------------------------------------------
  // Router
  // ---------------------------------------------------------------

  function render(pathname, search) {
    if (pathname === '/en/gb') {
      renderHome();
      return;
    }
    if (pathname === '/en/gb/search') {
      const params = new URLSearchParams(search);
      renderSearch(params.get('q'));
      return;
    }
    const manufacturerMatch = pathname.match(/^\/manufacturer\/([^/]+)\/[^/]+\/overview$/);
    if (manufacturerMatch) {
      renderManufacturer(manufacturerMatch[1]);
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
  document.querySelectorAll('[data-cy="searchFieldSearch"]').forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        navigate(`/en/gb/search?q=${encodeURIComponent(input.value)}`);
      }
    });
  });

  document.querySelector('[data-cy="navToggle"]').addEventListener('click', () => {
    const mobileForm = document.querySelector('[data-cy="searchFormMobile"]');
    mobileForm.hidden = !mobileForm.hidden;
  });

  // ---------------------------------------------------------------
  // Initial load
  // ---------------------------------------------------------------

  if (window.location.pathname === '/') {
    window.history.replaceState({}, '', '/en/gb');
  }
  render(window.location.pathname, window.location.search);
})();
