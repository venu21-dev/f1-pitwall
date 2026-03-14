<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const menuOpen = ref(false)

const navLinks = [
  { name: 'Übersicht', to: '/' },
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
    <div class="navbar__inner container">
      <!-- Logo -->
      <RouterLink to="/" class="navbar__logo" @click="closeMenu">
        <span class="navbar__logo-f1">F1</span>
        <span class="navbar__logo-text">PitWall</span>
      </RouterLink>

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
  </header>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--nav-height);
  background: rgba(13, 13, 13, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}

.navbar__inner {
  display: flex;
  align-items: center;
  height: var(--nav-height);
  gap: 2rem;
}

/* Logo */
.navbar__logo {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: -0.01em;
  flex-shrink: 0;
}

.navbar__logo-f1 {
  background: var(--color-primary);
  color: #fff;
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.navbar__logo-text {
  color: var(--color-text);
}

/* Desktop nav */
.navbar__links {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;
}

.navbar__link {
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-muted);
  transition: color var(--transition), background var(--transition);
}

.navbar__link:hover {
  color: var(--color-text);
  background: var(--color-surface);
}

.navbar__link--active {
  color: var(--color-primary);
  background: rgba(225, 6, 0, 0.1);
}

/* Burger */
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

/* Mobile dropdown */
.navbar__mobile {
  display: none;
  flex-direction: column;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  overflow: hidden;
  max-height: 0;
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
  border-bottom: 1px solid var(--color-border);
  transition: color var(--transition), background var(--transition);
}

.navbar__mobile-link:last-child {
  border-bottom: none;
}

.navbar__mobile-link:hover,
.navbar__mobile-link--active {
  color: var(--color-primary);
  background: rgba(225, 6, 0, 0.06);
}

/* Responsive */
@media (max-width: 640px) {
  .navbar {
    height: auto;
    min-height: var(--nav-height);
  }

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
