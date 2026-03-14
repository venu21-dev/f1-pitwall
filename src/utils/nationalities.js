/**
 * Nationalität (Ergast-String) → Flaggen-Emoji + 3-Buchstaben-Kürzel
 * Quelle: Ergast/Jolpica gibt Nationalität als englisches Adjektiv zurück.
 */

export const NATIONALITY_FLAG = {
  British:       '🇬🇧',
  Dutch:         '🇳🇱',
  German:        '🇩🇪',
  Spanish:       '🇪🇸',
  French:        '🇫🇷',
  Monegasque:    '🇲🇨',
  Australian:    '🇦🇺',
  Mexican:       '🇲🇽',
  Finnish:       '🇫🇮',
  Canadian:      '🇨🇦',
  Thai:          '🇹🇭',
  Danish:        '🇩🇰',
  Chinese:       '🇨🇳',
  Japanese:      '🇯🇵',
  American:      '🇺🇸',
  Brazilian:     '🇧🇷',
  Italian:       '🇮🇹',
  Austrian:      '🇦🇹',
  Belgian:       '🇧🇪',
  'New Zealander': '🇳🇿',
  Argentine:     '🇦🇷',
  Swiss:         '🇨🇭',
  Polish:        '🇵🇱',
  Russian:       '🇷🇺',
  Swedish:       '🇸🇪',
  Hungarian:     '🇭🇺',
}

export const NATIONALITY_CODE = {
  British:       'GBR',
  Dutch:         'NED',
  German:        'GER',
  Spanish:       'ESP',
  French:        'FRA',
  Monegasque:    'MON',
  Australian:    'AUS',
  Mexican:       'MEX',
  Finnish:       'FIN',
  Canadian:      'CAN',
  Thai:          'THA',
  Danish:        'DEN',
  Chinese:       'CHN',
  Japanese:      'JPN',
  American:      'USA',
  Brazilian:     'BRA',
  Italian:       'ITA',
  Austrian:      'AUT',
  Belgian:       'BEL',
  'New Zealander': 'NZL',
  Argentine:     'ARG',
  Swiss:         'SUI',
  Polish:        'POL',
  Russian:       'RUS',
  Swedish:       'SWE',
  Hungarian:     'HUN',
}

/**
 * @param {string} nationality  Ergast-Nationalitätsstring, z.B. "British"
 * @returns {string}  Flaggen-Emoji oder leerer String
 */
export function getNationalityFlag(nationality = '') {
  return NATIONALITY_FLAG[nationality] ?? ''
}

/**
 * @param {string} nationality
 * @returns {string}  3-Buchstaben-Kürzel oder die ersten 3 Buchstaben
 */
export function getNationalityCode(nationality = '') {
  return NATIONALITY_CODE[nationality] ?? nationality.slice(0, 3).toUpperCase()
}
