/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'

import { createApp } from 'vue'

// Plugins
import { register } from '@/components/panes/plugin'
import { registerPlugins } from '@/plugins'
import { createI18n } from 'vue-i18n'
import ja from './locales/ja.json'

const i18n = createI18n({
  locale: 'ja', // set locale
  fallbackLocale: 'ja', // set fallback locale
  messages: { ja },
  legacy: false,
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

const LOG_LEVEL = (import.meta.env as any).VITE_LOG_LEVEL

function setDebug() {
  const noOp = function () {}
  window.logger = {
    info: ['info'].includes(LOG_LEVEL) ? window.console.info.bind(window.console, '%s') : noOp,
    warn: ['info', 'warn'].includes(LOG_LEVEL) ? window.console.warn.bind(window.console, '%s') : noOp,
    error: ['info', 'warn', 'error'].includes(LOG_LEVEL) ? window.console.error.bind(window.console, '%s') : noOp
  }
}

setDebug()

const app = createApp(App)

import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

app.component('DynamicScroller', DynamicScroller)
app.component('DynamicScrollerItem', DynamicScrollerItem)

register(app)
registerPlugins(app)

app.use(i18n as any).mount('#app')
