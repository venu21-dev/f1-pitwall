/**
 * Jolpica F1 API – Service Layer
 * Base URL: https://api.jolpi.ca/ergast/f1
 * Docs:     https://github.com/jolpica/jolpica-f1
 *
 * Alle Funktionen geben normalisierte Daten UND die tatsächliche Saison zurück,
 * damit die Stores bei Requests mit 'current' den echten Jahrgang kennen.
 */

const BASE_URL = 'https://api.jolpi.ca/ergast/f1'

async function fetchJson(path) {
  const url = `${BASE_URL}${path}.json`
  let response
  try {
    response = await fetch(url)
  } catch {
    throw new Error(`Netzwerkfehler – Internetverbindung prüfen. (${url})`)
  }
  if (!response.ok) {
    throw new Error(`API ${response.status} ${response.statusText} – ${url}`)
  }
  return response.json()
}

export const f1Api = {
  /**
   * Fahrerwertung einer Saison.
   * @param {number|string} year  Jahreszahl oder 'current'
   * @returns {Promise<{ season: string, standings: DriverStanding[] }>}
   */
  async getDriverStandings(year) {
    const data = await fetchJson(`/${year}/driverstandings`)
    const table = data.MRData.StandingsTable
    const lists = table.StandingsLists
    return {
      season: table.season,
      // Aktuelle Runde – 0 wenn noch kein Rennen gefahren wurde
      round: lists.length ? Number(lists[0].round) : 0,
      standings: lists.length ? lists[0].DriverStandings : [],
    }
  },

  /**
   * Konstrukteurswertung einer Saison.
   * @param {number|string} year
   * @returns {Promise<{ season: string, standings: ConstructorStanding[] }>}
   */
  async getConstructorStandings(year) {
    const data = await fetchJson(`/${year}/constructorstandings`)
    const table = data.MRData.StandingsTable
    const lists = table.StandingsLists
    return {
      season: table.season,
      standings: lists.length ? lists[0].ConstructorStandings : [],
    }
  },

  /**
   * Alle Rennen (Kalender) einer Saison.
   * @param {number|string} year
   * @returns {Promise<{ season: string, races: Race[] }>}
   */
  async getRaces(year) {
    const data = await fetchJson(`/${year}/races`)
    const table = data.MRData.RaceTable
    return {
      season: table.season,
      races: table.Races,
    }
  },

  /**
   * Basisinfo zu einem Fahrer (unabhängig von Saison).
   * @param {string} driverId  z.B. "hamilton"
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
   * @returns {Promise<Race[]>}
   */
  async getDriverSeasonResults(year, driverId) {
    const data = await fetchJson(`/${year}/drivers/${driverId}/results`)
    return data.MRData.RaceTable.Races
  },

  /**
   * Alle Qualifying-Ergebnisse eines Fahrers in einer Saison.
   * Wird genutzt um Pole Positions zu zählen (position === "1").
   * @param {number|string} year
   * @param {string} driverId
   * @returns {Promise<Race[]>}  Jedes Race-Objekt enthält QualifyingResults[0] für diesen Fahrer
   */
  async getDriverQualifyingResults(year, driverId) {
    const data = await fetchJson(`/${year}/drivers/${driverId}/qualifying`)
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

  /**
   * Alle Sieger einer Saison (Position 1 jedes Rennens).
   * Endpoint /{year}/results/1 liefert nur den Erstplatzierten pro Rennen,
   * dadurch reicht das Standard-Limit für eine ganze Saison.
   * @param {number|string} year
   * @returns {Promise<Race[]>}  Jedes Race-Objekt enthält Results[0] = Sieger
   */
  async getSeasonWinners(year) {
    const data = await fetchJson(`/${year}/results/1`)
    return data.MRData.RaceTable.Races
  },
}
