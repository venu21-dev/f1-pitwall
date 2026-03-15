/**
 * Circuit-Land (aus Jolpica/Ergast) → Flaggen-Emoji
 * `Circuit.Location.country` aus der API wird hier gemappt.
 */
export const COUNTRY_FLAGS = {
  Bahrain:               '🇧🇭',
  'Saudi Arabia':        '🇸🇦',
  Australia:             '🇦🇺',
  Japan:                 '🇯🇵',
  China:                 '🇨🇳',
  USA:                   '🇺🇸',
  'United States':       '🇺🇸',
  Italy:                 '🇮🇹',
  Monaco:                '🇲🇨',
  Canada:                '🇨🇦',
  Spain:                 '🇪🇸',
  Austria:               '🇦🇹',
  UK:                    '🇬🇧',
  'United Kingdom':      '🇬🇧',
  Hungary:               '🇭🇺',
  Belgium:               '🇧🇪',
  Netherlands:           '🇳🇱',
  Azerbaijan:            '🇦🇿',
  Singapore:             '🇸🇬',
  Mexico:                '🇲🇽',
  Brazil:                '🇧🇷',
  Qatar:                 '🇶🇦',
  UAE:                   '🇦🇪',
  'United Arab Emirates':'🇦🇪',
  Portugal:              '🇵🇹',
  France:                '🇫🇷',
  Russia:                '🇷🇺',
  Turkey:                '🇹🇷',
  Germany:               '🇩🇪',
  'South Korea':         '🇰🇷',
  India:                 '🇮🇳',
  Vietnam:               '🇻🇳',
  'Las Vegas':           '🇺🇸',
}

/**
 * @param {string} country  Ländername aus der API
 * @returns {string}  Flaggen-Emoji oder 🏁 als Fallback
 */
export function getCountryFlag(country = '') {
  return COUNTRY_FLAGS[country] ?? '🏁'
}
