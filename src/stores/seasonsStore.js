import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { f1Api } from '@/services/f1Api'

export const useSeasonsStore = defineStore('seasons', () => {
  // ─── State ──────────────────────────────────────────────────────────────────

  /** Cache: { [year]: Race[] } */
  const racesCache = ref({})

  const selectedYear = ref(2024)
  const loading = ref(false)
  const error = ref(null)

  // ─── Getters ─────────────────────────────────────────────────────────────────

  /** Alle Rennen des gewählten Jahres */
  const races = computed(() => racesCache.value[selectedYear.value] ?? [])

  /** Anzahl Rennen */
  const totalRaces = computed(() => races.value.length)

  /** True wenn Renndaten für selectedYear geladen sind */
  const hasRaces = computed(() => races.value.length > 0)

  // ─── Actions ─────────────────────────────────────────────────────────────────

  /**
   * Lädt alle Rennen einer Saison (gecacht).
   * @param {number|string} year
   */
  async function fetchRaces(year = selectedYear.value) {
    const key = String(year)
    if (racesCache.value[key]) {
      selectedYear.value = key
      return
    }
    loading.value = true
    error.value = null
    try {
      racesCache.value[key] = await f1Api.getRaces(year)
      selectedYear.value = key
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  /** Setzt das aktive Jahr ohne Fetch */
  function setYear(year) {
    selectedYear.value = String(year)
  }

  return {
    // state
    racesCache,
    selectedYear,
    loading,
    error,
    // getters
    races,
    totalRaces,
    hasRaces,
    // actions
    fetchRaces,
    setYear,
  }
})
