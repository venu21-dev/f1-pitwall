<script setup>
import { computed, onMounted } from 'vue'
import { useDriversStore } from '@/stores/driversStore'

const driversStore = useDriversStore()

onMounted(() => {
  driversStore.fetchStandings(2024)
})

// DEBUG: Ersten 3 Fahrer vereinfacht aufbereitet
const debugData = computed(() =>
  driversStore.standings.slice(0, 3).map((s) => ({
    pos: s.position,
    fahrer: `${s.Driver.givenName} ${s.Driver.familyName}`,
    team: s.Constructors?.[0]?.name ?? '–',
    punkte: s.points,
  }))
)
</script>

<template>
  <div class="page container">
    <span class="placeholder-badge">Startseite</span>
    <h1 class="page-title">
      Willkommen bei <span>F1 PitWall</span>
    </h1>
    <div class="divider"></div>
    <p class="page-subtitle">Übersicht der aktuellen Saison – Daten folgen in Kürze.</p>

    <!-- DEBUG: API-Test – nach erfolgreichem Test entfernen -->
    <div v-if="driversStore.loading" class="debug-state">Lade API-Daten…</div>
    <div v-else-if="driversStore.error" class="debug-error">Fehler: {{ driversStore.error }}</div>
    <template v-else>
      <p class="debug-label">DEBUG – Top 3 aus driversStore (2024)</p>
      <pre class="debug-pre">{{ debugData }}</pre>
    </template>
  </div>
</template>

<style scoped>
.debug-state {
  margin-top: 1.5rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.debug-error {
  margin-top: 1.5rem;
  color: var(--color-primary);
  font-size: 0.9rem;
}

.debug-label {
  margin-top: 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
  margin-bottom: 0.5rem;
}

.debug-pre {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
  font-size: 0.85rem;
  color: var(--color-success);
  line-height: 1.7;
  overflow-x: auto;
}
</style>
