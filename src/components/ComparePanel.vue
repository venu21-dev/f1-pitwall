<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { getTeamColor } from '@/utils/teamColors'

const props = defineProps({
  /** "Fahrer A" | "Fahrer B" */
  label: { type: String, required: true },
  /** Aktuell gewählte driverId */
  driverId: { type: String, required: true },
  /** DriverStanding[] aus dem Standings-Cache des ausgewählten Jahres */
  standings: { type: Array, default: () => [] },
  /** 'A' | 'B' – wird beim select-Event durchgegeben */
  side: { type: String, required: true },
  /** Welche Seite aktuell offen ist (von CompareView gesteuert) */
  openSide: { type: String, default: null },
})

const emit = defineEmits(['select', 'opened'])

// ── Dropdown-State ──────────────────────────────────────────────────────────
const isOpen   = ref(false)
const panelRef = ref(null)

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) emit('opened', props.side)
}
function close()  { isOpen.value = false }

// Schliesst dieses Panel wenn die andere Seite geöffnet wird
watch(() => props.openSide, (side) => {
  if (side && side !== props.side) close()
})

function select(driverId) {
  emit('select', { side: props.side, driverId })
  close()
}

// Schließt das Dropdown bei Klick außerhalb des Panels
function onDocClick(e) {
  if (panelRef.value && !panelRef.value.contains(e.target)) close()
}
onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))

// ── Driver-Info aus Standings ───────────────────────────────────────────────
const currentStanding = computed(() =>
  props.standings.find((s) => s.Driver.driverId === props.driverId) ?? null
)

const driver    = computed(() => currentStanding.value?.Driver ?? null)
const team      = computed(() => currentStanding.value?.Constructors?.[0] ?? null)
const teamColor = computed(() => getTeamColor(team.value?.constructorId ?? ''))

const driverName = computed(() =>
  driver.value
    ? `${driver.value.givenName} ${driver.value.familyName}`
    : props.driverId
)
</script>

<template>
  <div class="panel" ref="panelRef">
    <!-- Farbiger Teambalken links -->
    <span class="panel__bar" :style="{ background: teamColor }"></span>

    <!-- Textbereich -->
    <div class="panel__content">
      <span class="panel__label">{{ label }}</span>
      <p class="panel__name">{{ driverName }}</p>
      <span class="panel__team">{{ team?.name ?? '–' }}</span>
    </div>

    <!-- Dropdown-Toggle -->
    <button class="panel__toggle" @click.stop="toggle" :aria-label="'Fahrer wählen'">
      <svg
        class="panel__chevron"
        :class="{ 'panel__chevron--open': isOpen }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <!-- Dropdown-Liste -->
    <ul v-if="isOpen && standings.length" class="panel__dropdown">
      <li
        v-for="s in standings"
        :key="s.Driver.driverId"
        class="panel__option"
        :class="{ 'panel__option--active': s.Driver.driverId === driverId }"
        @click="select(s.Driver.driverId)"
      >
        <span
          class="panel__option-dot"
          :style="{ background: getTeamColor(s.Constructors?.[0]?.constructorId ?? '') }"
        ></span>
        {{ s.Driver.givenName }} {{ s.Driver.familyName }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.panel {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  background: linear-gradient(to bottom, #262D36 0%, #202630 50%, #1D232D 100%);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 1.1rem 1rem 1.1rem 1.1rem;
  flex: 1;
  min-width: 0;
}

/* ── Teambalken ───────────────────────────────────── */
.panel__bar {
  width: 3px;
  height: 50px;
  border-radius: 2px;
  flex-shrink: 0;
}

/* ── Textbereich ──────────────────────────────────── */
.panel__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.panel__label {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.panel__name {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: clamp(1.3rem, 3vw, 1.75rem);
  text-transform: uppercase;
  color: #fff;
  line-height: 1;
  letter-spacing: calc(-0.01em + 2px);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.panel__team {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

/* ── Toggle-Button ────────────────────────────────── */
.panel__toggle {
  width: 36px;
  height: 36px;
  min-height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface-raised);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color var(--transition), border-color var(--transition);
}
.panel__toggle:hover { color: var(--color-text); border-color: var(--color-text-subtle); }

.panel__chevron {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}
.panel__chevron--open { transform: rotate(180deg); }

/* ── Dropdown ─────────────────────────────────────── */
.panel__dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 500;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden auto;
  max-height: 260px;
  list-style: none;
  margin: 0;
  padding: 0.4rem 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.panel__option {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 1rem;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background var(--transition), color var(--transition);
}
.panel__option:hover {
  background: var(--color-surface-raised);
  color: var(--color-text);
}
.panel__option--active {
  color: #fff;
  font-weight: 700;
}

.panel__option-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
