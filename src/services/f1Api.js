/**
 * Jolpica F1 API – Service Layer
 * Base URL: https://api.jolpi.ca/ergast/f1
 * Docs:     https://github.com/jolpica/jolpica-f1
 *
 * Alle Funktionen geben bereits normalisierte Daten zurück
 * (kein MRData-Wrapper in den Stores nötig).
 */

const BASE_URL = 'https://api.jolpi.ca/ergast/f1'

/**
 * Interner Fetch-Helfer mit einheitlichem Error Handling.
 * @param {string} path - Pfad ohne BASE_URL, ohne .json
 * @returns {Promise<object>} Rohes MRData-Objekt
 */
async function fetchJson(path) {
  const url = `${BASE_URL}${path}.json`
  let response
  try {
    response = await fetch(url)
  } catch {
    throw new Error(`Netzwerkfehler – ist eine Internetverbindung vorhanden? (${url})`)
  }
  if (!response.ok) {
    throw new Error(`API ${response.status} ${response.statusText} – ${url}`)
  }
  return response.json()
}

export const f1Api = {
  /**
   * Fahrerwertung einer Saison.
   * @param {number|string} year
   * @returns {Promise<DriverStanding[]>}
   */
  async getDriverStandings(year) {
    const data = await fetchJson(`/${year}/driverstandings`)
    const lists = data.MRData.StandingsTable.StandingsLists
    return lists.length ? lists[0].DriverStandings : []
  },

  /**
   * Alle Rennen (Kalender) einer Saison.
   * @param {number|string} year
   * @returns {Promise<Race[]>}
   */
  async getRaces(year) {
    const data = await fetchJson(`/${year}/races`)
    return data.MRData.RaceTable.Races
  },

  /**
   * Basisinfo zu einem Fahrer (unabhängig von Saison).
   * @param {string} driverId  z.B. "hamilton", "verstappen"
   * @returns {Promise<Driver|null>}
   */
  async getDriverInfo(driverId) {
    const data = await fetchJson(`/drivers/${driverId}`)
    const drivers = data.MRData.DriverTable.Drivers
    return drivers.length ? drivers[0] : null
  },

  /**
   * Alle Rennergebnisse eines Fahrers in einer Saison.
   * @param {number|string} year
   * @param {string} driverId
   * @returns {Promise<Race[]>}  Jedes Race-Objekt enthält Results[0] für diesen Fahrer
   */
  async getDriverSeasonResults(year, driverId) {
    const data = await fetchJson(`/${year}/drivers/${driverId}/results`)
    return data.MRData.RaceTable.Races
  },

  /**
   * Alle Ergebnisse eines einzelnen Rennens.
   * @param {number|string} year
   * @param {number|string} round
   * @returns {Promise<Race|null>}
   */
  async getRaceResults(year, round) {
    const data = await fetchJson(`/${year}/${round}/results`)
    const races = data.MRData.RaceTable.Races
    return races.length ? races[0] : null
  },
}
