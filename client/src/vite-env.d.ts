// noinspection JSUnusedGlobalSymbols

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMeta {
  readonly env: {
    readonly BASE_URL: string
  }
}
