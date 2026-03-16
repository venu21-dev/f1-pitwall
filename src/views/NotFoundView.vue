<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="nf page container">
    <!-- Hintergrund-Zahl -->
    <span class="nf__bg" aria-hidden="true">404</span>

    <!-- Inhalt -->
    <div class="nf__content">
      <h1 class="nf__title">Seite nicht gefunden</h1>
      <p class="nf__sub">
        Diese Route existiert nicht.<br>
        Zurück zur Startseite
      </p>
      <button class="nf__btn" @click="router.push('/')">
        zur Startseite
      </button>
    </div>
  </div>
</template>

<style scoped>
.nf {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--nav-height));
  text-align: center;
  overflow: hidden;
}

/* ── Wasserzeichen-Zahl ───────────────────────────── */
.nf__bg {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: clamp(16rem, 40vw, 28rem);
  color: var(--color-text);
  opacity: 0.04;
  pointer-events: none;
  user-select: none;
  line-height: 1;
  letter-spacing: -0.04em;
}

/* ── Inhalt ───────────────────────────────────────── */
.nf__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.nf__title {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: clamp(2.5rem, 7vw, 5rem);
  text-transform: uppercase;
  color: #fff;
  line-height: 1;
  letter-spacing: -0.01em;
}

.nf__sub {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

/* ── Button ───────────────────────────────────────── */
.nf__btn {
  margin-top: 0.5rem;
  padding: 0.7rem 1.75rem;
  min-height: 44px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  transition: background var(--transition), transform var(--transition);
}
.nf__btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}
</style>
