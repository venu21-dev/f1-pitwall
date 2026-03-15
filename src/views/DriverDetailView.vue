<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDriversStore } from '@/stores/driversStore'
import RaceResultRow from '@/components/RaceResultRow.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import { getTeamColor } from '@/utils/teamColors'

const props = defineProps({
  id: { type: String, required: true },
})

const router = useRouter()
const store = useDriversStore()

// ── Lokaler State ─────────────────────────────────────────────────────────
const selectedYear = ref(null)

/**
 * Eigener Lade-State für diese Seite.
 * Startet sofort als true → garantierter Spinner beim ersten Aufruf.
 */
const pageLoading = ref(true)
const pageError = ref(null)

const availableYears = computed(() => {
  const current = Number(store.currentYear) || new Date().getFullYear()
  const years = []
  for (let y = 2020; y <= current; y++) years.push(y)
  return years
})

// ── Daten aus Store ───────────────────────────────────────────────────────

const driverStanding = computed(() => {
  if (!selectedYear.value) return null
  const standings = store.standingsCache[String(selectedYear.value)] ?? []
  return standings.find((s) => s.Driver.driverId === props.id) ?? null
})

const driver    = computed(() => driverStanding.value?.Driver ?? null)
const team      = computed(() => driverStanding.value?.Constructors?.[0] ?? null)
const teamColor = computed(() => getTeamColor(team.value?.constructorId ?? ''))

const cacheKey   = computed(() => `${selectedYear.value}_${props.id}`)
const races      = computed(() => store.driverRacesCache[cacheKey.value] ?? [])
const qualiRaces = computed(() => store.driverQualiCache[cacheKey.value] ?? [])

const qualiMap = computed(() => {
  const map = {}
  qualiRaces.value.forEach((r) => {
    map[r.round] = r.QualifyingResults?.[0]?.position ?? null
  })
  return map
})

// ── Stats ────────────────────────────────────────────────────────────────

function hasDNF(r) {
  const s = r.Results?.[0]?.status ?? ''
  return s !== 'Finished' && !s.startsWith('+')
}

const stats = computed(() => {
  const list = races.value
  return {
    points:  driverStanding.value?.points ?? list.reduce((s, r) => s + Number(r.Results?.[0]?.points ?? 0), 0),
    wins:    list.filter((r) => r.Results?.[0]?.position === '1').length,
    poles:   qualiRaces.value.filter((r) => r.QualifyingResults?.[0]?.position === '1').length,
    podiums: list.filter((r) => Number(r.Results?.[0]?.position) <= 3).length,
    dnfs:    list.filter((r) => hasDNF(r)).length,
  }
})

// Nur "nicht gefunden" wenn: kein Eintrag in Standings UND keine Rennergebnisse
// (verhindert false positive bei Fahrern die noch keine Rennen gefahren sind)
const notFound = computed(
  () => !pageLoading.value && !pageError.value && selectedYear.value
        && !driver.value && races.value.length === 0
        && store.driverRacesCache[cacheKey.value] !== undefined  // Daten wurden geladen, sind aber wirklich leer
)

// ── Daten laden ───────────────────────────────────────────────────────────

async function loadYear(year) {
  pageLoading.value = true
  pageError.value = null
  selectedYear.value = year

  try {
    if (!store.standingsCache[String(year)]) {
      await store.fetchStandingsForYear(year)
    }
    await store.fetchDriverDetail(year, props.id)

    if (store.detailError) {
      pageError.value = store.detailError
    }
  } catch (err) {
    pageError.value = err.message
  } finally {
    pageLoading.value = false
  }
}

onMounted(async () => {
  if (!store.currentSeasonFetched) {
    await store.fetchStandings('current')
  }
  await loadYear(Number(store.currentYear))
})

async function retry() {
  const key = cacheKey.value
  delete store.driverRacesCache[key]
  delete store.driverQualiCache[key]
  store.detailError = null
  await loadYear(selectedYear.value)
}
</script>

<template>
  <div class="detail page container">

    <!-- ── Loading ──────────────────────────────────────── -->
    <LoadingSpinner v-if="pageLoading" label="Lade Fahrerdaten…" />

    <!-- ── Error ────────────────────────────────────────── -->
    <ErrorMessage
      v-else-if="pageError"
      :message="pageError"
      retry-label="Erneut versuchen"
      @retry="retry"
    />

    <!-- ── Not Found ────────────────────────────────────── -->
    <div v-else-if="notFound" class="not-found card-dark">
      <p class="not-found__text">
        Fahrer <strong>{{ id }}</strong> wurde in der Saison {{ selectedYear }} nicht gefunden.
      </p>
      <button class="btn btn--ghost" @click="router.push({ name: 'drivers' })">
        ← Zurück zur Übersicht
      </button>
    </div>

    <!-- ── Hauptinhalt ───────────────────────────────────── -->
    <template v-else>

      <!-- Zurück-Button -->
      <button class="back-btn" @click="router.push({ name: 'drivers' })">
        ← Fahrerwertung
      </button>

      <!-- ── Fahrername + Team ──────────────────────────── -->
      <div class="driver-header">
        <!-- Team-Badge: farbiger Balken + Teamname -->
        <div v-if="team" class="team-badge">
          <span class="team-badge__bar" :style="{ background: teamColor }"></span>
          <span class="team-badge__name" :style="{ color: teamColor }">{{ team.name }}</span>
        </div>

        <h1 class="driver-name">
          <span v-if="driver">{{ driver.givenName }} {{ driver.familyName }}</span>
          <span v-else>{{ id }}</span>
        </h1>
      </div>

      <!-- ── Stat-Kacheln ────────────────────────────────── -->
      <section class="stats-row">
        <div class="stat-card">
          <span class="stat-card__value">{{ stats.points }}</span>
          <span class="stat-card__label">PUNKTE</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__value">{{ stats.wins }}</span>
          <span class="stat-card__label">SIEGE</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__value">{{ stats.poles }}</span>
          <span class="stat-card__label">POLES</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__value">{{ stats.podiums }}</span>
          <span class="stat-card__label">PODIUM</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__value stat-card__value--dnf">{{ stats.dnfs }}</span>
          <span class="stat-card__label">DNF</span>
        </div>
      </section>

      <!-- ── Rennergebnisse ──────────────────────────────── -->
      <section class="results-section card-dark">

        <!-- Titelzeile mit Jahres-Filter rechts -->
        <div class="results-header">
          <h2 class="results-title">Rennergebnisse {{ selectedYear }}</h2>
          <div class="year-filter">
            <button
              v-for="year in availableYears"
              :key="year"
              class="year-btn"
              :class="{ 'year-btn--active': year === selectedYear }"
              @click="loadYear(year)"
            >
              {{ year }}
            </button>
          </div>
        </div>

        <!-- Tabellenkopf -->
        <div class="results-head">
          <span>RUNDE</span>
          <span>GRAND PRIX</span>
          <span class="col-center">START</span>
          <span class="col-center">RENNEN</span>
          <span class="col-right">PUNKTE</span>
        </div>

        <p v-if="races.length === 0" class="results-empty">
          Noch keine Rennergebnisse für {{ selectedYear }}.
        </p>

        <RaceResultRow
          v-for="race in races"
          :key="race.round"
          :race="race"
          :quali-pos="qualiMap[race.round] ?? null"
        />
      </section>

    </template>
  </div>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card-dark {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  overflow: hidden;
}

/* ── Zurück-Button ───────────────────────────────────── */
.back-btn {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 0.35rem;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-raised);
  color: var(--color-text-muted);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: color var(--transition), border-color var(--transition);
}
.back-btn:hover { color: var(--color-text); border-color: var(--color-text-subtle); }

/* ── Driver Header ───────────────────────────────────── */
.driver-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* ── Team-Badge ──────────────────────────────────────── */
.team-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.team-badge__bar {
  width: 3px;
  height: 16px;
  border-radius: 2px;
  flex-shrink: 0;
}

.team-badge__name {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* ── Fahrername ──────────────────────────────────────── */
.driver-name {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: clamp(3rem, 8vw, 5.5rem);
  text-transform: uppercase;
  line-height: 0.9;
  color: #fff;
  letter-spacing: -0.01em;
}

/* ── Stat-Kacheln ────────────────────────────────────── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.stat-card__value {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: clamp(2rem, 4vw, 2.8rem);
  line-height: 1;
  color: var(--color-gold);
}
.stat-card__value--dnf { color: var(--color-primary); }

.stat-card__label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

/* ── Rennergebnisse ──────────────────────────────────── */
.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem 0;
}

.results-title {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: 1.5rem;
  text-transform: uppercase;
  color: #fff;
  letter-spacing: 0.02em;
}

/* Jahres-Filter (inline, rechts neben Titel) */
.year-filter {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.year-btn {
  padding: 0.28rem 0.7rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-raised);
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  transition: background var(--transition), color var(--transition), border-color var(--transition);
}
.year-btn:hover { color: var(--color-text); border-color: var(--color-text-subtle); }
.year-btn--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

/* Tabellenkopf */
.results-head {
  display: grid;
  grid-template-columns: 52px 1fr 64px 80px 72px;
  padding: 0.65rem 1.5rem;
  margin-top: 0.75rem;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.col-center { text-align: center; }
.col-right  { text-align: right; }

.results-empty {
  padding: 2.5rem;
  text-align: center;
  color: var(--color-text-muted);
  font-style: italic;
  font-size: 0.9rem;
}

/* ── Not Found ───────────────────────────────────────── */
.not-found {
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}
.not-found__text { color: var(--color-text-muted); }

.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1.2rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--transition), background var(--transition);
}
.btn--ghost {
  background: var(--color-surface-raised);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}
.btn--ghost:hover { color: var(--color-text); }

/* ── Responsive ──────────────────────────────────────── */
@media (max-width: 700px) {
  .stats-row { grid-template-columns: repeat(3, 1fr); }

  .results-head {
    grid-template-columns: 44px 1fr 48px 64px;
    padding: 0.6rem 1rem;
  }
  .results-head span:nth-child(3) { display: none; } /* START */
  .results-header { padding: 1rem 1rem 0; }
}

@media (max-width: 440px) {
  .stats-row { grid-template-columns: repeat(3, 1fr); }

  .results-head {
    grid-template-columns: 40px 1fr 56px;
  }
  .results-head span:nth-child(4) { display: none; } /* RENNEN */

  .driver-name { font-size: clamp(2.2rem, 10vw, 3.5rem); }
}
</style>
