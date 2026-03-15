<script setup>
import { computed } from 'vue'
import { getCountryCode } from '@/utils/countryCodes'
import { getTeamColor } from '@/utils/teamColors'

const props = defineProps({
  /** Race-Objekt aus dem Kalender-Endpoint (ohne Results) */
  race: {
    type: Object,
    required: true,
  },
  /** Race-Objekt aus dem Winners-Endpoint (mit Results[0] = Sieger) oder null */
  winner: {
    type: Object,
    default: null,
  },
})

const country  = computed(() => props.race.Circuit?.Location?.country ?? '')
const code     = computed(() => getCountryCode(country.value))

const roundLabel = computed(() => `RUNDE ${String(props.race.round).padStart(2, '0')}`)

const raceName    = computed(() => props.race.raceName ?? '')
const circuitName = computed(() => props.race.Circuit?.circuitName ?? '')

const winnerDriver      = computed(() => props.winner?.Results?.[0]?.Driver ?? null)
const winnerConstructor = computed(() => props.winner?.Results?.[0]?.Constructor ?? null)
const teamColor         = computed(() => getTeamColor(winnerConstructor.value?.constructorId ?? ''))

const isCompleted = computed(() => props.winner !== null)

const raceDate  = computed(() => props.race.date ? new Date(props.race.date) : null)
const dateLabel = computed(() => {
  if (!raceDate.value) return ''
  return raceDate.value.toLocaleDateString('de-CH', { day: 'numeric', month: 'long' })
})
</script>

<template>
  <div class="race-card" :class="{ 'race-card--upcoming': !isCompleted }">

    <!-- Runden-Label -->
    <span class="race-card__round">{{ roundLabel }}</span>

    <!-- Mitte: Code + Rennname -->
    <div class="race-card__main">
      <span class="race-card__code">{{ code }}</span>
      <div class="race-card__info">
        <p class="race-card__name">{{ raceName }}</p>
        <p class="race-card__circuit">{{ circuitName }}</p>
      </div>
    </div>

    <!-- Trennlinie -->
    <div class="race-card__divider"></div>

    <!-- Sieger oder Datum -->
    <div class="race-card__footer">
      <template v-if="isCompleted && winnerDriver">
        <span class="race-card__footer-label">SIEGER</span>
        <div class="race-card__winner">
          <span class="race-card__team-dot" :style="{ background: teamColor }"></span>
          <span class="race-card__winner-name">
            {{ winnerDriver.givenName }} {{ winnerDriver.familyName }}
          </span>
        </div>
      </template>
      <template v-else>
        <span class="race-card__footer-label">DATUM</span>
        <span class="race-card__date">{{ dateLabel }}</span>
      </template>
    </div>

  </div>
</template>

<style scoped>
.race-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 1.25rem 1.25rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  transition: border-color var(--transition), transform var(--transition);
}

.race-card:hover {
  border-color: var(--color-text-subtle);
  transform: translateY(-2px);
}

.race-card--upcoming {
  opacity: 0.65;
}

/* ── Runden-Label ─────────────────────────────────── */
.race-card__round {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

/* ── Haupt-Bereich: Code links, Infos rechts ─────── */
.race-card__main {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.race-card__code {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: clamp(3rem, 5vw, 3.75rem);
  text-transform: uppercase;
  color: #fff;
  line-height: 1;
  letter-spacing: -0.02em;
  flex-shrink: 0;
  min-width: 3.5ch;
}

.race-card__info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.race-card__name {
  font-weight: 700;
  font-size: 0.9rem;
  color: #fff;
  margin: 0;
  line-height: 1.2;
}

.race-card__circuit {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Trennlinie ───────────────────────────────────── */
.race-card__divider {
  height: 1px;
  background: var(--color-border);
}

/* ── Footer ───────────────────────────────────────── */
.race-card__footer {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.race-card__footer-label {
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.race-card__winner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.race-card__team-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.race-card__winner-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.race-card__date {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
  font-style: italic;
}
</style>
