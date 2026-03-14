import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCompareStore = defineStore('compare', () => {
  const driverA = ref(null)
  const driverB = ref(null)
  const results = ref([])
  const loading = ref(false)
  const error = ref(null)

  return { driverA, driverB, results, loading, error }
})
