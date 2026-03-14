import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { f1Api } from '@/services/f1Api'

export const useSeasonsStore = defineStore('seasons', () => {
  // ─── State ───────────────────────────────────────────────────────────────────

  /** Cache: { [year]: Race[] } */
  const racesCache = ref({})

  /** Cache: { [year]: ConstructorStanding[] } */
  const constructorCache = ref({})

  /**
   * Tatsächliches Saison-Jahr – wird nach erstem 'current'-Fetch gesetzt.
   */
  const selectedYear = ref(null)

  const racesFetched = ref(false)
  const constructorFetched = ref(false)

  const loading = ref(false)
  const error = ref(null)

  // ─── Getters ─────────────────────────────────────────────────────────────────

  const races = computed(() =>
    selectedYear.value ? (racesCache.value[selectedYear.value] ?? []) : []
  )

  const totalRaces = computed(() => races.value.length)

  const hasRaces = computed(() => races.value.length > 0)

  const constructorStandings = computed(() =>
    selectedYear.value ? (constructorCache.value[selectedYear.value] ?? []) : []
  )

  /** Aktuell führendes Konstrukteur-Objekt (Position 1) */
  const constructorChampion = computed(() => constructorStandings.value[0] ?? null)

  // ─── Actions ─────────────────────────────────────────────────────────────────

  async function fetchRaces(year = 'current') {
    const key = String(year)
    if (key === 'current' && racesFetched.value) return
    if (key !== 'current' && racesCache.value[key]) {
      selectedYear.value = key
      return
    }
    loading.value = true
    error.value = null
    try {
      const { season, races: data } = await f1Api.getRaces(year)
      racesCache.value[season] = data
      selectedYear.value = season
      if (key === 'current') racesFetched.value = true
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchConstructorStandings(year = 'current') {
    const key = String(year)
    if (key === 'current' && constructorFetched.value) return
    if (key !== 'current' && constructorCache.value[key]) {
      selectedYear.value = key
      return
    }
    loading.value = true
    error.value = null
    try {
      const { season, standings } = await f1Api.getConstructorStandings(year)
      constructorCache.value[season] = standings
      selectedYear.value = season
      if (key === 'current') constructorFetched.value = true
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  function setYear(year) {
    selectedYear.value = String(year)
  }

  return {
    racesCache,
    constructorCache,
    selectedYear,
    loading,
    error,
    races,
    totalRaces,
    hasRaces,
    constructorStandings,
    constructorChampion,
    fetchRaces,
    fetchConstructorStandings,
    setYear,
  }
})
