import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { f1Api } from '@/services/f1Api'

export const useDriversStore = defineStore('drivers', () => {
  // ─── State ───────────────────────────────────────────────────────────────────

  /** Cache: { [year]: DriverStanding[] } – verhindert Doppel-Requests */
  const standingsCache = ref({})

  /** Cache: { [driverId]: Driver } */
  const driverInfoCache = ref({})

  /**
   * Kumulative Punkte pro Rennen pro Fahrer.
   * { [year]: { [driverId]: number[] } }
   */
  const sparklineCache = ref({})

  /**
   * Anzahl Podiumsplätze pro Fahrer (Top-3-Finishes).
   * { [year]: { [driverId]: number } }
   */
  const podiumsCache = ref({})

  /**
   * Anzahl Pole Positions pro Fahrer.
   * { [year]: { [driverId]: number } }
   */
  const polesCache = ref({})

  /**
   * Rohe Rennergebnisse für Detailseite.
   * { [`${year}_${driverId}`]: Race[] }
   */
  const driverRacesCache = ref({})

  /**
   * Rohe Qualifying-Ergebnisse für Detailseite.
   * { [`${year}_${driverId}`]: Race[] }
   */
  const driverQualiCache = ref({})

  /** Lade- und Fehler-State für DriverDetailView */
  const detailLoading = ref(false)
  const detailError = ref(null)

  /**
   * Tatsächliches Saison-Jahr (z.B. "2026"), wird nach dem ersten
   * 'current'-Fetch gesetzt. Nie 'current' nach einem erfolgreichen Fetch.
   */
  const currentYear = ref(null)

  /** Aktuelle Runde der Saison (aus Standings-Response), 0 = noch kein Rennen */
  const currentRound = ref(0)

  /** True solange ein 'current'-Fetch noch nicht abgeschlossen wurde */
  const currentSeasonFetched = ref(false)

  const loading = ref(false)
  const error = ref(null)

  /** True während Sparkline/Podiums-Daten geladen werden */
  const statsLoading = ref(false)

  // ─── Getters ─────────────────────────────────────────────────────────────────

  const standings = computed(() =>
    currentYear.value ? (standingsCache.value[currentYear.value] ?? []) : []
  )

  const topThree = computed(() => standings.value.slice(0, 3))

  const hasStandings = computed(() => standings.value.length > 0)

  // ─── Actions ─────────────────────────────────────────────────────────────────

  /**
   * Lädt die Fahrerwertung für die aktuelle Saison ('current') oder
   * setzt currentYear wenn das Jahr bereits gecacht ist.
   * Verändert immer currentYear → für Home/globale Nutzung.
   */
  async function fetchStandings(year = 'current') {
    const key = String(year)

    if (key === 'current' && currentSeasonFetched.value) return
    if (key !== 'current' && standingsCache.value[key]) {
      currentYear.value = key
      return
    }

    loading.value = true
    error.value = null
    try {
      const { season, round, standings: data } = await f1Api.getDriverStandings(year)
      standingsCache.value[season] = data
      currentYear.value = season
      currentRound.value = round
      if (key === 'current') currentSeasonFetched.value = true
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  /**
   * Lädt Standings für ein beliebiges Jahr OHNE currentYear zu ändern.
   * Gedacht für DriversView-Jahresauswahl damit Home unberührt bleibt.
   * @param {number|string} year
   */
  async function fetchStandingsForYear(year) {
    const key = String(year)
    if (standingsCache.value[key]) return

    loading.value = true
    error.value = null
    try {
      const { season, standings: data } = await f1Api.getDriverStandings(year)
      standingsCache.value[season] = data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  /**
   * Lädt Rennergebnisse für alle übergebenen Fahrer im Hintergrund und
   * berechnet dabei kumulative Punkte (Sparkline) sowie Podiumszahl.
   * Bereits gecachte Fahrer werden übersprungen.
   * @param {string} year
   * @param {string[]} driverIds
   */
  async function fetchDriverStats(year, driverIds) {
    const key = String(year)
    if (!sparklineCache.value[key]) sparklineCache.value[key] = {}
    if (!podiumsCache.value[key]) podiumsCache.value[key] = {}
    if (!polesCache.value[key]) polesCache.value[key] = {}

    const toFetch = driverIds.filter((id) => !(id in sparklineCache.value[key]))
    if (!toFetch.length) return

    statsLoading.value = true
    await Promise.allSettled(
      toFetch.map(async (driverId) => {
        // Rennergebnisse + Qualifying parallel laden
        const [racesResult, qualiResult] = await Promise.allSettled([
          f1Api.getDriverSeasonResults(key, driverId),
          f1Api.getDriverQualifyingResults(key, driverId),
        ])

        // Sparkline + Podiums aus Rennergebnissen
        if (racesResult.status === 'fulfilled') {
          const races = racesResult.value
          let cumulative = 0
          sparklineCache.value[key][driverId] = races.map((r) => {
            cumulative += Number(r.Results?.[0]?.points ?? 0)
            return cumulative
          })
          podiumsCache.value[key][driverId] = races.filter(
            (r) => Number(r.Results?.[0]?.position) <= 3
          ).length
        } else {
          sparklineCache.value[key][driverId] = []
          podiumsCache.value[key][driverId] = 0
        }

        // Poles aus Qualifying-Ergebnissen
        if (qualiResult.status === 'fulfilled') {
          polesCache.value[key][driverId] = qualiResult.value.filter(
            (r) => r.QualifyingResults?.[0]?.position === '1'
          ).length
        } else {
          polesCache.value[key][driverId] = 0
        }
      })
    )
    statsLoading.value = false
  }

  /**
   * Lädt Rennergebnisse + Qualifying für einen Fahrer in einem Jahr.
   * Gecacht unter `${year}_${driverId}`.
   * @param {number|string} year
   * @param {string} driverId
   */
  async function fetchDriverDetail(year, driverId) {
    const key = `${String(year)}_${driverId}`
    if (driverRacesCache.value[key] !== undefined) return

    detailLoading.value = true
    detailError.value = null
    try {
      const [racesResult, qualiResult] = await Promise.allSettled([
        f1Api.getDriverSeasonResults(year, driverId),
        f1Api.getDriverQualifyingResults(year, driverId),
      ])

      if (racesResult.status === 'rejected' && qualiResult.status === 'rejected') {
        throw racesResult.reason
      }

      driverRacesCache.value[key] = racesResult.status === 'fulfilled' ? racesResult.value : []
      driverQualiCache.value[key] = qualiResult.status === 'fulfilled' ? qualiResult.value : []
    } catch (err) {
      detailError.value = err.message
    } finally {
      detailLoading.value = false
    }
  }

  /**
   * Lädt Basisinfo zu einem Fahrer (gecacht).
   */
  async function fetchDriverInfo(driverId) {
    if (driverInfoCache.value[driverId]) return driverInfoCache.value[driverId]
    loading.value = true
    error.value = null
    try {
      const info = await f1Api.getDriverInfo(driverId)
      if (info) driverInfoCache.value[driverId] = info
      return info
    } catch (err) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  function setYear(year) {
    currentYear.value = String(year)
  }

  return {
    // state
    standingsCache,
    driverInfoCache,
    sparklineCache,
    podiumsCache,
    polesCache,
    driverRacesCache,
    driverQualiCache,
    currentYear,
    currentRound,
    loading,
    error,
    statsLoading,
    detailLoading,
    detailError,
    // getters
    standings,
    topThree,
    hasStandings,
    // actions
    fetchStandings,
    fetchStandingsForYear,
    fetchDriverStats,
    fetchDriverDetail,
    fetchDriverInfo,
    setYear,
  }
})
