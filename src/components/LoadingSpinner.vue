<script setup>
defineProps({
  label: { type: String, default: '' },
  small: { type: Boolean, default: false },
})
</script>

<template>
  <div class="spinner-wrap" :class="{ 'spinner-wrap--small': small }">
    <div class="spinner"></div>
    <p v-if="label" class="spinner-label">{{ label }}</p>
  </div>
</template>

<style scoped>
.spinner-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2.5rem;
}

.spinner-wrap--small {
  padding: 1rem;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(225, 6, 0, 0.2);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.spinner-wrap--small .spinner {
  width: 22px;
  height: 22px;
  border-width: 2px;
}

.spinner-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
