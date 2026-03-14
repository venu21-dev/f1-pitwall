import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { f1Api } from '@/services/f1Api'

export const useDriversStore = defineStore('drivers', () => {
  // ─── State ──────────────────────────────────────────────────────────────────

  /** Cache: { [year]: DriverStanding[] } – verhindert Doppel-Requests */
  const standingsCache = ref({})

  /** Cache: { [driverId]: Driver } */
  const driverInfoCache = ref({})

  /** Aktuell angezeigte Saison */
  const currentYear = ref(2024)

  const loading = ref(false)
  const error = ref(null)

  // ─── Getters ─────────────────────────────────────────────────────────────────

  /** Fahrerwertung für das aktuell gewählte Jahr */
  const standings = computed(() => standingsCache.value[currentYear.value] ?? [])

  /** Nur die Top-3 Fahrer */
  const topThree = computed(() => standings.value.slice(0, 3))

  /** True wenn Standings für currentYear bereits geladen sind */
  const hasStandings = computed(() => standings.value.length > 0)

  // ─── Actions ─────────────────────────────────────────────────────────────────

  /**
   * Lädt die Fahrerwertung für ein Jahr.
   * Wird gecacht – bei erneutem Aufruf mit gleichem Jahr kein API-Request.
   * @param {number|string} year
   */
  async function fetchStandings(year = currentYear.value) {
    const key = String(year)
    if (standingsCache.value[key]) {
      currentYear.value = key
      return
    }
    loading.value = true
    error.value = null
    try {
      standingsCache.value[key] = await f1Api.getDriverStandings(year)
      currentYear.value = key
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  /**
   * Lädt Basisinfo zu einem Fahrer (gecacht).
   * @param {string} driverId
   * @returns {Promise<Driver|null>}
   */
  async function fetchDriverInfo(driverId) {
    if (driverInfoCache.value[driverId]) {
      return driverInfoCache.value[driverId]
    }
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

  /** Setzt das aktive Jahr ohne einen neuen Fetch auszulösen */
  function setYear(year) {
    currentYear.value = String(year)
  }

  return {
    // state
    standingsCache,
    driverInfoCache,
    currentYear,
    loading,
    error,
    // getters
    standings,
    topThree,
    hasStandings,
    // actions
    fetchStandings,
    fetchDriverInfo,
    setYear,
  }
})
