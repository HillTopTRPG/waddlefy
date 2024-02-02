declare module 'vue-virtual-scroller'
interface Window {
  logger: {
    info: (msg: string) => void
    warn: (msg: string) => void
    error: (msg: string) => void
  }
}
declare let window: Window
