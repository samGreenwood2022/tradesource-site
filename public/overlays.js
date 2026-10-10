// Overlays for the TradeSource practice site: a cookie-consent banner and a
// "new feature" popup that arrive a moment after the page loads, with a
// full-page backdrop that swallows clicks until they are dismissed.
//
// They exist on purpose, because real sites do this and it is a classic cause
// of flaky automation: the popup shows up at no fixed moment, the header behind
// it is still "visible" (aria-modal is false), and the click fails with
// "<div class="cdk-overlay-backdrop ..."> intercepts pointer events".
//
// Class names (cdk-overlay-backdrop / cdk-overlay-backdrop-showing) deliberately
// follow Angular CDK so locators from the course carry over.
//
// They arrive one at a time: the feature popup only opens once the consent
// banner has been dealt with (or straight away if consent was already given),
// so there is never more than one overlay holding the backdrop up.
//
// Remembered choices:
//   - consent:  cookie  tradesource_consent=accepted
//   - feature:  localStorage  tradesource.newFeatureSeen=1
// Switch them off entirely (handy for tests that are not about overlays) by
// setting the cookie  tradesource_overlays=off  before loading the page.
//   Cypress:    cy.setCookie('tradesource_overlays', 'off')
//   Playwright: context.addCookies([{ name: 'tradesource_overlays', value: 'off', url: baseURL }])

(function () {
  const CONSENT_COOKIE = 'tradesource_consent';
  const OFF_COOKIE = 'tradesource_overlays';
  const FEATURE_KEY = 'tradesource.newFeatureSeen';

  function readCookie(name) {
    const match = document.cookie.split('; ').find((c) => c.startsWith(name + '='));
    return match ? decodeURIComponent(match.split('=')[1]) : null;
  }

  function featureSeen() {
    try { return window.localStorage.getItem(FEATURE_KEY) === '1'; } catch (e) { return false; }
  }

  if (readCookie(OFF_COOKIE) === 'off') return;

  let open = 0;
  let backdrop = null;

  function showBackdrop() {
    open += 1;
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'cdk-overlay-backdrop cdk-overlay-backdrop-showing';
      document.body.appendChild(backdrop);
    }
  }

  function hideBackdrop() {
    open = Math.max(0, open - 1);
    if (open === 0 && backdrop) {
      backdrop.remove();
      backdrop = null;
    }
  }

  function delay(minMs, maxMs) {
    return minMs + Math.random() * (maxMs - minMs);
  }

  // Opens the consent banner and calls onClosed once it has gone.
  function openConsent(onClosed) {
    if (readCookie(CONSENT_COOKIE) === 'accepted') {
      onClosed(false);
      return;
    }
    const banner = document.createElement('div');
    banner.className = 'overlay-dialog consent-banner';
    banner.id = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.setAttribute('data-cy', 'consentBanner');
    banner.innerHTML = `
      <p>TradeSource is a fictional training site. This banner is here so you can practise handling consent pop-ups. No cookies are used for tracking.</p>
      <div class="overlay-actions">
        <button type="button" id="consent-accept" data-cy="consentAccept">Accept all</button>
        <button type="button" class="secondary" id="consent-manage" data-cy="consentManage">Manage preferences</button>
      </div>
    `;
    document.body.appendChild(banner);
    showBackdrop();
    banner.querySelector('#consent-accept').addEventListener('click', () => {
      document.cookie = `${CONSENT_COOKIE}=accepted; path=/; max-age=31536000; SameSite=Lax`;
      banner.remove();
      hideBackdrop();
      onClosed(true);
    });
    banner.querySelector('#consent-manage').addEventListener('click', () => {
      // Preferences are not implemented: it behaves like "reject for now".
      banner.remove();
      hideBackdrop();
      onClosed(true);
    });
  }

  function openNewFeature() {
    if (featureSeen()) return;
    const dialog = document.createElement('div');
    dialog.className = 'overlay-dialog feature-dialog';
    dialog.id = 'new-feature-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'false');
    dialog.setAttribute('aria-labelledby', 'new-feature-title');
    dialog.setAttribute('data-cy', 'newFeatureDialog');
    dialog.innerHTML = `
      <button type="button" class="dialog-close" id="new-feature-close" data-cy="newFeatureClose" aria-label="Close dialog">&times;</button>
      <h2 id="new-feature-title">Discover TradeSource Insights</h2>
      <p>A made-up new feature, announced in a pop-up that appears after the page has loaded.</p>
    `;
    document.body.appendChild(dialog);
    showBackdrop();
    dialog.querySelector('#new-feature-close').addEventListener('click', () => {
      try { window.localStorage.setItem(FEATURE_KEY, '1'); } catch (e) { /* ignore */ }
      dialog.remove();
      hideBackdrop();
    });
  }

  window.setTimeout(() => {
    openConsent((consentWasShown) => {
      // Straight after the banner closes, wait a beat before the next popup.
      window.setTimeout(openNewFeature, consentWasShown ? delay(500, 1500) : delay(300, 1000));
    });
  }, delay(600, 1200));
})();
