// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  extends: ['shadcn-docs-nuxt'],
  compatibilityDate: '2024-07-06',
  modules: ['nuxt-gtag'],
  gtag: {
    id: 'G-PPY8DH6V4G'
  }
});