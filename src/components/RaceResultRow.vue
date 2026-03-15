<script setup>
import { computed } from 'vue'
import { getCountryFlag } from '@/utils/countryFlags'

const props = defineProps({
  /** Race-Objekt aus der Jolpica-API (enthält Results[0] für diesen Fahrer) */
  race: {
    type: Object,
    required: true,
  },
  /** Qualifying-Position als String (z.B. "1", "5") oder null */
  qualiPos: {
    type: String,
    default: null,
  },
})

const result = computed(() => props.race.Results?.[0] ?? null)

const roundLabel = computed(() => `R${String(props.race.round).padStart(2, '0')}`)

const countryFlag = computed(() => getCountryFlag(props.race.Circuit?.Location?.country ?? ''))

/** Kürzt "Grand Prix" aus dem Rennnamen für kompaktere Darstellung */
const raceName = computed(() => props.race.raceName.replace(' Grand Prix', ' GP'))

const positionText = computed(() => result.value?.positionText ?? '–')
const points = computed(() => result.value?.points ?? '0')
const grid = computed(() => {
  const g = result.value?.grid ?? '–'
  return g === '0' ? 'PL' : g // 0 = Pit Lane Start
})

/** True wenn das Rennen nicht regulär beendet wurde */
const isDNF = computed(() => {
  const status = result.value?.status ?? ''
  return status !== 'Finished' && !status.startsWith('+')
})

/** CSS-Klasse für die Ergebnis-Badge */
const posClass = computed(() => {
  if (isDNF.value) return 'badge--dnf'
  const pos = positionText.value
  if (pos === '1') return 'badge--p1'
  if (pos === '2') return 'badge--p2'
  if (pos === '3') return 'badge--p3'
  return 'badge--normal'
})

/** Angezeigter Text in der Ergebnis-Badge */
const badgeText = computed(() => (isDNF.value ? 'DNF' : positionText.value))
</script>

<template>
  <div class="rr-row" :class="{ 'rr-row--dnf': isDNF }">
    <!-- Runde -->
    <span class="rr-round">{{ roundLabel }}</span>

    <!-- Grand Prix -->
    <span class="rr-name">
      <span class="rr-flag">{{ countryFlag }}</span>
      <span class="rr-race-name">{{ raceName }}</span>
    </span>

    <!-- Startplatz -->
    <span class="rr-grid">{{ grid }}</span>

    <!-- Ergebnis -->
    <span class="rr-result">
      <span class="result-badge" :class="posClass">{{ badgeText }}</span>
    </span>

    <!-- Punkte -->
    <span class="rr-pts" :class="{ 'rr-pts--gold': Number(points) > 0 }">
      {{ points }}
    </span>
  </div>
</template>

<style scoped>
/* ── Zeilen-Grid ──────────────────────────────────── */
.rr-row {
  display: grid;
  grid-template-columns: 52px 1fr 64px 80px 72px;
  align-items: center;
  padding: 0.7rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  transition: background var(--transition);
}

.rr-row:last-child {
  border-bottom: none;
}

.rr-row:hover {
  background: rgba(255, 255, 255, 0.025);
}

.rr-row--dnf {
  opacity: 0.7;
}

/* ── Runde ───────────────────────────────────────── */
.rr-round {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
}

/* ── Grand Prix ──────────────────────────────────── */
.rr-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.rr-flag {
  font-size: 1rem;
  line-height: 1;
  flex-shrink: 0;
}

.rr-race-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Startplatz ──────────────────────────────────── */
.rr-grid {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted);
  text-align: center;
}

/* ── Ergebnis-Badge ──────────────────────────────── */
.rr-result {
  display: flex;
  justify-content: center;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.badge--p1   { background: rgba(245, 200, 66, 0.18); color: var(--color-gold); }
.badge--p2   { background: rgba(192, 192, 192, 0.15); color: #c0c0c0; }
.badge--p3   { background: rgba(205, 127, 50, 0.18); color: #cd7f32; }
.badge--normal { background: var(--color-surface-raised); color: var(--color-text-muted); }
.badge--dnf  { background: rgba(225, 6, 0, 0.18); color: var(--color-primary); }

/* ── Punkte ──────────────────────────────────────── */
.rr-pts {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-align: right;
}

.rr-pts--gold {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 800;
  font-size: 1rem;
  color: var(--color-gold);
}

/* ── Responsive ──────────────────────────────────── */
@media (max-width: 560px) {
  .rr-row {
    grid-template-columns: 44px 1fr 48px 64px;
    padding: 0.65rem 1rem;
  }

  /* Startplatz verstecken */
  .rr-grid {
    display: none;
  }
}

@media (max-width: 380px) {
  .rr-row {
    grid-template-columns: 40px 1fr 56px;
    padding: 0.6rem 0.75rem;
  }

  .rr-result {
    display: none;
  }

  .rr-race-name {
    font-size: 0.8rem;
  }
}
</style>
