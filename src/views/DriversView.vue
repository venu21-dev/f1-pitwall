<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDriversStore } from '@/stores/driversStore'
import StandingsTable from '@/components/StandingsTable.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'

const router = useRouter()
const store = useDriversStore()

// ── Lokaler State ────────────────────────────────────────────────────────────
const selectedYear = ref(null)
const activeStandings = ref([])
const activeSparklines = ref({})
const activePodiums = ref({})
const activePoles = ref({})

// Alle verfügbaren Jahre von 2020 bis aktuellem Jahr
const availableYears = computed(() => {
  const current = Number(store.currentYear) || new Date().getFullYear()
  const years = []
  for (let y = 2020; y <= current; y++) years.push(y)
  return years
})

// ── Hilfsfunktionen ──────────────────────────────────────────────────────────

/** Kopiert Sparklines/Podiums/Poles aus dem Store-Cache in lokale Refs */
function syncStats(year) {
  const key = String(year)
  activeSparklines.value = { ...store.sparklineCache[key] }
  activePodiums.value = { ...store.podiumsCache[key] }
  activePoles.value = { ...store.polesCache[key] }
}

/** Lädt Standings für ein Jahr und aktualisiert lokale Refs */
async function loadYear(year) {
  const key = String(year)

  if (store.standingsCache[key]) {
    // Bereits gecacht → sofort anzeigen
    activeStandings.value = store.standingsCache[key]
  } else {
    activeStandings.value = []
    await store.fetchStandingsForYear(year)
    activeStandings.value = store.standingsCache[key] ?? []
  }

  syncStats(year)

  // Sparklines/Podiums/Poles im Hintergrund laden
  const ids = activeStandings.value.map((s) => s.Driver.driverId)
  if (ids.length) store.fetchDriverStats(year, ids)
}

// ── Reaktivität: wenn Hintergrund-Stats fertig sind, lokale Refs aktualisieren
watch(
  () => store.statsLoading,
  (loading) => {
    if (!loading && selectedYear.value) syncStats(selectedYear.value)
  }
)

// ── Jahreswechsel ────────────────────────────────────────────────────────────
async function selectYear(year) {
  selectedYear.value = year
  await loadYear(year)
}

// ── Initialisierung ──────────────────────────────────────────────────────────
onMounted(async () => {
  await store.fetchStandings('current')
  const year = Number(store.currentYear)
  selectedYear.value = year
  await loadYear(year)
})

// ── Navigation ───────────────────────────────────────────────────────────────
function goToDriver(driverId) {
  router.push({ name: 'driver-detail', params: { id: driverId } })
}

// ── Error Retry ──────────────────────────────────────────────────────────────
async function retry() {
  if (!selectedYear.value) {
    await store.fetchStandings('current')
    selectedYear.value = Number(store.currentYear)
  }
  await loadYear(selectedYear.value)
}
</script>

<template>
  <div class="drivers page container">

    <!-- ── Header ──────────────────────────────────────── -->
    <div class="drivers__header">
      <h1 class="drivers__title">Fahrerwertung</h1>

      <!-- Jahres-Filter -->
      <div class="year-filter" role="group" aria-label="Saison wählen">
        <button
          v-for="year in availableYears"
          :key="year"
          class="year-btn"
          :class="{ 'year-btn--active': year === selectedYear }"
          :aria-pressed="year === selectedYear"
          @click="selectYear(year)"
        >
          {{ year }}
        </button>
      </div>
    </div>

    <!-- ── Inhalt ───────────────────────────────────────── -->
    <div class="drivers__body card-dark">

      <LoadingSpinner v-if="store.loading" label="Lade Fahrerwertung…" />

      <ErrorMessage
        v-else-if="store.error"
        :message="store.error"
        retry-label="Erneut versuchen"
        @retry="retry"
      />

      <p v-else-if="activeStandings.length === 0 && selectedYear" class="drivers__empty">
        Keine Daten für die Saison {{ selectedYear }}.
      </p>

      <StandingsTable
        v-else
        :standings="activeStandings"
        :sparklines="activeSparklines"
        :podiums="activePodiums"
        :poles="activePoles"
        :stats-loading="store.statsLoading"
        @row-click="goToDriver"
      />

    </div>

  </div>
</template>

<style scoped>
/* ── Animationen ──────────────────────────────────── */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.drivers__header {
  animation: fadeInDown 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.drivers__body {
  animation: fadeIn 0.3s ease 0.1s both;
}

.drivers {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Header ──────────────────────────────────────── */
.drivers__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.drivers__title {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: clamp(2.4rem, 6vw, 4rem);
  text-transform: uppercase;
  line-height: 0.95;
  color: #fff;
  letter-spacing: calc(-0.01em + 2px);
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

/* ── Tabellen-Card ───────────────────────────────── */
.card-dark {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  overflow: hidden;
}

.drivers__empty {
  padding: 3rem;
  text-align: center;
  color: var(--color-text-muted);
  font-style: italic;
  font-size: 0.95rem;
}

/* ── Responsive ──────────────────────────────────── */
@media (max-width: 640px) {
  .drivers__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .year-filter {
    justify-content: flex-start;
  }
}
</style>
