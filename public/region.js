// Location + language selector: the "UK" button in the header opens a panel with
// Location and Language dropdowns. Saving a different country asks for
// confirmation ("Confirm region change"), then goes to the homepage and shows a
// reminder banner at the bottom of every page until it is dismissed (or until
// you are back in the detected country).
//
// The dropdowns are custom comboboxes (role="combobox" + role="listbox"/"option"),
// like the Angular Material selects on NBS Source, not native <select> elements,
// so Playwright's selectOption() does NOT work on them: click the combobox, then
// click the option.
//
// State: localStorage "tradesource.region" = {country, language}. The banner's
// dismissed flag lives in sessionStorage. The "detected" country is fixed at GB
// (there is no real geolocation on this practice site).

(function () {
  const DETECTED = 'gb';
  const REGION_KEY = 'tradesource.region';
  const BANNER_KEY = 'tradesource.regionBannerDismissed';

  const COUNTRIES = [
    { code: 'gb', label: 'UK', name: 'United Kingdom', languages: [{ value: 'en', label: 'English' }] },
    { code: 'ca', label: 'CA', name: 'Canada', languages: [{ value: 'en', label: 'English' }, { value: 'fr', label: 'Français' }] },
    { code: 'us', label: 'US', name: 'United States', languages: [{ value: 'en', label: 'English' }] },
    { code: 'ie', label: 'IE', name: 'Ireland', languages: [{ value: 'en', label: 'English' }] },
  ];
  const byCode = (code) => COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function getRegion() {
    try {
      const r = JSON.parse(window.localStorage.getItem(REGION_KEY));
      if (r && COUNTRIES.some((c) => c.code === r.country)) return r;
    } catch (e) { /* ignore */ }
    return { country: DETECTED, language: 'en' };
  }
  function setRegion(country, language) {
    try { window.localStorage.setItem(REGION_KEY, JSON.stringify({ country, language })); } catch (e) { /* ignore */ }
  }
  const bannerDismissed = () => { try { return window.sessionStorage.getItem(BANNER_KEY) === '1'; } catch (e) { return false; } };
  const dismissBanner = () => { try { window.sessionStorage.setItem(BANNER_KEY, '1'); } catch (e) { /* ignore */ } };
  const clearDismissed = () => { try { window.sessionStorage.removeItem(BANNER_KEY); } catch (e) { /* ignore */ } };

  const GLOBE = '<svg class="globe" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false"><circle cx="16" cy="16" r="13" fill="#333"/><path d="M6 12c4-1 6 1 8 0s2-4 5-4 4 3 2 5-5 1-5 4 3 3 2 6-5 3-8 0-4-6-4-11z" fill="#fff" opacity=".9"/></svg>';

  // ---------------------------------------------------------------
  // Custom combobox
  // ---------------------------------------------------------------

  let comboCount = 0;
  function createCombobox({ labelId, ariaLabel, options, value, onChange, testid, up }) {
    const n = ++comboCount;
    const wrap = document.createElement('div');
    wrap.className = 'combobox' + (up ? ' combobox--up' : '');
    const listId = `combo-list-${n}`;
    wrap.innerHTML = `
      <button type="button" class="combobox-trigger" role="combobox" id="combo-${n}" aria-haspopup="listbox" aria-expanded="false" aria-controls="${listId}"
        ${labelId ? `aria-labelledby="${labelId}"` : `aria-label="${esc(ariaLabel)}"`} data-testid="${testid}"><span class="combobox-value"></span></button>
      <ul class="combobox-list" role="listbox" id="${listId}" hidden></ul>`;
    const trigger = wrap.querySelector('button');
    const list = wrap.querySelector('ul');
    let current = value;

    const render = () => {
      trigger.querySelector('.combobox-value').textContent = (options.find((o) => o.value === current) || options[0]).label;
      list.innerHTML = options.map((o) =>
        `<li role="option" tabindex="-1" data-value="${esc(o.value)}" aria-selected="${o.value === current}">${esc(o.label)}</li>`).join('');
    };
    const close = (refocus) => {
      list.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      if (refocus) trigger.focus();
    };
    const open = () => {
      list.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      (list.querySelector('[aria-selected="true"]') || list.firstElementChild).focus();
    };
    const choose = (v) => {
      current = v;
      render();
      close(true);
      if (onChange) onChange(v);
    };
    render();

    trigger.addEventListener('click', () => (list.hidden ? open() : close(true)));
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); }
    });
    list.addEventListener('click', (e) => {
      const li = e.target.closest('[role="option"]');
      if (li) choose(li.dataset.value);
    });
    list.addEventListener('keydown', (e) => {
      const items = [...list.querySelectorAll('[role="option"]')];
      const i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[Math.min(i + 1, items.length - 1)].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); items[Math.max(i - 1, 0)].focus(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (i >= 0) choose(items[i].dataset.value); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
      else if (e.key === 'Tab') close(false);
    });
    return {
      el: wrap,
      get value() { return current; },
      setOptions(opts, v) { options = opts; current = v; render(); },
    };
  }

  // ---------------------------------------------------------------
  // Header button
  // ---------------------------------------------------------------

  const localeButton = document.querySelector('[data-cy="localeButton"]');
  function refreshLocaleButton() {
    const r = getRegion();
    localeButton.querySelector('span').textContent = byCode(r.country).label;
    localeButton.setAttribute('aria-haspopup', 'dialog');
    localeButton.setAttribute('aria-expanded', String(!!panel));
    document.documentElement.lang = r.language;
  }

  // ---------------------------------------------------------------
  // Panel: "Choose your location and language"
  // ---------------------------------------------------------------

  let panel = null;
  function closePanel(refocus) {
    if (!panel) return;
    document.removeEventListener('keydown', panel.onKey);
    document.removeEventListener('click', panel.onOutside, true);
    panel.el.remove();
    panel = null;
    localeButton.setAttribute('aria-expanded', 'false');
    if (refocus) localeButton.focus();
  }

  function openPanel() {
    closePanel();
    const region = getRegion();
    const el = document.createElement('div');
    el.className = 'region-panel';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-labelledby', 'region-panel-title');
    el.setAttribute('data-cy', 'regionPanel');
    el.setAttribute('data-testid', 'region-panel');
    el.innerHTML = `
      <h2 id="region-panel-title">Choose your location and language</h2>
      <span class="field-label" id="region-location-label">Location</span>
      <div data-slot="location"></div>
      <span class="field-label" id="region-language-label">Language</span>
      <div data-slot="language"></div>
      <div class="overlay-actions region-actions">
        <button type="button" class="secondary" data-cy="regionCancel" data-testid="region-cancel">Cancel</button>
        <button type="button" data-cy="regionSave" data-testid="region-save">Save</button>
      </div>`;
    document.body.appendChild(el);
    const rect = localeButton.getBoundingClientRect();
    el.style.top = `${rect.bottom + window.scrollY + 8}px`;
    el.style.left = `${Math.max(8, rect.left)}px`;

    const languageOptions = (code) => byCode(code).languages;
    const language = createCombobox({
      labelId: 'region-language-label',
      options: languageOptions(region.country),
      value: region.language,
      testid: 'region-language',
    });
    const location = createCombobox({
      labelId: 'region-location-label',
      options: COUNTRIES.map((c) => ({ value: c.code, label: c.name })),
      value: region.country,
      testid: 'region-location',
      onChange: (code) => language.setOptions(languageOptions(code), languageOptions(code)[0].value),
    });
    el.querySelector('[data-slot="location"]').appendChild(location.el);
    el.querySelector('[data-slot="language"]').appendChild(language.el);

    el.querySelector('[data-cy="regionCancel"]').addEventListener('click', () => closePanel(true));
    el.querySelector('[data-cy="regionSave"]').addEventListener('click', () => {
      const country = location.value;
      const lang = language.value;
      closePanel(false);
      if (country === getRegion().country) {
        setRegion(country, lang);
        refreshLocaleButton();
        localeButton.focus();
      } else {
        openConfirm(country, lang);
      }
    });

    const onKey = (e) => { if (e.key === 'Escape') closePanel(true); };
    const onOutside = (e) => {
      if (!el.contains(e.target) && !localeButton.contains(e.target)) closePanel(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onOutside, true);
    panel = { el, onKey, onOutside };
    localeButton.setAttribute('aria-expanded', 'true');
    location.el.querySelector('button').focus();
  }

  localeButton.addEventListener('click', () => (panel ? closePanel(true) : openPanel()));

  // ---------------------------------------------------------------
  // "Confirm region change" dialog
  // ---------------------------------------------------------------

  let confirmDlg = null;
  function closeConfirm() {
    if (!confirmDlg) return;
    document.removeEventListener('keydown', confirmDlg.onKey);
    confirmDlg.el.remove();
    confirmDlg.backdrop.remove();
    confirmDlg = null;
    localeButton.focus();
  }

  function openConfirm(newCode, newLanguage) {
    closeConfirm();
    const from = byCode(getRegion().country);
    const to = byCode(newCode);
    const backdrop = document.createElement('div');
    backdrop.className = 'cdk-overlay-backdrop cdk-overlay-backdrop-showing';
    const el = document.createElement('div');
    el.className = 'overlay-dialog region-confirm';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'region-confirm-title');
    el.setAttribute('data-cy', 'regionConfirmDialog');
    el.setAttribute('data-testid', 'region-confirm-dialog');
    el.innerHTML = `
      <button type="button" class="dialog-close" aria-label="Close" data-cy="regionConfirmClose" data-testid="region-confirm-close">&times;</button>
      ${GLOBE}
      <h2 id="region-confirm-title">Confirm region change</h2>
      <p data-testid="region-confirm-message">You are viewing content for ${esc(from.name)}. Would you like to change to ${esc(to.name)}?<br />Changing region will navigate you to the homepage.</p>
      <div class="overlay-actions region-confirm-actions">
        <button type="button" class="secondary" data-cy="regionRemain" data-testid="region-remain">Remain in ${esc(from.name)}</button>
        <button type="button" data-cy="regionChange" data-testid="region-change">Change to ${esc(to.name)}</button>
      </div>`;
    document.body.appendChild(backdrop);
    document.body.appendChild(el);

    el.querySelector('.dialog-close').addEventListener('click', closeConfirm);
    el.querySelector('[data-cy="regionRemain"]').addEventListener('click', closeConfirm);
    el.querySelector('[data-cy="regionChange"]').addEventListener('click', () => {
      closeConfirm();
      changeRegion(newCode, newLanguage);
    });
    const onKey = (e) => {
      if (e.key === 'Escape') { closeConfirm(); return; }
      if (e.key !== 'Tab') return;
      const f = el.querySelectorAll('button');
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    };
    document.addEventListener('keydown', onKey);
    confirmDlg = { el, backdrop, onKey };
    el.querySelector('[data-cy="regionChange"]').focus();
  }

  function changeRegion(code, language) {
    setRegion(code, language);
    clearDismissed();
    refreshLocaleButton();
    refreshBanner();
    if (window.TS && window.TS.navigate) window.TS.navigate('/en/gb');
  }

  // ---------------------------------------------------------------
  // Reminder banner at the bottom of the page
  // ---------------------------------------------------------------

  let banner = null;
  function removeBanner() {
    if (banner) banner.remove();
    banner = null;
    document.body.classList.remove('has-region-banner');
  }

  function refreshBanner() {
    removeBanner();
    const region = getRegion();
    if (region.country === DETECTED || bannerDismissed()) return;

    const country = byCode(region.country);
    const el = document.createElement('div');
    el.className = 'region-banner';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Region reminder');
    el.setAttribute('data-cy', 'regionBanner');
    el.setAttribute('data-testid', 'region-banner');
    el.innerHTML = `
      <div class="region-banner-inner">
        ${GLOBE.replace('width="32" height="32"', 'width="22" height="22"')}
        <p class="region-banner-text"><strong data-testid="region-banner-title">You are viewing content for ${esc(country.name)}.</strong><br />Choose a country to see content for your location. Changing region will navigate you to the homepage.</p>
        <div class="region-banner-controls">
          <span data-slot="country"></span>
          <button type="button" class="region-continue" data-cy="regionContinue" data-testid="region-continue">Continue</button>
          <button type="button" class="region-banner-close" aria-label="Dismiss region reminder" data-cy="regionBannerClose" data-testid="region-banner-close">&times;</button>
        </div>
      </div>`;
    const select = createCombobox({
      ariaLabel: 'Country',
      options: COUNTRIES.map((c) => ({ value: c.code, label: c.name })),
      value: DETECTED,
      testid: 'region-banner-country',
      up: true,
    });
    el.querySelector('[data-slot="country"]').appendChild(select.el);
    el.querySelector('.region-continue').addEventListener('click', () => {
      if (select.value === getRegion().country) { dismissBanner(); refreshBanner(); return; }
      changeRegion(select.value, byCode(select.value).languages[0].value);
    });
    el.querySelector('.region-banner-close').addEventListener('click', () => { dismissBanner(); refreshBanner(); });
    document.body.appendChild(el);
    document.body.classList.add('has-region-banner');
    banner = el;
  }

  refreshLocaleButton();
  refreshBanner();
})();
