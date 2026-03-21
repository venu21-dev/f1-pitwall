<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDriversStore } from '@/stores/driversStore'
import { useSeasonsStore } from '@/stores/seasonsStore'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import { getTeamColor } from '@/utils/teamColors'

const router = useRouter()
const driversStore = useDriversStore()
const seasonsStore = useSeasonsStore()

onMounted(async () => {
  await driversStore.fetchStandings('current')
  seasonsStore.fetchRaces('current')
  seasonsStore.fetchConstructorStandings('current')
  // Poles des Leaders im Hintergrund laden
  if (driversStore.standings[0]) {
    driversStore.fetchDriverStats(driversStore.currentYear, [
      driversStore.standings[0].Driver.driverId,
    ])
  }
})

const year             = computed(() => driversStore.currentYear ?? seasonsStore.selectedYear ?? '…')
const champion         = computed(() => driversStore.standings[0] ?? null)
const top8             = computed(() => driversStore.standings.slice(0, 8))
const constructorLeader = computed(() => seasonsStore.constructorChampion)

// Aktuelles Rennen = Rennen an Index (currentRound - 1) aus dem Kalender
const currentRace = computed(() => {
  const round = driversStore.currentRound
  if (!round) return null
  return seasonsStore.races[round - 1] ?? null
})

const nextRace = computed(() => {
  const round = driversStore.currentRound
  if (!round) return null
  return seasonsStore.races[round] ?? null
})

const championPoles = computed(() => {
  if (!champion.value || !driversStore.currentYear) return '–'
  const yearPoles = driversStore.polesCache[String(driversStore.currentYear)]
  if (!yearPoles) return '–'
  return yearPoles[champion.value.Driver.driverId] ?? '–'
})

function retryAll() {
  driversStore.fetchStandings('current')
  seasonsStore.fetchRaces('current')
  seasonsStore.fetchConstructorStandings('current')
}
</script>

<template>
  <div class="home page container">

    <!-- ══════════════════════════════════════════
         HERO
    ══════════════════════════════════════════ -->
    <section class="hero">

      <!-- Links: Titel + CTAs -->
      <div class="hero__main">
        <p class="hero__eyebrow">F1 PitWall &bull; Saison {{ year }}</p>
        <h1 class="hero__title">Formula<br>One<br>Data</h1>
        <div class="hero__actions">
          <button class="btn btn--primary" @click="router.push('/compare')">
            Vergleich Starten
          </button>
          <button class="btn btn--ghost" @click="router.push('/drivers')">
            Standings Ansehen
          </button>
        </div>
      </div>

      <!-- Rechts: Rennen + Weltmeister -->
      <div class="hero__side">

        <div class="hero__races">
          <div class="hero__round-row">
            <span class="hero__big-num">{{ driversStore.currentRound || '–' }}</span>
            <span class="hero__round-total">/ {{ seasonsStore.totalRaces || '–' }}</span>
          </div>
          <span class="hero__races-label">Rennen &bull; {{ year }}</span>
          <template v-if="nextRace">
            <p class="hero__race-sublabel hero__race-sublabel--sm" style="margin-top: 0.75rem;">Nächster Grand Prix</p>
            <p class="hero__race-name hero__race-name--sm">{{ nextRace.raceName }}</p>
          </template>
        </div>

        <div class="hero__champion">
          <LoadingSpinner v-if="driversStore.loading" :small="true" />
          <template v-else-if="champion">
            <div class="hero__champ-left">
              <p class="hero__champ-label">Weltmeister</p>
              <span class="hero__champ-code">{{ champion.Driver.code }}</span>
              <p class="hero__champ-name">
                {{ champion.Driver.givenName }} {{ champion.Driver.familyName }}
              </p>
            </div>
            <div v-if="currentRace" class="hero__champ-race">
              <p class="hero__race-sublabel">Aktueller Grand Prix</p>
              <p class="hero__champ-race-name">{{ currentRace.raceName }}</p>
            </div>
          </template>
          <p v-else class="hero__no-data">Keine Daten</p>
        </div>

      </div>
    </section>

    <!-- ══════════════════════════════════════════
         STATS STRIP
    ══════════════════════════════════════════ -->
    <section class="highlights">

      <div class="highlight">
        <p class="highlight__label">Siege &bull; {{ champion?.Driver?.code ?? '–' }}</p>
        <span class="highlight__value">
          {{ driversStore.loading ? '…' : (champion?.wins ?? '–') }}
        </span>
        <p class="highlight__sub">von {{ seasonsStore.totalRaces || '–' }} Rennen</p>
      </div>

      <div class="highlight">
        <p class="highlight__label">Pole Position</p>
        <span class="highlight__value">{{ championPoles }}</span>
        <p class="highlight__sub">{{ champion?.Driver?.familyName ?? '–' }} &bull; {{ year }}</p>
      </div>

      <div class="highlight">
        <p class="highlight__label">Konstrukteurs WM</p>
        <span class="highlight__value highlight__value--gold">
          {{ seasonsStore.loading ? '…' : (constructorLeader?.Constructor?.name ?? '–') }}
        </span>
        <p class="highlight__sub">
          {{ constructorLeader ? constructorLeader.points + ' Punkte' : '' }}
        </p>
      </div>

    </section>

    <!-- ══════════════════════════════════════════
         TOP 8
    ══════════════════════════════════════════ -->
    <section class="standings-preview">
      <div class="standings-preview__header">
        <h2 class="standings-preview__title">Top 8</h2>
        <p class="standings-preview__sub">Fahrerwertung &bull; {{ year }}</p>
      </div>

      <LoadingSpinner v-if="driversStore.loading" label="Lade Wertung…" />

      <ErrorMessage
        v-else-if="driversStore.error"
        :message="driversStore.error"
        @retry="retryAll"
      />

      <p v-else-if="top8.length === 0" class="standings-empty">
        Noch keine Rennergebnisse für {{ year }}.
      </p>

      <div v-else class="standings-grid">
        <div
          v-for="(s, i) in top8"
          :key="s.Driver.driverId"
          class="standing-row"
          :style="{ animationDelay: `${0.32 + i * 0.07}s` }"
        >
          <span class="standing-row__pos">{{ s.position }}</span>
          <span
            class="standing-row__bar"
            :style="{ background: getTeamColor(s.Constructors?.[0]?.constructorId) }"
          ></span>
          <div class="standing-row__info">
            <span class="standing-row__name">{{ s.Driver.familyName }}</span>
            <span class="standing-row__team">{{ s.Constructors?.[0]?.name }}</span>
          </div>
          <span class="standing-row__pts">{{ s.points }}</span>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* ── Animationen ──────────────────────────────────── */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(28px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-24px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(24px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.hero__main {
  animation: fadeInLeft 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.hero__side {
  animation: fadeInRight 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
}

.highlights {
  animation: fadeInUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
}

.standings-preview {
  animation: fadeInUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.32s both;
}

/* ── Layout ───────────────────────────────────────── */
.home {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ══════════════════════════════════════════
   HERO
══════════════════════════════════════════ */
.hero {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 1.25rem;
  align-items: stretch;
  min-height: 420px;
}

/* Linke Hero-Karte */
.hero__main {
  background:
    radial-gradient(ellipse at 100% 0%, rgba(225, 5, 0, 0.40) 0%, transparent 60%),
    linear-gradient(to bottom, #262D36 0%, #202630 50%, #1D232D 100%);
  border: 1px solid #353D49;
  border-radius: 16px;
  padding: calc(3rem + 10px) 2.5rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 1.5rem;
}

.hero__eyebrow {
  font-family: var(--font-nav);
  font-style: normal;
  font-weight: 700;
  font-size: clamp(0.7rem, 1.1vw, 0.88rem);
  letter-spacing: calc(0.1em + 2px);
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: -1rem;
}

.hero__title {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: clamp(2.6rem, 5.5vw, 5rem);
  line-height: 0.88;
  text-transform: uppercase;
  letter-spacing: calc(-0.02em + 2px);
  color: #fff;
}

.hero__actions {
  display: flex;
  gap: 0.85rem;
  flex-wrap: wrap;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 1.6rem;
  min-height: 44px;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 700;
  border: none;
  transition: opacity var(--transition), transform var(--transition);
  white-space: nowrap;
  cursor: pointer;
  letter-spacing: 0.01em;
}
.btn--primary {
  background: linear-gradient(to right, #FF3624, #E10500);
  color: #fff;
  box-shadow: 0 4px 16px rgba(225, 6, 0, 0.3);
}
.btn--primary:hover { opacity: 0.88; transform: translateY(-1px); }

.btn--ghost {
  background: linear-gradient(135deg, #737373, #D9D9D9);
  color: #ffffff;
  border: 1px solid #ffffff;
}
.btn--ghost:hover { opacity: 0.85; transform: translateY(-1px); }

/* Rechte Hero-Karte */
.hero__side {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  background: linear-gradient(to bottom, #262D36 0%, #202630 50%, #1D232D 100%);
  border: 1px solid #353D49;
  border-radius: 16px;
  padding: 2rem 1.75rem;
}

.hero__races {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.1rem;
}

.hero__round-row {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
}

.hero__big-num {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: clamp(4.5rem, 8vw, 7rem);
  line-height: 1;
  color: var(--color-primary);
  letter-spacing: calc(-0.03em + 2px);
}

.hero__round-total {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 700;
  font-size: clamp(1.2rem, 2.5vw, 1.8rem);
  color: var(--color-text-muted);
  line-height: 1;
}

.hero__races-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.hero__race-divider {
  width: 100%;
  height: 1px;
  background: #353D49;
  margin: 0.6rem 0 0.5rem;
}

.hero__race-sublabel {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
  margin-top: 1.5rem;
}

.hero__race-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text);
}

.hero__race-sublabel--sm {
  font-size: 0.52rem;
}

.hero__race-name--sm {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

/* Champion-Karte */
.hero__champion {
  background: linear-gradient(to bottom left, #29313B 0%, #202630 55%, #1D232D 100%);
  border: 1px solid #353D49;
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.hero__champ-left {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.hero__champ-race {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: right;
}

.hero__champ-race-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text);
}

.hero__champ-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.hero__champ-code {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: clamp(2.8rem, 5vw, 4.5rem);
  line-height: 1;
  color: var(--color-primary);
  letter-spacing: calc(0.02em + 2px);
}

.hero__champ-name {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.hero__no-data {
  font-size: 0.8rem;
  color: var(--color-text-subtle);
  font-style: italic;
}

/* ══════════════════════════════════════════
   STATS STRIP
══════════════════════════════════════════ */
.highlights {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: linear-gradient(to bottom, #262D36 0%, #202630 50%, #1D232D 100%);
  border: 1px solid #353D49;
  border-radius: 16px;
  overflow: hidden;
}

.highlight {
  padding: 1.5rem 2rem;
}

.highlight + .highlight {
  border-left: 1px solid #353D49;
}

.highlight__label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
}

.highlight__value {
  display: block;
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: clamp(2rem, 3.5vw, 3rem);
  line-height: 1;
  letter-spacing: 2px;
  color: #fff;
  margin-bottom: 0.4rem;
}

.highlight__value--gold { color: var(--color-gold); }

.highlight__sub {
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

/* ══════════════════════════════════════════
   TOP 8
══════════════════════════════════════════ */
.standings-preview {
  background: linear-gradient(to bottom, #222831 0%, #1E242F 50%, #1B222B 100%);
  border: 1px solid #353D49;
  border-radius: 16px;
  padding: 1.75rem 2rem 2rem;
}

.standings-preview__header {
  display: flex;
  align-items: baseline;
  gap: 0.85rem;
  margin-bottom: 1.5rem;
}

.standings-preview__title {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: 2.2rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #fff;
  line-height: 1;
}

.standings-preview__sub {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.standings-empty {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-style: italic;
}

.standings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

/* Driver Row */
.standing-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #262D36, #252C39);
  border: 1px solid #353D49;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  transition: border-color var(--transition);
  animation: fadeInUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.standing-row:hover { border-color: #4a5260; }

.standing-row__pos {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: 1.3rem;
  letter-spacing: 2px;
  color: #fff;
  background: #343943;
  border-radius: 10px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.standing-row__bar {
  width: 3px;
  height: 44px;
  border-radius: 2px;
  flex-shrink: 0;
}

.standing-row__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.standing-row__name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.standing-row__team {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.standing-row__pts {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: 1.5rem;
  letter-spacing: 2px;
  color: var(--color-gold);
  flex-shrink: 0;
  line-height: 1;
}

/* ── Responsive ───────────────────────────────── */
@media (max-width: 900px) {
  .hero { grid-template-columns: 1fr; }
  .hero__side { flex-direction: row; flex-wrap: wrap; }
  .hero__races { align-items: flex-start; }
  .hero__champion { flex: 1; min-width: 180px; }
}

@media (max-width: 600px) {
  .highlights { grid-template-columns: 1fr; }
  .highlight + .highlight { border-left: none; border-top: 1px solid #353D49; }
  .standings-grid { grid-template-columns: 1fr; }
  .standings-preview { padding: 1.25rem; }
  .hero__main { padding: 1.5rem 1.5rem 2rem; }
  .hero__side { flex-direction: column; }
}
</style>
