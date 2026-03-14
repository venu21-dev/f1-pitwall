/**
 * Offizielle Teamfarben – aktualisiert für Saison 2026
 * Schlüssel = constructorId aus der Jolpica/Ergast-API
 */
export const TEAM_COLORS = {
  // Etablierte Teams
  red_bull:     '#3671C6',
  mercedes:     '#27F4D2',
  ferrari:      '#E8002D',
  mclaren:      '#FF8000',
  alpine:       '#FF87BC',
  williams:     '#64C4FF',
  aston_martin: '#229971',
  haas:         '#B6BABD',
  rb:           '#6692FF',
  // Neue Teams 2026
  audi:         '#B8B8B8', // Silber-grau
  cadillac:     '#1B4FDC', // Patriotisch Blau
  // Historische IDs (Backwards-Compat.)
  sauber:       '#C92D4B',
  kick_sauber:  '#C92D4B',
  alphatauri:   '#6692FF',
  alfa:         '#C92D4B',
  renault:      '#FFF500',
}

/**
 * Gibt die Teamfarbe für eine constructorId zurück.
 * Fallback: neutrales Grau.
 * @param {string} constructorId
 * @returns {string} CSS-Farbwert
 */
export function getTeamColor(constructorId = '') {
  return TEAM_COLORS[constructorId.toLowerCase()] ?? '#555566'
}
