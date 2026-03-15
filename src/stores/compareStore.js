import { ref } from 'vue'
import { defineStore } from 'pinia'
import { f1Api } from '@/services/f1Api'

export const useCompareStore = defineStore('compare', () => {
  // ─── State ───────────────────────────────────────────────────────────────────

  const driverAId = ref('max_verstappen')
  const driverBId = ref('norris')
  const selectedYear = ref(null)

  /** Stabile Ergebnis-Refs – werden nach jedem Fetch explizit gesetzt */
  const statsA = ref(_emptyStats())
  const statsB = ref(_emptyStats())

  /** Kumulierte Punkte pro Rennen für den Linienchart */
  const chartLabels = ref([])
  const chartDataA = ref([])
  const chartDataB = ref([])

  const loading = ref(false)
  const error = ref(null)

  // ─── Interner Cache (non-reactive, verhindert Doppel-Requests) ───────────────

  const _racesCache = {}
  const _qualiCache = {}

  // ─── Hilfsfunktionen ─────────────────────────────────────────────────────────

  function _emptyStats() {
    return { points: 0, wins: 0, poles: 0, podiums: 0, dnfs: 0, avgPoints: 0 }
  }

  function _hasDNF(r) {
    const s = r.Results?.[0]?.status ?? ''
    return s !== 'Finished' && !s.startsWith('+')
  }

  function _computeStats(races, quali) {
    const points  = races.reduce((s, r) => s + Number(r.Results?.[0]?.points ?? 0), 0)
    const wins    = races.filter((r) => r.Results?.[0]?.position === '1').length
    const podiums = races.filter((r) => Number(r.Results?.[0]?.position) <= 3).length
    const dnfs    = races.filter((r) => _hasDNF(r)).length
    const poles   = quali.filter((r) => r.QualifyingResults?.[0]?.position === '1').length
    const avgPoints = races.length ? +(points / races.length).toFixed(1) : 0
    return { points, wins, poles, podiums, dnfs, avgPoints }
  }

  function _cumulPoints(races) {
    let cum = 0
    return races.map((r) => {
      cum += Number(r.Results?.[0]?.points ?? 0)
      return cum
    })
  }

  function _refreshDerived(racesA, qualiA, racesB, qualiB) {
    statsA.value = _computeStats(racesA, qualiA)
    statsB.value = _computeStats(racesB, qualiB)

    const longer = racesA.length >= racesB.length ? racesA : racesB
    chartLabels.value = longer.map((r) => `R${String(r.round).padStart(2, '0')}`)
    chartDataA.value  = _cumulPoints(racesA)
    chartDataB.value  = _cumulPoints(racesB)
  }

  async function _fetchDriver(year, driverId) {
    const key = `${year}_${driverId}`
    if (!_racesCache[key]) {
      const [racesRes, qualiRes] = await Promise.allSettled([
        f1Api.getDriverSeasonResults(year, driverId),
        f1Api.getDriverQualifyingResults(year, driverId),
      ])
      _racesCache[key] = racesRes.status === 'fulfilled' ? racesRes.value : []
      _qualiCache[key] = qualiRes.status === 'fulfilled' ? qualiRes.value : []
    }
    return { races: _racesCache[key], quali: _qualiCache[key] }
  }

  // ─── Actions ─────────────────────────────────────────────────────────────────

  /**
   * Lädt Rennergebnisse + Qualifying für beide Fahrer parallel.
   * Berechnet danach Stats und Chart-Daten.
   */
  async function loadComparison(year) {
    selectedYear.value = String(year)
    loading.value = true
    error.value = null
    try {
      const [a, b] = await Promise.all([
        _fetchDriver(year, driverAId.value),
        _fetchDriver(year, driverBId.value),
      ])
      _refreshDerived(a.races, a.quali, b.races, b.quali)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  /**
   * Wechselt einen Fahrer und lädt dessen Daten nach.
   * @param {'A'|'B'} side
   * @param {string} driverId
   */
  async function switchDriver(side, driverId) {
    if (side === 'A') driverAId.value = driverId
    else driverBId.value = driverId

    loading.value = true
    error.value = null
    try {
      const [a, b] = await Promise.all([
        _fetchDriver(selectedYear.value, driverAId.value),
        _fetchDriver(selectedYear.value, driverBId.value),
      ])
      _refreshDerived(a.races, a.quali, b.races, b.quali)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    // state
    driverAId,
    driverBId,
    selectedYear,
    statsA,
    statsB,
    chartLabels,
    chartDataA,
    chartDataB,
    loading,
    error,
    // actions
    loadComparison,
    switchDriver,
  }
})
