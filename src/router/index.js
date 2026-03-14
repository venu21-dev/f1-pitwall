import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import DriversView from '@/views/DriversView.vue'
import DriverDetailView from '@/views/DriverDetailView.vue'
import SeasonView from '@/views/SeasonView.vue'
import CompareView from '@/views/CompareView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/drivers',
      name: 'drivers',
      component: DriversView,
    },
    {
      path: '/drivers/:id',
      name: 'driver-detail',
      component: DriverDetailView,
      props: true,
    },
    {
      path: '/seasons/:year',
      name: 'season',
      component: SeasonView,
      props: true,
    },
    {
      path: '/compare',
      name: 'compare',
      component: CompareView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

export default router
