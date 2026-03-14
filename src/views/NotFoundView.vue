<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="page container not-found">
    <p class="not-found__code">404</p>
    <h1 class="page-title">Seite nicht <span>gefunden</span></h1>
    <div class="divider"></div>
    <p class="page-subtitle">Diese Seite existiert nicht – vielleicht falsch abgebogen?</p>
    <button class="not-found__btn" @click="router.push('/')">Zurück zur Startseite</button>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding-top: 8rem;
}

.not-found__code {
  font-size: 7rem;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1;
  margin-bottom: 1rem;
  opacity: 0.8;
}

.not-found__btn {
  margin-top: 1.5rem;
  padding: 0.65rem 1.5rem;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 0.95rem;
  font-weight: 600;
  transition: background var(--transition);
}

.not-found__btn:hover {
  background: var(--color-primary-hover);
}
</style>
