<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** Array von Zahlen (z.B. kumulative Punkte pro Rennen) */
  data: {
    type: Array,
    default: () => [],
  },
  color: {
    type: String,
    default: '#e10600',
  },
  width: {
    type: Number,
    default: 64,
  },
  height: {
    type: Number,
    default: 28,
  },
})

const points = computed(() => {
  const d = props.data
  if (d.length < 2) return ''

  const min = Math.min(...d)
  const max = Math.max(...d)
  const range = max - min || 1
  const pad = 2 // vertikales Padding damit die Linie nicht abgeschnitten wird

  return d
    .map((v, i) => {
      const x = (i / (d.length - 1)) * props.width
      const y = props.height - pad - ((v - min) / range) * (props.height - pad * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})
</script>

<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    class="sparkline"
    aria-hidden="true"
  >
    <polyline
      v-if="points"
      :points="points"
      :stroke="color"
      stroke-width="2"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <!-- Platzhalter-Linie wenn noch keine Daten -->
    <line
      v-else
      x1="4"
      :y1="height / 2"
      :x2="width - 4"
      :y2="height / 2"
      :stroke="color"
      stroke-width="1.5"
      stroke-dasharray="3 3"
      opacity="0.35"
    />
  </svg>
</template>

<style scoped>
.sparkline {
  display: block;
  overflow: visible;
}
</style>
