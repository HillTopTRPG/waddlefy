/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'
import {register} from "@/components/panes/plugin";
import {createI18n} from "vue-i18n";

const i18n = createI18n({
  locale         : 'ja-JP', // set locale
  fallbackLocale : 'en-US', // set fallback locale
  messages       : {
    en: {
      message: {
        hello: 'hello world',
      },
    },
    ja: {
      message: {
        hello: 'こんにちは、世界',
      },
    },
  }, // set locale messages
  datetimeFormats: {
    'en-US': {
      short: {
        year : 'numeric',
        month: 'short',
        day  : 'numeric',
      },
      long : {
        year   : 'numeric',
        month  : 'short',
        day    : 'numeric',
        weekday: 'short',
        hour   : 'numeric',
        minute : 'numeric',
      },
      time : {
        hour  : 'numeric',
        minute: 'numeric',
        second: 'numeric',
      },
    },
    'ja-JP': {
      short: {
        year : 'numeric',
        month: 'short',
        day  : 'numeric',
      },
      long : {
        year   : 'numeric',
        month  : 'short',
        day    : 'numeric',
        weekday: 'short',
        hour   : 'numeric',
        minute : 'numeric',
        hour12 : true,
      },
      time : {
        hour  : 'numeric',
        minute: 'numeric',
        hour12: true,
        second: 'numeric',
      },
    },
  },
})

const app = createApp(App)

register(app)
registerPlugins(app)

app.use(i18n).mount('#app')
