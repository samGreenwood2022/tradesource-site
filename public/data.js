// Fictional catalogue data for the TradeSource practice site.
// Every manufacturer, product, category, phone number, description and URL
// here is invented for this course — none of it is copied from any real company.
//
// Loaded as a plain script in the browser (window.TRADESOURCE_DATA) and also
// require()-able by server.js, which uses it for the fictional API.

(function (root) {
  const data = {
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

    // Category tree: Home > Categories > Catalogue > ... . Each node has a
    // stable id, used in URLs: /en/gb/category/catalogue/<slugs...>/<id>
    categories: [
      { id: 'tHWdvTImJqzji3Ib5sNsi1', slug: 'cleaning-and-hygiene', name: 'Cleaning and hygiene', children: [
        { id: 'PkdyRHMI6Qh6Lbm0zVik53', slug: 'floor-care', name: 'Floor care', children: [
          { id: 'QrGPLRhPQKRRzPqXH6Mv85', slug: 'wet-and-dry-vacuums', name: 'Wet and dry vacuums', children: [] },
        ] },
        { id: 'I54xuk3HtcTalSqDdrHLcB', slug: 'washroom-equipment', name: 'Washroom equipment', children: [
          { id: 'MidvE9rPrKCWmtLMhGeKCh', slug: 'personal-drying', name: 'Personal drying', children: [
            { id: 'eY5VJApKqoGKMckxgCgUKE', slug: 'hand-dryers', name: 'Hand dryers', children: [] },
          ] },
        ] },
        { id: 'JnYbGEozLQopj0ilTWLM5u', slug: 'air-treatment', name: 'Air treatment', children: [
          { id: 't4JGK4peDqK9emH41Kylrw', slug: 'air-purifiers', name: 'Air purifiers', children: [] },
        ] },
      ] },
      { id: 'kcXFXcl0e1BngtP143sxD3', slug: 'fixings-and-fasteners', name: 'Fixings and fasteners', children: [
        { id: 'WhgcAHj5au3VlWmMimYehY', slug: 'structural-fixings', name: 'Structural fixings', children: [
          { id: '0J0yJWCmNzoWje7kjkpUKg', slug: 'bolts', name: 'Bolts', children: [] },
        ] },
        { id: 'H7nVfFEbmVorCczuJggPhI', slug: 'fire-stopping', name: 'Fire stopping', children: [
          { id: 'HaWqcbWOuPZsNkXaLWFqX7', slug: 'pipe-collars', name: 'Pipe collars', children: [] },
        ] },
      ] },
      { id: 'FthQ43sEVE5td7Gp1lyjJ7', slug: 'lighting', name: 'Lighting', children: [
        { id: 'WdEcIUd3qFL8ZguTBLynVR', slug: 'interior-lighting', name: 'Interior lighting', children: [
          { id: 'tXzDmvO4UCjomBkgtjw5rk', slug: 'led-panels', name: 'LED panels', children: [] },
        ] },
      ] },
      { id: 'yKN8IVGeSKTyJlbrFdnskk', slug: 'door-hardware', name: 'Door hardware', children: [
        { id: 'EPaw8cnTw0N8Xxz6ovZOkC', slug: 'locks', name: 'Locks', children: [
          { id: '5kU16H5BWiXGMjUBdRtPQg', slug: 'mortice-locks', name: 'Mortice locks', children: [] },
        ] },
        { id: 'zwxDYQHGAWwZbyUTXtLtr4', slug: 'door-closers', name: 'Door closers', children: [
          { id: 'VJOnN0zJtUlIctVUtmb4j4', slug: 'overhead-closers', name: 'Overhead closers', children: [] },
        ] },
      ] },
    ],

  manufacturers: [
    {
      slug: 'vortix',
      id: 'vtxA1B2C3D4E5F6G7H8',
      name: 'Vortix',
      tagline: 'Commercial cleaning equipment, built for daily use',
      about: 'Vortix designs commercial-grade cleaning and air-treatment equipment for offices, retail and industrial sites, with an emphasis on low running costs and easy maintenance.',
      color: '#0f766e',
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
      color: '#2f855a',
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
      color: '#5a7d2a',
      initials: 'BC',
      phoneDisplay: '08005551234',
      phoneHref: 'tel:08005551234',
      website: 'https://www.brightcore.example/overview',
    },
    {
      slug: 'halden-locks-uk',
      id: 'hldtIYD2mz1WnVtvyGn',
      name: 'Halden Locks UK',
      tagline: 'Locks and door hardware for commercial buildings',
      about: 'Halden Locks UK designs and supplies mortice locks, door closers and access hardware for commercial and public buildings, with CPD seminars for specifiers.',
      color: '#0e7490',
      initials: 'HL',
      // Shows a CPD tab instead of Certifications (the counterpart of Abloy UK in the course).
      hasCpd: true,
      phoneDisplay: '+44 (0)191 498 0123',
      phoneHref: 'tel:+44 (0)191 498 0123',
      website: 'https://www.halden-locks.example/overview',
    },
  ],
    products: [
    {
      slug: 'vortix-vc300',
      id: 'mS1TVAAD9CHsPAxh60NH7e',
      listingId: 'Y8BDbZxfelvPvz5IXcWvbl',
      name: 'Vortix VC300 Wet & Dry Vacuum',
      manufacturerSlug: 'vortix',
      categoryId: 'QrGPLRhPQKRRzPqXH6Mv85',
      icon: 'vacuum',
      description: 'A compact wet-and-dry commercial vacuum with a 30-litre tank, suited to daily use in offices and retail units.',
      specs: [['Tank capacity', '30 litres'], ['Power', '1,200 W']],
    },
    {
      slug: 'vortix-ab-v',
      id: 'TEnfYYR0sgglYs7gmQOCzL',
      listingId: 'zdp7Odro0hT6MHVuk0hIvF',
      name: 'Vortix Airbar V Hand Dryer',
      manufacturerSlug: 'vortix',
      categoryId: 'eY5VJApKqoGKMckxgCgUKE',
      icon: 'dryer',
      description: 'A slimline, wall-mounted hand dryer that protrudes only 100mm, designed for high-footfall washrooms.',
      specs: [['Projection from wall', '100 mm'], ['Drying time', '12 seconds']],
    },
    {
      slug: 'vortix-purify-9',
      id: '4AybRC9dJektEEl93PDxmU',
      listingId: 'idReVUJPjjovfXqNy04NVb',
      name: 'Vortix Purify 9 Air Treatment Tower',
      manufacturerSlug: 'vortix',
      categoryId: 't4JGK4peDqK9emH41Kylrw',
      icon: 'tower',
      description: 'A freestanding air purification and cooling tower for open-plan commercial spaces.',
      specs: [['Coverage', 'Up to 80 m²'], ['Filter life', '12 months']],
    },
    {
      slug: 'ferroline-m10-bolt',
      id: 'dqRjI4jU8f25jxjw7benYF',
      listingId: 'HW0H9ADvySGnZwViUWDD2p',
      name: 'Ferroline M10 Structural Bolt',
      manufacturerSlug: 'ferroline',
      categoryId: '0J0yJWCmNzoWje7kjkpUKg',
      icon: 'bolt',
      description: 'A galvanised M10 structural bolt rated for steel-to-steel connections on construction sites.',
      specs: [['Diameter', 'M10'], ['Finish', 'Hot-dip galvanised']],
    },
    {
      slug: 'ferroline-fire-collar',
      id: 'L0AKcxJJ7PpJ34pVpvXFGJ',
      listingId: '2KEAwmj0e1YC7k16jsf4mR',
      name: 'Ferroline Fire-Rated Pipe Collar',
      manufacturerSlug: 'ferroline',
      categoryId: 'HaWqcbWOuPZsNkXaLWFqX7',
      icon: 'collar',
      description: 'An intumescent pipe collar providing up to 2 hours of fire protection at service penetrations.',
      specs: [['Fire rating', 'Up to 120 minutes'], ['Pipe sizes', '32 mm to 160 mm']],
    },
    {
      slug: 'brightcore-panel-600',
      id: 'gxmJe1mQppLxUWNJASlLjK',
      listingId: 'RP8JURJVB6VYS5Mvdqu1yE',
      name: 'Brightcore 600x600 LED Panel',
      manufacturerSlug: 'brightcore',
      categoryId: 'tXzDmvO4UCjomBkgtjw5rk',
      icon: 'panel',
      description: 'A recessed 600x600mm LED ceiling panel for offices, rated for 50,000 hours of use.',
      specs: [['Size', '600 x 600 mm'], ['Rated life', '50,000 hours']],
    },
    {
      slug: 'halden-hm50-mortice-lock',
      id: 'UbIzYMLCUWHe0BGY74oINM',
      listingId: 'Fki1Y7z7rwvrx2sFeh9DCl',
      name: 'Halden HM50 Mortice Lock',
      manufacturerSlug: 'halden-locks-uk',
      categoryId: '5kU16H5BWiXGMjUBdRtPQg',
      icon: 'lock',
      description: 'A five-lever mortice lock for commercial timber doors, supplied with keys and a keyed-alike option.',
      specs: [['Levers', '5'], ['Backset', '60 mm']],
    },
    {
      slug: 'halden-dc200-door-closer',
      id: 'BumNxn16cyt0286VmofRPN',
      listingId: '0kOypF9xocGc6JAmmseSKm',
      name: 'Halden DC200 Overhead Door Closer',
      manufacturerSlug: 'halden-locks-uk',
      categoryId: 'VJOnN0zJtUlIctVUtmb4j4',
      icon: 'closer',
      description: 'An adjustable-power overhead door closer for fire doors up to 1,100 mm wide.',
      specs: [['Door width', 'Up to 1,100 mm'], ['Closing speed', 'Adjustable']],
    },
    ],
  };

  root.TRADESOURCE_DATA = data;
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
})(typeof window !== 'undefined' ? window : globalThis);
