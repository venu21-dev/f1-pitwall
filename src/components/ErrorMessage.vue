<script setup>
defineProps({
  message: { type: String, required: true },
  retryLabel: { type: String, default: 'Erneut versuchen' },
})

defineEmits(['retry'])
</script>

<template>
  <div class="error-wrap" role="alert" aria-live="assertive">
    <div class="error-icon" aria-hidden="true">!</div>
    <p class="error-text">{{ message }}</p>
    <button class="error-btn" @click="$emit('retry')" :aria-label="retryLabel">
      {{ retryLabel }}
    </button>
  </div>
</template>

<style scoped>
.error-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2.5rem;
  text-align: center;
}

.error-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(225, 6, 0, 0.15);
  border: 1px solid rgba(225, 6, 0, 0.4);
  color: var(--color-primary);
  font-weight: 700;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-text {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  max-width: 340px;
  line-height: 1.5;
}

.error-btn {
  margin-top: 0.25rem;
  padding: 0.45rem 1.1rem;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  color: var(--color-text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: border-color var(--transition), color var(--transition);
}

.error-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
