// Minimal client-side router for the TradeSource practice site.
// No framework, no build step: plain DOM manipulation, deliberately
// kept simple since the site exists to be tested, not to be impressive.

(function () {
  const { DATA, escapeHtml, findManufacturer, findProduct, manufacturerPath, productPath } = window.TS;
  const TS = window.TS;
  const app = document.getElementById('app');

  // Bumped on every navigation, so a slow response for a page we have already
  // left can tell it is stale and leave the screen alone.
  let renderToken = 0;

  // ---------------------------------------------------------------
  // Small view helpers
  // ---------------------------------------------------------------

  function manufacturerTile(m) {
    return `
      <a href="${manufacturerPath(m, 'overview')}" data-spa class="tile tile--manufacturer" data-cy="resultTile" data-testid="result-tile" data-manufacturer-slug="${m.slug}" title="View ${escapeHtml(m.name)}">
        <img class="tile-logo" src="${TS.logoSrc(m)}" alt="${escapeHtml(m.name)}" width="48" height="48" />
        <span class="tile-name">${escapeHtml(m.name)}</span>
        <span class="tile-desc">${escapeHtml(m.tagline)}</span>
      </a>
    `;
  }

  function productTile(p) {
    const manufacturer = findManufacturer(p.manufacturerSlug);
    return `
      <a href="${productPath(p)}" data-spa class="tile tile--product" data-cy="resultTile" data-testid="result-tile" title="View ${escapeHtml(p.name)}">
        <img class="tile-image" src="${TS.productSrc(p)}" alt="" width="400" height="300" />
        <span class="tile-name">${escapeHtml(p.name)}</span>
        <span class="tile-manufacturer">${escapeHtml(manufacturer ? manufacturer.name : '')}</span>
        <span class="tile-desc">${escapeHtml(p.description)}</span>
      </a>
    `;
  }

  // The breadcrumb trail is an <app-breadcrumbs> component wrapping a <nav>
  // that has NO aria-label (so getByRole('navigation', { name: 'Breadcrumb' })
  // finds nothing and the component tag is the stable locator). That missing
  // label is a genuine accessibility gap, kept on purpose as a teaching point.
  function breadcrumbsHtml(items) {
    return `<app-breadcrumbs data-cy="breadcrumbs"><nav><ol>${items}</ol></nav></app-breadcrumbs>`;
  }

  function shuffled(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // ---------------------------------------------------------------
  // Home
  // ---------------------------------------------------------------

  // Sponsored CPD promos (all point at the one manufacturer with a CPD tab).
  const CPD_PROMOS = [
    'Specifying Door Hardware for Fire Doors',
    'Access Control Basics for Specifiers',
    'Keying Systems Explained',
  ];

  // These four sections change on every load (random picks and order), and sit
  // below the fold: they are only added to the page when scrolled near. That
  // makes them realistic targets for visual-regression masks and for lazy-load
  // waits.
  const HOME_SECTIONS = {
    brands() {
      const picks = shuffled(DATA.manufacturers).slice(0, 3);
      return `
        <app-sponsored-brands data-cy="sponsoredBrands">
          <h2>Sponsored by <span class="sponsor-name">${escapeHtml(picks[0].name)}</span></h2>
          <div class="tiles">${picks.map(manufacturerTile).join('')}</div>
        </app-sponsored-brands>`;
    },
    products() {
      const picks = shuffled(DATA.products).slice(0, 3);
      return `
        <app-sponsored-products data-cy="sponsoredProducts">
          <h2>Sponsored products</h2>
          <div class="tiles">${picks.map(productTile).join('')}</div>
        </app-sponsored-products>`;
    },
    cpd() {
      const halden = findManufacturer('halden-locks-uk');
      const tiles = shuffled(CPD_PROMOS).map((title) => `
        <a href="${manufacturerPath(halden, 'cpd')}" data-spa class="tile tile--cpd" data-cy="cpdTile">
          <span class="tile-name">${escapeHtml(title)}</span>
          <span class="tile-manufacturer">${escapeHtml(halden.name)}</span>
        </a>`).join('');
      return `
        <app-sponsored-cpd data-cy="sponsoredCpd">
          <h2>Sponsored CPD</h2>
          <div class="tiles">${tiles}</div>
        </app-sponsored-cpd>`;
    },
    inspiration() {
      const items = shuffled([
        ...DATA.products.map((p) => ({ href: productPath(p), name: p.name, sub: 'Product', img: TS.productSrc(p) })),
        ...DATA.categories.map((c) => ({ href: TS.categoryPath([c]), name: c.name, sub: 'Category', img: TS.categorySrc(c) })),
      ]).slice(0, 9);
      // Tile heights follow a fixed pattern by position, so only the content
      // (not the grid's overall size) changes between loads. A visual-regression
      // mask only works while the masked box keeps its size and position.
      const heights = [150, 210, 150, 180, 210, 150, 180, 150, 210];
      const tiles = items.map((it, i) => {
        const height = heights[i % heights.length] - 60;
        return `<a href="${it.href}" data-spa class="inspiration-tile" style="height:${height + 60}px"><img src="${it.img}" alt="" width="400" height="300" /><span class="inspiration-caption"><span class="tile-name">${escapeHtml(it.name)}</span><span class="tile-manufacturer">${it.sub}</span></span></a>`;
      }).join('');
      return `
        <app-inspiration-grid data-cy="inspirationGrid">
          <h2>Find some inspiration</h2>
          <div class="inspiration-grid">${tiles}</div>
        </app-inspiration-grid>`;
    },
  };

  function renderHome() {
    app.innerHTML = `
      <section class="hero">
        <img class="hero-image" src="/images/hero.svg" alt="Illustration of a city skyline at dusk" width="1200" height="320" />
        <div class="hero-text">
          <h1>Find trade products and manufacturers</h1>
          <p>Search TradeSource's fictional catalogue of manufacturers and products, used for automation-testing practice.</p>
        </div>
      </section>
      ${Object.keys(HOME_SECTIONS).map((key) => `<div class="lazy-region" data-lazy="${key}"></div>`).join('')}
    `;

    const regions = app.querySelectorAll('[data-lazy]');
    const fill = (region) => {
      region.innerHTML = HOME_SECTIONS[region.dataset.lazy]();
      region.classList.add('is-loaded');
    };
    if (!('IntersectionObserver' in window)) {
      regions.forEach(fill);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fill(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '150px' });
    regions.forEach((r) => observer.observe(r));
  }

  // ---------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------

  const TABS = [
    { key: 'products', label: 'Products' },
    { key: 'manufacturers', label: 'Manufacturers' },
    { key: 'cpd', label: 'CPD' },
    { key: 'literature', label: 'Literature' },
    { key: 'case-studies', label: 'Case studies' },
  ];

  function renderSearch(query) {
    const q = (query || '').trim().toLowerCase();

    const matchedManufacturers = DATA.manufacturers.filter((m) => m.name.toLowerCase().includes(q));
    const matchedProducts = DATA.products.filter((p) => p.name.toLowerCase().includes(q));

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
      // CPD, Literature, Case studies: no search content behind these, they
      // exist so the tab bar matches the shape of the real site.
      return emptyState(tab);
    }

    function emptyState(tab) {
      const label = TABS.find((t) => t.key === tab)?.label ?? tab;
      return `<p class="empty-state">No ${label.toLowerCase()} found for &ldquo;${escapeHtml(query || '')}&rdquo;.</p>`;
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

    app.querySelectorAll('.tab-button').forEach((btn) => {
      btn.addEventListener('click', () => {
        app.querySelectorAll('.tab-button').forEach((b) => {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-selected', String(b === btn));
        });
        app.querySelector('[data-tab-panel="active"]').innerHTML = panelFor(btn.dataset.tab);
      });
    });
  }

  // ---------------------------------------------------------------
  // Categories and products
  // ---------------------------------------------------------------

  // A trail for pages that are not in the category tree: links, then the
  // current page as plain text.
  function simpleTrail(links, current) {
    return links.map(([text, href]) => `<li><a href="${href}" data-spa>${escapeHtml(text)}</a></li>`).join('')
      + `<li><span aria-current="page">${escapeHtml(current)}</span></li>`;
  }

  function renderCategoriesIndex() {
    document.title = 'Categories | TradeSource';
    app.innerHTML = `
      <section class="categories-page">
        ${breadcrumbsHtml(simpleTrail([['Home', '/en/gb']], 'Categories'))}
        <h1>Categories</h1>
        <ul class="link-list">
          <li><a href="/en/gb/categories/catalogue" data-spa data-cy="categoryLink">Catalogue</a></li>
        </ul>
      </section>`;
  }

  function renderCatalogueIndex() {
    document.title = 'Catalogue | TradeSource';
    app.innerHTML = `
      <section class="categories-page">
        ${breadcrumbsHtml(simpleTrail([['Home', '/en/gb'], ['Categories', '/en/gb/categories']], 'Catalogue'))}
        <h1>Catalogue</h1>
        <div class="category-cards">
          ${DATA.categories.map((c) => `
            <a href="${TS.categoryPath([c])}" data-spa class="category-card" data-cy="categoryLink">
              <img src="${TS.categorySrc(c)}" alt="" width="400" height="300" />
              <span class="category-card-name">${escapeHtml(c.name)}</span>
            </a>`).join('')}
        </div>
      </section>`;
  }

  function renderCategory(id) {
    const entry = TS.categoryIndex[id];
    if (!entry) {
      document.title = 'Page not found | TradeSource';
      app.innerHTML = '<section><h1>Category not found</h1></section>';
      return;
    }
    const { node, chain } = entry;
    document.title = `${node.name} | TradeSource`;
    const ids = new Set(TS.subtreeIds(node));
    const products = DATA.products.filter((p) => ids.has(p.categoryId));
    app.innerHTML = `
      <section class="category-page">
        ${breadcrumbsHtml(TS.breadcrumbs(chain, { currentIsLink: false }))}
        <h1>${escapeHtml(node.name)}</h1>
        ${node.children.length ? `
          <h2>Subcategories</h2>
          <ul class="link-list">
            ${node.children.map((c) => `<li><a href="${TS.categoryPath(chain.concat(c))}" data-spa data-cy="categoryLink">${escapeHtml(c.name)}</a></li>`).join('')}
          </ul>` : ''}
        <h2>Products</h2>
        ${products.length
          ? `<div class="tiles">${products.map(productTile).join('')}</div>`
          : '<p class="empty-state">No products in this category yet.</p>'}
      </section>`;
  }

  function renderProduct(slug) {
    const p = findProduct(slug);
    if (!p) {
      document.title = 'Page not found | TradeSource';
      app.innerHTML = '<section><h1>Product not found</h1></section>';
      return;
    }
    const m = findManufacturer(p.manufacturerSlug);
    const chain = TS.categoryIndex[p.categoryId].chain;
    document.title = `${p.name} | TradeSource`;
    app.innerHTML = `
      <section class="product-page">
        ${breadcrumbsHtml(TS.breadcrumbs(chain, { currentIsLink: true }))}
        <div class="product-header">
          <img class="product-image" src="${TS.productSrc(p)}" alt="${escapeHtml(p.name)}" width="400" height="300" />
          <div>
            <h1 data-testid="product-name">${escapeHtml(p.name)}</h1>
            <p class="product-manufacturer">By <a href="${manufacturerPath(m, 'overview')}" data-spa data-cy="productManufacturerLink">${escapeHtml(m.name)}</a></p>
          </div>
        </div>
        <p class="product-description">${escapeHtml(p.description)}</p>
        <h2>Specification</h2>
        <table class="spec-table" data-cy="specTable">
          <tbody>
            ${p.specs.map(([k, v]) => `<tr><th scope="row">${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`).join('')}
          </tbody>
        </table>
      </section>`;
  }

  // ---------------------------------------------------------------
  // Fictional API client
  // ---------------------------------------------------------------

  // POSTs a one-operation batch (an array, like GraphQL batching) and returns
  // the matching entry from the array that comes back. Non-2xx responses and
  // dropped connections both throw, so callers can treat "no usable data" as a
  // single case.
  async function gql(operationName, query, variables) {
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ operationName, query, variables }]),
    });
    if (!response.ok) throw new Error(`API responded ${response.status}`);
    const json = await response.json();
    return Array.isArray(json) ? json : [json];
  }

  // The manufacturer tabs that load a list from the API.
  const LIST_TABS = {
    'third-party-certifications': { op: 'certifications', tag: 'app-certificate-list', label: 'Certifications' },
    cpd: { op: 'cpd', tag: 'app-cpd-list', label: 'CPD' },
    literature: { op: 'literature', tag: 'app-literature-list', label: 'Literature' },
    'case-studies': { op: 'caseStudies', tag: 'app-case-study-list', label: 'Case studies' },
  };

  // Loads a tab's list. Two requests share the operation name: one for the
  // filter options and one for the result tiles (only that one asks for
  // "paginatedResponse"). Outcomes, which the course's network tests rely on:
  //   - tiles arrive with items       -> results wrapper with tiles
  //   - tiles arrive with no items    -> results wrapper with the "no results" panel
  //   - tiles request fails/is unusable -> the list area appears but stays blank
  //     (no wrapper, no tiles, no message), a known gap the tests document.
  async function loadList(container, tabInfo, m, token) {
    const { op, tag } = tabInfo;
    container.innerHTML = `<${tag} class="result-list" data-cy="resultList"><p class="loading" data-cy="loading">Loading&hellip;</p></${tag}>`;
    const list = container.querySelector(tag);

    const filtersQuery = `query ${op}($brandSlug: String!) { ${op} { byBrandId(brandSlug: $brandSlug) { filters { id label options } } } }`;
    const tilesQuery = `query ${op}($brandSlug: String!, $page: Int) { ${op} { byBrandId(brandSlug: $brandSlug, page: $page) { paginatedResponse { items { id name type } totalItems } } } }`;
    const variables = { brandSlug: m.slug, page: 1 };

    const [filtersResult, tilesResult] = await Promise.allSettled([
      gql(op, filtersQuery, variables),
      gql(op, tilesQuery, variables),
    ]);
    if (token !== renderToken) return; // user has moved on
    list.querySelector('.loading')?.remove();

    if (tilesResult.status !== 'fulfilled') return;
    const tilesEntry = tilesResult.value.find((e) => Array.isArray(e?.data?.[op]?.byBrandId?.paginatedResponse?.items));
    if (!tilesEntry) return;
    const items = tilesEntry.data[op].byBrandId.paginatedResponse.items;

    let filterOptions = [];
    if (filtersResult.status === 'fulfilled') {
      const f = filtersResult.value.find((e) => e?.data?.[op]?.byBrandId?.filters);
      filterOptions = f ? f.data[op].byBrandId.filters.flatMap((x) => x.options) : [];
    }

    const tileHtml = (list) => list.map((item) => `
      <article class="tile result-tile" data-cy="searchResultTile">
        <h3 class="tile-name" data-cy="searchResultTileTitle"> ${escapeHtml(item.name)} </h3>
        <p class="tile-desc">${escapeHtml(item.type || '')}</p>
      </article>`).join('');
    const noResults = '<app-no-results-guidance data-cy="noResultsGuidance"><p>Sorry, no results were found</p><p>Try removing a filter or searching for something else.</p></app-no-results-guidance>';
    const resultsHtml = (list) => (list.length ? `<div class="tiles">${tileHtml(list)}</div>` : noResults);

    list.insertAdjacentHTML('beforeend', `
      <app-search-result-wrapper data-cy="searchResultWrapper">
        ${filterOptions.length ? `
          <label class="filter-label">Type
            <select data-cy="filterType" id="filter-type">
              <option value="">All</option>
              ${filterOptions.map((o) => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join('')}
            </select>
          </label>` : ''}
        <div class="results" data-cy="results">${resultsHtml(items)}</div>
      </app-search-result-wrapper>`);

    const select = list.querySelector('#filter-type');
    if (select) {
      select.addEventListener('change', () => {
        const chosen = select.value;
        list.querySelector('[data-cy="results"]').innerHTML = resultsHtml(chosen ? items.filter((i) => i.type === chosen) : items);
      });
    }
  }

  // Overview's "Certification bodies": fetched a moment after the page shell
  // appears, so anything that needs it has to wait for it.
  async function loadCertificationBodies(container, m, token) {
    const query = 'query certificationBodies($brandSlug: String!) { certificationBodies { byBrandId(brandSlug: $brandSlug) { items { name } } } }';
    try {
      const entries = await gql('certificationBodies', query, { brandSlug: m.slug });
      if (token !== renderToken) return;
      const entry = entries.find((e) => Array.isArray(e?.data?.certificationBodies?.byBrandId?.items));
      const items = entry ? entry.data.certificationBodies.byBrandId.items : [];
      if (!items.length) return;
      container.innerHTML = `
        <section class="certification-bodies" data-cy="certificationBodies">
          <h2>Certification bodies</h2>
          <ul>${items.map((c) => `<li>${escapeHtml(c.name)}</li>`).join('')}</ul>
        </section>`;
    } catch (e) {
      // Section simply doesn't appear.
    }
  }

  // ---------------------------------------------------------------
  // Manufacturer pages
  // ---------------------------------------------------------------

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

  // Fake social links: the glyphs are generic originals and the URLs are
  // example.com placeholders, so nothing points at a real account.
  const SOCIAL_PLATFORMS = [
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'youtube', label: 'YouTube' },
    { key: 'instagram', label: 'Instagram' },
  ];

  function renderManufacturer(slug, sectionKey) {
    const m = findManufacturer(slug);
    if (!m) {
      document.title = 'Page not found | TradeSource';
      app.innerHTML = '<section><h1>Manufacturer not found</h1></section>';
      return;
    }

    const sections = manufacturerSections(m);
    const current = sections.find((t) => t.key === (sectionKey || 'overview')) || sections[0];
    document.title = `${m.name} | ${current.label} | TradeSource`;
    const ownProducts = DATA.products.filter((p) => p.manufacturerSlug === m.slug);

    const nav = `
      <nav class="manufacturer-nav" aria-label="Manufacturer navigation" data-cy="manufacturerNav">
        <div class="mat-mdc-tab-links">
          ${sections.map((t) => `<a href="${manufacturerPath(m, t.key)}" data-spa id="nav-${t.key}" class="mdc-tab${t === current ? ' mdc-tab--active' : ''}"${t.cy ? ` data-cy="${t.cy}"` : ''} data-testid="nav-${t.key}"${t === current ? ' aria-current="page"' : ''}>${t.label}</a>`).join('')}
        </div>
      </nav>
    `;

    let body;
    if (current.key === 'overview') {
      body = `
        <p class="manufacturer-about" data-testid="manufacturer-about">${escapeHtml(m.about)}</p>
        <div data-slot="certification-bodies"></div>
        ${ownProducts.length ? `<h2>Products</h2><div class="tiles">${ownProducts.map(productTile).join('')}</div>` : ''}
      `;
    } else if (current.key === 'products') {
      body = `<h2>Products</h2>${ownProducts.length ? `<div class="tiles">${ownProducts.map(productTile).join('')}</div>` : '<p class="empty-state">No products listed.</p>'}`;
    } else if (current.key === 'about') {
      body = `<h2>About us</h2><p class="manufacturer-about">${escapeHtml(m.about)}</p>`;
    } else {
      body = `<h2>${current.label}</h2><div data-slot="list"></div>`;
    }

    app.innerHTML = `
      <section class="manufacturer-page">
        <img class="tile-logo tile-logo--large" src="${TS.logoSrc(m)}" alt="${escapeHtml(m.name)} logo" width="72" height="72" />
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

        <ul class="social-links" data-cy="socialLinks" data-testid="social-links" aria-label="${escapeHtml(m.name)} on social media">
          ${SOCIAL_PLATFORMS.map((pl) => `
          <li><a class="social-link" href="https://example.com/social/${m.slug}/${pl.key}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(m.name)} on ${pl.label}" title="${pl.label}" data-cy="social-${pl.key}" data-testid="social-${pl.key}"><img src="/images/social-${pl.key}.svg" alt="" width="32" height="32" /></a></li>`).join('')}
        </ul>

        ${nav}

        ${body}
      </section>
    `;

    const contactButton = app.querySelector('#contact-manufacturer');
    if (contactButton) contactButton.addEventListener('click', () => openContactModal(m, contactButton));

    const token = renderToken;
    const certSlot = app.querySelector('[data-slot="certification-bodies"]');
    if (certSlot) loadCertificationBodies(certSlot, m, token);
    const listSlot = app.querySelector('[data-slot="list"]');
    if (listSlot) loadList(listSlot, LIST_TABS[current.key], m, token);
  }

  // ---------------------------------------------------------------
  // "Contact manufacturer" modal
  //   signed out -> "Sign in required" dialog
  //   signed in  -> subject + question form -> fake send -> confirmation
  // ---------------------------------------------------------------

  let contactModal = null;

  function closeContactModal() {
    if (!contactModal) return;
    document.removeEventListener('keydown', contactModal.onKey);
    contactModal.dialog.remove();
    contactModal.backdrop.remove();
    const opener = contactModal.opener;
    contactModal = null;
    if (opener && document.contains(opener)) opener.focus();
  }

  function openContactModal(m, opener) {
    closeContactModal();
    const backdrop = document.createElement('div');
    backdrop.className = 'cdk-overlay-backdrop cdk-overlay-backdrop-showing';
    const dialog = document.createElement('div');
    dialog.className = 'overlay-dialog contact-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('data-cy', 'contactDialog');
    dialog.setAttribute('data-testid', 'contact-dialog');
    document.body.appendChild(backdrop);
    document.body.appendChild(dialog);

    // Escape closes; Tab stays inside the dialog.
    const onKey = (e) => {
      if (e.key === 'Escape') { closeContactModal(); return; }
      if (e.key !== 'Tab') return;
      const focusable = dialog.querySelectorAll('button:not([disabled]), input, textarea');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    contactModal = { dialog, backdrop, onKey, opener };

    const closeX = '<button type="button" class="dialog-close" data-cy="contactClose" data-testid="contact-close" aria-label="Close dialog">&times;</button>';
    const wireClose = () => dialog.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeContactModal));

    const session = getSession();
    if (!session) {
      dialog.setAttribute('aria-labelledby', 'contact-title');
      dialog.innerHTML = `
        ${closeX.replace('class="dialog-close"', 'class="dialog-close" data-close')}
        <h2 id="contact-title">Sign in required</h2>
        <p data-testid="contact-signin-message">To contact a manufacturer you need to be signed in.</p>
        <div class="overlay-actions">
          <button type="button" id="contact-signin" data-cy="contactSignIn" data-testid="contact-signin">Sign in to continue</button>
          <button type="button" class="secondary" id="contact-cancel" data-cy="contactCancel" data-testid="contact-cancel" data-close>Cancel</button>
        </div>`;
      wireClose();
      dialog.querySelector('#contact-signin').addEventListener('click', () => {
        const returnUrl = window.location.pathname + window.location.search;
        closeContactModal();
        navigate(SIGN_IN_PATH + '?returnUrl=' + encodeURIComponent(returnUrl));
      });
      dialog.querySelector('#contact-signin').focus();
      return;
    }

    dialog.setAttribute('aria-labelledby', 'contact-title');
    dialog.innerHTML = `
      ${closeX.replace('class="dialog-close"', 'class="dialog-close" data-close')}
      <h2 id="contact-title">Contact ${escapeHtml(m.name)}</h2>
      <form id="contact-form" data-cy="contactForm" data-testid="contact-form" novalidate>
        <div class="field">
          <label for="contact-subject">Subject</label>
          <input id="contact-subject" name="subject" type="text" maxlength="100" required data-cy="contactSubject" data-testid="contact-subject" />
          <p class="form-error" id="contact-subject-error" data-testid="contact-subject-error" role="alert" hidden></p>
        </div>
        <div class="field">
          <label for="contact-question">Question</label>
          <textarea id="contact-question" name="question" rows="5" maxlength="1000" required data-cy="contactQuestion" data-testid="contact-question"></textarea>
          <p class="form-error" id="contact-question-error" data-testid="contact-question-error" role="alert" hidden></p>
        </div>
        <p class="form-error" id="contact-form-error" data-testid="contact-form-error" role="alert" hidden></p>
        <div class="overlay-actions">
          <button type="submit" id="contact-send" data-cy="contactSend" data-testid="contact-send">Send message</button>
          <button type="button" class="secondary" id="contact-cancel" data-cy="contactCancel" data-testid="contact-cancel" data-close>Cancel</button>
        </div>
      </form>`;
    wireClose();
    const form = dialog.querySelector('#contact-form');
    const subjectEl = form.querySelector('#contact-subject');
    const questionEl = form.querySelector('#contact-question');
    const showError = (id, input, text) => {
      const el = form.querySelector('#' + id);
      el.textContent = text || '';
      el.hidden = !text;
      if (input) input.setAttribute('aria-invalid', text ? 'true' : 'false');
    };
    subjectEl.focus();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const subject = subjectEl.value.trim();
      const question = questionEl.value.trim();
      showError('contact-subject-error', subjectEl, subject ? '' : 'Enter a subject');
      showError('contact-question-error', questionEl, question ? '' : 'Enter your question');
      showError('contact-form-error', null, '');
      if (!subject || !question) return;

      const send = form.querySelector('#contact-send');
      send.disabled = true;
      send.textContent = 'Sending...';
      try {
        const res = await fetch('/api/contact-manufacturer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ manufacturerId: m.id, subject, question, from: session.email }),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const { reference } = await res.json();
        if (!contactModal || contactModal.dialog !== dialog) return;
        dialog.innerHTML = `
          ${closeX.replace('class="dialog-close"', 'class="dialog-close" data-close')}
          <h2 id="contact-title">Message sent</h2>
          <p data-testid="contact-success">Your message to ${escapeHtml(m.name)} has been sent. Reference: <strong data-testid="contact-reference">${escapeHtml(reference)}</strong></p>
          <p class="contact-note">This is a practice site: nothing was actually sent.</p>
          <div class="overlay-actions">
            <button type="button" id="contact-done" data-cy="contactDone" data-testid="contact-done" data-close>Close</button>
          </div>`;
        wireClose();
        dialog.querySelector('#contact-done').focus();
      } catch (err) {
        if (!contactModal || contactModal.dialog !== dialog) return;
        send.disabled = false;
        send.textContent = 'Send message';
        showError('contact-form-error', null, 'Sorry, we could not send your message. Please try again.');
      }
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
  // Header: search autocomplete and the Browse menu
  // ---------------------------------------------------------------

  // Suggestions appear under the search box once two or more characters are
  // typed: an <app-autocomplete> with a Manufacturers section and a Products
  // section, like the real site. They close on Enter, Escape, a click elsewhere
  // or navigating.
  function closeAutocomplete() {
    document.querySelectorAll('app-autocomplete').forEach((el) => el.remove());
  }

  function updateAutocomplete(form, value) {
    closeAutocomplete();
    const term = value.trim().toLowerCase();
    if (term.length < 2) return;
    const manufacturers = DATA.manufacturers.filter((m) => m.name.toLowerCase().includes(term)).slice(0, 4);
    const products = DATA.products.filter((p) => p.name.toLowerCase().includes(term)).slice(0, 4);
    if (!manufacturers.length && !products.length) return;

    const el = document.createElement('app-autocomplete');
    el.setAttribute('data-cy', 'autocomplete');
    el.innerHTML = `
      ${manufacturers.length ? `<article class="manufacturers"><h3>Manufacturers</h3>
        ${manufacturers.map((m) => `<a href="${manufacturerPath(m, 'overview')}" data-spa>${escapeHtml(m.name)} <span class="suggestion-sub">${escapeHtml(m.tagline)}</span></a>`).join('')}
      </article>` : ''}
      ${products.length ? `<article class="products"><h3>Products</h3>
        ${products.map((p) => `<a href="${productPath(p)}" data-spa>${escapeHtml(p.name)}</a>`).join('')}
      </article>` : ''}
    `;
    form.appendChild(el);
  }

  function buildBrowseMenu() {
    const menu = document.querySelector('[data-cy="browseMenu"]');
    menu.innerHTML = `
      <h2>Categories</h2>
      <ul>
        ${DATA.categories.map((c) => `<li><a href="${TS.categoryPath([c])}" data-spa>${escapeHtml(c.name)}</a></li>`).join('')}
      </ul>
      <a href="/en/gb/categories" data-spa class="browse-all">All categories</a>
    `;
    const button = document.querySelector('[data-cy="browseButton"]');
    button.addEventListener('click', () => {
      menu.hidden = !menu.hidden;
      button.setAttribute('aria-expanded', String(!menu.hidden));
    });
  }

  // ---------------------------------------------------------------
  // Router
  // ---------------------------------------------------------------

  function render(pathname, search) {
    renderToken += 1;
    closeAutocomplete();
    closeContactModal();
    // The Browse menu closes when you navigate.
    const browseMenu = document.querySelector('[data-cy="browseMenu"]');
    if (browseMenu) {
      browseMenu.hidden = true;
      document.querySelector('[data-cy="browseButton"]').setAttribute('aria-expanded', 'false');
    }

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
    if (pathname === '/en/gb/categories') {
      renderCategoriesIndex();
      return;
    }
    if (pathname === '/en/gb/categories/catalogue') {
      renderCatalogueIndex();
      return;
    }
    const categoryMatch = pathname.match(/^\/en\/gb\/category\/catalogue\/(?:[^/]+\/)+([^/]+)$/);
    if (categoryMatch) {
      renderCategory(categoryMatch[1]);
      return;
    }
    const productMatch = pathname.match(/^\/en\/gb\/product\/([^/]+)\/[^/]+\/[^/]+$/);
    if (productMatch) {
      renderProduct(productMatch[1]);
      return;
    }
    const manufacturerMatch = pathname.match(/^(?:\/en\/gb)?\/manufacturer\/([^/]+)\/[^/]+\/([^/]+)$/);
    if (manufacturerMatch) {
      renderManufacturer(manufacturerMatch[1], manufacturerMatch[2]);
      return;
    }
    document.title = 'Page not found | TradeSource';
    app.innerHTML = '<section><h1>Page not found</h1></section>';
  }

  function navigate(pathAndQuery) {
    const [pathname, search] = pathAndQuery.split('?');
    window.history.pushState({}, '', pathAndQuery);
    render(pathname, search ? `?${search}` : '');
    window.scrollTo(0, 0);
  }

  window.addEventListener('popstate', () => {
    render(window.location.pathname, window.location.search);
  });

  // Any link marked data-spa navigates without a full page load, unless the
  // user is opening it in a new tab (modifier keys) or it isn't a plain click.
  document.addEventListener('click', (e) => {
    const link = e.target.closest && e.target.closest('a[data-spa]');
    if (link) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      navigate(link.getAttribute('href'));
      return;
    }
    // A click anywhere else closes the suggestions.
    if (!e.target.closest || !e.target.closest('app-autocomplete')) closeAutocomplete();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAutocomplete();
  });

  // Wire up both search boxes (desktop always visible, mobile hidden
  // behind the nav toggle) — deliberately two so cy.get(...).filter(':visible')
  // has a real reason to exist.
  document.querySelectorAll('.search-form').forEach((form) => {
    const input = form.querySelector('[data-cy="searchFieldSearch"]');
    input.addEventListener('input', () => updateAutocomplete(form, input.value));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      closeAutocomplete();
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

  buildBrowseMenu();

  if (window.location.pathname === '/') {
    window.history.replaceState({}, '', '/en/gb');
  }
  render(window.location.pathname, window.location.search);
})();
