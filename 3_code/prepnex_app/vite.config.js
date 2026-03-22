import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        coaching: resolve(__dirname, 'Coaching.html'),
        dashboard: resolve(__dirname, 'Dashboard.html'),
        login: resolve(__dirname, 'Login.html'),
        profile: resolve(__dirname, 'Profile.html'),
        roadmap: resolve(__dirname, 'Roadmap.html'),
        strategy: resolve(__dirname, 'Strategy.html'),
        testing: resolve(__dirname, 'Testing.html'),
        test_supa: resolve(__dirname, 'test_supa_compare.html'),
        vesta: resolve(__dirname, 'Vesta.html'),
      },
    },
  },
})
