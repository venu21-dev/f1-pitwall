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

onMounted(() => {
  // Alle drei parallel laden – keine gegenseitige Abhängigkeit
  driversStore.fetchStandings('current')
  seasonsStore.fetchRaces('current')
  seasonsStore.fetchConstructorStandings('current')
})

const year = computed(() => driversStore.currentYear ?? seasonsStore.selectedYear ?? '…')
const champion = computed(() => driversStore.standings[0] ?? null)
const top8 = computed(() => driversStore.standings.slice(0, 8))
const constructorLeader = computed(() => seasonsStore.constructorChampion)

// Aktueller GP = letztes abgeschlossenes Rennen (Index = currentRound - 1)
const nextRace = computed(() => {
  const round = driversStore.currentRound
  return seasonsStore.races[round - 1] ?? null
})

function retryAll() {
  driversStore.fetchStandings('current')
  seasonsStore.fetchRaces('current')
  seasonsStore.fetchConstructorStandings('current')
}
</script>

<template>
  <div class="home page container">

    <!-- ══════════════════════════════════════════════
         HERO
    ══════════════════════════════════════════════ -->
    <section class="hero">

      <!-- Left: Title + CTA -->
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

      <!-- Right: Race count + Champion (eine Karte) -->
      <div class="hero__side card-dark">

        <div class="hero__races">
          <div class="hero__round">
            <span class="hero__big-num">{{ driversStore.currentRound }}</span>
            <span class="hero__round-total">/ {{ seasonsStore.totalRaces || '–' }}</span>
          </div>
          <span class="hero__side-label">Rennen &bull; {{ year }}</span>
          <div v-if="nextRace" class="hero__next-race">
            <span class="hero__next-label">Aktueller Grand Prix</span>
            <span class="hero__next-name">{{ nextRace.raceName }}</span>
          </div>
        </div>

        <div class="hero__champion">
          <LoadingSpinner v-if="driversStore.loading" :small="true" />
          <template v-else-if="champion">
            <p class="hero__side-label">WM-Leader</p>
            <span class="hero__champ-code">{{ champion.Driver.code }}</span>
            <p class="hero__champ-name">
              {{ champion.Driver.givenName }} {{ champion.Driver.familyName }}
            </p>
          </template>
          <p v-else class="hero__no-data">Noch keine Daten</p>
        </div>

      </div>

    </section>

    <!-- ══════════════════════════════════════════════
         STAT CARDS  – alle aus echter API
    ══════════════════════════════════════════════ -->
    <section class="highlights card-dark">

      <!-- Siege des Leaders -->
      <div class="highlight">
        <p class="highlight__label">Siege &bull; {{ champion?.Driver?.code ?? '–' }}</p>
        <span class="highlight__value">
          {{ driversStore.loading ? '…' : (champion?.wins ?? '–') }}
        </span>
        <p class="highlight__sub">von {{ seasonsStore.totalRaces || '–' }} Rennen</p>
      </div>

      <!-- Punkte des Leaders -->
      <div class="highlight">
        <p class="highlight__label">Punkte &bull; {{ champion?.Driver?.code ?? '–' }}</p>
        <span class="highlight__value">
          {{ driversStore.loading ? '…' : (champion?.points ?? '–') }}
        </span>
        <p class="highlight__sub">Saison {{ year }}</p>
      </div>

      <!-- Konstrukteurs-Leader -->
      <div class="highlight">
        <p class="highlight__label">Konstrukteurs-Leader</p>
        <span class="highlight__value highlight__value--gold">
          {{ seasonsStore.loading ? '…' : (constructorLeader?.Constructor?.name ?? '–') }}
        </span>
        <p class="highlight__sub">
          {{ constructorLeader ? constructorLeader.points + ' Punkte' : '' }}
        </p>
      </div>

    </section>

    <!-- ══════════════════════════════════════════════
         TOP 8 STANDINGS
    ══════════════════════════════════════════════ -->
    <section class="standings-preview card-dark">
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
          v-for="s in top8"
          :key="s.Driver.driverId"
          class="standing-row"
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
/* ── Layout ───────────────────────────────────────── */
.home {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Shared card base ─────────────────────────────── */
.card-dark {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
}

/* ── Buttons ──────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.4rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  transition: opacity var(--transition), background var(--transition);
  white-space: nowrap;
  cursor: pointer;
}
.btn--primary { background: var(--color-primary); color: #fff; }
.btn--primary:hover { opacity: 0.85; }
.btn--ghost {
  background: var(--color-surface-raised);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}
.btn--ghost:hover { color: var(--color-text); border-color: var(--color-text-subtle); }

/* ══════════════════════════════════════════════
   HERO
══════════════════════════════════════════════ */
.hero {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 1.25rem;
  align-items: stretch;
  min-height: 320px;
}

.hero__main {
  background:
    radial-gradient(ellipse at 90% 10%, rgba(225, 6, 0, 0.22) 0%, transparent 55%),
    var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 2rem 2.25rem 2.25rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 1.25rem;
}

.hero__eyebrow {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.hero__title {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: clamp(2.8rem, 6vw, 5.5rem);
  line-height: 0.92;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  color: #fff;
}

.hero__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.hero__side {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 1rem;
}

.hero__races {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
  flex: 1;
}

.hero__round {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
}

.hero__big-num {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: clamp(3rem, 5vw, 4.5rem);
  line-height: 1;
  color: var(--color-primary);
}

.hero__round-total {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 700;
  font-size: clamp(1.2rem, 2.5vw, 1.8rem);
  color: var(--color-text-muted);
  line-height: 1;
}

.hero__side-label {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.hero__next-race {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  align-items: flex-end;
}

.hero__next-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

.hero__next-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text);
  text-align: right;
}

.hero__champion {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3rem;
}

.hero__champ-code {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: clamp(2.2rem, 4vw, 3.5rem);
  line-height: 1;
  color: var(--color-primary);
  letter-spacing: 0.02em;
}

.hero__champ-name {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.hero__no-data {
  font-size: 0.8rem;
  color: var(--color-text-subtle);
  font-style: italic;
}

/* ══════════════════════════════════════════════
   HIGHLIGHT STATS
══════════════════════════════════════════════ */
.highlights {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.highlight {
  padding: 1.25rem 2rem;
}

.highlight + .highlight {
  border-left: 1px solid var(--color-border);
}

.highlight__label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: 0.4rem;
}

.highlight__value {
  display: block;
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  line-height: 1;
  color: #fff;
  margin-bottom: 0.35rem;
}

.highlight__value--gold { color: var(--color-gold); }

.highlight__sub {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

/* ══════════════════════════════════════════════
   TOP 8
══════════════════════════════════════════════ */
.standings-preview {
  padding: 1.75rem 2rem;
}

.standings-preview__header {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.standings-preview__title {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: 2rem;
  text-transform: uppercase;
  color: #fff;
}

.standings-preview__sub {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
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
  gap: 0.5rem;
}

.standing-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 0.65rem 0.85rem;
}

.standing-row__pos {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
  background: var(--color-bg);
  border-radius: 5px;
  padding: 0.15rem 0.45rem;
  min-width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.standing-row__bar {
  width: 3px;
  height: 32px;
  border-radius: 2px;
  flex-shrink: 0;
}

.standing-row__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.standing-row__name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.standing-row__team {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.standing-row__pts {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 800;
  font-size: 1.4rem;
  color: var(--color-gold);
  flex-shrink: 0;
  line-height: 1;
}

/* ── Responsive ───────────────────────────────── */
@media (max-width: 900px) {
  .hero { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .hero__side { flex-direction: column; }
  .highlights { grid-template-columns: 1fr; }
  .highlight + .highlight { border-left: none; border-top: 1px solid var(--color-border); }
  .standings-grid { grid-template-columns: 1fr; }
  .standings-preview { padding: 1.25rem; }
  .hero__main { padding: 1.5rem; }
}
</style>
