<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const props = defineProps({
  labels:  { type: Array, required: true },
  dataA:   { type: Array, required: true },
  colorA:  { type: String, required: true },
  labelA:  { type: String, required: true },
  dataB:   { type: Array, required: true },
  colorB:  { type: String, required: true },
  labelB:  { type: String, required: true },
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.labelA,
      data: props.dataA,
      borderColor: props.colorA,
      backgroundColor: 'transparent',
      borderWidth: 2.5,
      pointRadius: 0,
      pointHoverRadius: 0,
      pointStyle: 'line',
      tension: 0.35,
    },
    {
      label: props.labelB,
      data: props.dataB,
      borderColor: props.colorB,
      backgroundColor: 'transparent',
      borderWidth: 2.5,
      pointRadius: 0,
      pointHoverRadius: 0,
      pointStyle: 'line',
      tension: 0.35,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 1100,
    easing: 'easeOutQuart',
    y: {
      from: (ctx) => {
        if (ctx.type === 'data' && ctx.mode === 'default') {
          return ctx.chart.scales.y.getPixelForValue(0)
        }
      },
    },
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#888',
        font: { size: 12, family: "'Inter', sans-serif" },
        usePointStyle: true,
        pointStyle: 'line',
        pointStyleWidth: 32,
        padding: 28,
      },
    },
    tooltip: {
      backgroundColor: '#1a1a2e',
      borderColor: '#2a2a3e',
      borderWidth: 1,
      titleColor: '#fff',
      bodyColor: '#aaa',
      padding: 10,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.05)', drawTicks: false },
      ticks: { color: '#555', font: { size: 10 }, maxTicksLimit: 12 },
      border: { color: 'rgba(255,255,255,0.08)' },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.05)', drawTicks: false },
      ticks: { color: '#555', font: { size: 10 } },
      border: { color: 'rgba(255,255,255,0.08)' },
      beginAtZero: true,
    },
  },
}
</script>

<template>
  <div class="chart-wrap">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-wrap {
  height: 280px;
  width: 100%;
}
</style>
