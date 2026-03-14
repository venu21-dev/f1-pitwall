import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { f1Api } from '@/services/f1Api'

export const useCompareStore = defineStore('compare', () => {
  // ─── State ──────────────────────────────────────────────────────────────────

  /** driverId von Fahrer A, z.B. "hamilton" */
  const driverA = ref(null)

  /** driverId von Fahrer B, z.B. "verstappen" */
  const driverB = ref(null)

  /** Vergleichsjahr */
  const year = ref(2024)

  /** Rennergebnisse (Race[]) für Fahrer A */
  const resultsA = ref([])

  /** Rennergebnisse (Race[]) für Fahrer B */
  const resultsB = ref([])

  const loading = ref(false)
  const error = ref(null)

  // ─── Getters ─────────────────────────────────────────────────────────────────

  /** True wenn beide Fahrer gesetzt sind */
  const isReady = computed(() => Boolean(driverA.value && driverB.value))

  /** True wenn Ergebnisse beider Fahrer geladen sind */
  const hasResults = computed(() => resultsA.value.length > 0 && resultsB.value.length > 0)

  /**
   * Vereinfachte Vergleichsdaten pro Rennen:
   * [{ round, raceName, posA, posB, pointsA, pointsB }]
   */
  const chartData = computed(() => {
    if (!hasResults.value) return []
    return resultsA.value.map((raceA) => {
      const raceB = resultsB.value.find((r) => r.round === raceA.round)
      return {
        round: Number(raceA.round),
        raceName: raceA.raceName,
        posA: Number(raceA.Results?.[0]?.position ?? 0),
        posB: Number(raceB?.Results?.[0]?.position ?? 0),
        pointsA: Number(raceA.Results?.[0]?.points ?? 0),
        pointsB: Number(raceB?.Results?.[0]?.points ?? 0),
      }
    })
  })

  // ─── Actions ─────────────────────────────────────────────────────────────────

  function setDriverA(id) {
    driverA.value = id
  }

  function setDriverB(id) {
    driverB.value = id
  }

  function setYear(y) {
    year.value = Number(y)
  }

  /**
   * Lädt Rennergebnisse für beide Fahrer parallel.
   * Setzt loading/error entsprechend.
   */
  async function fetchComparison() {
    if (!isReady.value) return
    loading.value = true
    error.value = null
    resultsA.value = []
    resultsB.value = []
    try {
      const [a, b] = await Promise.all([
        f1Api.getDriverSeasonResults(year.value, driverA.value),
        f1Api.getDriverSeasonResults(year.value, driverB.value),
      ])
      resultsA.value = a
      resultsB.value = b
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  /** Setzt den gesamten Vergleich zurück */
  function reset() {
    driverA.value = null
    driverB.value = null
    resultsA.value = []
    resultsB.value = []
    error.value = null
  }

  return {
    // state
    driverA,
    driverB,
    year,
    resultsA,
    resultsB,
    loading,
    error,
    // getters
    isReady,
    hasResults,
    chartData,
    // actions
    setDriverA,
    setDriverB,
    setYear,
    fetchComparison,
    reset,
  }
})
