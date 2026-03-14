<script setup>
import SparkLine from '@/components/SparkLine.vue'
import { getTeamColor } from '@/utils/teamColors'
import { getNationalityFlag } from '@/utils/nationalities'

const props = defineProps({
  /** DriverStanding[] aus der Jolpica-API */
  standings: {
    type: Array,
    default: () => [],
  },
  /** { [driverId]: number[] } kumulative Punkte pro Rennen */
  sparklines: {
    type: Object,
    default: () => ({}),
  },
  /** { [driverId]: number } Podiumsanzahl */
  podiums: {
    type: Object,
    default: () => ({}),
  },
  /** { [driverId]: number } Pole Positions */
  poles: {
    type: Object,
    default: () => ({}),
  },
  /** True während Sparkline/Podiums/Poles-Daten geladen werden */
  statsLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['rowClick'])

function posClass(pos) {
  if (pos === '1') return 'pos--gold'
  if (pos === '2') return 'pos--silver'
  if (pos === '3') return 'pos--bronze'
  return ''
}
</script>

<template>
  <div class="standings-wrap">
    <!-- ── Tabellenkopf ──────────────────────────────── -->
    <div class="standings-head">
      <span class="col-pos">POS</span>
      <span class="col-driver">FAHRER</span>
      <span class="col-stat">SIEGE</span>
      <span class="col-stat col-poles">POLES</span>
      <span class="col-stat col-podiums">PODIUMS</span>
      <span class="col-pts">PUNKTE</span>
      <span class="col-spark">VERLAUF</span>
    </div>

    <!-- ── Zeilen ────────────────────────────────────── -->
    <div
      v-for="s in standings"
      :key="s.Driver.driverId"
      class="standings-row"
      role="button"
      tabindex="0"
      @click="emit('rowClick', s.Driver.driverId)"
      @keydown.enter="emit('rowClick', s.Driver.driverId)"
    >
      <!-- Position -->
      <span class="col-pos">
        <span class="pos-badge" :class="posClass(s.position)">
          {{ s.position }}
        </span>
      </span>

      <!-- Fahrer -->
      <span class="col-driver">
        <span
          class="team-bar"
          :style="{ background: getTeamColor(s.Constructors?.[0]?.constructorId) }"
        ></span>
        <span class="driver-info">
          <span class="driver-name">
            {{ s.Driver.givenName }}
            <strong>{{ s.Driver.familyName }}</strong>
          </span>
          <span class="driver-meta">
            <span class="nat-flag">{{ getNationalityFlag(s.Driver.nationality) }}</span>
            <span class="team-name">{{ s.Constructors?.[0]?.name }}</span>
          </span>
        </span>
      </span>

      <!-- Siege -->
      <span class="col-stat stat-value">{{ s.wins }}</span>

      <!-- Poles -->
      <span class="col-stat col-poles stat-value">
        <span v-if="s.Driver.driverId in poles">
          {{ poles[s.Driver.driverId] }}
        </span>
        <span v-else-if="statsLoading" class="stat-loading">…</span>
        <span v-else class="stat-na">–</span>
      </span>

      <!-- Podiums -->
      <span class="col-stat col-podiums stat-value">
        <span v-if="s.Driver.driverId in podiums">
          {{ podiums[s.Driver.driverId] }}
        </span>
        <span v-else-if="statsLoading" class="stat-loading">…</span>
        <span v-else class="stat-na">–</span>
      </span>

      <!-- Punkte (gold) -->
      <span class="col-pts pts-value">{{ s.points }}</span>

      <!-- Sparkline -->
      <span class="col-spark">
        <SparkLine
          :data="sparklines[s.Driver.driverId] ?? []"
          :color="getTeamColor(s.Constructors?.[0]?.constructorId)"
          :width="64"
          :height="28"
        />
      </span>
    </div>
  </div>
</template>

<style scoped>
/* ── Layout-Raster ──────────────────────────────── */
.standings-head,
.standings-row {
  display: grid;
  grid-template-columns: 52px 1fr 60px 60px 80px 80px 80px;
  align-items: center;
  gap: 0;
  padding: 0 1.5rem;
}

/* ── Kopfzeile ──────────────────────────────────── */
.standings-head {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

/* ── Daten-Zeile ────────────────────────────────── */
.standings-row {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background var(--transition);
}

.standings-row:last-child {
  border-bottom: none;
}

.standings-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

/* ── Spalten ────────────────────────────────────── */
.col-pos {
  display: flex;
  align-items: center;
}

.col-driver {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.col-stat,
.col-pts,
.col-spark {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Position-Badge ─────────────────────────────── */
.pos-badge {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: 1.35rem;
  line-height: 1;
  color: var(--color-text-muted);
  min-width: 28px;
  text-align: left;
}

.pos-badge.pos--gold   { color: var(--color-gold); }
.pos-badge.pos--silver { color: #c0c0c0; }
.pos-badge.pos--bronze { color: #cd7f32; }

/* ── Teamfarben-Balken ──────────────────────────── */
.team-bar {
  flex-shrink: 0;
  width: 3px;
  height: 38px;
  border-radius: 2px;
}

/* ── Fahrer-Info ────────────────────────────────── */
.driver-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.driver-name {
  font-size: 0.95rem;
  font-weight: 400;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.driver-name strong {
  font-weight: 700;
}

.driver-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.nat-flag {
  font-size: 0.85rem;
  line-height: 1;
}

.team-name {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Statistik-Werte ────────────────────────────── */
.stat-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
}

.stat-loading {
  color: var(--color-text-subtle);
  font-style: italic;
}

.stat-na {
  color: var(--color-text-subtle);
}

/* ── Punkte (gold) ──────────────────────────────── */
.pts-value {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: 1.35rem;
  color: var(--color-gold);
  line-height: 1;
}

/* ── Responsive ─────────────────────────────────── */

/* Tablet: Sparkline + Podiums ausblenden */
@media (max-width: 860px) {
  .standings-head,
  .standings-row {
    grid-template-columns: 52px 1fr 60px 60px 80px;
    padding: 0 1.25rem;
  }

  .col-spark,
  .col-podiums {
    display: none;
  }
}

/* Mobil: nur SIEGE + PUNKTE neben Fahrer */
@media (max-width: 560px) {
  .standings-head,
  .standings-row {
    grid-template-columns: 40px 1fr 52px 68px;
    padding: 0 1rem;
  }

  .col-poles {
    display: none;
  }

  .pos-badge  { font-size: 1.05rem; }
  .pts-value  { font-size: 1.1rem; }
}

/* Sehr klein: nur Fahrer + Punkte */
@media (max-width: 380px) {
  .standings-head,
  .standings-row {
    grid-template-columns: 36px 1fr 64px;
    padding: 0 0.75rem;
  }

  .col-stat {
    display: none;
  }

  .driver-name { font-size: 0.85rem; }
}
</style>
