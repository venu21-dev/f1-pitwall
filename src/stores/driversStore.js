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
   * Tatsächliches Saison-Jahr (z.B. "2025"), wird nach dem ersten
   * 'current'-Fetch gesetzt. Nie 'current' nach einem erfolgreichen Fetch.
   */
  const currentYear = ref(null)

  /** Aktuelle Runde der Saison (aus Standings-Response), 0 = noch kein Rennen */
  const currentRound = ref(0)

  /** True solange ein 'current'-Fetch noch nicht abgeschlossen wurde */
  const currentSeasonFetched = ref(false)

  const loading = ref(false)
  const error = ref(null)

  // ─── Getters ─────────────────────────────────────────────────────────────────

  const standings = computed(() =>
    currentYear.value ? (standingsCache.value[currentYear.value] ?? []) : []
  )

  const topThree = computed(() => standings.value.slice(0, 3))

  const hasStandings = computed(() => standings.value.length > 0)

  // ─── Actions ─────────────────────────────────────────────────────────────────

  /**
   * Lädt die Fahrerwertung.
   * - 'current' → lädt aktuelle Saison, danach in echtem Jahr gecacht
   * - Jahreszahl → aus Cache oder API
   */
  async function fetchStandings(year = 'current') {
    const key = String(year)

    // 'current' bereits geladen → nicht nochmal fetchen
    if (key === 'current' && currentSeasonFetched.value) return
    // Spezifisches Jahr bereits im Cache
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
    standingsCache,
    driverInfoCache,
    currentYear,
    currentRound,
    loading,
    error,
    standings,
    topThree,
    hasStandings,
    fetchStandings,
    fetchDriverInfo,
    setYear,
  }
})
