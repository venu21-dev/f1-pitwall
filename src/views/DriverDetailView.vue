<script setup>
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="page container">
    <span class="placeholder-badge">Fahrerdetail</span>
    <h1 class="page-title">
      Fahrer <span>#{{ id }}</span>
    </h1>
    <div class="divider"></div>
    <p class="page-subtitle">Rennergebnisse dieses Fahrers – Daten folgen in Kürze.</p>
  </div>
</template>
