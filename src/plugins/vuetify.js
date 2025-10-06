import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          surface: '#ffffff',
          background: '#f8f9fa',
        },
      },
    },
  },
  defaults: {
    VBtn: {
      style: 'text-transform: none; font-weight: 500;',
    },
    VCard: {
      style: 'border-radius: 12px; border: 1px solid #e2e8f0;',
    },
    VTextField: {
      variant: 'outlined',
      style: 'border-radius: 8px;',
    },
    VSelect: {
      variant: 'outlined',
      style: 'border-radius: 8px;',
    },
  },
})

