<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSeasonsStore } from '@/stores/seasonsStore'
import { useDriversStore } from '@/stores/driversStore'
import RaceCard from '@/components/RaceCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'

const props = defineProps({
  year: { type: String, required: true },
})

const router       = useRouter()
const seasonsStore = useSeasonsStore()
const driversStore = useDriversStore()

// ── Lokaler State ──────────────────────────────────────────────────────────
const pageLoading  = ref(true)
const pageError    = ref(null)
const activeRaces  = ref([])

/**
 * Sieger-Map: { [round]: Race } – für direkten Zugriff per Runde.
 * Wird nach jedem winnersCache-Update neu gesetzt.
 */
const activeWinners = ref({})

// ── Computed ───────────────────────────────────────────────────────────────

const availableYears = computed(() => {
  const current = Number(driversStore.currentYear) || new Date().getFullYear()
  const years = []
  for (let y = 2020; y <= current; y++) years.push(y)
  return years
})

const completedCount = computed(
  () => Object.keys(activeWinners.value).length
)

// ── Hilfsfunktionen ────────────────────────────────────────────────────────

function syncWinners(year) {
  const races = seasonsStore.winnersCache[String(year)] ?? []
  const map = {}
  races.forEach((r) => { map[r.round] = r })
  activeWinners.value = map
}

// ── Daten laden ────────────────────────────────────────────────────────────

async function loadYear(year) {
  pageLoading.value = true
  pageError.value   = null

  try {
    await seasonsStore.fetchRacesForYear(year)
    activeRaces.value = seasonsStore.racesCache[String(year)] ?? []

    if (seasonsStore.error) {
      pageError.value = seasonsStore.error
      return
    }

    // Sieger im Hintergrund laden (non-blocking)
    syncWinners(year)
    seasonsStore.fetchSeasonWinners(year).then(() => syncWinners(year))
  } catch (err) {
    pageError.value = err.message
  } finally {
    pageLoading.value = false
  }
}

onMounted(async () => {
  // currentYear sicherstellen (für Jahres-Tabs)
  if (!driversStore.currentSeasonFetched) {
    await driversStore.fetchStandings('current')
  }
  await loadYear(props.year)
})

// Reagiert auf Route-Wechsel (z.B. /seasons/2024 → /seasons/2023)
watch(
  () => props.year,
  (newYear) => {
    syncWinners(newYear)
    loadYear(newYear)
  }
)

// ── Jahr wählen ────────────────────────────────────────────────────────────

function selectYear(year) {
  router.push({ name: 'season', params: { year } })
}

// ── Retry ──────────────────────────────────────────────────────────────────

async function retry() {
  const key = String(props.year)
  delete seasonsStore.racesCache[key]
  delete seasonsStore.winnersCache[key]
  seasonsStore.error = null
  await loadYear(props.year)
}
</script>

<template>
  <div class="season page container">

    <!-- ── Header ───────────────────────────────────────── -->
    <div class="season__header">
      <div class="season__title-group">
        <p v-if="!pageLoading && !pageError" class="season__meta">
          {{ activeRaces.length }} Rennen
          <template v-if="completedCount > 0"> · {{ completedCount }} abgeschlossen</template>
        </p>
        <h1 class="season__title">Saison {{ year }}</h1>
      </div>

      <!-- Jahres-Filter -->
      <div class="year-filter" role="group" aria-label="Saison wählen">
        <button
          v-for="y in availableYears"
          :key="y"
          class="year-btn"
          :class="{ 'year-btn--active': String(y) === String(year) }"
          :aria-pressed="String(y) === String(year)"
          @click="selectYear(y)"
        >
          {{ y }}
        </button>
      </div>
    </div>

    <!-- ── Loading ──────────────────────────────────────── -->
    <LoadingSpinner v-if="pageLoading" label="Lade Renndaten…" />

    <!-- ── Error ────────────────────────────────────────── -->
    <ErrorMessage
      v-else-if="pageError"
      :message="pageError"
      retry-label="Erneut versuchen"
      @retry="retry"
    />

    <!-- ── Leer ──────────────────────────────────────────── -->
    <p v-else-if="activeRaces.length === 0" class="season__empty">
      Keine Renndaten für die Saison {{ year }} verfügbar.
    </p>

    <!-- ── Rennen-Grid ───────────────────────────────────── -->
    <div v-else class="races-grid">
      <div
        v-for="(race, i) in activeRaces"
        :key="race.round"
        class="race-card-wrap"
        :style="{ animationDelay: `${i * 0.05}s` }"
      >
        <RaceCard
          :race="race"
          :winner="activeWinners[race.round] ?? null"
        />
      </div>
    </div>

  </div>
</template>

<style scoped>
.season {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Animationen ─────────────────────────────────── */
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.season__header {
  animation: fadeInDown 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.race-card-wrap {
  animation: fadeInUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* ── Header ──────────────────────────────────────── */
.season__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.season__title-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.season__title {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: clamp(2.4rem, 6vw, 4rem);
  text-transform: uppercase;
  line-height: 0.95;
  color: #fff;
  letter-spacing: calc(-0.01em + 2px);
}

.season__meta {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

/* ── Jahres-Filter ───────────────────────────────── */
.year-filter {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.year-btn {
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: #202730;
  color: var(--color-text-muted);
  font-family: var(--font-nav);
  font-size: 0.78rem;
  font-weight: 700;
  transition: background var(--transition), color var(--transition), border-color var(--transition), box-shadow var(--transition);
  white-space: nowrap;
  cursor: pointer;
}

.year-btn:hover {
  color: var(--color-text);
  border-color: var(--color-text-subtle);
}

.year-btn--active {
  background: linear-gradient(to right, #FF3624, #E10500);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 0 10px rgba(225, 5, 0, 0.4);
}

/* ── Rennen-Grid ─────────────────────────────────── */
.races-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

/* ── Leer ────────────────────────────────────────── */
.season__empty {
  padding: 3rem;
  text-align: center;
  color: var(--color-text-muted);
  font-style: italic;
  font-size: 0.95rem;
}

/* ── Responsive ──────────────────────────────────── */
@media (max-width: 900px) {
  .races-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .season__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .year-filter {
    justify-content: flex-start;
  }

  .races-grid {
    grid-template-columns: 1fr;
  }
}
</style>
