import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useDriversStore = defineStore('drivers', () => {
  const drivers = ref([])
  const standings = ref([])
  const loading = ref(false)
  const error = ref(null)

  return { drivers, standings, loading, error }
})
