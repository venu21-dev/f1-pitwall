/**
 * Circuit-Land (aus Jolpica/Ergast) → ISO 2-Buchstaben-Code
 * `Circuit.Location.country` aus der API wird hier gemappt.
 */
export const COUNTRY_CODES = {
  Bahrain:               'BH',
  'Saudi Arabia':        'SA',
  Australia:             'AU',
  Japan:                 'JP',
  China:                 'CN',
  USA:                   'US',
  'United States':       'US',
  Italy:                 'IT',
  Monaco:                'MC',
  Canada:                'CA',
  Spain:                 'ES',
  Austria:               'AT',
  UK:                    'GB',
  'United Kingdom':      'GB',
  Hungary:               'HU',
  Belgium:               'BE',
  Netherlands:           'NL',
  Azerbaijan:            'AZ',
  Singapore:             'SG',
  Mexico:                'MX',
  Brazil:                'BR',
  Qatar:                 'QA',
  UAE:                   'AE',
  'United Arab Emirates':'AE',
  Portugal:              'PT',
  France:                'FR',
  Russia:                'RU',
  Turkey:                'TR',
  Germany:               'DE',
  'South Korea':         'KR',
  India:                 'IN',
  Vietnam:               'VN',
  'Las Vegas':           'US',
}

/**
 * @param {string} country  Ländername aus der API
 * @returns {string}  ISO-Code (2 Zeichen) oder '??' als Fallback
 */
export function getCountryCode(country = '') {
  return COUNTRY_CODES[country] ?? '??'
}
