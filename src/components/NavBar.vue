<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const menuOpen = ref(false)

const navLinks = [
  { name: 'Home', to: '/' },
  { name: 'Fahrer', to: '/drivers' },
  { name: 'Saison', to: '/seasons/2024' },
  { name: 'Vergleich', to: '/compare' },
]

function closeMenu() {
  menuOpen.value = false
}

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <header class="navbar">
    <div class="navbar__pill">

      <!-- Logo -->
      <RouterLink to="/" class="navbar__logo" @click="closeMenu">
        <span class="navbar__logo-mark">F1</span>
      </RouterLink>

      <span class="navbar__sep" aria-hidden="true"></span>

      <!-- Desktop Links -->
      <nav class="navbar__links" aria-label="Hauptnavigation">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="navbar__link"
          :class="{ 'navbar__link--active': isActive(link.to) }"
        >
          {{ link.name }}
        </RouterLink>
      </nav>

      <!-- Mobile Burger -->
      <button
        class="navbar__burger"
        :class="{ 'navbar__burger--open': menuOpen }"
        aria-label="Menü öffnen"
        @click="menuOpen = !menuOpen"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <!-- Mobile Dropdown -->
    <div class="navbar__mobile-wrap">
      <nav
        class="navbar__mobile"
        :class="{ 'navbar__mobile--open': menuOpen }"
        aria-label="Mobile Navigation"
      >
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="navbar__mobile-link"
          :class="{ 'navbar__mobile-link--active': isActive(link.to) }"
          @click="closeMenu"
        >
          {{ link.name }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
/* ── Outer header (just positions the pill) ─────────── */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 14px 1.5rem;
}

/* ── Pill container ──────────────────────────────────── */
.navbar__pill {
  width: fit-content;
  margin: 0 auto;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.75rem 0 1rem;
  background: rgba(18, 18, 28, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 999px;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

/* ── Logo ────────────────────────────────────────────── */
.navbar__logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  text-decoration: none;
}

.navbar__logo-mark {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: 1.5rem;
  color: var(--color-primary);
  letter-spacing: -0.02em;
  line-height: 1;
  user-select: none;
}

/* ── Desktop nav links ───────────────────────────────── */
.navbar__links {
  display: flex;
  align-items: center;
  gap: 0.15rem;
}

.navbar__link {
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text-muted);
  transition: color var(--transition);
}

.navbar__link:hover {
  color: var(--color-text);
}

.navbar__link--active {
  color: #ffffff;
  font-weight: 700;
}

/* ── Logo/links separator ────────────────────────────── */
.navbar__sep {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
  margin: 0 0.5rem;
}

/* ── Mobile burger button ────────────────────────────── */
.navbar__burger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: none;
  border: none;
  padding: 0.4rem;
  margin-left: auto;
  width: 36px;
  height: 36px;
  cursor: pointer;
}

.navbar__burger span {
  display: block;
  height: 2px;
  background: var(--color-text);
  border-radius: 2px;
  transition: transform var(--transition), opacity var(--transition);
}

.navbar__burger--open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.navbar__burger--open span:nth-child(2) {
  opacity: 0;
}
.navbar__burger--open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* ── Mobile dropdown ─────────────────────────────────── */
.navbar__mobile-wrap {
  width: fit-content;
  min-width: 240px;
  margin: 0 auto;
}

.navbar__mobile {
  display: none;
  flex-direction: column;
  background: rgba(18, 18, 28, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 14px;
  overflow: hidden;
  max-height: 0;
  margin-top: 6px;
  transition: max-height 250ms ease;
}

.navbar__mobile--open {
  max-height: 300px;
}

.navbar__mobile-link {
  padding: 0.9rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text-muted);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  transition: color var(--transition), background var(--transition);
}

.navbar__mobile-link:last-child {
  border-bottom: none;
}

.navbar__mobile-link:hover {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.04);
}

.navbar__mobile-link--active {
  color: #ffffff;
  font-weight: 700;
}

/* ── Responsive ──────────────────────────────────────── */
@media (max-width: 640px) {
  .navbar__links {
    display: none;
  }

  .navbar__burger {
    display: flex;
  }

  .navbar__mobile {
    display: flex;
  }
}
</style>
