import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSeasonsStore = defineStore('seasons', () => {
  const races = ref([])
  const selectedYear = ref(2024)
  const loading = ref(false)
  const error = ref(null)

  return { races, selectedYear, loading, error }
})
