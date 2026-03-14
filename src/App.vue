<script setup>
import NavBar from '@/components/NavBar.vue'
</script>

<template>
  <NavBar />
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
main {
  min-height: calc(100vh - var(--nav-height));
}
</style>
