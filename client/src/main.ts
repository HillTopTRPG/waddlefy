/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'

import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'
import { register } from '@/components/panes/plugin'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  locale: 'ja-JP', // set locale
  fallbackLocale: 'en-US', // set fallback locale
  datetimeFormats: {
    'en-US': {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric'
      },
      time: {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }
    },
    'ja-JP': {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      },
      time: {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        second: 'numeric'
      }
    }
  }
})

const app = createApp(App)

import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

app.component('DynamicScroller', DynamicScroller)
app.component('DynamicScrollerItem', DynamicScrollerItem)

register(app)
registerPlugins(app)

app.use(i18n as any).mount('#app')
