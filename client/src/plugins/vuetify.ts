/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides

const isDark = localStorage.getItem('dark') === 'true'

export default createVuetify({
  theme: {
    defaultTheme: isDark ? 'dark' : 'light',
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
          deleteText: '#B00020',
          deleteTextSub: '#ffdd44'
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#2470c5',
          secondary: '#5CBBF6',
          'on-surface': '#ccc',
          warning: '#883',
          error: '#7c3d48',
          success: '#2d6930',
          'on-success': '#ccc',
          info: '#135a91',
          'on-info': '#ccc',
          'on-error': '#ccc',
          border: '#ccc',
          deleteText: '#B00020',
          deleteTextSub: '#ffdd44'
        }
      }
    }
  }
})
