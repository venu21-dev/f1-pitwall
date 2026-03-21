<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCompareStore } from '@/stores/compareStore'
import { useDriversStore } from '@/stores/driversStore'
import { getTeamColor } from '@/utils/teamColors'
import ComparePanel from '@/components/ComparePanel.vue'
import LineChart from '@/components/LineChart.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'

const compareStore = useCompareStore()
const driversStore = useDriversStore()

// ── Jahres-State ───────────────────────────────────────────────────────────
const selectedYear = ref(null)

const availableYears = computed(() => {
  const current = Number(driversStore.currentYear) || new Date().getFullYear()
  const years = []
  for (let y = 2022; y <= current; y++) years.push(y)
  return years
})

// ── Standings für Dropdown ─────────────────────────────────────────────────
// Explizite lokale Ref – vermeidet Pinia-Reaktivitätsproblem mit dynami­schen Keys
const activeStandings = ref([])

async function loadYear(year) {
  selectedYear.value = year
  const key = String(year)
  if (!driversStore.standingsCache[key]) {
    await driversStore.fetchStandingsForYear(year)
  }
  activeStandings.value = driversStore.standingsCache[key] ?? []
  await compareStore.loadComparison(year)
}

async function selectYear(year) {
  await loadYear(year)
}

// ── Dropdown-Koordination ──────────────────────────────────────────────────
const openSide = ref(null)

// ── Fahrerwechsel ──────────────────────────────────────────────────────────
async function onSelect({ side, driverId }) {
  openSide.value = null
  await compareStore.switchDriver(side, driverId)
}

// ── Initialisierung ────────────────────────────────────────────────────────
onMounted(async () => {
  if (!driversStore.currentSeasonFetched) {
    await driversStore.fetchStandings('current')
  }
  selectedYear.value = Number(driversStore.currentYear)
  await loadYear(selectedYear.value)
})

async function retry() {
  await loadYear(selectedYear.value)
}

// ── Driver-Info (Name + Teamfarbe) für Chart und Balken ───────────────────

function getDriverInfo(driverId) {
  const s = activeStandings.value.find((s) => s.Driver.driverId === driverId)
  if (!s) return { name: driverId, color: '#555566' }
  const name  = `${s.Driver.givenName} ${s.Driver.familyName}`
  const color = getTeamColor(s.Constructors?.[0]?.constructorId ?? '')
  return { name, color }
}

const infoA = computed(() => getDriverInfo(compareStore.driverAId))
const infoB = computed(() => getDriverInfo(compareStore.driverBId))

// ── Metriken für den Balkenvergleich ───────────────────────────────────────

const metrics = computed(() => {
  const a = compareStore.statsA
  const b = compareStore.statsB
  return [
    { key: 'points',    label: 'PUNKTE',         valA: a.points,    valB: b.points },
    { key: 'wins',      label: 'SIEGE',           valA: a.wins,      valB: b.wins },
    { key: 'poles',     label: 'POLES',           valA: a.poles,     valB: b.poles },
    { key: 'podiums',   label: 'PODIUMS',         valA: a.podiums,   valB: b.podiums },
    { key: 'dnfs',      label: 'DNF',             valA: a.dnfs,      valB: b.dnfs },
    { key: 'avgPoints', label: 'PUNKTE / RENNEN', valA: a.avgPoints, valB: b.avgPoints },
  ]
})

/** Balkenbreite in % (0–100), als Anteil am Total beider Werte */
function barWidth(val, valA, valB) {
  const total = Number(valA) + Number(valB)
  if (total === 0) return 50
  return Math.round((Number(val) / total) * 100)
}
</script>

<template>
  <div class="compare page container">

    <!-- ── Header ───────────────────────────────────────── -->
    <div class="compare__header">
      <div class="compare__title-group">
        <span class="compare__eyebrow">HEAD-TO-HEAD · SAISON {{ selectedYear }}</span>
        <h1 class="compare__title">Vergleich</h1>
      </div>

      <div class="year-filter" role="group" aria-label="Saison wählen">
        <button
          v-for="y in availableYears"
          :key="y"
          class="year-btn"
          :class="{ 'year-btn--active': y === selectedYear }"
          :aria-pressed="y === selectedYear"
          @click="selectYear(y)"
        >
          {{ y }}
        </button>
      </div>
    </div>

    <!-- ── Loading ───────────────────────────────────────── -->
    <LoadingSpinner v-if="compareStore.loading" label="Lade Vergleichsdaten…" />

    <!-- ── Error ─────────────────────────────────────────── -->
    <ErrorMessage
      v-else-if="compareStore.error"
      :message="compareStore.error"
      retry-label="Erneut versuchen"
      @retry="retry"
    />

    <template v-else>

      <!-- ── Fahrer-Auswahl ────────────────────────────────── -->
      <div class="driver-selector anim-fade-up" style="animation-delay: 0.1s">
        <ComparePanel
          label="Fahrer A"
          :driver-id="compareStore.driverAId"
          :standings="activeStandings"
          side="A"
          :open-side="openSide"
          @opened="openSide = $event"
          @select="onSelect"
        />

        <span class="vs-label">VS</span>

        <ComparePanel
          label="Fahrer B"
          :driver-id="compareStore.driverBId"
          :standings="activeStandings"
          side="B"
          :open-side="openSide"
          @opened="openSide = $event"
          @select="onSelect"
        />
      </div>

      <!-- ── Metriken-Vergleich ─────────────────────────────── -->
      <section class="metrics card-dark anim-fade-up" style="animation-delay: 0.22s">
        <div
          v-for="m in metrics"
          :key="m.key"
          class="metric-row"
        >
          <!-- Wert A -->
          <span class="metric-val metric-val--a">{{ m.valA }}</span>

          <!-- Balken A (wächst von links) -->
          <div class="bar-wrap bar-wrap--a">
            <div
              class="bar bar--a"
              :style="{ width: barWidth(m.valA, m.valA, m.valB) + '%', background: infoA.color }"
            ></div>
          </div>

          <!-- Label -->
          <span class="metric-label">{{ m.label }}</span>

          <!-- Balken B (wächst von rechts) -->
          <div class="bar-wrap bar-wrap--b">
            <div
              class="bar bar--b"
              :style="{ width: barWidth(m.valB, m.valA, m.valB) + '%', background: infoB.color }"
            ></div>
          </div>

          <!-- Wert B -->
          <span class="metric-val metric-val--b">{{ m.valB }}</span>
        </div>
      </section>

      <!-- ── Linienchart ────────────────────────────────────── -->
      <section v-if="compareStore.chartLabels.length" class="chart-section card-dark anim-fade-up" style="animation-delay: 0.36s">
        <h3 class="chart-title">PUNKTEVERLAUF · SAISON {{ selectedYear }}</h3>
        <LineChart
          :labels="compareStore.chartLabels"
          :data-a="compareStore.chartDataA"
          :color-a="infoA.color"
          :label-a="infoA.name"
          :data-b="compareStore.chartDataB"
          :color-b="infoB.color"
          :label-b="infoB.name"
        />
      </section>

    </template>
  </div>
</template>

<style scoped>
/* ── Animationen ─────────────────────────────────── */
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes revealFromRight {
  from { clip-path: inset(0 0 0 100%); }
  to   { clip-path: inset(0 0 0 0); }
}

@keyframes revealFromLeft {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0 0 0); }
}

.compare__header {
  animation: fadeInDown 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.anim-fade-up {
  animation: fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* Balken wachsen von der Mitte nach aussen */
.bar--a {
  animation: revealFromRight 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both;
}

.bar--b {
  animation: revealFromLeft 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both;
}

.compare {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card-dark {
  background: linear-gradient(to bottom, #262D36 0%, #202630 50%, #1D232D 100%);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  overflow: hidden;
}

/* ── Header ──────────────────────────────────────── */
.compare__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.compare__title-group {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.compare__eyebrow {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.compare__title {
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
  cursor: pointer;
  transition: background var(--transition), color var(--transition), border-color var(--transition), box-shadow var(--transition);
  white-space: nowrap;
}
.year-btn:hover { color: var(--color-text); border-color: var(--color-text-subtle); }
.year-btn--active {
  background: linear-gradient(to right, #FF3624, #E10500);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 0 10px rgba(225, 5, 0, 0.4);
}

/* ── Fahrer-Selector ─────────────────────────────── */
.driver-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 200;
}

.vs-label {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: 1.4rem;
  letter-spacing: 2px;
  color: #ffffff;
  flex-shrink: 0;
}

/* ── Metriken ────────────────────────────────────── */
.metrics {
  padding: 0.5rem 0;
}

.metric-row {
  display: grid;
  grid-template-columns: 52px 1fr 120px 1fr 52px;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}
.metric-row:last-child { border-bottom: none; }

.metric-val {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: 1.1rem;
  letter-spacing: 2px;
  color: #fff;
}
.metric-val--a { text-align: right; }
.metric-val--b { text-align: left; }

.bar-wrap {
  height: 5px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 3px;
  overflow: hidden;
}

/* Balken A: wächst von rechts nach links (text-align: right entspricht flex-end) */
.bar-wrap--a {
  display: flex;
  justify-content: flex-end;
}

/* Balken B: wächst von links nach rechts */
.bar-wrap--b {
  display: flex;
  justify-content: flex-start;
}

.bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}

.metric-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  text-align: center;
}

/* ── Chart ───────────────────────────────────────── */
.chart-section {
  padding: 1.5rem;
}

.chart-title {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin: 0 0 1.25rem;
}

/* ── Responsive ──────────────────────────────────── */
@media (max-width: 700px) {
  .driver-selector {
    flex-direction: column;
    gap: 0.5rem;
  }

  .vs-label { align-self: center; }

  .metric-row {
    grid-template-columns: 40px 1fr 90px 1fr 40px;
    padding: 0.6rem 1rem;
    gap: 0.5rem;
  }

  .metric-val { font-size: 0.9rem; }

  .compare__header {
    flex-direction: column;
    align-items: flex-start;
  }
  .year-filter { justify-content: flex-start; }
}

@media (max-width: 440px) {
  .metric-row {
    grid-template-columns: 36px 1fr 72px 1fr 36px;
    gap: 0.35rem;
  }
  .metric-label { font-size: 0.55rem; }
}
</style>
