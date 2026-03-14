import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from '../App.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
})

describe('App', () => {
  it('renders the NavBar', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router, createPinia()],
      },
    })
    await router.isReady()
    expect(wrapper.find('header').exists()).toBe(true)
  })
})
