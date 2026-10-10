// Fictional catalogue data for the TradeSource practice site.
// Every manufacturer, product, phone number, description and URL here is
// invented for this course — none of it is copied from any real company.

window.TRADESOURCE_DATA = {
  // Demo accounts for the sign-in journey. Fictional, and deliberately
  // visible in the page source: this is a practice site, not real auth.
  users: [
    {
      email: 'test.user@tradesource.example',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
    },
  ],
  manufacturers: [
    {
      slug: 'vortix',
      id: 'vtxA1B2C3D4E5F6G7H8',
      name: 'Vortix',
      tagline: 'Commercial cleaning equipment, built for daily use',
      about: 'Vortix designs commercial-grade cleaning and air-treatment equipment for offices, retail and industrial sites, with an emphasis on low running costs and easy maintenance.',
      color: '#7c3aed',
      initials: 'VX',
      phoneDisplay: '08001234567',
      phoneHref: 'tel:08001234567',
      website: 'https://www.vortix-commercial.example/overview',
    },
    {
      slug: 'ferroline',
      id: 'frlZ9Y8X7W6V5U4T3S2',
      name: 'Ferroline',
      tagline: 'Fixings and fastenings for the trade',
      about: 'Ferroline manufactures structural fixings and fastenings for construction and manufacturing, supplying trade counters and contractors across the UK.',
      color: '#0f766e',
      initials: 'FL',
      phoneDisplay: '08009876543',
      phoneHref: 'tel:08009876543',
      website: 'https://www.ferroline.example/overview',
    },
    {
      slug: 'brightcore',
      id: 'brcQ1R2S3T4U5V6W7X8',
      name: 'Brightcore',
      tagline: 'LED lighting for commercial spaces',
      about: 'Brightcore supplies LED lighting systems for commercial and industrial buildings, with a focus on energy efficiency and long service life.',
      color: '#b45309',
      initials: 'BC',
      phoneDisplay: '08005551234',
      phoneHref: 'tel:08005551234',
      website: 'https://www.brightcore.example/overview',
    },
  ],
  products: [
    {
      slug: 'vortix-vc300',
      name: 'Vortix VC300 Wet & Dry Vacuum',
      manufacturerSlug: 'vortix',
      icon: 'vacuum',
      description: 'A compact wet-and-dry commercial vacuum with a 30-litre tank, suited to daily use in offices and retail units.',
    },
    {
      slug: 'vortix-ab-v',
      name: 'Vortix Airbar V Hand Dryer',
      manufacturerSlug: 'vortix',
      icon: 'dryer',
      description: 'A slimline, wall-mounted hand dryer that protrudes only 100mm, designed for high-footfall washrooms.',
    },
    {
      slug: 'vortix-purify-9',
      name: 'Vortix Purify 9 Air Treatment Tower',
      manufacturerSlug: 'vortix',
      icon: 'tower',
      description: 'A freestanding air purification and cooling tower for open-plan commercial spaces.',
    },
    {
      slug: 'ferroline-m10-bolt',
      name: 'Ferroline M10 Structural Bolt',
      manufacturerSlug: 'ferroline',
      icon: 'bolt',
      description: 'A galvanised M10 structural bolt rated for steel-to-steel connections on construction sites.',
    },
    {
      slug: 'ferroline-fire-collar',
      name: 'Ferroline Fire-Rated Pipe Collar',
      manufacturerSlug: 'ferroline',
      icon: 'collar',
      description: 'An intumescent pipe collar providing up to 2 hours of fire protection at service penetrations.',
    },
    {
      slug: 'brightcore-panel-600',
      name: 'Brightcore 600x600 LED Panel',
      manufacturerSlug: 'brightcore',
      icon: 'panel',
      description: 'A recessed 600x600mm LED ceiling panel for offices, rated for 50,000 hours of use.',
    },
  ],
};
