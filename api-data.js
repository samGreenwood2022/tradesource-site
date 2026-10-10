// Fictional back-end data for the TradeSource API (served by server.js at
// /api/graphql). Kept out of /public on purpose, so the browser only ever sees
// it through network requests, which is what makes it stub-able in tests.
//
// Everything here is invented for the course.

module.exports = {
  // Certifications: shown on the "Certifications" tab of a manufacturer page.
  certifications: {
    vortix: [
      { id: 'c-vtx-1', name: 'Commercial Cleaning Equipment Safety Certificate', type: 'Safety' },
      { id: 'c-vtx-2', name: 'Air Treatment Performance Certificate', type: 'Performance' },
      { id: 'c-vtx-3', name: 'Energy Efficiency Declaration', type: 'Environmental' },
    ],
    ferroline: [
      { id: 'c-frl-1', name: 'Structural Fixings Compliance Certificate', type: 'Compliance' },
      { id: 'c-frl-2', name: 'Fire Collar Test Certificate', type: 'Safety' },
    ],
    brightcore: [
      { id: 'c-brc-1', name: 'LED Photobiological Safety Certificate', type: 'Safety' },
      { id: 'c-brc-2', name: 'Lighting Energy Rating Certificate', type: 'Environmental' },
    ],
  },

  // CPD (continuing professional development) seminars: the "CPD" tab, which
  // only manufacturers flagged hasCpd have in their tab strip.
  cpd: {
    'halden-locks-uk': [
      { id: 'cpd-hld-1', name: 'Specifying Door Hardware for Fire Doors', type: 'Seminar' },
      { id: 'cpd-hld-2', name: 'Access Control Basics for Specifiers', type: 'Seminar' },
      { id: 'cpd-hld-3', name: 'Keying Systems Explained', type: 'Webinar' },
    ],
  },

  // Literature: brochures and datasheets. Not every manufacturer has any.
  literature: {
    vortix: [
      { id: 'lit-vtx-1', name: 'Vortix Commercial Range Brochure', type: 'Brochure' },
      { id: 'lit-vtx-2', name: 'Airbar V Installation Guide', type: 'Datasheet' },
    ],
    'halden-locks-uk': [{ id: 'lit-hld-1', name: 'Halden Door Hardware Catalogue', type: 'Brochure' }],
  },

  // Case studies: deliberately empty for everyone, so the "no results" state
  // can be reached on demand without stubbing anything.
  caseStudies: {},

  // Certification bodies listed on a manufacturer's Overview. Loaded by a
  // separate request, a moment after the page shell appears.
  certificationBodies: {
    vortix: ['BuildMark Assurance', 'SafeSite Standards Board'],
    ferroline: ['BuildMark Assurance', 'Fixings Quality Council'],
    brightcore: ['BuildMark Assurance', 'Lumen Standards Board'],
  },
};
