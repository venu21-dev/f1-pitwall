/**
 * Jolpica F1 API – Service Layer
 * Base URL: https://api.jolpi.ca/ergast/f1
 * Docs: https://github.com/jolpica/jolpica-f1
 */

const BASE_URL = 'https://api.jolpi.ca/ergast/f1'

async function fetchJson(path) {
  const response = await fetch(`${BASE_URL}${path}.json`)
  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

// Placeholder exports – implementations follow in later steps

export const f1Api = {
  /**
   * Get driver standings for a given season year.
   * @param {number|string} year
   */
  getDriverStandings(year) {
    return fetchJson(`/${year}/driverstandings`)
  },

  /**
   * Get all races for a given season year.
   * @param {number|string} year
   */
  getRaces(year) {
    return fetchJson(`/${year}/races`)
  },

  /**
   * Get race results for a driver in a given year.
   * @param {number|string} year
   * @param {string} driverId
   */
  getDriverResults(year, driverId) {
    return fetchJson(`/${year}/drivers/${driverId}/results`)
  },
}
