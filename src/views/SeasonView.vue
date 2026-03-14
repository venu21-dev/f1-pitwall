<script setup>
const props = defineProps({
  year: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="page container">
    <span class="placeholder-badge">Saison</span>
    <h1 class="page-title">
      Saison <span>{{ year }}</span>
    </h1>
    <div class="divider"></div>
    <p class="page-subtitle">Rennergebnisse der Saison {{ year }} – Daten folgen in Kürze.</p>
  </div>
</template>
