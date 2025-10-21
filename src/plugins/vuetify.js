import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Function to get theme colors from settings
const getThemeColors = () => {
  try {
    const settings = localStorage.getItem('system_theme_settings')
    if (settings) {
      const parsed = JSON.parse(settings)
      return {
        primary: parsed.primary || '#B71C1C',
        secondary: parsed.secondary || '#5F6368',
        background: parsed.background || '#F5F5F5',
        mode: parsed.mode || 'light'
      }
    }
  } catch (error) {
  }
  return {
    primary: '#B71C1C',
    secondary: '#5F6368',
    background: '#F5F5F5',
    mode: 'light'
  }
}

const themeColors = getThemeColors()

const vuetify = createVuetify({
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
    defaultTheme: themeColors.mode,
    themes: {
      light: {
        colors: {
          primary: themeColors.primary,
          secondary: themeColors.secondary,
          accent: '#C62828',
          error: '#D32F2F',
          info: '#757575',
          success: '#4CAF50',
          warning: '#F57C00',
          surface: '#ffffff',
          background: themeColors.background,
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
        },
      },
      dark: {
        colors: {
          primary: themeColors.primary,
          secondary: themeColors.secondary,
          accent: '#C62828',
          error: '#CF6679',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
          surface: '#1E1E1E',
          background: '#121212',
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
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

// Function to update theme dynamically
export const updateTheme = (primary, secondary, background, mode) => {
  // Save to localStorage
  localStorage.setItem('system_theme_settings', JSON.stringify({
    primary,
    secondary,
    background,
    mode
  }))

  // Update theme colors for both light and dark modes
  if (vuetify.theme.themes.value.light) {
    vuetify.theme.themes.value.light.colors.primary = primary
    vuetify.theme.themes.value.light.colors.secondary = secondary
    vuetify.theme.themes.value.light.colors.background = background
  }

  if (vuetify.theme.themes.value.dark) {
    vuetify.theme.themes.value.dark.colors.primary = primary
    vuetify.theme.themes.value.dark.colors.secondary = secondary
    // Dark mode keeps its own background
  }

  // Switch theme mode
  vuetify.theme.global.name.value = mode
}

// Listen for theme updates from SystemSettings
window.addEventListener('theme-updated', (event) => {
  const { primary, secondary, background, mode } = event.detail
  updateTheme(primary, secondary, background, mode)
})

export default vuetify
