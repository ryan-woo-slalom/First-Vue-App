import './assets/main.css'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'

import App from './App.vue'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
)

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'sportsDark',
    themes: {
      sportsDark: {
        dark: true,
        colors: {
          background: '#0e1117',
          surface: '#161b22',
          'surface-bright': '#1d242e',
          primary: '#4f8cff',
          secondary: '#22c1a6',
          accent: '#ff8a3d',
          error: '#ff5a6a',
          info: '#4f8cff',
          success: '#22c1a6',
          warning: '#ffb648',
        },
      },
    },
  },
  defaults: {
    VCard: { rounded: 'lg' },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})

const app = createApp(App)

app.use(vuetify)

app.mount('#app')
