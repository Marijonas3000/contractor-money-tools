export type StructuredDataNode = Record<string, unknown>;

export const SITE_URL = 'https://contractormoneytools.com/';
export const ORGANIZATION_ID = `${SITE_URL}#organization`;

export const organizationSchema: StructuredDataNode = {
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: 'Contractor Money Tools',
  url: SITE_URL,
};
